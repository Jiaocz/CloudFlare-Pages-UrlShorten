export const onRequest = async ({ next }) => {
    const resp = await next();
    resp.headers.set("Access-Control-Allow-Origin", "*");
    resp.headers.set("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS");

    return resp;
}