/* ================= Kanapé-tervező ================= */
Object.assign(IC,{
 plan:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h7v11M10 14h11"/>',
 side:'<path d="M4 17v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5z"/><path d="M4 14h16M6 17v3M18 17v3M8 10V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3"/>',
 sheet:'<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 16h18M10 16v4M15 4v12"/>',
 img:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
 mirH:'<path d="M12 3v18M9 7 4 12l5 5zM15 7l5 5-5 5z"/>',mirV:'<path d="M3 12h18M7 9l5-5 5 5zM7 15l5 5 5-5z"/>',
 rot:'<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/>',redo:'<path d="m15 14 5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>',
 norm:'<path d="M4 4h6M4 4v6M4 4l7 7"/><rect x="11" y="11" width="9" height="9" rx="1"/>',file:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
 front:'<rect x="9" y="9" width="11" height="11" rx="1"/><path d="M4 15V5a1 1 0 0 1 1-1h10"/>',back:'<rect x="4" y="4" width="11" height="11" rx="1"/><path d="M20 9v10a1 1 0 0 1-1 1H9"/>'
});
let S;
const INK='#1c2128',ACC='#b45309',FONT='Inter,Arial,Helvetica,sans-serif';
const TY={seat:['Ülőrész','#e6e8eb'],trim:['Bőr perem / könyöklő','#f3d6ab'],back:['Háttámla','#cdd5df'],pil:['Párna / fekvőrész','#dde7f2']};
const TORDER=['trim','seat','pil','back'];
const LGK={seat:'lgSeat',trim:'lgTrim',back:'lgBack',pil:'lgPil'};
const NEWSZ={seat:[80,80],trim:[150,13],back:[150,20],pil:[80,150]};
const B=(name,type,x,y,w,h,o={})=>({id:uid(),name,type,x,y,w,h,dw:o.dw?1:0,dh:o.dh?1:0,tab:(o.tab||[]).map(([f,l])=>({f,l}))});
const TPL={
 kep:{n:'Lépcsős sarokkanapé (minta)',p:{dT:'edge',dB:'tot',dL:'tot',dR:'chain',totW:'',totH:'1',lTotH:'Teljes hossz (bal oldal)'},items:()=>[
  B('Felső perem','trim',0,0,165,13,{tab:[['w','Felső ág teljes hossza'],['h','Könyöklő / perem szélessége']]}),
  B('Bal kar','trim',0,13,15,299,{tab:[['w','Külső bal kar szélessége']]}),
  B('Felső ülőrész','seat',15,13,150,90,{tab:[['w','Felső ág hasznos hossza (könyöklő nélkül)'],['h','Jobb oldali függőleges rész']]}),
  B('Középső ülőrész','seat',15,103,80,124,{dw:1,tab:[['w','Belső ülőfelület szélessége'],['h','Középső függőleges rész']]}),
  B('Alsó ülőrész','seat',15,227,170,85,{tab:[['h','Alsó ág mélysége (szélessége)']]}),
  B('Alsó perem','trim',0,312,185,13,{tab:[['w','Alsó ág hossza']]})]},
 egy:{n:'Egyenes, 3 személyes',p:{dT:'chain',dB:'off',dL:'tot',dR:'chain',totW:'1',totH:'1',lTotW:'Teljes szélesség',lTotH:'Teljes mélység'},items:()=>[
  B('Bal karfa','trim',0,0,20,95,{tab:[['w','Karfa szélessége']]}),
  B('Háttámla','back',20,0,180,22,{tab:[['h','Háttámla vastagsága']]}),
  B('Ülőrész','seat',20,22,180,73,{dw:1,dh:1,tab:[['w','Ülőfelület szélessége'],['h','Ülésmélység']]}),
  B('Jobb karfa','trim',200,0,20,95)]},
 L:{n:'Sarokkanapé recamiere-rel',p:{dT:'chain',dB:'chain',dL:'chain',dR:'tot',totW:'1',totH:'1',lTotW:'Teljes szélesség',lTotH:'Teljes mélység'},items:()=>[
  B('Bal karfa','trim',0,0,20,95,{tab:[['w','Karfa szélessége']]}),
  B('Háttámla','back',20,0,240,22),
  B('Ülőrész','seat',20,22,160,73,{dw:1,tab:[['w','Ülőrész szélessége'],['h','Ülésmélység']]}),
  B('Recamiere','pil',180,22,80,148,{dw:1,dh:1,tab:[['w','Recamiere szélessége'],['h','Recamiere hossza']]}),
  B('Jobb karfa','trim',260,0,20,170)]},
 U:{n:'U alakú, két recamiere',p:{dT:'chain',dB:'chain',dL:'tot',dR:'chain',totW:'1',totH:'1',lTotW:'Teljes szélesség',lTotH:'Teljes mélység'},items:()=>[
  B('Bal karfa','trim',0,0,20,170,{tab:[['w','Karfa szélessége']]}),
  B('Háttámla','back',20,0,300,22),
  B('Ülőrész','seat',20,22,300,73,{tab:[['w','Ülőrész szélessége'],['h','Ülésmélység']]}),
  B('Bal recamiere','pil',20,95,80,75,{dw:1,tab:[['wh','Recamiere (sz × h)']]}),
  B('Jobb recamiere','pil',240,95,80,75,{dw:1}),
  B('Jobb karfa','trim',320,0,20,170)]}
};
const DEF={
 p:{title:'KANAPÉ – MÉRETEZETT TERVRAJZ',proj:'',client:'',author:'',date:'',
  H:'43',leg:'5',cush:'12',D:'90',bH:'8',bD:'40',
  dT:'edge',dB:'tot',dL:'tot',dR:'chain',totW:'',totH:'1',lTotW:'Teljes szélesség',lTotH:'Teljes hossz (bal oldal)',
  seams:'',lbl:'1',trimSum:'',area:'',snap:'5',
  lgSeat:'Ülőfelület / bútor test',lgTrim:'Bőr könyöklő / díszperem',lgBack:'Háttámla',lgPil:'Párna / fekvőrész',extra:[]},
 b:{items:null,sel:''}
};
/* ---------- adatellenőrzés (import és tárolt állapot) ---------- */
const KP_LIM={items:300,tab:20,extra:30,coord:20000,size:10000};
const KP_STR={title:120,proj:120,client:120,author:120,date:40,lTotW:120,lTotH:120,lgSeat:120,lgTrim:120,lgBack:120,lgPil:120};
const KP_NUM={H:[0,300],leg:[0,100],cush:[0,100],D:[0,500],bH:[0,200],bD:[0,300]};
const KP_DIM=['off','tot','chain','edge'],KP_FLAG=['totW','totH','seams','lbl','trimSum','area'];
function validateKp(d){
 const dp=isObj(d.p)?d.p:{},p={};
 for(const k in DEF.p){const v=dp[k],dv=DEF.p[k];
  if(k==='extra')p.extra=(Array.isArray(v)?v:[]).slice(0,KP_LIM.extra).filter(isObj).map(x=>({l:vStr(x.l,120),v:vStr(x.v,120)}));
  else if(KP_STR[k])p[k]=typeof v==='string'||typeof v==='number'?vStr(v,KP_STR[k]):dv;
  else if(KP_NUM[k]){const n=vNumOpt(v,KP_NUM[k][0],KP_NUM[k][1],NaN);p[k]=ok(n)?String(n):dv}
  else if(k==='snap')p[k]=vOne(String(v),['1','5','10'],dv);
  else if(/^d[TBLR]$/.test(k))p[k]=vOne(v,KP_DIM,dv);
  else if(KP_FLAG.includes(k))p[k]=v===undefined?dv:vFlag(v);
  else p[k]=dv}
 const db=vObj(d.b,'elemek'),idMap={};
 const items=vArr(db.items,KP_LIM.items,'elemek').map((b,i)=>{const n=`${i+1}. elem`;vObj(b,n);const id=uid();if(typeof b.id==='string')idMap[b.id]=id;
  return {id,name:vStr(b.name,80)||'Elem',type:vOne(b.type,Object.keys(TY),'seat'),
   x:vNum(b.x,-KP_LIM.coord,KP_LIM.coord,n+' x'),y:vNum(b.y,-KP_LIM.coord,KP_LIM.coord,n+' y'),
   w:vNum(b.w,.1,KP_LIM.size,n+' szélesség'),h:vNum(b.h,.1,KP_LIM.size,n+' mélység'),dw:b.dw?1:0,dh:b.dh?1:0,
   tab:(Array.isArray(b.tab)?b.tab:[]).slice(0,KP_LIM.tab).filter(isObj).map(r=>({f:vOne(r.f,['w','h','wh'],'w'),l:vStr(r.l,120)}))}});
 return {p,b:{items,sel:''},idMap}}
