import { createHmac, timingSafeEqual, createHash } from 'node:crypto';

const COOKIE = 'ad_admin';
const MAX_AGE = 60 * 60 * 12; // 12 saat

function secret() {
  const base = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
  return createHash('sha256').update('atesdoner:' + base).digest();
}

export function isConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 6);
}

export function checkPassword(input) {
  if (!isConfigured() || typeof input !== 'string') return false;
  const a = createHash('sha256').update(input).digest();
  const b = createHash('sha256').update(process.env.ADMIN_PASSWORD).digest();
  return timingSafeEqual(a, b);
}

function sign(payload) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function issueCookie(res) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `v1.${exp}`;
  const token = `${payload}.${sign(payload)}`;
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE}`);
}

export function clearCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
}

function readCookie(req) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === COOKIE) return rest.join('=');
  }
  return '';
}

export function isAuthed(req) {
  if (!isConfigured()) return false;
  const token = readCookie(req);
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = sign(payload);
  const given = parts[2];
  if (expected.length !== given.length) return false;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(given))) return false;
  return Number(parts[1]) > Math.floor(Date.now() / 1000);
}

// Basic CSRF guard for state changing requests: require same origin.
export function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // same origin fetches from older browsers may omit it; cookie is SameSite=Strict anyway
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

export function json(res, status, body, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(body));
}

export async function readBody(req, limit = 5_000_000) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > limit) throw Object.assign(new Error('too_large'), { status: 413 });
    chunks.push(c);
  }
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}
