// Statikus ellenőrzés (npm run check) – a szabályokat az AGENTS.md írja le.
//  1. JS szintaxis: src/*.js és a kész HTML-ekbe ágyazott szkriptek
//  2. kész HTML-ek: CSP meta = src/csp.txt, a script-src a beágyazott szkript SHA-256 hash-e; nincs külső <script src>, inline eseménykezelő
//  3. a kész HTML-ek szkriptjei: nincs hálózati kérés, eval, eszköz- vagy vágólap-hozzáférés, süti, service worker, window.open;
//     localStorage-kulcs csak kp. / pr. / bt. előtaggal
//  4. minden fájl (git nélkül is): nincs e-mail cím (csak a megengedett noreply), chat-/munkamenet-link, utm_, belső útvonal, IP-cím, token
//  5. MI-nyilatkozat a README-ben (magyar, angol) és a kezdőlapon; LICENSE megvan
//  6. git előzmény (ha elérhető): szerző/commitoló és üzenet tiszta, az üzenet utolsó sora „AI-generated: <modell>”
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ALLOWED_EMAIL = '29810786+nomadbeni@users.noreply.github.com';
const AI_LINE = /\nAI-generated: [^\n@]+$/;
let failed = 0;
const ok = (m) => console.log('  ok  ' + m);
const bad = (m, e) => { failed++; console.error('  HIBA ' + m + (e ? '\n       ' + String(e.message || e).split('\n')[0] : '')); };
const read = (f) => readFileSync(join(root, f), 'utf8');
const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });

// 1–2
const BUILT = {};
const CSP = read('src/csp.txt').trim();
for (const f of readdirSync(join(root, 'src')).filter((f) => f.endsWith('.js'))) {
  try { execFileSync(process.execPath, ['--check', join(root, 'src', f)], { stdio: 'pipe' }); ok('szintaxis: src/' + f); }
  catch (e) { bad('szintaxis: src/' + f, e.stderr?.toString() || e); }
}
for (const f of ['kanape.html', 'polcrendezo.html', 'index.html']) {
  if (!existsSync(join(root, f))) { bad(f + ' hiányzik'); continue; }
  const html = read(f);
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  try { if (!scripts.length) throw new Error('nincs beágyazott szkript'); scripts.forEach((s) => new Function(s)); ok('szintaxis: ' + f); } catch (e) { bad('szintaxis: ' + f, e); }
  const hashes = scripts.map((x) => `'sha256-${createHash('sha256').update(x, 'utf8').digest('base64')}'`).join(' ');
  const m = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]*)">/);
  m && m[1] === CSP.replace('{SCRIPT_HASH}', hashes) && /<meta charset="utf-8">\s*<meta http-equiv="Content-Security-Policy"/.test(html) ? ok('CSP (szkript-hash): ' + f) : bad('CSP hiányzik, eltér a src/csp.txt-től vagy rossz a szkript-hash: ' + f);
  /<script[^>]+src=/i.test(html) ? bad('külső szkript: ' + f) : ok('nincs külső szkript: ' + f);
  /<[a-z][^>]*\son[a-z]+\s*=/i.test(html.replace(/<script>[\s\S]*?<\/script>/g, '')) ? bad('inline eseménykezelő attribútum: ' + f) : ok('nincs inline eseménykezelő: ' + f);
  BUILT[f] = scripts.join('\n');
  if (f === 'index.html') for (const [, href] of html.matchAll(/<a class="app" href="([^"]+)"/g)) existsSync(join(root, href)) ? ok('kezdőlap link: ' + href) : bad('kezdőlap link nem létező fájlra: ' + href);
}

