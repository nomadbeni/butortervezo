"""Kezdőlap: index.html – az appok listája. Új app: egy sor az APPS listába."""
import os
SP=os.path.dirname(os.path.abspath(__file__))+'/'
CSS=open(SP+'common.css').read()
CSP=open(SP+'csp.txt').read().strip()
APPS=[
 dict(href='kanape.html',name='Kanapé-tervező',grad='linear-gradient(135deg,#b45309,#f59e0b)',
  icon='<path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M3 12a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3z"/><path d="M5 17v2M19 17v2"/>',
  desc='Sarok-, egyenes és U alakú kanapé felülnézetben, téglalap elemekből. Automatikus méretláncok, oldalnézet, méret-táblázat.',
  tags=['Felülnézet','Méretláncok','PNG · SVG · PDF']),
 dict(href='polcrendezo.html',name='Polcrendező',grad='linear-gradient(135deg,#0f766e,#14b8a6)',
  icon='<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M4 9h16M4 15h16"/><path d="M7 6.5h3M13 12.5h4M7 18.5h5"/>',
  desc='Fali, álló, konyha- és fürdőszoba szekrények: méretek, polcok, polcközök arányos átméretezéssel, és hogy melyik polcra mi kerül.',
  tags=['Szekrények','Kereső','PNG · SVG · PDF · CSV']),
]
extra='''
.wrap{max-width:1080px;margin:0 auto;padding:28px 16px 60px;display:flex;flex-direction:column;gap:22px}
.hero h1{margin:0;font-size:30px;font-weight:800;letter-spacing:-.02em}
.hero p{margin:6px 0 0;color:var(--muted);max-width:62ch}
.apps{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
a.app{text-decoration:none;color:inherit;background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:18px;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:12px;transition:transform .15s,border-color .15s}
a.app:hover{transform:translateY(-2px);border-color:var(--accent)}
a.app .top{display:flex;gap:12px;align-items:center}
a.app .ico{width:48px;height:48px;border-radius:14px;display:grid;place-items:center;flex:none}
a.app .ico svg{width:28px;height:28px}
a.app h2{margin:0;font-size:19px;font-weight:800}
a.app p{margin:0;color:var(--muted);font-size:14px}
a.app .tags{display:flex;gap:6px;flex-wrap:wrap}
a.app .tags span{font-size:11.5px;font-weight:700;color:var(--muted);background:var(--in);border:1px solid var(--line);border-radius:999px;padding:2px 9px}
a.app .go{margin-top:auto;font-weight:700;color:var(--accent);font-size:14px}
.foot{color:var(--muted);font-size:12.5px;border-top:1px solid var(--line);padding-top:14px;display:flex;flex-direction:column;gap:6px}
.foot p{margin:0}.foot a{color:var(--accent);font-weight:600}
'''
cards=''.join(f'''<a class="app" href="{a['href']}"><div class="top"><div class="ico" style="background:{a['grad']}"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{a['icon']}</svg></div><h2>{a['name']}</h2></div><p>{a['desc']}</p><div class="tags">{''.join(f'<span>{t}</span>' for t in a['tags'])}</div><div class="go">Megnyitás →</div></a>''' for a in APPS)
logo='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V9l8-5 8 5v12"/><path d="M8 21v-6h8v6M8 12h8"/></svg>'
fav="%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23334155'/%3E%3Cpath d='M7 26V12l9-6 9 6v14M11 26v-8h10v8M11 15h10' stroke='white' stroke-width='2.2' fill='none' stroke-linejoin='round' stroke-linecap='round'/%3E%3C/svg%3E"
html=f'''<!doctype html>
<html lang="hu">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="{CSP}">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#334155">
<title>Bútortervező</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
<link rel="icon" href="data:image/svg+xml,{fav}">
<style>{CSS}
{extra}
</style>
</head>
<body>
<header>
 <div class="logo" style="background:linear-gradient(135deg,#334155,#64748b)">{logo}</div>
 <div class="ttl" style="display:block">Bútortervező</div>
 <div class="grow"></div>
 <button class="ib" id="themeBtn" title="Téma"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></button>
</header>
<div class="wrap">
 <div class="hero"><h1>Bútortervező</h1><p>Egyfájlos tervező appok telefonra és laptopra. A tervek a böngészőben maradnak, JSON-ba menthetők, a tervlap képként és PDF-ként exportálható.</p></div>
 <div class="apps">{cards}</div>
 <footer class="foot">
  <p>Nincs regisztráció, nincs szerver, nincs adatgyűjtés: a terv csak a saját böngésződben tárolódik (localStorage), és JSON-ba menthető. A betűtípust a Google Fonts szolgáltatja.</p>
  <p><a href="https://github.com/nomadbeni/butortervezo">Forráskód a GitHubon</a> · Szabad felhasználás az <a href="https://github.com/nomadbeni/butortervezo/blob/main/LICENSE">MIT licenc</a> szerint.</p>
  <p>A tárolóban minden kódot és leírást teljes egészében mesterséges intelligencia (Claude, Anthropic) készített, az ellenőrzést egy másik MI végezte.</p>
  <p lang="en">All code and text in this repository were created entirely by AI (Claude, Anthropic) and reviewed by another AI. Free to use under the MIT License.</p>
 </footer>
</div>
<div id="toast"></div>
<script>
(()=>{{const k='bt.theme',TH=['auto','light','dark'],r=document.documentElement;
const get=()=>{{try{{return localStorage.getItem(k)||'auto'}}catch(e){{return 'auto'}}}};
const apply=t=>t==='auto'?r.removeAttribute('data-theme'):r.setAttribute('data-theme',t);apply(get());
document.getElementById('themeBtn').onclick=()=>{{const n=TH[(TH.indexOf(get())+1)%3];try{{localStorage.setItem(k,n)}}catch(e){{}}apply(n);const t=document.getElementById('toast');t.textContent='Téma: '+{{auto:'automatikus',light:'világos',dark:'sötét'}}[n];t.classList.add('on');setTimeout(()=>t.classList.remove('on'),1800)}};
}})();
</script>
</body>
</html>
'''
from build import with_script_hash
html=with_script_hash(html)
open(os.path.join(SP,'..','index.html'),'w',encoding='utf-8').write(html)
print('wrote index.html',len(html))