S=loadState('kp',DEF);
{let v=null;if(Array.isArray(S.b.items)){try{v=validateKp({p:S.p,b:S.b})}catch(e){v=null;setTimeout(()=>toast('A tárolt terv hibás volt, a minta töltődött be.'),400)}}
 if(v){const sel=v.idMap[S.b.sel]||'';S.p=v.p;S.b=v.b;S.b.sel=sel}else{S.p=validateKp({p:S.p,b:{items:[]}}).p;S.b={items:TPL.kep.items(),sel:''}}}

/* ---------- segédek ---------- */
const f=v=>Math.round(v*100)/100;
const r1=v=>Math.round(v*10)/10;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const eq=(a,b)=>Math.abs(a-b)<1e-6;
const tw=(s,fs)=>String(s).length*fs*.58;
const L1=v=>fmt(v,1);
const selB=()=>S.b.items.find(b=>b.id===S.b.sel);
const bbox=it=>({x0:Math.min(...it.map(b=>b.x)),y0:Math.min(...it.map(b=>b.y)),x1:Math.max(...it.map(b=>b.x+b.w)),y1:Math.max(...it.map(b=>b.y+b.h))});
const mkT=(s,ox,oy,bb)=>({s,ox,oy,bb,X:v=>ox+v*s,Y:v=>oy+v*s});
const line=(x1,y1,x2,y2,w,c=INK,extra='')=>`<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${c}" stroke-width="${f(w)}"${extra}/>`;
const tx=(x,y,t,fs,wt=400,anc='start',fill=INK,extra='')=>`<text x="${f(x)}" y="${f(y)}" font-size="${f(fs)}" font-weight="${wt}" text-anchor="${anc}" fill="${fill}"${extra}>${esc(t)}</text>`;
function wrap(t,n,max){const ws=String(t).split(/\s+/).filter(Boolean),ls=[];let cur='';
 for(const w of ws){const c=cur?cur+' '+w:w;if(c.length<=n||!cur)cur=c;else{ls.push(cur);cur=w}}if(cur)ls.push(cur);
 const out=ls.slice(0,max);if(ls.length>max)out[max-1]=out[max-1]+' '+ls.slice(max).join(' ');
 return out.map(l=>l.length>n?l.slice(0,Math.max(1,n-1))+'…':l)}
const pv=k=>{const v=num(S.p[k]);return ok(v)?v:NaN};

/* ---------- visszavonás ---------- */
let U=[],RD=[];
const snap=()=>JSON.stringify({p:S.p,b:S.b});
function hist(){const j=snap();if(U[U.length-1]!==j){U.push(j);if(U.length>80)U.shift();RD=[]}}
function applySnap(j){const d=JSON.parse(j);S.p=d.p;S.b=d.b;ui.save();ui.render()}
function undo(){const cur=snap();while(U.length&&U[U.length-1]===cur)U.pop();if(!U.length){toast('Nincs több visszavonható lépés');return}RD.push(cur);applySnap(U.pop())}
function redo(){if(!RD.length){toast('Nincs ismételhető lépés');return}U.push(snap());applySnap(RD.pop())}

/* ---------- méretláncok ---------- */
function chain(all,cand,side){
 const H=side==='top'||side==='bottom';
 const lo=b=>H?b.x:b.y,hi=b=>H?b.x+b.w:b.y+b.h;
 const dep=b=>side==='top'?b.y:side==='bottom'?-(b.y+b.h):side==='left'?b.x:-(b.x+b.w);
 const behind=(t,c)=>side==='top'?eq(c.y,t.y+t.h):side==='bottom'?eq(c.y+c.h,t.y):side==='left'?eq(c.x,t.x+t.w):eq(c.x+c.w,t.x);
 const a0=Math.min(...cand.map(lo)),a1=Math.max(...cand.map(hi));
 const vs=[...new Set(all.flatMap(b=>[lo(b),hi(b)]).filter(v=>v>=a0-1e-6&&v<=a1+1e-6))].sort((a,b)=>a-b);
 const parts=[];
 for(let i=0;i<vs.length-1;i++){const a=vs[i],b=vs[i+1];if(b-a<1e-6)continue;const m=(a+b)/2;
  const cov=cand.filter(q=>lo(q)<m&&hi(q)>m).sort((p,q)=>dep(p)-dep(q));
  let k='gap',d=null;
  if(cov.length){const o=cov[0];k=o.id;d=dep(o);if(o.type==='trim'){const bh=all.find(c=>c!==o&&lo(c)<m&&hi(c)>m&&behind(o,c));if(bh)k+='/'+bh.id}}
  const L=parts[parts.length-1];
  if(L&&L.k===k){L.b=b;if(d!=null)L.d=L.d==null?d:Math.min(L.d,d)}else parts.push({a,b,k,d})}
 return parts}
function ticksOf(parts){const t=[];parts.forEach((p,i)=>{if(i===0)t.push({v:p.a,d:p.d});const n=parts[i+1];const ds=[p.d,n&&n.d].filter(x=>x!=null);t.push({v:p.b,d:ds.length?Math.min(...ds):null})});return t}
const SIDES=[['top','dT'],['bottom','dB'],['left','dL'],['right','dR']];
function layoutDims(it,st){
 const out={lv:{},offs:{},m:{}};
 for(const [side,key] of SIDES){
  const H=side==='top'||side==='bottom';const mode=S.p[key]||'off';const lv=[];
  if(it.length&&mode!=='off'){
   const full=chain(it,it,side);
   if(mode==='tot')lv.push([{v:full[0].a,d:full[0].d},{v:full[full.length-1].b,d:full[full.length-1].d}]);
   else{
    let cand=it;
    if(mode==='edge'){const ed=b=>side==='top'?b.y:side==='bottom'?-(b.y+b.h):side==='left'?b.x:-(b.x+b.w);const mn=Math.min(...it.map(ed));cand=it.filter(b=>eq(ed(b),mn))}
    const parts=chain(it,cand,side);
    if(parts.length>1)lv.push(ticksOf(parts));
    lv.push([{v:parts[0].a,d:parts[0].d},{v:parts[parts.length-1].b,d:parts[parts.length-1].d}])}}
  const offs=[];let off=st.fs*1.5;
  lv.forEach(tk=>{offs.push(off);off+=H?st.fs*1.75:maxLab(tk,st)+st.fs*1.1});
  out.lv[side]=lv;out.offs[side]=offs;
  out.m[side]=!lv.length?st.fs*.6:H?offs[offs.length-1]+st.fs*1.45:offs[offs.length-1]+maxLab(lv[lv.length-1],st)+st.fs*.7}
 return out}
