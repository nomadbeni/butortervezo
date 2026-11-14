// Statikus ellenőrzés: a JS források és a kész HTML-ekbe ágyazott szkriptek szintaktikailag helyesek,
// a kezdőlap linkjei létező fájlokra mutatnak.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;
const ok = (m) => console.log('  ok  ' + m);
const bad = (m, e) => { failed++; console.error('  HIBA ' + m + (e ? '\n       ' + String(e.message || e).split('\n')[0] : '')); };

for (const f of readdirSync(join(root, 'src')).filter((f) => f.endsWith('.js'))) {
  try { execFileSync(process.execPath, ['--check', join(root, 'src', f)], { stdio: 'pipe' }); ok('src/' + f); }
  catch (e) { bad('src/' + f, e.stderr?.toString() || e); }
}
for (const f of ['kanape.html', 'polcrendezo.html', 'index.html']) {
  const p = join(root, f);
  if (!existsSync(p)) { bad(f + ' hiányzik'); continue; }
  const html = readFileSync(p, 'utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (!scripts.length) { bad(f + ': nincs beágyazott szkript'); continue; }
  try { scripts.forEach((s) => new Function(s)); ok(f + ' szkript'); } catch (e) { bad(f + ' szkript', e); }
  if (f === 'index.html') {
    for (const [, href] of html.matchAll(/<a class="app" href="([^"]+)"/g)) existsSync(join(root, href)) ? ok('kezdőlap link: ' + href) : bad('kezdőlap link nem létező fájlra: ' + href);
  }
}
if (failed) { console.error(`\n${failed} hiba`); process.exit(1); }
console.log('\nStatikus ellenőrzés rendben.');
