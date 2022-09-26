const UrlShortenKV = "UrlShorten";
const GravatarPrefix = "/avatar/";

const fetchGravatar = async (pathname) => {
  const path = pathname.replace(GravatarPrefix, "");
  const url = `https://www.gravatar.com/avatar/${path}`;
  const response = await fetch(url);
  return response;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const value = await env[UrlShortenKV].get(url.pathname);

    if (value === null) {
      if (url.pathname.startsWith(GravatarPrefix)) {
        return await fetchGravatar(`${url.pathname}${url.search}`);
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
