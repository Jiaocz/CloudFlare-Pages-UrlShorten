const APP_STORE_ORIGIN = 'https://apps.nextcloud.com';
const APP_STORE_API_PREFIX = '/api/v1/';
const CACHE_TTL_SECONDS = 3600;

const ALLOWED_ENDPOINTS = new Set([
    'apps.json',
    'categories.json',
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
                    result[key] = `${proxyOrigin}/gh/${downloadUrl.href}`;
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

    if (endpoint !== 'apps.json' || request.method === 'HEAD' || !upstream.ok) {
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
    if (!ALLOWED_ENDPOINTS.has(endpoint)) {
        return jsonError('Unknown Nextcloud App Store endpoint', 404);
    }

    try {
        return await fetchEndpoint(request, endpoint);
    } catch {
        return jsonError('Unable to reach the Nextcloud App Store', 502);
    }
}
