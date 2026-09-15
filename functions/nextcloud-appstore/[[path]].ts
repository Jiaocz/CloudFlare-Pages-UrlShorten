const APP_STORE_ORIGIN = 'https://apps.nextcloud.com';
const APP_STORE_API_PREFIX = '/api/v1/';
const CACHE_TTL_SECONDS = 3600;

const ALLOWED_ENDPOINTS = new Set([
    'apps.json',
    'categories.json',
    'discover.json',
]);

function getPath(params: { path?: string | string[] }): string {
    const path = params.path;

    return Array.isArray(path) ? path.join('/') : (path || '');
}

function jsonError(message: string, status: number): Response {
    return Response.json({ error: message }, {
        status,
        headers: {
            'cache-control': 'no-store',
        },
    });
}

function proxyGithubDownloads(value: unknown, proxyOrigin: string): unknown {
    if (Array.isArray(value)) {
        return value.map((entry) => proxyGithubDownloads(entry, proxyOrigin));
    }

    if (value === null || typeof value !== 'object') {
        return value;
    }

    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
        if (key === 'download' && typeof entry === 'string') {
            try {
                const downloadUrl = new URL(entry);
                if (downloadUrl.protocol === 'https:' && downloadUrl.hostname === 'github.com') {
                    const proxyUrl = new URL('/nextcloud-appstore/download', proxyOrigin);
                    proxyUrl.searchParams.set('url', downloadUrl.href);
                    result[key] = proxyUrl.href;
                    continue;
                }
            } catch {
                // Leave invalid or non-HTTP download values untouched.
            }
        }

        result[key] = proxyGithubDownloads(entry, proxyOrigin);
    }

    return result;
}

function isAllowedDownload(url: URL): boolean {
    return url.protocol === 'https:'
        && url.hostname === 'github.com'
        && /^\/[^/]+\/[^/]+\/releases\/download\//.test(url.pathname);
}

async function fetchDownload(request: Request): Promise<Response> {
    const requestUrl = new URL(request.url);
    const target = requestUrl.searchParams.get('url');

    if (target === null) {
        return jsonError('Missing download URL', 400);
    }

    let downloadUrl: URL;
    try {
        downloadUrl = new URL(target);
    } catch {
        return jsonError('Invalid download URL', 400);
    }

    if (!isAllowedDownload(downloadUrl)) {
        return jsonError('Download URL is not allowed', 403);
    }

    const headers = new Headers();
    for (const name of ['accept', 'if-modified-since', 'if-none-match', 'range', 'user-agent']) {
        const value = request.headers.get(name);
        if (value !== null) {
            headers.set(name, value);
        }
    }

    const upstream = await fetch(downloadUrl.href, {
        method: request.method,
        headers,
        redirect: 'follow',
    });

    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.set('x-nextcloud-appstore-proxy', 'cloudflare-pages');

    return new Response(request.method === 'HEAD' ? null : upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders,
    });
}

async function fetchEndpoint(request: Request, endpoint: string): Promise<Response> {
    const requestUrl = new URL(request.url);
    const upstreamUrl = new URL(APP_STORE_API_PREFIX + endpoint, APP_STORE_ORIGIN);
    upstreamUrl.search = requestUrl.search;

    const headers = new Headers();
    for (const name of ['accept', 'accept-language', 'if-modified-since', 'if-none-match', 'user-agent']) {
        const value = request.headers.get(name);
        if (value !== null) {
            headers.set(name, value);
        }
    }

    const upstream = await fetch(upstreamUrl.href, {
        method: request.method,
        headers,
        redirect: 'follow',
    });

    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.set('cache-control', `public, max-age=${CACHE_TTL_SECONDS}`);
    responseHeaders.set('x-nextcloud-appstore-proxy', 'cloudflare-pages');

    if (request.method === 'HEAD' || !upstream.ok) {
        return new Response(request.method === 'HEAD' ? null : upstream.body, {
            status: upstream.status,
            statusText: upstream.statusText,
            headers: responseHeaders,
        });
    }

    const contentType = upstream.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
        return jsonError('Unexpected response from the Nextcloud App Store', 502);
    }

    try {
        const data = await upstream.json();
        const body = JSON.stringify(proxyGithubDownloads(data, requestUrl.origin));

        responseHeaders.set('content-type', 'application/json; charset=utf-8');
        responseHeaders.delete('content-length');
        responseHeaders.delete('content-encoding');
        responseHeaders.delete('etag');

        return new Response(body, {
            status: upstream.status,
            statusText: upstream.statusText,
            headers: responseHeaders,
        });
    } catch {
        return jsonError('Invalid JSON from the Nextcloud App Store', 502);
    }
}

export async function onRequest(context): Promise<Response> {
    const { request, params } = context;

    if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response('Method Not Allowed', {
            status: 405,
            headers: { allow: 'GET, HEAD' },
        });
    }

    const endpoint = getPath(params);
    if (endpoint === 'download') {
        try {
            return await fetchDownload(request);
        } catch {
            return jsonError('Unable to download the Nextcloud app', 502);
        }
    }

    if (!ALLOWED_ENDPOINTS.has(endpoint)) {
        return jsonError('Unknown Nextcloud App Store endpoint', 404);
    }

    try {
        return await fetchEndpoint(request, endpoint);
    } catch {
        return jsonError('Unable to reach the Nextcloud App Store', 502);
    }
}