function maxLab(tk,st){let m=0;for(let i=0;i<tk.length-1;i++)m=Math.max(m,tw(L1(tk[i+1].v-tk[i].v),st.fs));return m}
function arrow(x,y,dx,dy,al){const w=al*.34,bx=x-dx*al,by=y-dy*al;return `<path d="M${f(x)} ${f(y)}L${f(bx-dy*w)} ${f(by+dx*w)}L${f(bx+dy*w)} ${f(by-dx*w)}Z" fill="${INK}"/>`}
function dimSeg(x1,y1,x2,y2,label,pos,st,halo){
 const L=Math.hypot(x2-x1,y2-y1);if(L<.5)return '';const ux=(x2-x1)/L,uy=(y2-y1)/L;
 let o=line(x1,y1,x2,y2,st.lw);
 if(L>=st.al*2.4)o+=arrow(x1,y1,-ux,-uy,st.al)+arrow(x2,y2,ux,uy,st.al);
 else{const e=st.al*1.7;o+=line(x1-ux*e,y1-uy*e,x1,y1,st.lw)+line(x2,y2,x2+ux*e,y2+uy*e,st.lw)+arrow(x1,y1,ux,uy,st.al)+arrow(x2,y2,-ux,-uy,st.al)}
 const mx=(x1+x2)/2,my=(y1+y2)/2,fs=st.fs;
 const h=halo?` stroke="${halo}" stroke-width="${f(fs*.28)}" paint-order="stroke" stroke-linejoin="round"`:'';
 if(pos==='above')o+=tx(mx,my-fs*.32,label,fs,700,'middle',INK,h);
 else if(pos==='below')o+=tx(mx,my+fs*1.02,label,fs,700,'middle',INK,h);
 else if(pos==='left')o+=tx(mx-fs*.42,my+fs*.36,label,fs,700,'end',INK,h);
 else o+=tx(mx+fs*.42,my+fs*.36,label,fs,700,'start',INK,h);
 return o}
function drawDims(LD,T,st){
 let o='';const bb=T.bb;if(!bb)return '';
 for(const [side] of SIDES){
  const H=side==='top'||side==='bottom',sg=side==='top'||side==='left'?-1:1;
  const base=side==='top'?T.Y(bb.y0):side==='bottom'?T.Y(bb.y1):side==='left'?T.X(bb.x0):T.X(bb.x1);
  const crd=d=>side==='top'||side==='left'?d:-d;
  LD.lv[side].forEach((tk,li)=>{
   const ln=base+sg*LD.offs[side][li];
   for(const t of tk){if(t.d==null)continue;const ob=H?T.Y(crd(t.d)):T.X(crd(t.d));const p=H?T.X(t.v):T.Y(t.v);const e1=ob+sg*st.fs*.22,e2=ln+sg*st.fs*.32;
    o+=H?line(p,e1,p,e2,st.lw*.75):line(e1,p,e2,p,st.lw*.75)}
   for(let i=0;i<tk.length-1;i++){const lab=L1(tk[i+1].v-tk[i].v);
    if(H){const p1=T.X(tk[i].v),p2=T.X(tk[i+1].v);o+=dimSeg(p1,ln,p2,ln,lab,side==='top'?'above':'below',st)}
    else{const p1=T.Y(tk[i].v),p2=T.Y(tk[i+1].v);o+=dimSeg(ln,p1,ln,p2,lab,side,st)}}})}
 return o}

/* ---------- felülnézet rajz ---------- */
function outline(bs,T){if(!bs.length)return '';
 const xs=[...new Set(bs.flatMap(b=>[b.x,b.x+b.w]))].sort((a,b)=>a-b),ys=[...new Set(bs.flatMap(b=>[b.y,b.y+b.h]))].sort((a,b)=>a-b);
 const nx=xs.length-1,ny=ys.length-1,C=[];
 for(let j=0;j<ny;j++){C[j]=[];const my=(ys[j]+ys[j+1])/2;for(let i=0;i<nx;i++){const mx=(xs[i]+xs[i+1])/2;C[j][i]=bs.some(b=>b.x<mx&&b.x+b.w>mx&&b.y<my&&b.y+b.h>my)}}
 const cv=(i,j)=>j>=0&&j<ny&&i>=0&&i<nx&&C[j][i];let d='';
 for(let j=0;j<=ny;j++){let s=null;for(let i=0;i<=nx;i++){const e=i<nx&&cv(i,j-1)!==cv(i,j);if(e&&s==null)s=i;if(!e&&s!=null){d+=`M${f(T.X(xs[s]))} ${f(T.Y(ys[j]))}H${f(T.X(xs[i]))}`;s=null}}}
 for(let i=0;i<=nx;i++){let s=null;for(let j=0;j<=ny;j++){const e=j<ny&&cv(i-1,j)!==cv(i,j);if(e&&s==null)s=j;if(!e&&s!=null){d+=`M${f(T.X(xs[i]))} ${f(T.Y(ys[s]))}V${f(T.Y(ys[j]))}`;s=null}}}
 return d}
function wave(x,y,w,h,st){const hz=w>=h,L=hz?w:h,th=hz?h:w;if(L<th*1.6||th<4)return '';
 const m=Math.max(th*.55,st.fs*.35),len=L-2*m;if(len<=th)return '';
 const a=Math.min(th*.19,st.fs*.26),n=Math.max(2,Math.round(len/Math.max(th*.62,st.fs*.42))),hw=len/n;let d;
 if(hz){d=`M${f(x+m)} ${f(y+th/2)}`;for(let i=0;i<n;i++)d+=`q${f(hw/2)} ${f((i%2?2:-2)*a)} ${f(hw)} 0`}
 else{d=`M${f(x+th/2)} ${f(y+m)}`;for(let i=0;i<n;i++)d+=`q${f((i%2?2:-2)*a)} ${f(hw/2)} 0 ${f(hw)}`}
 return `<path d="${d}" fill="none" stroke="#6b5238" stroke-width="${f(st.lw*.9)}" stroke-linecap="round"/>`}
function planSVG(it,T,st,opt={}){
 let o='';const nt=it.filter(b=>b.type!=='trim'),tr=it.filter(b=>b.type==='trim');
 const R=(b,a)=>`<rect x="${f(T.X(b.x))}" y="${f(T.Y(b.y))}" width="${f(b.w*T.s)}" height="${f(b.h*T.s)}" ${a}/>`;
 for(const b of nt)o+=R(b,`fill="${TY[b.type][1]}"`);
 for(const b of nt){if(b.type!=='seat')o+=R(b,`fill="none" stroke="#7d8793" stroke-width="${f(st.lw*.9)}"`);else if(S.p.seams)o+=R(b,`fill="none" stroke="#8a939e" stroke-width="${f(st.lw*.8)}" stroke-dasharray="${f(st.fs*.35)} ${f(st.fs*.25)}"`)}
 if(nt.length)o+=`<path d="${outline(nt,T)}" fill="none" stroke="${INK}" stroke-width="${f(st.lo)}" stroke-linecap="square"/>`;
 for(const b of tr){const w=b.w*T.s,h=b.h*T.s;o+=R(b,`rx="${f(Math.min(st.fs*.2,w/3,h/3))}" fill="${TY.trim[1]}" stroke="${INK}" stroke-width="${f(st.lo)}"`)+wave(T.X(b.x),T.Y(b.y),w,h,st)}
 for(const b of it){const fill=TY[b.type][1];
  if(b.dw){const y=T.Y(b.y+b.h*(b.dh?.4:.5));o+=dimSeg(T.X(b.x),y,T.X(b.x+b.w),y,L1(b.w),'above',st,fill)}
  if(b.dh){const x=T.X(b.x+b.w*(b.dw?.72:.5));o+=dimSeg(x,T.Y(b.y),x,T.Y(b.y+b.h),L1(b.h),'right',st,fill)}}
 if(opt.labels)for(const b of it){const w=b.w*T.s,h=b.h*T.s,fs=opt.lfs||st.fs*.9;if(w<fs*3.2||h<fs*2.4)continue;
  const n=Math.max(3,Math.floor((w-8)/(fs*.6))),ls=wrap(b.name,n,h>fs*4.6?2:1),cx=T.X(b.x)+w/2;let y=T.Y(b.y)+fs*1.3;
  for(const l of ls){o+=tx(cx,y,l,fs,700,'middle','#334155');y+=fs*1.12}
  if(opt.sizes&&h>fs*(2.6+ls.length*1.2))o+=tx(cx,y,`${L1(b.w)} × ${L1(b.h)}`,fs*.88,500,'middle','#64748b')}
 if(opt.dims!==false)o+=drawDims(opt.LD||layoutDims(it,st),T,st);
 return o}

