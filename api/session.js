import { isAuthed, isConfigured, json } from './_lib/auth.js';
import { storageConfigured } from './_lib/store.js';

export default function handler(req, res) {
  return json(res, 200, {
    authed: isAuthed(req),
    passwordConfigured: isConfigured(),
    storage: storageConfigured(),
  }, { 'Cache-Control': 'no-store' });
}
