import sys,os
SP=os.path.dirname(os.path.abspath(__file__))+'/'
CSS=open(SP+'common.css').read()
CORE=open(SP+'core.js').read()
EXTRA_CSS='''
.logo{background:var(--logo)!important}
'''
def page(fname,title,themecolor,logo_grad,logo_svg,favicon_svg,accent_css,body_extra,script,extra_css=''):
    html=f'''<!doctype html>
<html lang="hu">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="{themecolor}">
<title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap">
<link rel="icon" href="data:image/svg+xml,{favicon_svg}">
<style>{CSS}
{EXTRA_CSS}
{accent_css}
{extra_css}
</style>
</head>
<body>
<header>
 <div class="logo" style="--logo:{logo_grad}">{logo_svg}</div>
 <div class="ttl">{title}</div>
 <div class="grow"></div>
 {body_extra}
 <a class="ib" href="index.html" title="Bútortervező kezdőlap" aria-label="Kezdőlap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/></svg></a>
 <button class="ib" id="themeBtn" title="Téma"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></button>
 <button class="ib" id="menuBtn" title="Menü"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
</header>
<div class="app">
 <nav class="side" id="side"></nav>
 <main id="main"></main>
</div>
<nav class="bot" id="bot"></nav>
<div id="menu"><div class="sheet" id="menuBody"></div></div>
<div id="modal"><div class="dlg" id="modalBody"></div></div>
<div id="toast"></div>
<input type="file" id="file" accept=".json,application/json" hidden>
<script>
(()=>{{
'use strict';
{CORE}
{script}
}})();
</script>
</body>
</html>
'''
    open(os.path.join(SP,'..',fname),'w',encoding='utf-8').write(html)
    print('wrote',fname,len(html))