/* ---------- oldalnézet ---------- */
function sideView(bx,by,bw,bh,fs){
 const g=(k,d)=>{const v=pv(k);return ok(v)?v:d};
 const H=Math.max(5,g('H',43)),leg=clamp(g('leg',5),0,H-2),cush=clamp(g('cush',12),0,H-leg-1),D=Math.max(10,g('D',90)),bH=Math.max(0,g('bH',0)),bD=clamp(g('bD',0),0,D);
 const hasB=bH>0&&bD>0,tot=H+(hasB?bH:0),st={fs,al:fs*.55,lw:fs*.075};
 const ml=tw(L1(H),fs)+fs*1.5,mr=hasB?tw(L1(tot),fs)+fs*1.5:fs*.6,mt=fs*.5,mb=fs*.6;
 const s=Math.min((bw-ml-mr)/D,(bh-mt-mb)/tot);
 const x0=bx+ml+((bw-ml-mr)-D*s)/2,yF=by+mt+tot*s+((bh-mt-mb)-tot*s)/2;
 const X=v=>x0+v*s,Y=v=>yF-v*s,lw=fs*.1;
 let o=line(X(-5),yF,X(D+5),yF,lw*.8,'#c4c9cf');
 const lg=Math.min(7,D*.07);
 if(leg>0)for(const lx of[5,D-5-lg])o+=`<rect x="${f(X(lx))}" y="${f(Y(leg)-2)}" width="${f(lg*s)}" height="${f(leg*s+2)}" rx="${f(Math.min(lg*s,leg*s)*.3)}" fill="#9aa1a9" stroke="${INK}" stroke-width="${f(lw)}"/>`;
 const bodyH=(H-cush-leg)*s;
 if(bodyH>0)o+=`<rect x="${f(X(0))}" y="${f(Y(H-cush))}" width="${f(D*s)}" height="${f(bodyH)}" rx="${f(Math.min(fs*.45,bodyH/3))}" fill="${TY.seat[1]}" stroke="${INK}" stroke-width="${f(lw*1.4)}"/>`;
 if(cush>0)o+=`<rect x="${f(X(0))}" y="${f(Y(H))}" width="${f(D*s)}" height="${f(cush*s)}" rx="${f(Math.min(fs*.55,cush*s/2.5))}" fill="#eef0f2" stroke="${INK}" stroke-width="${f(lw*1.4)}"/>`;
 if(hasB)o+=`<rect x="${f(X(D-bD))}" y="${f(Y(H+bH))}" width="${f(bD*s)}" height="${f(bH*s+1)}" rx="${f(Math.min(fs*.55,bH*s/2.2))}" fill="#e3e6ea" stroke="${INK}" stroke-width="${f(lw*1.4)}"/>`;
 const dx=X(0)-fs*.9;
 o+=line(X(0)-fs*.2,Y(H),dx-fs*.3,Y(H),st.lw*.75)+dimSeg(dx,yF,dx,Y(H),L1(H),'left',st);
 if(hasB){const rx=X(D)+fs*.9;o+=line(X(D)+fs*.2,Y(tot),rx+fs*.3,Y(tot),st.lw*.75)+line(X(D)+fs*.2,yF,rx+fs*.3,yF,st.lw*.75)+dimSeg(rx,yF,rx,Y(tot),L1(tot),'right',st)}
 return o}

/* ---------- táblázat, jelmagyarázat ---------- */
function tableRows(){const p=S.p,it=S.b.items,rows=[];const bb=it.length?bbox(it):null;
 if(bb&&p.totW)rows.push([p.lTotW||'Teljes szélesség',L1(bb.x1-bb.x0)]);
 if(bb&&p.totH)rows.push([p.lTotH||'Teljes hossz',L1(bb.y1-bb.y0)]);
 for(const b of it)for(const r of b.tab||[])rows.push([r.l||b.name,r.f==='w'?L1(b.w):r.f==='h'?L1(b.h):`${L1(b.w)} × ${L1(b.h)}`]);
 for(const x of p.extra||[])if(x.l||x.v)rows.push([x.l||'',x.v||'']);
 if(p.trimSum){const L=trimLen();if(L)rows.push(['Bőr perem összhossza',fmt(L,2)+' m'])}
 if(p.area){const A=seatArea();if(A)rows.push(['Ülő- és párnafelület',fmt(A,2)+' m²'])}
 return rows}
const trimLen=()=>S.b.items.filter(b=>b.type==='trim').reduce((s,b)=>s+Math.max(b.w,b.h),0)/100;
const seatArea=()=>S.b.items.filter(b=>b.type==='seat'||b.type==='pil').reduce((s,b)=>s+b.w*b.h,0)/1e4;
function trimThick(){const c={};for(const b of S.b.items)if(b.type==='trim'){const t=Math.min(b.w,b.h);c[t]=(c[t]||0)+1}const e=Object.entries(c).sort((a,b)=>b[1]-a[1]);return e.length?+e[0][0]:NaN}
function legendItems(){const used=new Set(S.b.items.map(b=>b.type));return TORDER.filter(t=>used.has(t)).map(t=>{let l=S.p[LGK[t]]||TY[t][0];if(t==='trim'){const th=trimThick();if(ok(th))l+=` (szélesség: ${L1(th)} cm)`}return [t,l]})}
function swatch(t,x,y,w,h,st){let o=`<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(h*.22)}" fill="${TY[t][1]}" stroke="${INK}" stroke-width="${f(st.lw*1.1)}"/>`;if(t==='trim'){const m=h*.18;o+=wave(x+m*.2,y,w-m*.4,h,{fs:h*.9,lw:st.lw})}return o}
function overlaps(){const it=S.b.items,r=[];for(let i=0;i<it.length;i++)for(let j=i+1;j<it.length;j++){const a=it[i],b=it[j];const w=Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x),h=Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y);if(w>.01&&h>.01)r.push(`${a.name} – ${b.name}`)}return r}

