import { isAuthed, json, readBody, sameOrigin } from './_lib/auth.js';
import { uploadImage } from './_lib/store.js';

const TYPES = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' };

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' });
  if (!isAuthed(req) || !sameOrigin(req)) return json(res, 401, { error: 'unauthorized' });
  try {
    const body = await readBody(req, 4_000_000);
    const m = /^data:(image\/(?:webp|jpeg|png));base64,(.+)$/.exec(body.dataUrl || '');
    if (!m) return json(res, 400, { error: 'invalid_image' });
    const buffer = Buffer.from(m[2], 'base64');
    if (buffer.length > 2_500_000) return json(res, 413, { error: 'image_too_large' });
    const url = await uploadImage(buffer, m[1], TYPES[m[1]]);
    return json(res, 200, { url }, { 'Cache-Control': 'no-store' });
  } catch (e) {
    console.error(e);
    return json(res, e.status || 500, { error: e.message || 'server_error' });
  }
}
