import sys;sys.path.insert(0,'.')
from build import page
acc='''
:root{--accent:#0f766e;--accent2:#14b8a6}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--accent:#2dd4bf;--accent2:#5eead4}}
:root[data-theme="dark"]{--accent:#2dd4bf;--accent2:#5eead4}
'''
css='''
.prg{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:16px;align-items:start}
.kcol{display:flex;flex-direction:column;gap:16px;min-width:0}
@media (max-width:1180px){.prg{grid-template-columns:1fr}}
.tb{gap:6px}.tb .grow{flex:1}
.ctabs{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.ctab{display:inline-flex;gap:7px;align-items:center;border:1px solid var(--line);background:var(--in);border-radius:10px;padding:6px 10px;cursor:pointer;font-weight:600;font-size:13px;max-width:260px}
.ctab span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ctab small{color:var(--muted);font-weight:700;font-size:11px;background:var(--hover);border-radius:999px;padding:0 6px}
.ctab svg{flex:none;color:var(--muted)}
.cgrp{display:flex;gap:6px;flex-wrap:wrap;align-items:center;padding:4px 6px 4px 4px;border:1px dashed color-mix(in srgb,var(--accent) 45%,var(--line));border-radius:12px;width:100%}
.glab{display:inline-flex;gap:5px;align-items:center;font-size:12px;font-weight:800;color:var(--accent);text-transform:uppercase;letter-spacing:.04em;padding:0 6px}
.ctab .no{display:inline-grid;place-items:center;min-width:20px;height:20px;border-radius:999px;background:#475569;color:#fff;font-size:11px;font-weight:800;padding:0 5px}
.ctab.on .no{background:var(--accent)}
#pr_view .seg button{padding:5px 10px;font-size:12.5px}
.ctab:hover{border-color:var(--accent)}
.ctab.on{background:color-mix(in srgb,var(--accent) 14%,var(--bg2));border-color:var(--accent)}
.ctab.on svg{color:var(--accent)}
select.sel.addc{width:auto;padding:6px 10px;font-size:13px;font-weight:600}
.cv{background:#fcfcfa;border:1px solid var(--line);border-radius:12px;overflow:hidden;display:flex;justify-content:center;touch-action:pan-y pinch-zoom;user-select:none;-webkit-user-select:none;min-height:200px}
.cv svg{display:block;max-width:100%;height:auto}
.cv .empty{padding:60px 20px;color:#64748b;text-align:center;font-weight:600}
.fields.f2{grid-template-columns:repeat(2,minmax(0,1fr))}
.fields.f3{grid-template-columns:repeat(3,minmax(0,1fr))}
@media (max-width:420px){.fields.f3{grid-template-columns:repeat(2,minmax(0,1fr))}}
.ck{display:flex;gap:8px;align-items:center;font-size:13.5px;cursor:pointer}.ck input{width:16px;height:16px;accent-color:var(--accent);flex:none}
.ck.sm{font-size:12.5px;color:var(--muted);font-weight:600;margin-left:6px}
.cks{display:flex;flex-direction:column;gap:6px}
.lk{border:0;border-left:1px solid var(--line);background:transparent;padding:0 9px;cursor:pointer;color:var(--muted);display:grid;place-items:center}
.lk:hover{color:var(--fg)}.lk.on{color:var(--accent);background:color-mix(in srgb,var(--accent) 12%,transparent)}
.ilist{display:flex;flex-direction:column;gap:6px}
.irow{display:grid;grid-template-columns:22px minmax(0,1fr) 52px minmax(0,104px) auto auto;gap:5px;align-items:center}
.irow .txt{padding:6px 8px;font-size:13px}
.irow .q{text-align:center}
.irow .sel.mv{padding:6px 4px;font-size:12px}
.irow .btn.sm{padding:5px 7px}
.cdot{width:20px;height:20px;border-radius:6px;border:2px solid var(--bg2);box-shadow:0 0 0 1px var(--line);cursor:pointer;padding:0}
@media (max-width:480px){.irow{grid-template-columns:22px minmax(0,1fr) 46px auto auto}.irow .sel.mv{grid-column:2/-1;grid-row:2}}
.addrow{display:flex;gap:6px}.addrow .txt{flex:1;padding:7px 9px}
.btn[disabled]{opacity:.45;cursor:not-allowed}
.srch{align-items:center;padding-left:10px;color:var(--muted)}
.srch input{font-weight:500}
.sw{display:inline-block;width:11px;height:11px;border-radius:3px;vertical-align:-1px}
.sheetw{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fff}
.sheetw svg{display:block;width:100%;height:auto}
#pr_ghost{position:fixed;z-index:70;pointer-events:none;background:var(--accent);color:#fff;padding:5px 10px;border-radius:8px;font-size:13px;font-weight:700;box-shadow:var(--shadow);white-space:nowrap}
#rep{display:none}
@media print{
 html:has(body.rep-on){color-scheme:light!important;background:#fff!important}
 body.rep-on{background:#fff!important}
 body.rep-on>*:not(#rep){display:none!important}
 body.rep-on #rep{display:block!important}
 #rep{page:pr}
 #rep .pg{break-after:page;page-break-after:always}
 #rep .pg:last-child{break-after:auto;page-break-after:auto}
 #rep svg{display:block;width:100%;height:auto;max-height:193mm}
}
@page pr{size:A4 landscape;margin:8mm}
'''
logo='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M4 9h16M4 15h16"/><path d="M7 6.5h3M13 12.5h4M7 18.5h5"/></svg>'
fav="%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230f766e'/%3E%3Crect x='8' y='6' width='16' height='20' rx='1.5' stroke='white' stroke-width='2.2' fill='none'/%3E%3Cpath d='M8 13h16M8 19h16M11 9.5h4M17 16h4M11 22.5h5' stroke='white' stroke-width='2.2' stroke-linecap='round'/%3E%3C/svg%3E"
page('polcrendezo.html','Polcrendező','#0f766e','linear-gradient(135deg,#0f766e,#14b8a6)',logo,fav,acc,'',open('pr.js').read(),css)
