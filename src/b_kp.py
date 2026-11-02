import sys;sys.path.insert(0,'.')
from build import page
acc='''
:root{--accent:#b45309;--accent2:#d97706}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--accent:#f59e0b;--accent2:#fbbf24}}
:root[data-theme="dark"]{--accent:#f59e0b;--accent2:#fbbf24}
'''
css='''
.kpg{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:16px;align-items:start}
.kcol{display:flex;flex-direction:column;gap:16px;min-width:0}
@media (max-width:1180px){.kpg{grid-template-columns:1fr}}
.tb{gap:6px}.tb .l{font-size:12px;font-weight:600;color:var(--muted);margin-left:6px}.tb .seg button{padding:5px 9px}
.cv{background:#fcfcfa;border:1px solid var(--line);border-radius:12px;overflow:hidden;display:flex;justify-content:center;touch-action:none;user-select:none;-webkit-user-select:none}
.cv svg{display:block;max-width:100%;height:auto}
.fields.f2{grid-template-columns:repeat(2,minmax(0,1fr))}
.cks{display:flex;flex-direction:column;gap:6px}
.ck{display:flex;gap:8px;align-items:center;font-size:13.5px;cursor:pointer}.ck input{width:16px;height:16px;accent-color:var(--accent);flex:none}
.tlist{display:flex;flex-direction:column;gap:6px}
.trw{display:grid;grid-template-columns:104px minmax(0,1fr) auto;gap:6px;align-items:center}.trw.x{grid-template-columns:minmax(0,1.4fr) minmax(0,1fr) auto}
.trw .sel,.trw .txt{padding:6px 8px;font-size:13px}
.blist{display:flex;flex-direction:column;gap:2px;max-height:300px;overflow:auto}
.bl{display:grid;grid-template-columns:14px minmax(0,1fr) auto;gap:8px;align-items:center;border:0;background:transparent;text-align:left;padding:7px 8px;border-radius:9px;cursor:pointer}
.bl:hover{background:var(--hover)}.bl.on{background:color-mix(in srgb,var(--accent) 14%,transparent)}
.bl i{width:14px;height:14px;border-radius:4px;border:1px solid #1c2128}.bl span{font-weight:600;font-size:13.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.bl small{color:var(--muted);font-variant-numeric:tabular-nums;font-size:12px}
.sw{display:inline-block;width:12px;height:12px;border-radius:3px;border:1px solid #1c2128}
.dms{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}
.dms .seg button{padding:5px 9px;font-size:12.5px}
.sheetw{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fff}
.sheetw svg{display:block;width:100%;height:auto}
#kp_props{display:flex;flex-direction:column;gap:12px}
#kp_props .seg button{padding:5px 9px;font-size:12.5px}
#rep{display:none}
@media print{
 html:has(body.rep-on){color-scheme:light!important;background:#fff!important}
 body.rep-on{background:#fff!important}
 body.rep-on>*:not(#rep){display:none!important}
 body.rep-on #rep{display:block!important}
 #rep{page:kp}
 #rep svg{display:block;width:100%;height:auto;max-height:193mm}
}
@page kp{size:A4 landscape;margin:8mm}
'''
logo='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M3 12a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3z"/><path d="M5 17v2M19 17v2"/></svg>'
fav="%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23b45309'/%3E%3Cpath d='M8 15v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M5 16a2 2 0 0 1 4 0v2h14v-2a2 2 0 0 1 4 0v6H5zM8 22v3M24 22v3' stroke='white' stroke-width='2.2' fill='none' stroke-linejoin='round' stroke-linecap='round'/%3E%3C/svg%3E"
page('kanape.html','Kanapé-tervező','#b45309','linear-gradient(135deg,#b45309,#f59e0b)',logo,fav,acc,'',open('kp.js').read(),css)