/* ---------- tervlap ---------- */
const SW=1414,SH=1000;
function sheetSVG(){const p=S.p,it=S.b.items,M=16;
 let o=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SW} ${SH}" width="${SW}" height="${SH}" font-family="${FONT}"><rect width="${SW}" height="${SH}" fill="#fff"/>`;
 o+=`<rect x="${M}" y="${M}" width="${SW-2*M}" height="${SH-2*M}" fill="none" stroke="${INK}" stroke-width="2.2"/>`;
 // fejléc
 const tbH=76,ty=SH-M-tbH,W0=SW-2*M,cw=[.5,.14,.19,.17].map(k=>k*W0);let cx=M;
 o+=line(M,ty,SW-M,ty,2.2);
 const H=pv('H'),cells=[null,'Felülnézet','Mértékegység: cm',`Magasság: ${ok(H)?L1(H):'–'}`];
 cells.forEach((c,i)=>{const w=cw[i];if(i)o+=line(cx,ty,cx,SH-M,2.2);
  if(i===0){const t=p.title||'KANAPÉ – MÉRETEZETT TERVRAJZ',meta=[p.proj,p.client,p.author,p.date].filter(Boolean).join('   ·   ');
   const fs=Math.min(31,(w-44)/(t.length*.63));o+=tx(cx+22,meta?ty+37:ty+tbH/2+fs*.36,t,fs,800);
   if(meta)o+=tx(cx+22,ty+62,meta,Math.min(15,(w-44)/(meta.length*.55)),500,'start','#475569')}
  else{const fs=Math.min(20,(w-20)/(c.length*.56));o+=tx(cx+w/2,ty+tbH/2+fs*.36,c,fs,500,'middle')}
  cx+=w});
 // jobb panel
 const PW=420,px=SW-M-20-PW,top=M+20,pBot=ty-20,gap=18,st={fs:16,al:9,lw:1.3};
 const rows=tableRows(),lg=legendItems(),sideH=205,legH=lg.length?54+lg.length*38:0;
 const n=rows.length+1,avail=pBot-top-sideH-legH-gap*(lg.length?2:1)-52;
 const rh=clamp(avail/n,14,27),rfs=Math.min(16,rh*.62),tabH=50+rh*n+6;let y=top;
 o+=`<rect x="${px}" y="${y}" width="${PW}" height="${f(tabH)}" fill="#fff" stroke="${INK}" stroke-width="1.6"/>`;
 o+=tx(px+14,y+32,'Méretek (cm)',22,800)+line(px,y+46,px+PW,y+46,1.6);
 const allRows=[...rows,['Magasság:',ok(H)?L1(H):'–',1]];
 allRows.forEach(([l,v,b],i)=>{const yy=y+46+rh*i;if(b)o+=line(px,yy,px+PW,yy,1.6);else if(i)o+=line(px+8,yy,px+PW-8,yy,.8,'#b8bec6');
  const vw=tw(v,rfs),lfs=Math.min(rfs,(PW-34-vw-12)/(String(l).length*.55));
  o+=tx(px+12,yy+rh/2+rfs*.36,l,lfs,b?800:500)+tx(px+PW-12,yy+rh/2+rfs*.36,v,rfs,b?800:600,'end')});
 y+=tabH+gap;
 o+=`<rect x="${px}" y="${f(y)}" width="${PW}" height="${sideH}" fill="#fff" stroke="${INK}" stroke-width="1.6"/>`+tx(px+14,y+30,'Oldalnézet',20,800);
 o+=sideView(px+12,y+42,PW-24,sideH-52,17);
 y+=sideH+gap;
 if(lg.length){o+=`<rect x="${px}" y="${f(y)}" width="${PW}" height="${legH}" fill="#fff" stroke="${INK}" stroke-width="1.6"/>`+tx(px+14,y+30,'Jelmagyarázat',20,800)+line(px,y+42,px+PW,y+42,1.6);
  lg.forEach(([t,l],i)=>{const yy=y+54+i*38;o+=swatch(t,px+16,yy,50,22,st);const lf=Math.min(15,(PW-96)/(l.length*.53));o+=tx(px+80,yy+11+lf*.36,l,lf,500)})}
 // felülnézet
 const ax=M+24,ay=M+20,aw=px-24-ax,ah=ty-20-ay;
 if(it.length){const stS={fs:21,al:13,lw:1.5,lo:3.2},LD=layoutDims(it,stS),bb=bbox(it),bw=bb.x1-bb.x0,bh=bb.y1-bb.y0,m=LD.m;
  const s=Math.min((aw-m.left-m.right)/bw,(ah-m.top-m.bottom)/bh,5);
  const ox=ax+m.left+((aw-m.left-m.right)-bw*s)/2-bb.x0*s,oy=ay+m.top+((ah-m.top-m.bottom)-bh*s)/2-bb.y0*s;
  o+=planSVG(it,mkT(s,ox,oy,bb),stS,{LD,labels:!!p.lbl,sizes:1,lfs:15})}
 else o+=tx(ax+aw/2,ay+ah/2,'Nincs még elem a tervben',22,500,'middle','#94a3b8');
 return o+'</svg>'}

/* ---------- szerkesztő vászon ---------- */
const STE={fs:13,al:8,lw:1.1,lo:2.2};
let EV=null,DR=null;
function drawEditor(fit){const cv=$('#kp_cv');if(!cv)return;const it=S.b.items;const bb=it.length?bbox(it):null;
 if(fit||!EV){const b0=bb||{x0:0,y0:0,x1:200,y1:100},LD=layoutDims(it,STE),pad=25;
  const cw=Math.max(260,cv.clientWidth-2),mX=LD.m.left+LD.m.right,mY=LD.m.top+LD.m.bottom,W=b0.x1-b0.x0+2*pad,Hh=b0.y1-b0.y0+2*pad;
  let s=(cw-mX)/W;s=Math.min(s,(Math.max(360,innerHeight*.66)-mY)/Hh);s=clamp(s,.25,6);
  EV={s,vw:W*s+mX,vh:Hh*s+mY,ox:LD.m.left+(pad-b0.x0)*s,oy:LD.m.top+(pad-b0.y0)*s}}
 const T=mkT(EV.s,EV.ox,EV.oy,bb),k=EV.vw/Math.min(EV.vw,cv.clientWidth||EV.vw);
 let o=`<rect width="${f(EV.vw)}" height="${f(EV.vh)}" fill="#fcfcfa"/>`;
 const cx0=Math.floor(-EV.ox/EV.s/10)*10,cx1=(EV.vw-EV.ox)/EV.s,cy0=Math.floor(-EV.oy/EV.s/10)*10,cy1=(EV.vh-EV.oy)/EV.s;
 for(let x=cx0;x<=cx1;x+=10)o+=line(T.X(x),0,T.X(x),EV.vh,x%50?.6*k:1*k,x%50?'#eef0f2':'#dde1e6');
 for(let y=cy0;y<=cy1;y+=10)o+=line(0,T.Y(y),EV.vw,T.Y(y),y%50?.6*k:1*k,y%50?'#eef0f2':'#dde1e6');
 o+=planSVG(it,T,STE,{labels:1,sizes:1,lfs:12});
 for(const b of it)o+=`<rect data-id="${b.id}" x="${f(T.X(b.x))}" y="${f(T.Y(b.y))}" width="${f(b.w*T.s)}" height="${f(b.h*T.s)}" fill="transparent" style="cursor:move"/>`;
 const b=selB();
 if(b){const x=T.X(b.x),y=T.Y(b.y),w=b.w*T.s,h=b.h*T.s,hs=10*k;
  o+=`<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${ACC}" fill-opacity=".08" stroke="${ACC}" stroke-width="${f(2*k)}" stroke-dasharray="${f(6*k)} ${f(4*k)}" pointer-events="none"/>`;
  const H={nw:[x,y,'nwse'],n:[x+w/2,y,'ns'],ne:[x+w,y,'nesw'],e:[x+w,y+h/2,'ew'],se:[x+w,y+h,'nwse'],s:[x+w/2,y+h,'ns'],sw:[x,y+h,'nesw'],w:[x,y+h/2,'ew']};
  for(const [kk,[hx,hy,c]] of Object.entries(H)){if((kk==='n'||kk==='s')&&w<hs*4)continue;if((kk==='e'||kk==='w')&&h<hs*4)continue;
   o+=`<rect data-h="${kk}" x="${f(hx-hs/2)}" y="${f(hy-hs/2)}" width="${f(hs)}" height="${f(hs)}" rx="${f(2*k)}" fill="#fff" stroke="${ACC}" stroke-width="${f(2*k)}" style="cursor:${c}-resize"/>`}}
 if(!it.length)o+=tx(EV.vw/2,EV.vh/2,'Adj hozzá elemet, vagy válassz sablont',15,600,'middle','#94a3b8');
 cv.innerHTML=`<svg viewBox="0 0 ${f(EV.vw)} ${f(EV.vh)}" style="width:${f(EV.vw)}px" font-family="${FONT}" aria-label="Kanapé felülnézet szerkesztő">${o}</svg>`}
