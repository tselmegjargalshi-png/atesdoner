// Fails if a hyphen or dash is used between words in visible menu text (project rule).
import { readFileSync } from 'node:fs';
const menu = JSON.parse(readFileSync(new URL('../data/menu.json', import.meta.url), 'utf8'));
const bad = [];
const walk = (v, path) => {
  if (typeof v === 'string') {
    if (/^(https?:|\/assets\/)/.test(v)) return;
    if (/[‐-―−]|\p{L}-\p{L}|\s-\s/u.test(v)) bad.push(`${path}: ${v}`);
  } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (k !== 'id') walk(x, `${path}.${k}`);
};
walk(menu, 'menu');
if (bad.length) { console.error(bad.join('\n')); process.exit(1); }
console.log('OK: no hyphens or dashes between words');
