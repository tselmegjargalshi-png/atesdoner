import { clearCookie, json } from './_lib/auth.js';

export default function handler(req, res) {
  clearCookie(res);
  return json(res, 200, { ok: true }, { 'Cache-Control': 'no-store' });
}
