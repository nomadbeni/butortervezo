/* ===== közös alap (app keret, mezők, téma, menü) ===== */
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
const parse=s=>{try{return JSON.parse(s)}catch(e){return null}};
const num=v=>{if(v==null)return NaN;if(typeof v==='number')return v;const s=String(v).replace(/\s/g,'').replace(',','.');return s===''?NaN:+s};
const ok=x=>Number.isFinite(x);
function fmt(x,d=2){if(!ok(x))return '–';const a=Math.abs(x);let dd=d;if(a>=1000)dd=0;else if(a>=100)dd=Math.min(d,1);return x.toLocaleString('hu-HU',{minimumFractionDigits:0,maximumFractionDigits:dd})}
let toastT=0;function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('on'),2200)}
const uid=()=>Math.random().toString(36).slice(2,10);
const IC={
 plus:'<path d="M12 5v14M5 12h14"/>',trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
 dl:'<path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14"/>',up:'<path d="M12 20V9m0 0-4 4m4-4 4 4M5 5h14"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
 print:'<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3"/><rect x="7" y="14" width="10" height="7"/>',doc:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',home:'<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>'
};
const ic=(k,w=18)=>`<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[k]||''}</svg>`;
/* field builders – S[t][k] */
const fld=(t,k,label,o={})=>{const v=S[t][k]??'';const unit=o.u?`<span class="u">${o.u}</span>`:'';
 return `<div class="f"${o.style?` style="${o.style}"`:''}><label for="i_${t}_${k}">${label}</label><div class="iw"><input id="i_${t}_${k}" data-t="${t}" data-k="${k}" maxlength="120" inputmode="decimal" autocomplete="off" value="${esc(v)}" placeholder="${esc(o.ph||'')}">${unit}</div></div>`};
