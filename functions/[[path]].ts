declare global {
    const UrlShorten: KVNamespace;
}

export async function onRequest(context) {
    const {
        request,
        env,
        params,
        waitUntil,
    } = context;

    const url = new URL(request.url);

    const value = await env.UrlShorten.get(url.pathname);

    if (value === null) {
        return env.ASSETS.fetch(request);
    }

    try {
        const redirect = new URL(value);
        return new Response("Redirecting", { status: 301, headers: { Location: redirect.href } });
    } catch (e) {
        return new Response("Invalid URL", { status: 400 });
    }
}
