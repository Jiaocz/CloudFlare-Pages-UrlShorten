const UrlShortenKV = "UrlShorten";
const GravatarPrefix = "/avatar/";

/**
 * Fetch Gravatar image with cache.
 * @param {Request} request Origin request
 * @param {{waitUntil: (f: any) => void}} context CloudFlare Worker Context
 * @returns {Response} Gravatar Response
 */
const fetchGravatar = async (request, context) => {
  const path = new URL(request.url).pathname.replace(GravatarPrefix, "") + new URL(request.url).search;
  const url = `https://www.gravatar.com/avatar/${path}`;

  // https://developers.cloudflare.com/workers/examples/cache-api/
  const cacheKey = new Request(request.url, request);
  const cache = caches.default;

  let response = await cache.match(cacheKey);
  if (!response) {
    response = await fetch(url);
    response = new Response(response.body, response);
    response.headers.append("Cache-Control", "s-maxage=86400");
    context.waitUntil(cache.put(cacheKey, response.clone()));
  }

  return response;
}

export default {
  async fetch(request, env, context) {
    const url = new URL(request.url);
    const value = await env[UrlShortenKV].get(url.pathname);

    if (value === null) {
      if (url.pathname.startsWith(GravatarPrefix)) {
        return await fetchGravatar(request, context);
      }

      return new Response("URL not found", { status: 404 });
    }
    
    try {
      const redirect = new URL(value);
      return new Response("Redirecting", { status: 301, headers: { "Location": redirect.toString() } });
    } catch (e) {
      return new Response(`URL ${value} is not valid`, { status: 400 })
    }
  }
};
