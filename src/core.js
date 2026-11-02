/* ===== közös alap (app keret, mezők, téma, menü) ===== */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
const parse=s=>{try{return JSON.parse(s)}catch(e){return null}};
const num=v=>{if(v==null)return NaN;if(typeof v==='number')return v;const s=String(v).replace(/\s/g,'').replace(',','.');return s===''?NaN:+s};
const ok=x=>Number.isFinite(x);
function fmt(x,d=2){if(!ok(x))return '–';const a=Math.abs(x);let dd=d;if(a>=1000)dd=0;else if(a>=100)dd=Math.min(d,1);return x.toLocaleString('hu-HU',{minimumFractionDigits:0,maximumFractionDigits:dd})}
const fmtF=(x,d)=>ok(x)?x.toLocaleString('hu-HU',{minimumFractionDigits:d,maximumFractionDigits:d}):'–';
const fmtFt=x=>ok(x)?Math.round(x).toLocaleString('hu-HU')+' Ft':'–';
let toastT=0;function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('on'),2200)}
const uid=()=>Math.random().toString(36).slice(2,10);
const IC={
 plus:'<path d="M12 5v14M5 12h14"/>',trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
 dl:'<path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14"/>',up:'<path d="M12 20V9m0 0-4 4m4-4 4 4M5 5h14"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
 print:'<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3"/><rect x="7" y="14" width="10" height="7"/>',doc:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',home:'<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>'
};
const ic=(k,w=18)=>`<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[k]||''}</svg>`;
/* field builders – S[t][k] */
const unitSel=(t,uk,opts)=>`<select data-t="${t}" data-k="${uk}">${opts.map(u=>`<option ${S[t][uk]===u?'selected':''}>${u}</option>`).join('')}</select>`;
const fld=(t,k,label,o={})=>{const v=S[t][k]??'';const unit=o.units?unitSel(t,o.uk,o.units):(o.u?`<span class="u">${o.u}</span>`:'');
 return `<div class="f"${o.style?` style="${o.style}"`:''}><label for="i_${t}_${k}">${label}</label><div class="iw"><input id="i_${t}_${k}" data-t="${t}" data-k="${k}" inputmode="decimal" autocomplete="off" value="${esc(v)}" placeholder="${esc(o.ph||'')}">${unit}</div></div>`};
