const GravatarPrefix = "/avatar/";

export async function onRequest(context) {
    const {
        request,
        env,
        params,
        waitUntil,
    } = context;

    const path = new URL(request.url).pathname.replace(GravatarPrefix, "") + new URL(request.url).search;
    const url = `https://www.gravatar.com/avatar/${path}`;

    const cacheKey = new Request(request.url, request);
    const cache = caches.default;

    let response = await cache.match(cacheKey);
    if (!response) {
        response = await fetch(url);
        response = new Response(response.body, response);
        response.headers.set("Cache-Control", "max-age=86400, s-maxage=86400");
        waitUntil(cache.put(cacheKey, response.clone()));
    }

    return response;
}
