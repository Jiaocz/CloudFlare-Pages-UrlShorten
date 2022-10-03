import { createCanvas } from 'canvas';

export const filename_pattern = /(\d+)x(\d+)\.(jpg|png)(,[0-9a-zA-Z]*,[0-9a-zA-Z]*)?$/

/**
 * @type {import('@cloudflare/workers-types').PagesFunction}
 */
export async function onRequest(context) {
    const {
        request,
        env,
        params,
        waitUntil,
    } = context;

    const { param } = params;

    if (!filename_pattern.test(param)) {
        return new Response('Invalid filename', {
            status: 400,
        });
    }

    const [, width, height, format] = filename_pattern.exec(param);

    const canvas = createCanvas(parseInt(width), parseInt(height));
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = '30px Helvetica';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${width} x ${height}`, canvas.width / 2, canvas.height / 2);

    // return the image
    return new Response(canvas.toBuffer(), {
        headers: {
            'Content-Type': `image/${format}`,
        },
    });
}