function toCm(e){const svg=$('#kp_cv svg');const r=svg.getBoundingClientRect();return {x:((e.clientX-r.left)*EV.vw/r.width-EV.ox)/EV.s,y:((e.clientY-r.top)*EV.vh/r.height-EV.oy)/EV.s}}
function snapE(v,c,thr,g){let best=null;for(const x of c)if(Math.abs(v-x)<thr&&(best==null||Math.abs(v-x)<Math.abs(v-best)))best=x;return best!=null?best:Math.round(v/g)*g}
function snapMove(v,len,c,thr,g){let best=null;for(const x of c)for(const d of[x-v,x-(v+len)])if(Math.abs(d)<thr&&(best==null||Math.abs(d)<Math.abs(best)))best=d;return best!=null?v+best:Math.round(v/g)*g}
document.addEventListener('pointerdown',e=>{const cv=e.target.closest('#kp_cv');if(!cv||e.button>0||!EV)return;
 const h=e.target.closest('[data-h]'),r=e.target.closest('[data-id]'),p=toCm(e);
 if(h&&selB()){const b=selB();DR={m:'r',h:h.dataset.h,id:b.id,p,o:{...b},mv:0}}
 else if(r){if(S.b.sel!==r.dataset.id){S.b.sel=r.dataset.id;renderPanel()}const b=selB();DR={m:'m',id:b.id,p,o:{...b},mv:0};drawEditor()}
 else{if(S.b.sel){S.b.sel='';renderPanel();drawEditor()}return}
 try{cv.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault()});
document.addEventListener('pointermove',e=>{if(!DR||!$('#kp_cv svg'))return;const p=toCm(e),dx=p.x-DR.p.x,dy=p.y-DR.p.y;
 if(!DR.mv){if(Math.hypot(dx,dy)*EV.s<3)return;hist();DR.mv=1}
 const b=S.b.items.find(q=>q.id===DR.id);if(!b)return;const g=num(S.p.snap)||1,thr=9/EV.s,o=DR.o,oth=S.b.items.filter(q=>q.id!==b.id);
 const ex=oth.flatMap(q=>[q.x,q.x+q.w]),ey=oth.flatMap(q=>[q.y,q.y+q.h]);
 if(DR.m==='m'){b.x=r1(snapMove(o.x+dx,o.w,ex,thr,g));b.y=r1(snapMove(o.y+dy,o.h,ey,thr,g))}
 else{let l=o.x,rr=o.x+o.w,t=o.y,bt=o.y+o.h;const hh=DR.h,mn=Math.max(g,1);
  if(hh.includes('w'))l=Math.min(snapE(o.x+dx,ex,thr,g),rr-mn);
  if(hh.includes('e'))rr=Math.max(snapE(o.x+o.w+dx,ex,thr,g),l+mn);
  if(hh.includes('n'))t=Math.min(snapE(o.y+dy,ey,thr,g),bt-mn);
  if(hh.includes('s'))bt=Math.max(snapE(o.y+o.h+dy,ey,thr,g),t+mn);
  b.x=r1(l);b.y=r1(t);b.w=r1(rr-l);b.h=r1(bt-t)}
 drawEditor(false);syncProps()});
const endDrag=()=>{if(!DR)return;const mv=DR.mv;DR=null;if(mv){ui.save();drawEditor(true);stats();renderList()}};
document.addEventListener('pointerup',endDrag);document.addEventListener('pointercancel',endDrag);
let rzT=0;window.addEventListener('resize',()=>{clearTimeout(rzT);rzT=setTimeout(()=>{if(ui.tab==='plan')drawEditor(true)},150)});

/* ---------- panel ---------- */
const fin=v=>String(v).replace('.',',');
const pf=(b,k,l)=>`<div class="f"><label>${l}</label><div class="iw"><input data-bk="${k}" inputmode="decimal" autocomplete="off" value="${fin(b[k])}"><span class="u">cm</span></div></div>`;
function renderPanel(){const pp=$('#kp_props');if(pp){const b=selB();
 pp.innerHTML=b?`<div class="f"><label>Megnevezés</label><div class="iw"><input data-bk="name" autocomplete="off" value="${esc(b.name)}"></div></div>
  <div class="f"><span class="l">Típus</span><div class="seg">${Object.entries(TY).map(([k,[n]])=>`<button type="button" data-act="type" data-v="${k}" class="${b.type===k?'on':''}">${n}</button>`).join('')}</div></div>
  <div class="fields f2">${pf(b,'x','X (balról)')}${pf(b,'y','Y (felülről)')}${pf(b,'w','Szélesség ↔')}${pf(b,'h','Hossz ↕')}</div>
  <div class="cks"><label class="ck"><input type="checkbox" data-bck="dw" ${b.dw?'checked':''}>Szélesség-méret a rajzon</label><label class="ck"><input type="checkbox" data-bck="dh" ${b.dh?'checked':''}>Hossz-méret a rajzon</label></div>
  <div class="f"><span class="l">Sorok a méret-táblázatban</span><div class="tlist">${(b.tab||[]).map((r,i)=>`<div class="trw"><select class="sel" data-tf="${i}">${[['w','szélesség'],['h','hossz'],['wh','sz × h']].map(([v,l])=>`<option value="${v}" ${r.f===v?'selected':''}>${l}</option>`).join('')}</select><input class="txt" data-tl="${i}" value="${esc(r.l)}" placeholder="${esc(b.name)}" autocomplete="off"><button class="btn sm" data-act="tdel" data-i="${i}" title="Sor törlése" aria-label="Sor törlése">${ic('trash',14)}</button></div>`).join('')}</div>
  <div><button class="btn sm" data-act="tadd">${ic('plus')}Sor</button></div></div>
  <div class="row"><button class="btn sm" data-act="dup">${ic('copy')}Másolat</button><button class="btn sm" data-act="rot">${ic('rot')}90°</button><button class="btn sm" data-act="front" title="Előre hoz">${ic('front')}Előre</button><button class="btn sm" data-act="back" title="Hátra küld">${ic('back')}Hátra</button><button class="btn sm danger" data-act="del">${ic('trash')}Törlés</button></div>`
 :`<p class="hint">Kattints egy elemre a rajzon vagy a listában. Húzással mozgatod, a sarkoknál és oldalaknál átméretezed; a többi elem éléhez és a rácshoz illeszkedik.</p><p class="hint"><b>Billentyűk:</b> nyilak = mozgatás (Shift: 1 cm), Delete = törlés, Ctrl+D = másolat, Ctrl+Z / Ctrl+Y = vissza / újra.</p>`}
 renderList()}
function renderList(){const el=$('#kp_list');if(!el)return;
 el.innerHTML=S.b.items.map(b=>`<button class="bl${b.id===S.b.sel?' on':''}" data-act="pick" data-id="${b.id}"><i style="background:${TY[b.type][1]}"></i><span>${esc(b.name)}</span><small>${L1(b.w)} × ${L1(b.h)}</small></button>`).join('')||'<p class="hint">Még nincs elem.</p>'}
function syncProps(){const b=selB();if(!b)return;for(const k of['x','y','w','h']){const i=$(`#kp_props [data-bk="${k}"]`);if(i&&document.activeElement!==i)i.value=fin(b[k])}renderList()}
function stats(){const el=$('#kp_stats');if(el){const it=S.b.items,bb=it.length?bbox(it):null;
 el.innerHTML=`<div class="kv"><small>Befoglaló méret</small><b>${bb?`${L1(bb.x1-bb.x0)} × ${L1(bb.y1-bb.y0)}`:'–'}</b><i>cm</i></div><div class="kv"><small>Ülő- és párnafelület</small><b>${fmt(seatArea(),2)}</b><i>m²</i></div><div class="kv"><small>Bőr perem hossza</small><b>${fmt(trimLen(),2)}</b><i>m</i></div><div class="kv"><small>Elemek</small><b>${it.length}</b><i>db</i></div>`}
 const pl=$('#kp_pill');if(pl){const o=overlaps();pl.className='pill '+(o.length?'warn':'ok');pl.textContent=o.length?`Átfedés: ${o.length}`:'Nincs átfedés';pl.title=o.join('\n')}}

/* ---------- műveletek ---------- */
function loadTpl(k){const t=TPL[k];if(!t)return;hist();S.b.items=t.items();S.b.sel='';Object.assign(S.p,t.p);ui.save();ui.render();toast(`Sablon: ${t.n} (Ctrl+Z visszavonja)`)}
function addBlock(type){hist();const it=S.b.items,[w,h]=NEWSZ[type],bb=it.length?bbox(it):{x0:0,y0:0,x1:-20};const cnt=it.filter(b=>b.type===type).length+1;
 const b=B(`${TY[type][0].split(' /')[0]} ${cnt}`,type,r1(bb.x1+20),r1(bb.y0),w,h);it.push(b);S.b.sel=b.id;ui.save();R.plan.calc()}
function mirror(ax){const it=S.b.items;if(!it.length)return;hist();const bb=bbox(it);for(const b of it){if(ax==='h')b.x=r1(bb.x0+bb.x1-b.x-b.w);else b.y=r1(bb.y0+bb.y1-b.y-b.h)}
 if(ax==='h'){const sw={dL:S.p.dR,dR:S.p.dL};Object.assign(S.p,sw)}else{const sw={dT:S.p.dB,dB:S.p.dT};Object.assign(S.p,sw)}ui.save();ui.render()}
function normalize(){const it=S.b.items;if(!it.length)return;hist();const bb=bbox(it);for(const b of it){b.x=r1(b.x-bb.x0);b.y=r1(b.y-bb.y0)}ui.save();R.plan.calc()}
const fileBase=()=>safeName(S.p.proj||S.p.client||'kanape_terv');
async function exportPNG(){try{const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(sheetSVG());await img.decode();
 const k=2,c=document.createElement('canvas');c.width=SW*k;c.height=SH*k;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(img,0,0,c.width,c.height);
 const blob=await new Promise(r=>c.toBlob(r,'image/png'));await download(fileBase()+'.png',blob,'image/png')}catch(e){toast('A PNG export nem sikerült: '+e.message)}}
function exportSVG(){download(fileBase()+'.svg',sheetSVG(),'image/svg+xml')}
function exportPDF(){let el=$('#rep');if(!el){el=document.createElement('div');el.id='rep';document.body.appendChild(el)}
 el.innerHTML=sheetSVG();document.body.classList.add('rep-on');const t=document.title;document.title=fileBase();
 const done=()=>{document.body.classList.remove('rep-on');document.title=t;window.removeEventListener('afterprint',done)};window.addEventListener('afterprint',done);
 toast('A nyomtatási ablakban válaszd: Mentés PDF-ként');setTimeout(()=>window.print(),80)}
function exportJSON(){download(fileBase()+'.json',JSON.stringify({app:'kanape',v:1,p:S.p,b:{items:S.b.items}},null,1),'application/json')}
/* import: előbb teljes ellenőrzés, csak hibátlan fájl után változik a terv */
function applyImport(v,name){hist();S.p=v.p;S.b=v.b;ui.save();ui.render();toast('Betöltve: '+name)}
document.addEventListener('change',e=>{if(e.target.id!=='kp_file')return;const fl=e.target.files[0];e.target.value='';if(!fl)return;
 readImport(fl,'kanape','Kanapé-tervező',validateKp).then(v=>applyImport(v,fl.name),err=>toast('Nem sikerült betölteni: '+err.message))});
document.addEventListener('focusin',e=>{if(e.target.closest('main')&&/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))hist()});
document.addEventListener('click',e=>{if(e.target.closest('[data-seg][data-t]'))hist()},true);
document.addEventListener('keydown',e=>{const tg=e.target,inF=/INPUT|SELECT|TEXTAREA/.test(tg.tagName),mod=e.ctrlKey||e.metaKey,k=e.key.toLowerCase();
 if(mod&&!inF&&k==='z'){e.preventDefault();e.shiftKey?redo():undo();return}
 if(mod&&!inF&&k==='y'){e.preventDefault();redo();return}
 if(inF||ui.tab!=='plan')return;const b=selB();if(!b)return;
 const st=e.shiftKey?1:(num(S.p.snap)||1),mv={arrowleft:[-st,0],arrowright:[st,0],arrowup:[0,-st],arrowdown:[0,st]}[k];
 if(mv&&!mod){e.preventDefault();hist();b.x=r1(b.x+mv[0]);b.y=r1(b.y+mv[1]);ui.save();drawEditor(true);syncProps();stats();return}
 if(k==='delete'||k==='backspace'){e.preventDefault();act('del');return}
 if(mod&&k==='d'){e.preventDefault();act('dup');return}
 if(k==='escape'){S.b.sel='';renderPanel();drawEditor()}});
