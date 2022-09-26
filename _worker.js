const UrlShortenKV = "UrlShorten";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const value = await env[UrlShortenKV].get(url.pathname);

    if (value === null) {
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
