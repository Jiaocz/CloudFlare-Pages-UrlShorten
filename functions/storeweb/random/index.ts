import { getRandom } from './json';

export async function onRequest(context) {
    const {
        request,
        env,
        params,
        waitUntil,
    } = context;

    const { data } = await getRandom();

    return Response.redirect(`${data.site.http}${data.site.domain}`, 302);
}