function act(a,el){const b=selB(),it=S.b.items;
 switch(a){
  case 'add':addBlock(el.dataset.v);return;
  case 'pick':S.b.sel=el.dataset.id;renderPanel();drawEditor();return;
  case 'undo':undo();return;case 'redo':redo();return;
  case 'mirH':mirror('h');return;case 'mirV':mirror('v');return;case 'norm':normalize();return;
  case 'png':exportPNG();return;case 'svg':exportSVG();return;case 'pdf':exportPDF();return;case 'json':exportJSON();return;
  case 'open':$('#kp_file').click();return;
  case 'xadd':hist();S.p.extra.push({l:'',v:''});ui.save();ui.render();return;
  case 'xdel':hist();S.p.extra.splice(+el.dataset.i,1);ui.save();ui.render();return;
  case 'new':if(it.length&&!confirm('Új, üres tervet kezdesz? (Ctrl+Z visszavonja)'))return;hist();S.b.items=[];S.b.sel='';ui.save();ui.render();return}
 if(!b)return;
 switch(a){
  case 'type':hist();b.type=el.dataset.v;break;
  case 'tadd':hist();(b.tab=b.tab||[]).push({f:'w',l:''});break;
  case 'tdel':hist();b.tab.splice(+el.dataset.i,1);break;
  case 'dup':{hist();const c=JSON.parse(JSON.stringify(b));c.id=uid();c.name=b.name+' (másolat)';c.x=r1(b.x+(num(S.p.snap)||5)*2);c.y=r1(b.y+(num(S.p.snap)||5)*2);it.push(c);S.b.sel=c.id;break}
  case 'rot':hist();[b.w,b.h]=[b.h,b.w];[b.dw,b.dh]=[b.dh,b.dw];break;
  case 'front':hist();it.splice(it.indexOf(b),1);it.push(b);break;
  case 'back':hist();it.splice(it.indexOf(b),1);it.unshift(b);break;
  case 'del':hist();it.splice(it.indexOf(b),1);S.b.sel='';break;
  default:return}
 ui.save();R.plan.calc()}

/* ---------- nézetek ---------- */
const ck=(k,l)=>`<label class="ck"><input type="checkbox" data-ck="${k}" ${S.p[k]?'checked':''}>${l}</label>`;
const txt=(k,l,ph='')=>`<div class="f"><label for="i_p_${k}">${l}</label><div class="iw"><input id="i_p_${k}" data-t="p" data-k="${k}" autocomplete="off" value="${esc(S.p[k]??'')}" placeholder="${esc(ph)}"></div></div>`;
const R={};
R.plan={title:'Felülnézet',desc:'A kanapé téglalap elemekből áll: ülőrész, bőr perem / könyöklő, háttámla, párna. A méretláncokat az app az elemekből számolja, a tervlapon ugyanez a rajz jelenik meg.',
 html(){return `<div class="kpg"><div class="card"><h2><span>Rajz</span><span id="kp_pill" class="pill na"></span></h2>
  <div class="row tb"><button class="btn sm" data-act="undo" title="Visszavonás (Ctrl+Z)">${ic('undo')}</button><button class="btn sm" data-act="redo" title="Újra (Ctrl+Y)">${ic('redo')}</button>
   <span class="l">Rács</span>${seg('p','snap',[['1','1'],['5','5'],['10','10 cm']])}
   <button class="btn sm" data-act="mirH" title="Tükrözés vízszintesen">${ic('mirH')}Tükör ↔</button><button class="btn sm" data-act="mirV" title="Tükrözés függőlegesen">${ic('mirV')}Tükör ↕</button><button class="btn sm" data-act="norm" title="A rajz bal felső sarka a 0,0 pontra kerül">${ic('norm')}0,0</button></div>
  <div class="cv" id="kp_cv"></div><div class="res" id="kp_stats"></div></div>
  <div class="kcol"><div class="card"><h2>Kijelölt elem</h2><div id="kp_props"></div></div>
  <div class="card"><h2>Elemek</h2><div class="row">${Object.entries(TY).map(([k,[n]])=>`<button class="btn sm" data-act="add" data-v="${k}"><i class="sw" style="background:${TY[k][1]}"></i>${n.split(' /')[0]}</button>`).join('')}</div><div id="kp_list" class="blist"></div></div>
  <div class="card"><h2>Sablon</h2><select class="sel" id="kp_tpl"><option value="">Sablon betöltése…</option>${Object.entries(TPL).map(([k,t])=>`<option value="${k}">${esc(t.n)}</option>`).join('')}</select><button class="btn sm danger" data-act="new">${ic('trash')}Új, üres terv</button></div></div></div>`},
 calc(){drawEditor(true);stats();renderPanel()}};
