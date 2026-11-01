import { checkPassword, issueCookie, isConfigured, json, readBody, sameOrigin } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' });
  if (!sameOrigin(req)) return json(res, 403, { error: 'forbidden' });
  if (!isConfigured()) return json(res, 503, { error: 'admin_password_not_set' });
  let body = {};
  try { body = await readBody(req, 10_000); } catch { return json(res, 400, { error: 'bad_request' }); }
  if (!checkPassword(body.password)) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return json(res, 401, { error: 'wrong_password' });
  }
  issueCookie(res);
  return json(res, 200, { ok: true }, { 'Cache-Control': 'no-store' });
}
