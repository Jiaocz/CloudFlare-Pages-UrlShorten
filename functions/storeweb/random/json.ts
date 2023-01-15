export const getRandom = async (): Promise<any> => {
    try {
        const response = await fetch(
            'http://api.storeweb.cn/api/site/random',
            {
                method: 'POST',
                headers: { 'session-id': '0', 'Referer': 'https://storeweb.cn/' },
                
            }
        );
        return await response.json();
    } catch (error) {
        console.log(error);
    }
    return null;
}

export async function onRequest(context) {
    const {
        request,
        env,
        params,
        waitUntil,
    } = context;

    return new Response(JSON.stringify(await getRandom()))
}
