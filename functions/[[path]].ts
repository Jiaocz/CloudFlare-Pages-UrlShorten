declare global {
    const UrlShorten: KVNamespace | null;
}

export async function onRequest(context) {
    const {
        request,
        env,
        params,
        waitUntil,
    } = context;

    const url = new URL(request.url);

    if (!env.UrlShorten) { // If the KV namespace is not bound to the script unluckily
        return env.ASSETS.fetch(request);
    }

    const value = await env.UrlShorten.get(url.pathname);

    if (value === null) {
        return env.ASSETS.fetch(request);
    }

    try {
        const redirect = new URL(value);
        return Response.redirect(redirect.href, 301);
    } catch (e) {
        return new Response("Invalid URL", { status: 400 });
    }
}