R.side={title:'Oldalnézet',desc:'Magasságok és mélység az oldalnézethez. A tervlapon a teljes magasság a fejlécbe és a táblázat utolsó sorába is bekerül.',
 html(){return `<div class="grid"><div class="card"><h2>Méretek</h2><div class="fields">${fld('p','H','Teljes magasság (ülés teteje)',{u:'cm'})}${fld('p','leg','Láb magassága',{u:'cm'})}${fld('p','cush','Ülőpárna vastagsága',{u:'cm'})}${fld('p','D','Mélység (oldalnézet)',{u:'cm'})}${fld('p','bH','Felső párna / háttámla az ülés felett',{u:'cm'})}${fld('p','bD','Felső párna mélysége',{u:'cm'})}</div>
  <p class="hint">A felső párna 0 magassággal kikapcsolható. Ha van, a jobb oldalon a teljes magasság is méretezve van.</p></div>
  <div class="card"><h2>Előnézet</h2><svg id="kp_side" viewBox="0 0 640 300" style="width:100%;height:auto;background:#fcfcfa;border-radius:12px" font-family="${FONT}"></svg></div></div>`},
 calc(){const s=$('#kp_side');if(s)s.innerHTML=sideView(20,16,600,268,18)}};
R.sheet={title:'Tervlap és export',desc:'A méretezett tervrajz A4 fekvő lapon: felülnézet méretláncokkal, méret-táblázat, oldalnézet, jelmagyarázat és fejléc. Exportálható PNG, SVG és PDF formában.',
 html(){const dm=(k,l)=>`<div class="f"><span class="l">${l}</span>${seg('p',k,[['off','Ki'],['tot','Teljes'],['chain','Lánc'],['edge','Szélső sor']])}</div>`;
  return `<div class="card"><div class="row"><button class="btn pri" data-act="png">${ic('img')}PNG kép</button><button class="btn" data-act="pdf">${ic('doc')}PDF (A4 fekvő)</button><button class="btn" data-act="svg">${ic('dl')}SVG</button><button class="btn" data-act="json">${ic('dl')}Mentés JSON-ba</button><button class="btn" data-act="open">${ic('up')}Megnyitás</button></div>
  <div class="sheetw" id="kp_sheet"></div></div>
  <div class="grid"><div class="card"><h2>Fejléc</h2><div class="fields">${txt('title','Cím')}${txt('proj','Projekt / megnevezés','pl. Nappali sarokkanapé')}${txt('client','Megrendelő')}${txt('author','Tervező')}${txt('date','Dátum','pl. 2026.11.02.')}</div></div>
  <div class="card"><h2>Méretláncok</h2><div class="dms">${dm('dT','Felül')}${dm('dB','Alul')}${dm('dL','Bal oldal')}${dm('dR','Jobb oldal')}</div>
   <p class="hint"><b>Teljes:</b> csak a befoglaló méret. <b>Lánc:</b> a kívülről látható elemek mérete egymás után, és fölötte a teljes méret. <b>Szélső sor:</b> csak az oldal szélén fekvő elemek (pl. a felső ág 15 + 150 = 165). A bőr perem mögötti elem határa is bekerül a láncba.</p>
   <div class="cks">${ck('seams','Elemhatárok szaggatott vonallal az ülőrészen')}${ck('lbl','Elemnevek és méretek a tervlapon')}</div></div>
  <div class="card"><h2>Méret-táblázat</h2><div class="cks">${ck('totW','Teljes szélesség')}${ck('totH','Teljes hossz')}${ck('trimSum','Bőr perem összhossza (m)')}${ck('area','Ülő- és párnafelület (m²)')}</div>
   <div class="fields">${txt('lTotW','Teljes szélesség felirata')}${txt('lTotH','Teljes hossz felirata')}</div>
   <p class="hint">Az elemek sorait a Felülnézet fülön, a kijelölt elemnél adod meg. Az utolsó sor mindig a magasság.</p>
   <div class="f"><span class="l">Saját sorok</span><div class="tlist">${S.p.extra.map((x,i)=>`<div class="trw x"><input class="txt" data-xr="${i}" data-xf="l" value="${esc(x.l)}" placeholder="Felirat" autocomplete="off"><input class="txt" data-xr="${i}" data-xf="v" value="${esc(x.v)}" placeholder="Érték" autocomplete="off"><button class="btn sm" data-act="xdel" data-i="${i}" aria-label="Sor törlése">${ic('trash',14)}</button></div>`).join('')}</div><div><button class="btn sm" data-act="xadd">${ic('plus')}Sor</button></div></div></div>
  <div class="card"><h2>Jelmagyarázat</h2><div class="fields">${txt('lgSeat','Ülőrész')}${txt('lgTrim','Bőr perem / könyöklő')}${txt('lgBack','Háttámla')}${txt('lgPil','Párna / fekvőrész')}</div><p class="hint">Csak a rajzon szereplő típusok jelennek meg. A bőr peremnél a leggyakoribb szélesség automatikusan mögé kerül.</p></div></div>`},
 calc(){const el=$('#kp_sheet');if(el)el.innerHTML=sheetSVG()}};
const ui=shell({prefix:'kp',tabs:[['plan','Felülnézet','Felül','plan'],['side','Oldalnézet','Oldal','side'],['sheet','Tervlap és export','Tervlap','sheet']],R,
 note:'A méretek centiméterben. A terv a böngészőben tárolódik, JSON-ba menthető.',
 onClick:(a,el)=>act(a,el),
 onInput(t){const b=selB();
  if(t.id==='kp_tpl'){const v=t.value;t.value='';if(v)loadTpl(v);return}
  if(t.dataset.ck){S.p[t.dataset.ck]=t.checked?'1':'';ui.recalc();return}
  if(t.dataset.xr!=null){const x=S.p.extra[+t.dataset.xr];if(x){x[t.dataset.xf]=t.value;ui.recalc()}return}
  if(!b)return;
  if(t.dataset.bk){const k=t.dataset.bk;if(k==='name')b.name=t.value;else{const v=num(t.value);if(!ok(v))return;b[k]=k==='w'||k==='h'?Math.max(1,v):v}drawEditor(true);stats();renderList();ui.save();return}
  if(t.dataset.bck){b[t.dataset.bck]=t.checked?1:0;drawEditor(true);ui.save();return}
  if(t.dataset.tf!=null){b.tab[+t.dataset.tf].f=t.value;ui.save();return}
  if(t.dataset.tl!=null){b.tab[+t.dataset.tl].l=t.value;ui.save();return}},
 menu:()=>`<div class="mh">Kanapé-tervező</div><button class="mi" data-m="png">${ic('img')}Tervlap PNG képként</button><button class="mi" data-m="pdf">${ic('doc')}Tervlap PDF-be (A4)</button><button class="mi" data-m="svg">${ic('dl')}Tervlap SVG-be</button><button class="mi" data-m="json">${ic('dl')}Mentés JSON-ba</button><button class="mi" data-m="open">${ic('up')}Megnyitás JSON-ból</button><button class="mi" data-m="new">${ic('trash')}Új, üres terv</button>`,
 onMenu(m){act(m,{dataset:{}})}});
document.body.insertAdjacentHTML('beforeend','<input type="file" id="kp_file" accept=".json,application/json" hidden>');
ui.render();
/* tesztelési felület (tests/*.spec.mjs) */
window.__bt=Object.freeze({get S(){return S},validateKp,bbox,overlaps,trimLen,seatArea,snapMove,snapE,loadTpl,TPL,exportJSON,fileBase,undo,redo,act,safeName});
