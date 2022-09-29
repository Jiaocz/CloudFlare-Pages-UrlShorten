import md5 from 'md5';

export async function onRequest(context) {
    const {
        request,
        env,
        params,
        waitUntil,
    } = context;

    return new Response(md5(params.md5));
}