const seg=(t,k,opts)=>`<div class="seg">${opts.map(([v,l])=>`<button type="button" data-t="${t}" data-seg="${k}" data-v="${v}" class="${S[t][k]===v?'on':''}">${l}</button>`).join('')}</div>`;
const sel=(t,k,opts,label)=>`<div class="f"><label>${label}</label><select class="sel" data-t="${t}" data-k="${k}">${opts.map(o=>{const [v,l]=Array.isArray(o)?o:[o,o];return `<option value="${esc(v)}" ${S[t][k]===v?'selected':''}>${esc(l)}</option>`}).join('')}</select></div>`;
const kv=(id,label,unit,o={})=>`<div class="kv${o.big?' big':''}"><small>${label}</small><b id="${id}">–</b>${unit?`<i>${unit}</i>`:''}${o.alt?`<span class="alt" id="${id}_alt"></span>`:''}</div>`;
const set=(id,v,alt)=>{const e=document.getElementById(id);if(e)e.textContent=v;if(alt!==undefined){const a=document.getElementById(id+'_alt');if(a)a.textContent=alt}};
async function download(name,text,type){const blob=new Blob([text],{type});const file=new File([blob],name,{type});
 if(navigator.canShare&&/Mobi|Android|iPhone|iPad/.test(navigator.userAgent)&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:name});return}catch(e){if(e.name==='AbortError')return}}
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
const safeName=s=>(s||'export').replace(/[^\p{L}\p{N}\-_ ]/gu,'').trim().replace(/\s+/g,'_')||'export';
const csvQ=v=>{v=String(v??'');return /[;"\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
async function copyText(t){try{await navigator.clipboard.writeText(t);return true}catch(e){const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();let r=false;try{r=document.execCommand('copy')}catch(_){}ta.remove();return r}}
/* app shell */
function shell(cfg){
 // cfg: {prefix, tabs:[[key,label,short,icon]], R, onClick(act,el), onInput(el), menu(), onMenu(m), afterRender()}
 let tab=store.get(cfg.prefix+'.tab');if(!cfg.R[tab])tab=cfg.tabs[0][0];
 let saveT=0;const save=()=>{clearTimeout(saveT);saveT=setTimeout(()=>store.set(cfg.prefix+'.state',JSON.stringify(S)),250)};
 const navHTML=c=>cfg.tabs.map(([k,l,sh,icn],i)=>`${c==='side'&&cfg.sep&&cfg.sep.includes(i)?'<hr>':''}<button data-tab="${k}" class="${tab===k?'on':''}">${ic(icn||k)}<span>${c==='side'?l:sh}</span></button>`).join('')+(c==='side'?`<hr><div class="ver">${cfg.note||'Számítások tájékoztató jellegűek, a tervezői felelősséget nem váltják ki.'}</div>`:'');
 function render(){const r=cfg.R[tab];$('#side').innerHTML=navHTML('side');$('#bot').innerHTML=navHTML('bot');
  $('#main').innerHTML=`<div class="ph"><div><h1>${r.title}</h1><p>${r.desc}</p></div></div>${r.html()}`;r.calc();cfg.afterRender&&cfg.afterRender();
  const b=$('#bot .on');if(b)b.scrollIntoView({block:'nearest',inline:'center'})}
 function recalc(){cfg.R[tab].calc();cfg.afterRender&&cfg.afterRender();save()}
 document.addEventListener('click',e=>{const t=e.target.closest('[data-tab]');if(t){tab=t.dataset.tab;store.set(cfg.prefix+'.tab',tab);render();window.scrollTo({top:0});return}
  const sg=e.target.closest('[data-seg]');if(sg&&sg.dataset.t){S[sg.dataset.t][sg.dataset.seg]=sg.dataset.v;save();render();return}
  const a=e.target.closest('[data-act]');if(a&&cfg.onClick)cfg.onClick(a.dataset.act,a,e)});
 document.addEventListener('input',e=>{const t=e.target;if(t.dataset.t&&t.dataset.k&&S[t.dataset.t]){S[t.dataset.t][t.dataset.k]=t.value;if(t.dataset.rr)render();else recalc();return}if(cfg.onInput)cfg.onInput(t)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#menu').classList.remove('on');$('#modal')&&$('#modal').classList.remove('on')}});
 const TH=['auto','light','dark'];const applyTheme=t=>{const r=document.documentElement;t==='auto'?r.removeAttribute('data-theme'):r.setAttribute('data-theme',t)};
 applyTheme(store.get(cfg.prefix+'.theme')||'auto');$('#themeBtn').onclick=()=>{const c=store.get(cfg.prefix+'.theme')||'auto',n=TH[(TH.indexOf(c)+1)%3];store.set(cfg.prefix+'.theme',n);applyTheme(n);cfg.afterRender&&cfg.afterRender();toast('Téma: '+{auto:'automatikus',light:'világos',dark:'sötét'}[n])};
 $('#menuBtn').onclick=()=>{$('#menuBody').innerHTML=cfg.menu();$('#menu').classList.add('on')};
 $('#menu').addEventListener('click',e=>{if(e.target.id==='menu'){$('#menu').classList.remove('on');return}const m=e.target.closest('[data-m]');if(!m)return;$('#menu').classList.remove('on');cfg.onMenu&&cfg.onMenu(m.dataset.m,m)});
 return {render,recalc,save,get tab(){return tab},setTab(t){tab=t;store.set(cfg.prefix+'.tab',t)}}}
function loadState(prefix,DEF){const s=parse(store.get(prefix+'.state'))||{};const o={};for(const k in DEF)o[k]={...JSON.parse(JSON.stringify(DEF[k])),...(s[k]||{})};return o}