// 3
const FORBIDDEN = /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|\beval\s*\(|new\s+Function\b|importScripts|serviceWorker|getUserMedia|geolocation|clipboard|execCommand|document\.cookie|window\.open\s*\(|\.postMessage\s*\(|indexedDB/;
for (const [f, js] of Object.entries(BUILT)) {
  const hit = js.match(FORBIDDEN);
  hit ? bad(`tiltott hívás (${hit[0]}): ${f}`) : ok('nincs hálózati kérés, eval, eszköz- és vágólap-hozzáférés: ' + f);
  // literál kulcsok, a keret előtagjai (shell({prefix:'..'})) és a kezdőlap kulcsa
  const keys = [...js.matchAll(/(?:localStorage\.(?:get|set|remove)Item|store\.(?:get|set|del))\(\s*(['"`])([^'"`$]+)\1/g)].map((m) => m[2])
    .concat([...js.matchAll(/prefix\s*:\s*'([^']+)'/g)].map((m) => m[1] + '.'), [...js.matchAll(/const k='([^']+)'/g)].map((m) => m[1]));
  const badKeys = keys.filter((k) => !/^(kp|pr|bt)\./.test(k)).concat(/localStorage\s*\[|localStorage\.(?!getItem|setItem|removeItem)\w+\s*=/.test(js) ? ['közvetlen localStorage-írás'] : []);
  badKeys.length ? bad(`localStorage-kulcs előtag nélkül (${badKeys[0]}): ${f}`) : (keys.length ? ok(`localStorage-kulcsok előtaggal (${keys.join(', ')}): ${f}`) : bad(`nem található localStorage-kulcs: ${f}`));
}

// 4
let files = [];
try { files = git('ls-files', '-co', '--exclude-standard').split('\n').filter(Boolean); }
catch { // git nélkül (pl. kicsomagolt pillanatkép): fájlrendszer-bejárás
  const walk = (d) => readdirSync(join(root, d)).flatMap((n) => { const p = d ? d + '/' + n : n;
    if (/^(\.git|node_modules|test-results|playwright-report|_site|__pycache__)$/.test(n)) return [];
    return statSync(join(root, p)).isDirectory() ? walk(p) : [p]; });
  files = walk(''); console.log('  --  git nem érhető el, fájlrendszer-bejárással keresek');
}
if (!files.length) bad('nincs ellenőrizhető fájl');
const SKIP = /\.(png|webp|jpe?g|gif|ico|woff2?)$|^package-lock\.json$/;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const LINK = /claude\.ai|chatgpt\.com|Claude-Session|utm_[a-z]+=/i;
const SECRET = /\/home\/[a-z]|\/root\/|\/Users\/[A-Za-z]|[A-Z]:\\Users\\|(?<![\d.v@])(?:\d{1,3}\.){3}\d{1,3}(?!\d|\.\d)|ghp_[A-Za-z0-9]{10}|github_pat_|-----BEGIN [A-Z ]*PRIVATE KEY/;
let dirty = 0;
for (const f of files.filter((f) => !SKIP.test(f) && existsSync(join(root, f)))) {
  const s = read(f);
  // kivétel: a megengedett noreply címek és a csomagverziók (pl. @playwright/test@1.65.1 → „test@1.65.1”)
  const emails = [...s.matchAll(EMAIL)].map((m) => m[0]).filter((e) => e !== ALLOWED_EMAIL && e !== 'noreply@github.com' && !/@\d+\.\d+\.\d+$/.test(e) && !/\.(png|jpe?g|webp|gif|svg)$/i.test(e));   // csomagverzió, @2x képnév
  if (emails.length) { dirty++; bad(`e-mail cím: ${f}: ${emails[0]}`); }
  if (f !== 'tests/check.mjs' && f !== 'AGENTS.md' && LINK.test(s)) { dirty++; bad(`chat-/munkamenet-link vagy utm_: ${f}`); }
  const sec = f !== 'tests/check.mjs' ? s.match(SECRET) : null;
  if (sec) { dirty++; bad(`belső útvonal, IP-cím vagy token (${sec[0]}): ${f}`); }
}
if (files.length && !dirty) ok(`${files.length} fájl: nincs e-mail cím és chat-link`);

// 5
const readme = existsSync(join(root, 'README.md')) ? read('README.md') : '';
const idx = read('index.html');
readme.includes('teljes egészében mesterséges intelligencia (Claude, Anthropic) készített, az ellenőrzést egy másik MI végezte') ? ok('MI-nyilatkozat: README (magyar)') : bad('MI-nyilatkozat hiányzik: README (magyar)');
readme.includes('created entirely by AI (Claude, Anthropic) and reviewed by another AI') ? ok('MI-nyilatkozat: README (angol)') : bad('MI-nyilatkozat hiányzik: README (angol)');
idx.includes('az ellenőrzést egy másik MI végezte') && idx.includes('reviewed by another AI') ? ok('MI-nyilatkozat: kezdőlap') : bad('MI-nyilatkozat hiányzik: kezdőlap');
existsSync(join(root, 'LICENSE')) && read('LICENSE').startsWith('MIT License') ? ok('LICENSE (MIT)') : bad('LICENSE hiányzik');

// 6
try {
  const log = git('log', '--format=%H%x1f%an%x1f%ae%x1f%cn%x1f%ce%x1f%B%x1e');
  let n = 0, bc = 0;
  for (const rec of log.split('\x1e').map((r) => r.trim()).filter(Boolean)) {
    const [h, an, ae, cn, ce, body] = rec.split('\x1f'); n++;
    const okMail = (e) => e === ALLOWED_EMAIL || e === 'noreply@github.com';
    const msg = (body || '').trim();
    const why = !okMail(ae) ? 'szerző e-mail: ' + ae : !okMail(ce) ? 'commitoló e-mail: ' + ce
      : LINK.test(msg) ? 'chat-link az üzenetben' : /co-authored-by/i.test(msg) ? 'Co-Authored-By sor'
      : [...msg.matchAll(EMAIL)].length ? 'e-mail az üzenetben' : (!/^Merge /.test(msg) && !AI_LINE.test(msg)) ? 'hiányzó MI-jelölő sor (utolsó sor: AI-generated: <modell>)' : '';
    if (why) { bc++; bad(`commit ${h.slice(0, 7)}: ${why}`); }
  }
  if (n && !bc) ok(`${n} commit: szerző, commitoló és üzenet tiszta`);
} catch { console.log('  --  git előzmény nem érhető el, kihagyva'); }

if (failed) { console.error(`\n${failed} hiba`); process.exit(1); }
console.log('\nStatikus ellenőrzés rendben.');