const seg=(t,k,opts)=>`<div class="seg">${opts.map(([v,l])=>`<button type="button" data-t="${t}" data-seg="${k}" data-v="${v}" class="${S[t][k]===v?'on':''}">${l}</button>`).join('')}</div>`;
async function download(name,text,type){const blob=new Blob([text],{type});const file=new File([blob],name,{type});
 if(navigator.canShare&&/Mobi|Android|iPhone|iPad/.test(navigator.userAgent)&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:name});return}catch(e){if(e.name==='AbortError')return}}
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
const safeName=s=>(s||'export').replace(/[^\p{L}\p{N}\-_ ]/gu,'').trim().replace(/\s+/g,'_')||'export';
/* CSV-cella: a képletként értelmezhető kezdőkaraktert (= + - @ TAB CR) aposztróf semlegesíti (CSV-injektálás ellen) */
const csvQ=v=>{v=String(v??'');if(/^[=+\-@\t\r]/.test(v))v="'"+v;return /[;"\r\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
/* app shell */
function shell(cfg){
 // cfg: {prefix, tabs:[[key,label,short,icon]], R, onClick(act,el), onInput(el), menu(), onMenu(m), afterRender()}
 let tab=store.get(cfg.prefix+'.tab');if(!cfg.tabs.some(t=>t[0]===tab))tab=cfg.tabs[0][0];
 /* mentés: ha az app ad guard()-ot, csak érvényes állapot kerül a tárolóba (a guard vissza is állíthat) */
 let saveT=0;const save=()=>{if(cfg.guard&&!cfg.guard())return false;clearTimeout(saveT);
  saveT=setTimeout(()=>{if(!store.set(cfg.prefix+'.state',JSON.stringify(S)))toast('Nem sikerült menteni a böngészőbe (megtelt a tárhely?). Mentsd a tervet JSON-ba.')},250);return true};
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

/* ===== import-ellenőrzés (közös) =====
   Szabályok: a fájl legfeljebb 2 MB, érvényes JSON objektum, a megfelelő "app" mezővel.
   Kötelező méretek (nem véges vagy tartományon kívüli szám) és a darabszám-korlátok átlépése -> elutasítás, érthető üzenettel.
   Opcionális mezők (szövegek, kapcsolók, választók) hibás típus esetén alapértékre állnak, a szövegek hossza korlátozott.
   Az importált azonosítókat az app nem használja: minden elem új, belső azonosítót kap. */
const IMP_MAX_BYTES=2*1024*1024;
class ImportErr extends Error{constructor(m){super(m);this.name='ImportErr'}}
const impFail=m=>{throw new ImportErr(m)};
const isObj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
/* egysoros szöveg: sortörés és TAB szóközre, egyéb vezérlőkarakter törölve, hossz korlátozva */
const vStr=(v,max=200,def='')=>(typeof v==='string'?v:(typeof v==='number'&&Number.isFinite(v)?String(v):def)).replace(/[\t\r\n]+/g,' ').replace(/[\u0000-\u001f\u007f]/g,'').slice(0,max);
const vNumRaw=v=>typeof v==='number'?v:(typeof v==='string'&&v.trim()!==''&&v.length<40?num(v):NaN);
const vNum=(v,lo,hi,what)=>{const n=vNumRaw(v);if(!Number.isFinite(n)||n<lo||n>hi)impFail(`Érvénytelen érték: ${what} (${lo} és ${hi} közötti szám kell)`);return n};
const vNumOpt=(v,lo,hi,def)=>{const n=vNumRaw(v);return Number.isFinite(n)?Math.min(hi,Math.max(lo,n)):def};
const vArr=(v,max,what,min=0)=>{if(!Array.isArray(v))impFail(`Hiányzó vagy hibás lista: ${what}`);if(v.length>max)impFail(`Túl sok elem: ${what} (legfeljebb ${max})`);if(v.length<min)impFail(`Üres lista: ${what}`);return v};
const vObj=(v,what)=>{if(!isObj(v))impFail(`Hibás adat: ${what}`);return v};
const vOne=(v,list,def)=>list.includes(v)?v:def;
const vFlag=v=>v===true||v===1||v==='1'?'1':'';
const vBool=v=>v===true||v===1||v==='1'?1:0;
function parseImport(text,app,appName){if(typeof text!=='string')impFail('A fájl nem szöveges.');
 if(text.length>IMP_MAX_BYTES)impFail('A fájl túl nagy (legfeljebb 2 MB lehet).');
 let d;try{d=JSON.parse(text)}catch(e){impFail('A fájl nem érvényes JSON.')}
 if(!isObj(d))impFail('A fájl nem tervfájl.');if(d.app!==app)impFail(`Ez nem ${appName} fájl.`);return d}
/* fájl beolvasása + ellenőrzése; a validate függvény a kész, ellenőrzött adatot adja vissza vagy ImportErr-t dob */
function readImport(file,app,appName,validate){return new Promise((res,rej)=>{
 if(!file)return rej(new ImportErr('Nincs fájl kiválasztva.'));
 if(file.size>IMP_MAX_BYTES)return rej(new ImportErr(`A fájl túl nagy (${(file.size/1048576).toFixed(1)} MB, legfeljebb 2 MB lehet).`));
 const rd=new FileReader();rd.onerror=()=>rej(new ImportErr('A fájl nem olvasható.'));
 rd.onload=()=>{try{res(validate(parseImport(rd.result,app,appName)))}catch(e){rej(e instanceof ImportErr?e:new ImportErr('Hibás tervfájl.'))}};
 rd.readAsText(file)})}
/* ===== tárolt terv védelme =====
   Betöltéskor hibás tárolt terv: az eredeti szöveg a <prefix>.state.bak kulcsra kerül, és a menüből letölthető (nem vész el csendben).
   Szerkesztéskor: az app guard()-ja minden mentés előtt ugyanazzal az ellenőrzéssel nézi az állapotot, mint az import;
   ha nem felel meg (pl. túl nagy méret, túl sok elem), a módosítást visszavonja, így a tárolt terv mindig betölthető marad. */
const bakKey=p=>p+'.state.bak';
function keepBadState(prefix){const raw=store.get(prefix+'.state');if(raw)store.set(bakKey(prefix),raw)}
const bakMenu=prefix=>store.get(bakKey(prefix))?`<button class="mi" data-m="bak">${ic('dl')}Hibás tárolt terv letöltése</button>`:'';
function downloadBak(prefix){const raw=store.get(bakKey(prefix));if(!raw)return;download(prefix+'_hibas_tarolt_terv.json',raw,'application/json');store.del(bakKey(prefix));toast('Letöltve; a böngészőből törölve.')}
/* check(): érvényes-e az állapot; snapshot(): az állapot szövegként; apply(d): visszaállítás egy korábbi pillanatképre.
   Visszaállítás mindig az utolsó, ellenőrzésen átment állapotra történik (nem a visszavonási verem tetejére). */
function makeGuard(check,snapshot,apply){let busy=false,last=null;
 return ()=>{if(busy)return true;try{check();last=snapshot();return true}catch(e){
  busy=true;const msg=e instanceof ImportErr?e.message:'Érvénytelen állapot.';
  try{if(last){apply(JSON.parse(last));toast(msg+' A módosítás visszavonva.')}else toast(msg+' A terv nem menthető: mentsd JSON-ba.')}
  catch(_){toast('A terv nem menthető: mentsd JSON-ba.')}finally{busy=false}return false}}}
