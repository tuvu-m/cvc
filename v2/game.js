'use strict';
/* Cá Viên Chiên Bé Ba v2. Một ngày: sáng chọn lộ trình (hoặc mở quán), xem thực đơn (mỗi món một que 5 viên tự xiên), đi chợ,
   bán 3–4 buổi (chạm món thả que vào chảo, vàng thì vớt, kéo chai xịt sốt theo tay, GIAO), tối tổng kết.
   Lâu dài: nâng xe → quán → chuỗi, nhân viên phụ chảo, khách quen (bênh tiệm khi bị chê), review, sưu tập, trang trí.
   Dữ liệu và câu chữ ở data.js. Giao diện ít chữ: hình, số, biểu tượng. */

/* ===================== tiện ích ===================== */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const rnd=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(rnd(a,b+1)),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pickW=(L,f)=>{const w=L.map(f),t=w.reduce((a,b)=>a+b,0);if(!(t>0))return L[0];let r=Math.random()*t;for(let i=0;i<L.length;i++){r-=w[i];if(r<=0)return L[i]}return L[L.length-1]};
const r1k=v=>Math.max(1000,Math.round(v/1000)*1000);
const fk=v=>{const a=Math.abs(v),s=v<0?'−':'';return a>=1e9?s+(a/1e9).toFixed(a>=1e10?0:1).replace('.',',')+' tỉ':a>=1e6?s+(a/1e6).toFixed(a>=1e7?0:1).replace('.',',')+'tr':a>=1000?s+Math.round(a/1000)+'k':s+Math.round(a)+'đ'};
const fmt=v=>(v<0?'−':'')+Math.abs(Math.round(v)).toLocaleString('vi-VN')+'đ';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ===================== hình ===================== */
const SPR={};for(const k in window.ART||{}){const im=new Image();im.src=ART[k];SPR[k]=im}
const img=k=>(window.ART||{})[k]||'';
/* hình xe/quán theo cấp; xe máy kéo chưa có hình thì dùng hình ki-ốt */
const lvSpr=l=>(window.ART||{})[LV[l].spr]?LV[l].spr:'tiem_2';

/* ===================== lưu ===================== */
const SAVE='cvc2';
const NEW=()=>({v:1,day:1,money:300000,lv:1,rep:{},sauce:{s_tuongot:CHAI},stat:{},hist:[],mk:null,routes:null,buy:{},bring:['s_tuongot'],debt:0});
let S;try{S=JSON.parse(localStorage.getItem(SAVE))}catch(e){}if(!S||S.v!==1)S=NEW();
/* bổ sung trường mới cho save cũ */
(function fix(){if(S.cart&&!S.lv)S.lv=S.cart;delete S.cart;S.lv=S.lv||1;
  if(!S.menu)S.menu=[{v:Array(5).fill('cavien')},{v:Array(5).fill('bovien')},{v:['cavien','cavien','bovien','bovien','cavien']}];
  S.staff=S.staff||[];S.cands=S.cands||[];S.regs=S.regs||[];S.reviews=S.reviews||[];S.decor=S.decor||[];S.branches=S.branches||[];
  S.coll=Object.assign({recipe:{},album:{},loc:{},ach:{}},S.coll||{});S.stat=Object.assign({served:0,five:0,maxCombo:0,bestDay:0,regWins:0,catch:0},S.stat||{});S.rid=S.rid||0})();
const save=()=>{try{localStorage.setItem(SAVE,JSON.stringify(S))}catch(e){}};
const L0=()=>LV[S.lv];
const rep=l=>S.rep[l]||0,repF=l=>.8+rep(l)*.006;
/* điểm sao: trung bình có trọng số 80 review gần nhất (review bị khách quen bênh chỉ tính một phần) */
function rating(){const R=S.reviews.slice(-80);let a=0,w=0;R.forEach(r=>{a+=r.s*r.w;w+=r.w});return w?a/w:0}
const rateF=()=>{const r=rating();return r?clamp(.75+.1*(r-2.5),.75,1.1):1};
/* trang trí: cộng dồn lợi ích theo biểu tượng (❤️ danh tiếng, ⏳ kiên nhẫn, 💰 tip, 👥 khách tối) */
const perk=t=>S.decor.reduce((a,k)=>{const d=DECOR.find(x=>x.k===k);if(!d)return a;const m=d.perk.match(/^(\S+).*?\+(\d+)%/);return m&&m[1]===t?a+(+m[2])/100:a},0);

/* ===================== âm thanh ===================== */
let AC=null,SBUF={},SND=localStorage.getItem('cv2_snd')!=='0',MUSON=localStorage.getItem('cv2_mus')!=='0',MUS=null;
const SFX={bell:'bell',cash:'cash',err:'err',win:'win',meow:'meow',chime:'chime',fry:'pour'};
function audio(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();try{if(navigator.audioSession)navigator.audioSession.type='ambient'}catch(e){}
  for(const k in SFX)fetch('../sfx/'+SFX[k]+'.mp3').then(r=>r.arrayBuffer()).then(b=>AC.decodeAudioData(b)).then(b=>SBUF[k]=b).catch(()=>{})}catch(e){}}
  if(AC&&AC.state==='suspended')AC.resume();return AC}
function beep(f,d,type='sine',v=.12){const a=AC;if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+d);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+d)}
function sfx(n){if(!SND||!AC)return;try{if(SBUF[n]){const s=AC.createBufferSource(),g=AC.createGain();g.gain.value=n==='fry'?.25:.5;s.buffer=SBUF[n];s.connect(g);g.connect(AC.destination);s.start();return}
  if(n==='pop')beep(620,.08,'triangle',.14);else if(n==='tick')beep(980,.05,'square',.05);else if(n==='err')beep(180,.18,'sawtooth',.08);else if(n==='cash'){beep(1320,.08);setTimeout(()=>beep(1760,.12),70)}else if(n==='win'){beep(880,.1);setTimeout(()=>beep(1320,.15),90)}}catch(e){}}
function music(on){MUSON=on;localStorage.setItem('cv2_mus',on?'1':'0');if(!AC)return;if(MUS){try{MUS.s.stop()}catch(e){}MUS=null}if(!on)return;
  const t=pick(['cozy','cafelofi','lofisunny','bossasunny','ukulele','sunny','cats','coffeeshop']);fetch('../nhac/'+t+'.mp4').then(r=>r.arrayBuffer()).then(b=>AC.decodeAudioData(b)).then(b=>{if(!MUSON||MUS)return;const s=AC.createBufferSource(),g=AC.createGain();g.gain.value=.22;s.buffer=b;s.loop=true;s.connect(g);g.connect(AC.destination);s.start();MUS={s}}).catch(()=>{})}
addEventListener('pointerdown',()=>{const first=!AC;audio();if(first&&MUSON)music(true)},true);
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(AC)AC.suspend();if(D&&!PAUSED)pause(true)}else if(AC)AC.resume()});
document.addEventListener('gesturestart',e=>e.preventDefault());

/* ===================== toast ===================== */
let toT=0;function toast(m,ms=1400){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toT);toT=setTimeout(()=>t.classList.remove('show'),ms)}

/* ===================== vẽ ===================== */
const LINE='#1f2d4d',INK='#1f2d4d',GOLD='#d99a3e',BROWN='#9a5420',BURNT='#2e1c12';
let K=null;
function mk(cv,LW,LH){return{cv,ctx:cv.getContext('2d'),LW,LH,s:1}}
function fit(C,w,h){const dpr=Math.min(2,devicePixelRatio||1),W=Math.max(1,Math.round(w*dpr)),H=Math.max(1,Math.round(h*dpr));if(C.cv.width!==W||C.cv.height!==H){C.cv.width=W;C.cv.height=H}C.cv.style.width=w+'px';C.cv.style.height=h+'px';C.s=W/C.LW}
function begin(C){K=C;const c=C.ctx;c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.clearRect(0,0,C.cv.width,C.cv.height);c.setTransform(C.s,0,0,C.s,0,0);c.lineJoin='round';c.lineCap='round';return c}
function rrPath(x,y,w,h,r){const c=K.ctx;r=Math.max(0,Math.min(r,w/2,h/2));c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function paint(f,st,lw){const c=K.ctx;if(f){c.fillStyle=f;c.fill()}if(st){c.strokeStyle=st;c.lineWidth=lw??.6;c.stroke()}}
function RR(x,y,w,h,r,f,st=LINE,lw){rrPath(x,y,w,h,r);paint(f,st,lw)}
function EL(x,y,rx,ry,f,st=LINE,lw){const c=K.ctx;c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,Math.PI*2);paint(f,st,lw)}
function ELR(x,y,rx,ry,a,f,st=LINE,lw){const c=K.ctx;c.beginPath();c.ellipse(x,y,rx,ry,a,0,Math.PI*2);paint(f,st,lw)}
function PT(p,f,st=LINE,lw){const c=K.ctx;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();paint(f,st,lw)}
function LN(x1,y1,x2,y2,col,lw=.6){const c=K.ctx;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=col;c.lineWidth=lw;c.stroke()}
function T(t,x,y,size,col,align='left',wt=800){const c=K.ctx;c.font=`${wt} ${size}px "Baloo 2","Be Vietnam Pro",system-ui,sans-serif`;c.fillStyle=col;c.textAlign=align;c.textBaseline='middle';c.fillText(t,x,y)}
/* chữ co lại cho vừa bề ngang */
function TF(t,x,y,size,col,maxW,align='center'){const c=K.ctx;let s=size;c.font=`800 ${s}px "Baloo 2",system-ui,sans-serif`;while(s>2.2&&c.measureText(t).width>maxW){s-=.2;c.font=`800 ${s}px "Baloo 2",system-ui,sans-serif`}T(t,x,y,s,col,align)}
function AL(a,f){const c=K.ctx,o=c.globalAlpha;c.globalAlpha=o*a;f();c.globalAlpha=o}
function LG(x0,y0,x1,y1,st){const g=K.ctx.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>g.addColorStop(o,c));return g}
const hx=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
function mixCol(L){let r=0,g=0,b=0,t=0;L.forEach(([c,w])=>{const [R,G,B]=hx(c);r+=R*w;g+=G*w;b+=B*w;t+=w});return`rgb(${r/t|0},${g/t|0},${b/t|0})`}
function shade(c,f){if(c[0]!=='#')return c;const [r,g,b]=hx(c),m=v=>clamp(Math.round(f<0?v*(1+f):v+(255-v)*f),0,255);return`rgb(${m(r)},${m(g)},${m(b)})`}
function drawSprite(im,x,y,w,h,dim,flip){if(!im||!im.complete||!im.width)return false;const c=K.ctx,sc=Math.min(w/im.width,h/im.height),dw=im.width*sc,dh=im.height*sc,dx=x+(w-dw)/2;c.save();if(dim)c.globalAlpha*=.4;
  if(flip){c.translate(dx+dw,0);c.scale(-1,1);c.drawImage(im,0,y+h-dh,dw,dh)}else c.drawImage(im,dx,y+h-dh,dw,dh);c.restore();return true}
const FRY_MIN=.85,FRY_OK=1.35,FRY_BURN=1.85;
function cookCol(k,c){const raw=ITEMS[k]?ITEMS[k].col:'#f0d9a0';if(c==null)return raw;const g=mixCol([[raw,.3],[GOLD,.7]]);
  if(c<1)return mixCol([[raw,1-c*.7+.001],[GOLD,c*.7+.001]]);if(c<FRY_BURN){const f=(c-1)/(FRY_BURN-1);return mixCol([[g,1-f+.001],[BROWN,f+.001]])}
  const f=Math.min(1,(c-FRY_BURN)/.4);return mixCol([[BROWN,1-f+.001],[BURNT,f+.001]])}
function drawPiece(k,x,y,s,col,rot=0){const sc=col[0]==='#'?shade(col,-.38):'rgba(0,0,0,.45)',c=K.ctx;
  if(k==='xucxich'||k==='xxduc'){c.save();c.translate(x,y);c.rotate(rot);RR(-1.5*s,-.62*s,3*s,1.24*s,.62*s,col,sc,.3);c.restore()}
  else if(k==='kani'){c.save();c.translate(x,y);c.rotate(rot);RR(-1.4*s,-.55*s,2.8*s,1.1*s,.3*s,col,sc,.3);c.restore()}
  else if(k==='dauhu'){c.save();c.translate(x,y);c.rotate(rot*.3);RR(-.95*s,-.95*s,1.9*s,1.9*s,.45*s,col,sc,.3);EL(0,0,.42*s,.36*s,'#fff3b8',null);c.restore()}
  else if(k==='chaca'||k==='chabusan')ELR(x,y,1.35*s,.82*s,rot*.4,col,sc,.3);
  else if(k==='khoailang')ELR(x,y,1.5*s,.62*s,rot*.5+.4,col,sc,.3);
  else{EL(x,y,s,s,col,sc,.3);if(k==='bovien'){EL(x+.35*s,y+.25*s,.16*s,.16*s,'rgba(60,30,20,.5)',null);EL(x-.3*s,y+.35*s,.12*s,.12*s,'rgba(60,30,20,.5)',null)}}
  EL(x-.38*s,y-.4*s,.28*s,.2*s,'rgba(255,255,255,.5)',null)}
/* que tre dựng dọc, viên xếp từ dưới lên */
function xeQueV(v,x,yb,s,c){const g=s*2.15;LN(x,yb+s*1.3,x,yb-g*QUE-s*.2,'#c99a5e',.9);LN(x,yb+s*1.3,x,yb-g*QUE-s*.2,'#f2d8a0',.3);v.forEach((k,j)=>drawPiece(k,x,yb-j*g,s,cookCol(k,c),j*1.3+.5))}
const QI={};function queImg(v){const key=v.join(',');if(QI[key])return QI[key];const cv=document.createElement('canvas');cv.width=40;cv.height=120;const C={cv,ctx:cv.getContext('2d'),LW:20,LH:60,s:2},old=K;K=C;C.ctx.setTransform(2,0,0,2,0,0);C.ctx.lineCap='round';xeQueV(v,10,52,3.6,null);K=old;return QI[key]=cv.toDataURL()}

/* ===================== món, thực đơn ===================== */
const mCount=m=>{const c={};m.v.forEach(k=>c[k]=(c[k]||0)+1);return c};
const mKey=v=>[...v].sort().join(',');
const recipeOf=m=>RECIPES.find(r=>mKey(r.v)===mKey(m.v));
const mName=m=>{const r=recipeOf(m);if(r&&S.coll.recipe[r.id])return r.n.replace('Que ','');const ks=Object.keys(mCount(m));return ks.length===1?ITEMS[ks[0]].n:ks.length===2?ks.map(k=>ITEMS[k].n.split(' ')[0]).join(' + '):'Thập cẩm'};
/* giá một que: MARK lần vốn 5 viên × hệ số cấp; que bí truyền đã mở đắt hơn 15% */
const priceM=m=>{const r=recipeOf(m);return r1k(m.v.reduce((a,k)=>a+ITEMS[k].c,0)*MARK*L0().pm*(r&&S.coll.recipe[r.id]?1.15:1))};
/* khách thích món: trung bình độ thích các viên (0..1); gia đình, giới trẻ thích que thập cẩm hơn */
function appeal(m,t){const L=TYPES[t].like,mx=Math.max(...Object.values(L));let a=m.v.reduce((s,k)=>s+(L[k]||0),0)/(QUE*mx);if(TYPES[t].mixLike&&new Set(m.v).size>1)a+=.15;return a}

/* ===================== sáng: chợ, thời tiết, lộ trình, ứng viên ===================== */
function morning(){if(S.mk&&S.mk.day===S.day)return;
  const prev=S.mk?S.mk.f:{},f={};for(const k in ITEMS)f[k]=clamp((prev[k]||rnd(.85,1.15))*rnd(.87,1.15),.7,1.4);
  let ev=null;const r=Math.random();
  if(r<.12){ev={t:'🌀 Bão',up:['tomvien','mucvien','tomhum']};ev.up.forEach(k=>f[k]=Math.max(f[k],1.35))}
  else if(r<.22){ev={t:'🐟 Mùa cá',dn:['cavien','chaca']};ev.dn.forEach(k=>f[k]=Math.min(f[k],.72))}
  const rares=Object.keys(ITEMS).filter(k=>ITEMS[k].rare),rareS=Object.keys(SAUCES).filter(k=>SAUCES[k].rare);
  S.mk={day:S.day,f,prevF:prev,ev,rare:Math.random()<.35+.08*S.lv?pick(rares):null,rareS:Math.random()<.3?pick(rareS):null};
  const wr=Math.random();S.weather=wr<.18?'mua':wr<.3?'nong':'nang';
  S.routes=L0().quan?null:genRoutes();S.route=L0().quan?Array(L0().stops).fill(S.quan):null;S.buy={};
  /* ứng viên nhân viên (từ ngày 3) */
  S.cands=S.day>=3&&S.staff.length<L0().staff?[0,1,2].map(genStaff):[];save()}
const bagPrice=k=>r1k(ITEMS[k].c*BAG*S.mk.f[k]);
const chaiPrice=k=>r1k(SAUCES[k].c*CHAI*.5);
const locsOpen=()=>Object.keys(LOCS).filter(l=>LOCS[l].lv<=S.lv);
const slotsN=()=>L0().stops;
/* quán: khách ở khu đó là chính, khách nơi khác ghé thêm */
function mixAt(l){if(!L0().quan)return LOCS[l].mix;const m={};for(const t in LOCS[l].mix)m[t]=LOCS[l].mix[t]*3;for(const o of locsOpen())if(o!==l)for(const t in LOCS[o].mix)m[t]=(m[t]||0)+LOCS[o].mix[t]*.25;return m}
const curveAt=(l,sl)=>L0().quan?.45+.55*LOCS[l].c[sl]:LOCS[l].c[sl];
/* khách đói dự kiến ở một điểm */
function expect(l,sl){const W=WEATHER[S.weather]||WEATHER.nang;return L0().base*curveAt(l,sl)*W.m*(W.park&&l==='congvien'&&!L0().quan?W.park:1)*repF(l)*rateF()*(sl==='toi'||sl==='khuya'?1+perk('👥'):1)}
function genRoutes(){const L=locsOpen(),N=slotsN(),sc=r=>r.reduce((a,l,i)=>a+expect(l,SLOTS[i].id),0);let all=[];
  for(let n=0;n<60;n++)all.push(SLOTS.slice(0,N).map(()=>pick(L)));
  all=all.filter((r,i)=>all.findIndex(x=>x.join()===r.join())===i).sort((a,b)=>sc(b)-sc(a));
  const best=all[Math.min(all.length-1,ri(0,2))],other=all.filter(r=>r.join()!==best.join()&&r.some((l,i)=>l!==best[i]));
  return [best,other.length?pick(other.slice(0,Math.max(1,other.length>>1))):best].sort(()=>Math.random()-.5)}
function topLikes(l,n=3){const mx=mixAt(l),s={};for(const t in mx)for(const k in TYPES[t].like)s[k]=(s[k]||0)+mx[t]*TYPES[t].like[k];return Object.keys(s).filter(k=>!ITEMS[k].rare).sort((a,b)=>s[b]-s[a]).slice(0,n)}

/* ===================== màn hình chính ===================== */
const SCR=['route','menu','market','sell','sum','hub'];
function show(id){SCR.forEach(s=>$('#'+s).hidden=s!==id);$('#app').classList.toggle('selling',id==='sell');$('#hud').hidden=id==='sell';hud()}
function hud(){$('#hDay').textContent='Ngày '+S.day;$('#hMoney').textContent='💰 '+fk(S.money);const r=rating();$('#hRep').textContent='⭐ '+(r?r.toFixed(1):'—')}
$('#hRep').onclick=()=>openHub('rv');
/* hàng nút mở hub (nhân viên, đánh giá, khách quen, sưu tập, trang trí) ở màn sáng và tổng kết */
const hubBar=()=>`<div class="hubbar">${[['staff','👥',S.staff.length+'/'+L0().staff],['rv','⭐',S.reviews.some(r=>r.s<=2&&!r.fought)?'⚔️':S.reviews.length],['reg','💛',S.regs.length],['coll','🏆',collDone()],['decor','🎨',S.decor.length+'/'+DECOR.length]].map(([k,i,n])=>`<button class="hb" data-hub="${k}"><i>${i}</i><small>${n}</small></button>`).join('')}</div>`;
document.addEventListener('click',e=>{const b=e.target.closest('[data-hub]');if(b){sfx('tick');openHub(b.dataset.hub)}});

/* ---- sáng: chọn lộ trình (xe) hoặc mở quán ---- */
function renderRoute(){morning();show('route');const W=WEATHER[S.weather],nx=LV[S.lv+1];
  let h=hubBar()+`<h2>${W.i} ${L0().quan?'Hôm nay':'Hôm nay đi đâu?'}</h2>${nx?`<div class="mtop"><span class="chip">🎯 ${nx.i} ${nx.n} · ${fk(S.money)}/${fk(nx.price)}</span></div>`:''}`;
  const stopRow=(l,i)=>{const L=LOCS[l],sl=SLOTS[i],N=expect(l,sl.id),bars=Math.round(clamp(N/3.5,0,5)),mx=mixAt(l),tops=Object.keys(mx).sort((a,b)=>mx[b]-mx[a]).slice(0,2);
    return`<div class="stop"><div class="tm"><i>${sl.i}</i>${sl.n}</div><div class="ln">${L.i} ${L.n}${rep(l)?` <small>❤️${Math.round(rep(l))}</small>`:''}</div>
    <div class="crowd"><div class="bars">${[1,2,3,4,5].map(b=>`<i class="${b<=bars?'on':''}" style="height:${6+b*3}px"></i>`).join('')}</div>👥${Math.round(N)}</div>
    <div class="lk">${tops.map(t=>`<img class="hd" src="${img(TYPES[t].spr[0])}" alt="">`).join('')}<span style="width:6px"></span>${topLikes(l).map(k=>`<img src="${img(k)}" alt="">`).join('')}</div></div>`};
  if(L0().quan)h+=`<div class="rcard"><div class="rh"><span>${L0().i} ${LOCS[S.quan].n}</span><button class="btn sm teal" data-route="q">Mở cửa</button></div>${S.route.map(stopRow).join('')}</div>`;
  else h+=S.routes.map((r,ri)=>`<div class="rcard"><div class="rh"><span>${['🅰','🅱'][ri]}</span><button class="btn sm teal" data-route="${ri}">Chọn</button></div>${r.map(stopRow).join('')}</div>`).join('');
  $('#routeBody').innerHTML=h}
$('#routeBody').addEventListener('click',e=>{const b=e.target.closest('[data-route]');if(!b)return;sfx('pop');if(b.dataset.route!=='q')S.route=S.routes[+b.dataset.route];save();renderMenu()});

/* ===================== thực đơn: tự xiên món ===================== */
const routeTypes=()=>{const s={};(S.route||[]).forEach(l=>{const mx=mixAt(l);for(const t in mx)s[t]=(s[t]||0)+mx[t]});return s};
const likeFaces=m=>{const rt=routeTypes();return Object.keys(rt).filter(t=>appeal(m,t)>=.5).sort((a,b)=>appeal(m,b)-appeal(m,a)).slice(0,3).map(t=>`<img class="hd" src="${img(TYPES[t].spr[0])}" alt="">`).join('')};
const topOf=t=>{const L=TYPES[t].like;return Object.keys(L).filter(k=>!ITEMS[k].rare).sort((a,b)=>L[b]-L[a]).slice(0,3)};
function renderMenu(){show('menu');const cap=L0().menu,rt=routeTypes();
  $('#menuBody').innerHTML=`<h2>📋 Thực đơn <small class="cnt">${S.menu.length}/${cap}</small></h2><div class="mtop">${Object.keys(rt).sort((a,b)=>rt[b]-rt[a]).slice(0,4).map(t=>`<span class="chip"><img class="hd" src="${img(TYPES[t].spr[0])}" alt="">${topOf(t).map(k=>`<img src="${img(k)}" alt="">`).join('')}</span>`).join('')}</div>`
    +S.menu.map((m,i)=>{const r=recipeOf(m),open=r&&S.coll.recipe[r.id];return`<div class="mrow menu ${open?'rec':''}" data-ed="${i}"><img class="qimg" src="${queImg(m.v)}" alt=""><div><div class="nm">${open?'📜 ':''}${mName(m)}</div><div class="pr">${fk(priceM(m))} <span class="faces">${likeFaces(m)}</span></div></div><span class="ed">✏️</span></div>`}).join('')
    +(S.menu.length<cap?`<button class="addm" data-ed="new">＋ 🍢</button>`:'')}
$('#menuBody').addEventListener('click',e=>{const b=e.target.closest('[data-ed]');if(!b)return;sfx('tick');edOpen(b.dataset.ed==='new'?-1:+b.dataset.ed)});
$('#toMarket').onclick=()=>{if(!S.menu.length)return toast('📋 Thêm món đã');sfx('pop');renderMarket()};
/* ---- xiên món: chạm/giữ tô viên để xiên lên que, chạm que để gỡ viên cuối ---- */
let E=null,PW=0,PH=0,PR=[],PRAF=0,PD=null;const PC=mk($('#pc'),160,200);
const edItems=()=>Object.keys(ITEMS).filter(k=>!ITEMS[k].rare||k===(S.mk&&S.mk.rare)||(E&&E.v.includes(k)));
function edOpen(i){E={i,v:i>=0?[...S.menu[i].v]:[]};$('#edOv').hidden=false;$('#edDel').hidden=i<0;edHead();if(!PRAF)PRAF=requestAnimationFrame(edFrame)}
function edHead(){const m={v:E.v},r=E.v.length===5&&recipeOf(m);$('#edHead').innerHTML=E.v.length?`<b>${r&&S.coll.recipe[r.id]?'📜 ':''}${mName(m)}</b> · ${fk(priceM(m))} <span class="faces">${E.v.length===5?likeFaces(m):''}</span>`:'<b>🍢 0/5</b>';$('#edOk').disabled=E.v.length<5}
function edAdd(k){if(E.v.length>=5)return false;E.v.push(k);sfx('pop');edHead();return E.v.length<5}
function edUndo(){if(!E.v.length)return;E.v.pop();sfx('tick');edHead()}
function edClose(){E=null;$('#edOv').hidden=true;cancelAnimationFrame(PRAF);PRAF=0;PD=null;renderMenu()}
$('#edOk').onclick=()=>{if(E.v.length<5)return;const m={v:E.v};if(E.i>=0)S.menu[E.i]=m;else S.menu.push(m);save();sfx('win');edClose()};
$('#edDel').onclick=()=>{if(E.i>=0)S.menu.splice(E.i,1);save();edClose()};
$('#edX').onclick=()=>edClose();
function edFrame(ts){PRAF=0;if(!E)return;if(PD&&ts>=PD.nx){PD.nx=ts+150;if(PD.f()===false)PD=null}drawEd();PRAF=requestAnimationFrame(edFrame)}
function drawEd(){if(!PW||!PH)return;PC.LH=160*PH/PW;fit(PC,PW,PH);begin(PC);const W=160,H=PC.LH;PR=[];
  RR(0,0,W,H,0,'#f1d9ad',null);for(let y=4;y<H;y+=7)LN(0,y,W,y,'rgba(122,86,70,.12)',.5);
  const qh=Math.min(H*.4,74),qs=Math.min(6,(qh-8)/(5*2.15+2));RR(W/2-20,3,40,qh,6,'rgba(255,250,240,.75)',LINE,.5);xeQueV(E.v,W/2,3+qh-qs*1.6-3,qs,null);
  T(E.v.length+'/5',W/2+14,10,5,E.v.length<5?'#c0702a':'#3f8f66','center',800);
  if(E.v.length){RR(W/2+22,qh-12,14,14,5,'#fde3e0',LINE,.5);T('↩',W/2+29,qh-5,6,'#d9534f','center',800);PR.push({x:W/2-20,y:3,w:58,h:qh+2,f:()=>{edUndo();return false}})}
  const ks=edItems(),cols=4,cw=(W-4)/cols,rows=Math.ceil(ks.length/cols),by=qh+8,ch=Math.min(cw*1.05,(H-by-2)/rows);
  ks.forEach((k,i)=>{const r={x:2+(i%cols)*cw+1,y:by+Math.floor(i/cols)*ch,w:cw-2,h:ch-2};RR(r.x,r.y,r.w,r.h,4,ITEMS[k].rare?'#fff3d6':'rgba(255,255,255,.65)',ITEMS[k].rare?'#e0b24a':'#c9bdb5',.6);
    if(!drawSprite(SPR[k],r.x+2,r.y+2,r.w-4,r.h-11))drawPiece(k,r.x+r.w/2,r.y+r.h/2,4,ITEMS[k].col);TF(ITEMS[k].n,r.x+r.w/2,r.y+r.h-4.5,3.6,INK,r.w-2);
    PR.push({...r,f:()=>edAdd(k)})})}
$('#pc').addEventListener('pointerdown',e=>{if(!E)return;const b=e.currentTarget.getBoundingClientRect(),x=(e.clientX-b.left)*160/b.width,y=(e.clientY-b.top)*PC.LH/b.height;
  const R=PR.find(R=>x>=R.x&&x<=R.x+R.w&&y>=R.y&&y<=R.y+R.h);if(!R)return;e.preventDefault();try{e.currentTarget.setPointerCapture(e.pointerId)}catch(_){}if(R.f()!==false)PD={f:R.f,nx:performance.now()+300}});
['pointerup','pointercancel'].forEach(ev=>$('#pc').addEventListener(ev,()=>{PD=null}));

/* ===================== đi chợ ===================== */
function mItems(){return Object.keys(ITEMS).filter(k=>!ITEMS[k].rare||k===S.mk.rare)}
function mSauces(){return Object.keys(SAUCES).filter(k=>!SAUCES[k].rare||k===S.mk.rareS||(S.sauce[k]||0)>0)}
const buyCost=()=>Object.entries(S.buy).reduce((a,[k,n])=>a+(ITEMS[k]?bagPrice(k)*n:chaiPrice(k)*n),0);
const bagUse=()=>Object.keys(S.buy).filter(k=>ITEMS[k]).reduce((a,k)=>a+S.buy[k],0);
const inMenu=k=>S.menu.some(m=>m.v.includes(k));
/* viên mỗi loại cần cho thực đơn trên lộ trình: khách mỗi điểm × món họ chọn (độ thích bình phương) × số que × số viên loại đó trên que */
function demandMenu(route){const d={};route.forEach((l,i)=>{const N=expect(l,SLOTS[i].id),mx=mixAt(l),tw=Object.values(mx).reduce((a,b)=>a+b,0);
  for(const t in mx){const T0=TYPES[t],ap=S.menu.map(m=>appeal(m,t)),ok=ap.map(a=>a>=.2?a*a:0),sw=ok.reduce((a,b)=>a+b,0);if(!sw)continue;
    const ques=((T0.q[0]+T0.q[1])/2+(L0().quan?.3:0))*Math.min((T0.k[0]+T0.k[1])/2,ok.filter(Boolean).length);
    S.menu.forEach((m,j)=>{if(!ok[j])return;const c=mCount(m);for(const k in c)d[k]=(d[k]||0)+N*mx[t]/tw*ques*ok[j]/sw*c[k]})}});return d}
function renderMarket(){show('market');const cost=buyCost(),C=L0(),mk=S.mk,arrow=k=>{const p=mk.prevF[k];if(!p)return'';const d=mk.f[k]/p-1;return Math.abs(d)<.04?'':d>0?`<span class="up">↑</span>`:`<span class="dn">↓</span>`};
  const dm=demandMenu(S.route),ks=mItems().sort((a,b)=>inMenu(b)-inMenu(a));
  let h=`<div class="mtop"><span class="chip">${S.route.map(l=>LOCS[l].i).join(' → ')}</span><span class="chip ${bagUse()>C.bags?'warn':''}">🧺 ${bagUse()}/${C.bags}</span><span class="chip ${cost>S.money?'warn':''}">🛒 ${fk(cost)}</span>${mk.ev?`<span class="chip">${mk.ev.t}</span>`:''}</div>`;
  h+=ks.map(k=>{const n=S.buy[k]||0,need=Math.round(dm[k]||0);return`<div class="mrow ${n?'on':''}"><img src="${img(k)}" alt=""><div><div class="nm">${ITEMS[k].n} ${ITEMS[k].rare?'<span class="tag">✈️</span>':''}${inMenu(k)?'<span class="tag m">📋</span>':''}</div><div class="pr">${fk(bagPrice(k))}/${BAG} ${arrow(k)}${need?` · 🎯${need}`:''}</div></div>
    <div class="step"><button data-b="${k}" data-d="-1" aria-label="Bớt">−</button><b>${n}</b><button data-b="${k}" data-d="1" aria-label="Thêm">+</button></div></div>`}).join('');
  h+=`<div class="sec">🥫 ${S.bring.length}/${C.sauces}</div>`+mSauces().map(k=>{const on=S.bring.includes(k),left=S.sauce[k]||0,n=S.buy[k]||0;return`<div class="mrow ${on?'on':''}"><img src="${img(k)}" alt=""><div><div class="nm">${SAUCES[k].n} ${SAUCES[k].rare?'<span class="tag">✈️</span>':''}</div><div class="pr">${left+n*CHAI} lần · +${fk(chaiPrice(k))}</div></div>
    <div class="step"><button data-b="${k}" data-d="1" aria-label="Mua chai">+</button><button class="tog ${on?'on':''}" data-tog="${k}" aria-label="Mang theo">${on?'✓':''}</button></div></div>`}).join('');
  if(S.money<80000&&!S.debt)h+=`<div style="margin-top:10px"><button class="btn sm ghost" id="loanBtn">🏦 Vay 300k</button></div>`;
  $('#mBody').innerHTML=h;$('#mGo').disabled=!bagUse()||cost>S.money||bagUse()>C.bags}
$('#mBody').addEventListener('click',e=>{const b=e.target.closest('[data-b],[data-tog],#loanBtn');if(!b)return;sfx('tick');const C=L0();
  if(b.id==='loanBtn'){S.money+=300000;S.debt=330000;toast('🏦 +300k');save();return renderMarket()}
  if(b.dataset.tog){const k=b.dataset.tog;if(S.bring.includes(k))S.bring=S.bring.filter(x=>x!==k);else{if((S.sauce[k]||0)+(S.buy[k]||0)*CHAI<=0)S.buy[k]=1;S.bring.push(k);if(S.bring.length>C.sauces)S.bring.shift()}return renderMarket()}
  const k=b.dataset.b,d=+b.dataset.d,n=(S.buy[k]||0)+d;
  if(ITEMS[k]&&d>0&&bagUse()>=C.bags)return toast(`🧺 ${C.bags} bịch thôi`);
  if(SAUCES[k]&&d>0&&!S.bring.includes(k)){S.bring.push(k);if(S.bring.length>C.sauces)S.bring.shift()}
  if(n<=0)delete S.buy[k];else S.buy[k]=n;renderMarket()});
/* gợi ý: đủ viên cho thực đơn trên lộ trình, trong số bịch chở được và số tiền đang có; sốt hợp khách */
function autoBuy(){const C=L0(),dm=demandMenu(S.route);S.buy={};let budget=S.money*.92;
  for(const k in dm)if(dm[k]>2)S.buy[k]=Math.max(1,Math.ceil(dm[k]*1.1/BAG));
  const tc=()=>Object.keys(S.buy).reduce((a,k)=>a+bagPrice(k)*S.buy[k],0);
  while(bagUse()>C.bags||tc()>budget){const k=Object.keys(S.buy).sort((a,b)=>S.buy[b]-S.buy[a])[0];if(!k)break;if(S.buy[k]>1)S.buy[k]--;else delete S.buy[k]}budget-=tc();
  const sw={};S.route.forEach(l=>{const mx=mixAt(l);for(const t in mx)for(const s in TYPES[t].sa)if(mSauces().includes(s))sw[s]=(sw[s]||0)+mx[t]*TYPES[t].sa[s]});
  S.bring=Object.keys(sw).sort((a,b)=>sw[b]-sw[a]).slice(0,C.sauces);S.bring.forEach(k=>{if((S.sauce[k]||0)<15&&chaiPrice(k)<=budget){S.buy[k]=1;budget-=chaiPrice(k)}});
  sfx('pop');renderMarket()}
$('#mAuto').onclick=autoBuy;
$('#mGo').onclick=()=>{const cost=buyCost();if(cost>S.money||!bagUse()||bagUse()>L0().bags)return;S.money-=cost;
  const stock={};for(const k in S.buy){if(ITEMS[k])stock[k]=S.buy[k]*BAG;else S.sauce[k]=(S.sauce[k]||0)+S.buy[k]*CHAI}
  startDay(stock,cost)};

/* ===================== nhân viên ===================== */
const SNAMES=['Tí','Tèo','Mít','Bông','Na','Bin','Su','Cốm','Mận','Bưởi','Tôm','Ốc','Gạo','Khoai','Đậu','Sữa','Kem','Mơ'];
/* spd nhanh tay, kheo khéo (ít cháy), duyen duyên (khách đỡ sốt ruột); lương theo tổng chỉ số */
function genStaff(){const a=ri(1,5),b=ri(1,5),c=ri(1,5),used=S.staff.map(s=>s.name);return{id:'s'+(++S.rid),name:pick(SNAMES.filter(n=>!used.includes(n))),spr:pick(['nv1_o_hong','nv2_o_hong','nv1_o_xanh','nv2_o_xanh']),spd:a,kheo:b,duyen:c,wage:r1k(40000+12000*(a+b+c)*(1+.25*(S.lv-1))),days:0}}
const stars=n=>'★'.repeat(n)+'☆'.repeat(5-n);

/* ===================== khách quen ===================== */
const XUNG={hocsinh:['Bé'],ba:['Cô','Bà','Dì'],giadinh:['Anh','Chị'],vanphong:['Anh','Chị'],taixe:['Chú','Anh'],gioitre:['Em','Bạn'],sinhvien:['Bạn','Em']};
const GNAME=['Na','Bin','Tâm','Hoa','Lan','Mai','Hùng','Dũng','Tú','Vy','My','Khoa','Long','Thảo','Linh','Phúc','Quân','Trang','Hạnh','Sơn','Nhi','Tín','Vân','Hải','Ngọc','Phương','Bảo','Tuấn'];
const genName=t=>`${pick(XUNG[t]||['Bạn'])} ${pick(GNAME)}`;
const regCap=()=>6+S.lv*6;
function makeRegular(c,mi){if(S.regs.length>=regCap()||TYPES[c.type].sp_||!S.menu[mi])return null;const used=new Set(S.regs.map(r=>r.nick));let nick='';
  for(let i=0;i<10&&(!nick||used.has(nick));i++)nick=Math.random()<.6?pick(NICK[c.type]||NICK.adj):pick(NICK.adj);
  const R={id:'r'+(++S.rid),name:c.name||genName(c.type),nick,type:c.type,spr:c.spr,home:D.st.l,fav:[...S.menu[mi].v],visits:1,love:1,day:S.day};S.regs.push(R);return R}
const regName=R=>`${R.name} ${R.nick}`;

/* ===================== review ===================== */
function rvText(c,s,f){const T0=TYPES[c.type],P=[],mm=f.m!=null&&S.menu[f.m],m=mm?mName(mm).toLowerCase():'cá viên',sa=f.ss&&f.ss[0]?SAUCES[f.ss[0]].n.toLowerCase():'tương ớt',pr=mm?fk(priceM(mm)):'';
  const sub=x=>x.replace('{m}',m).replace('{s}',sa).replace('{p}',pr).replace('{k}',f.k?ITEMS[f.k].n.toLowerCase():m).replace('{r}',f.rec||m),cap=x=>x[0].toUpperCase()+x.slice(1);
  P.push(pick(RV.open[s]));
  if(s>=4){const pool=[];if(!f.burnt)pool.push(...RV.good.crisp);if(f.fast)pool.push(...RV.good.fast);if(f.ss&&f.ss.length&&!f.sauceBad)pool.push(...RV.good.sauce);if(T0.sens<=1.1)pool.push(...RV.good.price);
    if(Math.random()<.25)pool.push(...RV.good.cat);if(f.combo)pool.push(...RV.good.combo);if(S.weather==='mua')pool.push(...RV.good.rain);if(f.night)pool.push(...RV.good.night);if(f.rec)pool.push(...RV.good.recipe);
    const a=pick(pool),b=pick(pool.filter(x=>x!==a));P.push(cap(sub(a))+(b&&Math.random()<.5?', '+sub(b):'')+'.')}
  else{const pool=[];if(f.burnt)pool.push(...RV.bad.burnt);if(f.slow)pool.push(...RV.bad.slow);if(f.sauceBad)pool.push(...RV.bad.sauce);if(f.quit)pool.push(...RV.bad.quit);if(f.miss)pool.push(...RV.bad.miss);if(f.crowd)pool.push(...RV.bad.crowd);
    if(T0.sens>=1.4&&!pool.length)pool.push(...RV.bad.price);if(!pool.length)pool.push(...RV.bad.slow);P.push(cap(sub(pick(pool)))+'.')}
  if(T0.rv&&Math.random()<.7)P.push(cap(pick(T0.rv))+(s>=4?'!':'.'));
  return P.join(' ')+' '+pick(RV.end[s])}
/* viết review: 5★ 30%, 4★ 20%, 3★ 40%, ≤2★ 70%; reviewer luôn viết và nặng gấp 3 */
function review(c,s,f){const p=c.type==='reviewer'?1:s>=5?.3:s>=4?.2:s>=3?.4:.7;if(Math.random()>p)return;
  const r={id:'v'+(++S.rid),day:S.day,name:c.reg?regName(c.reg):c.name||genName(c.type),spr:c.spr,type:c.type,s,t:rvText(c,s,f),w:c.type==='reviewer'?3:1,loc:D.st.l};S.reviews.push(r);if(S.reviews.length>150)S.reviews.shift();
  /* khách quen tự vào bênh (có lúc) */
  if(s<=2&&S.regs.length&&Math.random()<Math.min(.6,.2+.03*S.regs.length))defend(r,pick(S.regs),true)}
/* khách quen bênh review chê: sức của khách quen (độ thân, số lần ghé) đấu với độ gắt của người chê */
function defend(r,R,auto){const pow=R.love+R.visits*.5+rnd(0,6),gat=(6-r.s)*1.5+rnd(0,6),win=pow>=gat;r.fought=1;
  r.def={nick:regName(R),spr:R.spr,txt:pick(DEF.hit),back:pick(DEF.back),end:win?pick(DEF.win):pick(DEF.lose),win};
  if(win){r.w*=.3;if(Math.random()<.4){r.s=Math.min(5,r.s+1);r.edit=1}R.love++;S.stat.regWins++}else R.love=Math.max(0,R.love-1);
  if(!auto)sfx(win?'win':'err');return win}
function replyRv(r,kind){if(r.rep)return;r.rep={kind,txt:pick(REPLY[kind])};
  if(kind==='sorry'&&r.s<=3&&Math.random()<.45){r.s++;r.edit=1;r.rep.res='⬆️'}
  else if(kind==='sass'){if(Math.random()<.5){r.s=Math.max(1,r.s-1);r.edit=1;r.rep.res='⬇️'}else if(Math.random()<.4){S.buzz=(S.buzz||0)+ri(2,5);r.rep.res='🔥'}}
  else if(kind==='thx'&&r.s>=4&&Math.random()<.3){S.buzz=(S.buzz||0)+1;r.rep.res='💛'}save()}

/* ===================== sưu tập, huy hiệu ===================== */
const ACH=[
  {id:'k100',n:'100 khách',i:'🍢',ok:()=>S.stat.served>=100},{id:'k1k',n:'1.000 khách',i:'🍢',ok:()=>S.stat.served>=1000},{id:'k10k',n:'10.000 khách',i:'🍢',ok:()=>S.stat.served>=10000},
  {id:'c10',n:'Combo ×10',i:'🔥',ok:()=>S.stat.maxCombo>=10},{id:'c25',n:'Combo ×25',i:'🔥',ok:()=>S.stat.maxCombo>=25},
  {id:'d1m',n:'Lời 1 triệu/ngày',i:'💰',ok:()=>S.stat.bestDay>=1e6},{id:'d10m',n:'Lời 10 triệu/ngày',i:'💰',ok:()=>S.stat.bestDay>=1e7},
  {id:'m100',n:'Có 100 triệu',i:'💎',ok:()=>S.money>=1e8},{id:'m1b',n:'Tỉ phú cá viên',i:'💎',ok:()=>S.money>=1e9},
  {id:'reg10',n:'10 khách quen',i:'💛',ok:()=>S.regs.length>=10},{id:'reg30',n:'30 khách quen',i:'💛',ok:()=>S.regs.length>=30},
  {id:'def10',n:'Bênh tiệm thắng 10 trận',i:'⚔️',ok:()=>S.stat.regWins>=10},{id:'five200',n:'200 lượt 5★',i:'⭐',ok:()=>S.stat.five>=200},
  {id:'rec6',n:'6 que bí truyền',i:'📜',ok:()=>Object.keys(S.coll.recipe).length>=6},{id:'loc7',n:'Bán đủ 7 nơi',i:'🗺️',ok:()=>Object.keys(S.coll.loc).length>=7},
  {id:'quan',n:'Mở quán',i:'🏪',ok:()=>S.lv>=4},{id:'chain3',n:'3 chi nhánh',i:'🏙️',ok:()=>S.branches.length>=3},{id:'catch',n:'Bắt kẻ quỵt',i:'🏃',ok:()=>S.stat.catch>=1}];
const COLL=()=>[
  {id:'recipe',i:'📜',n:'Que bí truyền',cup:'cup_famous',L:RECIPES.map(r=>({ok:!!S.coll.recipe[r.id],t:S.coll.recipe[r.id]?r.n:'❔ '+r.h,img:S.coll.recipe[r.id]?queImg(r.v):''}))},
  {id:'album',i:'🧑',n:'Album khách',cup:'cup_ach',L:Object.keys(TYPES).map(t=>({ok:!!S.coll.album[t],t:S.coll.album[t]?TYPES[t].n:'❔',img:S.coll.album[t]?img(TYPES[t].spr[0]):''}))},
  {id:'loc',i:'🗺️',n:'Địa điểm',cup:'cup_bang',L:Object.keys(LOCS).map(l=>({ok:!!S.coll.loc[l],t:(S.coll.loc[l]?LOCS[l].i+' ':'❔ ')+LOCS[l].n}))},
  {id:'decor',i:'🎨',n:'Trang trí',cup:'cup_mon',L:DECOR.map(d=>({ok:S.decor.includes(d.k),t:d.n,img:img(d.k)}))},
  {id:'ach',i:'🏅',n:'Huy hiệu',cup:'cup_own',L:ACH.map(a=>({ok:!!S.coll.ach[a.id],t:a.i+' '+a.n}))},
  {id:'reg',i:'💛',n:'Khách quen',cup:'cup_quen',L:[...S.regs.map(R=>({ok:1,t:regName(R),img:img(R.spr)})),...Array(Math.max(0,30-S.regs.length)).fill({ok:0,t:'❔'})]},
  {id:'branch',i:'🏙️',n:'Chi nhánh',cup:'cup_rival',L:Object.keys(LOCS).map(l=>({ok:S.branches.includes(l)||l===S.quan&&S.lv>=6,t:LOCS[l].i+' '+LOCS[l].n}))}];
const collDone=()=>COLL().filter(c=>c.L.every(x=>x.ok)).length+'/'+COLL().length;
function achCheck(){ACH.forEach(a=>{if(!S.coll.ach[a.id]&&a.ok()){S.coll.ach[a.id]=S.day;toast(`🏅 ${a.n}!`,2200);sfx('win')}})}

/* ===================== hub: nhân viên, đánh giá, khách quen, sưu tập, trang trí ===================== */
let HUB='staff',HUBBACK='route',COLLSEL=null,RVF='all';
function openHub(k){if(!$('#sell').hidden)return;if($('#hub').hidden)HUBBACK=SCR.find(s=>!$('#'+s).hidden)||'route';HUB=k;show('hub');renderHub();$('#hubBody').scrollTop=0}
$('#hubBack').onclick=()=>{sfx('tick');if(HUBBACK==='sum')show('sum');else if(HUBBACK==='menu')renderMenu();else if(HUBBACK==='market')renderMarket();else renderRoute()};
function renderHub(){const tabs=[['staff','👥'],['rv','⭐'],['reg','💛'],['coll','🏆'],['decor','🎨']];
  $('#hubTabs').innerHTML=tabs.map(([k,i])=>`<button class="ht ${k===HUB?'on':''}" data-hubt="${k}">${i}</button>`).join('');
  $('#hubBody').innerHTML=({staff:staffHTML,rv:rvHTML,reg:regHTML,coll:collHTML,decor:decorHTML})[HUB]();hud()}
$('#hubTabs').addEventListener('click',e=>{const b=e.target.closest('[data-hubt]');if(!b)return;sfx('tick');HUB=b.dataset.hubt;renderHub();$('#hubBody').scrollTop=0});
function staffHTML(){const C=L0();let h=`<h2>👥 Nhân viên <small class="cnt">${S.staff.length}/${C.staff}</small></h2>`;
  const row=(s,btn)=>`<div class="srow"><img src="${img(s.spr)}" alt=""><div class="sm"><b>${esc(s.name)}</b><div class="st"><span>⚡${stars(s.spd)}</span><span>🍳${stars(s.kheo)}</span><span>😊${stars(s.duyen)}</span></div><small>${fk(s.wage)}/ngày</small></div>${btn}</div>`;
  h+=S.staff.map(s=>row(s,`<button class="btn sm ghost" data-fire="${s.id}" aria-label="Cho nghỉ">✕</button>`)).join('')||'<p class="empty">—</p>';
  if(S.day<3)h+=`<p class="empty">🔒 Ngày 3</p>`;
  else if(S.staff.length<C.staff&&S.cands.length)h+=`<div class="sec">🙋 Ứng viên</div>`+S.cands.map(s=>row(s,`<button class="btn sm teal" data-hire="${s.id}">Thuê</button>`)).join('');
  return h}
document.addEventListener('click',e=>{const h=e.target.closest('[data-hire]'),f=e.target.closest('[data-fire]');if(!h&&!f)return;
  if(h){const s=S.cands.find(x=>x.id===h.dataset.hire);if(!s||S.staff.length>=L0().staff)return;S.staff.push(s);S.cands=S.cands.filter(x=>x!==s);sfx('win');toast(`👋 ${s.name}!`)}
  else{S.staff=S.staff.filter(x=>x.id!==f.dataset.fire);sfx('tick')}save();renderHub()});
function rvHTML(){const R=S.reviews.slice().reverse(),r=rating(),cnt=s=>S.reviews.filter(x=>x.s===s).length,F=[['all','Tất cả'],['bad','⚔️'],['5','5★'],['low','≤3★'],['new','Mới']];
  const L=R.filter(x=>RVF==='all'||(RVF==='bad'&&x.s<=2&&!x.fought)||(RVF==='5'&&x.s===5)||(RVF==='low'&&x.s<=3)||(RVF==='new'&&x.day>=S.day-1));
  let h=`<h2>⭐ ${r?r.toFixed(2):'—'} <small class="cnt">${S.reviews.length}</small></h2><div class="rvbars">${[5,4,3,2,1].map(s=>`<div><span>${s}★</span><i style="width:${S.reviews.length?cnt(s)/S.reviews.length*100:0}%"></i><b>${cnt(s)}</b></div>`).join('')}</div>`;
  h+=`<div class="filt">${F.map(([k,n])=>`<button class="${RVF===k?'on':''}" data-rvf="${k}">${n}</button>`).join('')}</div>`;
  h+=L.slice(0,40).map(x=>`<div class="rv ${x.s<=2?'bad':''}"><div class="rvh"><img src="${img(x.spr)}" alt=""><b>${esc(x.name)}</b><span class="s">${'★'.repeat(x.s)}${x.edit?'<small> ✎</small>':''}</span><small>N${x.day}${x.w>1?' · 📹':''}</small></div><p>${esc(x.t)}</p>
    ${x.def?`<div class="def ${x.def.win?'win':'lose'}"><img src="${img(x.def.spr)}" alt=""><div><b>💛 ${esc(x.def.nick)}:</b> ${esc(x.def.txt)}<br><i>↪ ${esc(x.def.back)} … ${esc(x.def.end)}</i></div></div>`:''}
    ${x.rep?`<div class="rep">🍢 ${esc(x.rep.txt)} ${x.rep.res||''}</div>`:`<div class="ra">${x.s<=2&&!x.fought&&S.regs.length?`<button class="btn sm" data-fight="${x.id}">⚔️</button>`:''}<button class="btn sm ghost" data-rp="${x.id}" data-k="thx" aria-label="Cảm ơn">💛</button><button class="btn sm ghost" data-rp="${x.id}" data-k="sorry" aria-label="Xin lỗi">🙏</button><button class="btn sm ghost" data-rp="${x.id}" data-k="sass" aria-label="Cà khịa">😏</button></div>`}</div>`).join('')||'<p class="empty">—</p>';
  return h}
document.addEventListener('click',e=>{const f=e.target.closest('[data-rvf]'),p=e.target.closest('[data-rp]'),g=e.target.closest('[data-fight]');
  if(f){RVF=f.dataset.rvf;sfx('tick');return renderHub()}
  if(p){const r=S.reviews.find(x=>x.id===p.dataset.rp);if(r){replyRv(r,p.dataset.k);sfx('pop');renderHub()}return}
  if(g){const r=S.reviews.find(x=>x.id===g.dataset.fight);if(r)fightOpen(r)}});
/* ⚔️ chọn khách quen ra bênh */
let FR=null;
function fightOpen(r){FR=r;const top=S.regs.slice().sort((a,b)=>(b.love+b.visits*.5)-(a.love+a.visits*.5)).slice(0,4);
  $('#fightCard').innerHTML=`<div class="big">⚔️</div><div class="rv bad"><div class="rvh"><img src="${img(r.spr)}" alt=""><b>${esc(r.name)}</b><span class="s">${'★'.repeat(r.s)}</span></div><p>${esc(r.t)}</p></div>
    <div class="regs">${top.map(R=>`<button class="regb" data-fr="${R.id}"><img src="${img(R.spr)}" alt=""><b>${esc(R.nick)}</b><small>💛${R.love} · ${R.visits}🍢</small></button>`).join('')}</div><button class="btn ghost wide" id="fightX">✕</button>`;
  $('#fightOv').hidden=false;$('#fightX').onclick=()=>{$('#fightOv').hidden=true}}
$('#fightCard').addEventListener('click',e=>{const b=e.target.closest('[data-fr]');if(!b||!FR)return;const R=S.regs.find(x=>x.id===b.dataset.fr);if(!R)return;const win=defend(FR,R,false);save();achCheck();
  $('#fightCard').innerHTML=`<div class="big">${win?'🏆':'💥'}</div><div class="def ${win?'win':'lose'}"><img src="${img(R.spr)}" alt=""><div><b>💛 ${esc(regName(R))}:</b> ${esc(FR.def.txt)}<br><i>↪ ${esc(FR.def.back)} … ${esc(FR.def.end)}</i></div></div>
    <div class="row">${win?`<span>⭐ ${rating().toFixed(2)}</span>${FR.edit?`<span>✎ ${FR.s}★</span>`:''}`:'<span>😤</span>'}</div><button class="btn wide" id="fightX">OK</button>`;
  $('#fightX').onclick=()=>{$('#fightOv').hidden=true;renderHub()}});
function regHTML(){return`<h2>💛 Khách quen <small class="cnt">${S.regs.length}/${regCap()}</small></h2>`+(S.regs.slice().sort((a,b)=>b.love-a.love).map(R=>`<div class="srow"><img src="${img(R.spr)}" alt=""><div class="sm"><b>${esc(regName(R))}</b><div class="st"><span>${LOCS[R.home]?LOCS[R.home].i:''}</span><span>💛${R.love}</span><span>${R.visits}🍢</span></div></div><img class="qimg" src="${queImg(R.fav)}" alt=""></div>`).join('')||'<p class="empty">5★ → 💛</p>')}
function collHTML(){const C=COLL();return`<h2>🏆 Sưu tập <small class="cnt">${collDone()}</small></h2>`+C.map(c=>{const n=c.L.filter(x=>x.ok).length,full=n===c.L.length;
  return`<div class="cset ${full?'full':''}"><button class="csh" data-cs="${c.id}">${full&&ART[c.cup]?`<img class="cupi" src="${img(c.cup)}" alt="">`:`<i>${c.i}</i>`}<b>${c.n}</b><small>${n}/${c.L.length}</small><span class="gbar"><i style="width:${n/c.L.length*100}%"></i></span></button>
    ${COLLSEL===c.id?`<div class="cl">${c.L.slice().sort((a,b)=>a.ok-b.ok).map(x=>`<span class="${x.ok?'ok':''}">${x.img?`<img src="${x.img}" alt="">`:''}${esc(x.t)}</span>`).join('')}</div>`:''}</div>`}).join('')}
document.addEventListener('click',e=>{const b=e.target.closest('[data-cs]');if(!b)return;COLLSEL=COLLSEL===b.dataset.cs?null:b.dataset.cs;sfx('tick');renderHub()});
function decorHTML(){let h=`<h2>🎨 Trang trí <small class="cnt">${S.decor.length}/${DECOR.length}</small></h2>`+DECOR.map(d=>{const own=S.decor.includes(d.k);return`<div class="mrow ${own?'on':''}"><img src="${img(d.k)}" alt=""><div><div class="nm">${d.n}</div><div class="pr">${d.perk}</div></div>${own?'<b class="own">✓</b>':`<button class="btn sm" data-buyd="${d.k}" ${S.money>=d.p?'':'disabled'}>${fk(d.p)}</button>`}</div>`}).join('');
  if(L0().chain)h+=`<div class="sec">🏙️ Chi nhánh <small>${S.branches.length}/${Object.keys(LOCS).length-1} · +${fk(BRANCH_IN)}/ngày</small></div>`+Object.keys(LOCS).filter(l=>l!==S.quan).map(l=>{const own=S.branches.includes(l);return`<div class="mrow ${own?'on':''}"><span class="li">${LOCS[l].i}</span><div><div class="nm">${LOCS[l].n}</div><div class="pr">❤️${Math.round(rep(l))}</div></div>${own?'<b class="own">✓</b>':`<button class="btn sm" data-buyb="${l}" ${S.money>=BRANCH_PRICE?'':'disabled'}>${fk(BRANCH_PRICE)}</button>`}</div>`}).join('');
  return h}
document.addEventListener('click',e=>{const d=e.target.closest('[data-buyd]'),b=e.target.closest('[data-buyb]');if(!d&&!b)return;
  if(d){const x=DECOR.find(q=>q.k===d.dataset.buyd);if(!x||S.money<x.p||S.decor.includes(x.k))return;S.money-=x.p;S.decor.push(x.k);toast(`🎨 ${x.n}!`)}
  else{const l=b.dataset.buyb;if(S.money<BRANCH_PRICE||S.branches.includes(l))return;S.money-=BRANCH_PRICE;S.branches.push(l);toast(`🏙️ ${LOCS[l].n}!`)}
  sfx('win');achCheck();save();renderHub()});

/* ===================== ngày bán ===================== */
let D=null,PAUSED=false;
function startDay(stock,cost){
  D={stock,start:{...stock},cost,fuel:L0().cost,rev:0,tips:0,served:0,stars:[],angry:0,miss:{},full:0,si:-1,cust:[],fx:[],cid:0,sauces:S.bring.filter(k=>(S.sauce[k]||0)>0),stops:[],combo:0,fines:0,lostQuyt:0,
    staff:S.staff.map(s=>({s,st:'idle',t:0,f:null}))};
  S.money-=D.fuel;XS=null;show('sell');layout();nextStop()}
function nextStop(){D.si++;if(D.si>=S.route.length)return endDay();const l=S.route[D.si],sl=SLOTS[D.si];
  D.st={l,sl:sl.id,t:0,dur:STOP_SEC,next:1.2,rev:0,served:0,miss:0,angry:0,N:expect(l,sl.id)+(D.si===0&&S.buzz?S.buzz:0),done:false,ev:null,pause:0};D.cust=[];
  if(D.si===0)S.buzz=0;S.coll.loc[l]=S.coll.loc[l]||S.day;
  /* sự kiện của buổi: trật tự đô thị (lúc còn xe), công ty đặt tiệc (từ ki-ốt) */
  if(!L0().quan&&Math.random()<.14)D.st.evAt={k:'tttd',t:rnd(15,60)};else if(S.lv>=2&&Math.random()<.12)D.st.evAt={k:'tiec',t:rnd(10,50)};
  $('#stopOv').hidden=true;PAUSED=false;toast(`${LOCS[l].i} ${LOCS[l].n} · ${sl.n}`,1600);loop()}
const clock=()=>{const st=D.st,sl=SLOTS[D.si],h=sl.h0+(sl.h1-sl.h0)*clamp(st.t/st.dur,0,1),hh=Math.floor(h),mm=Math.floor((h-hh)*6)*10;return`${hh}:${String(mm).padStart(2,'0')}`};
const queue=()=>D.cust.filter(c=>c.st==='q');
const QMAX=5;
/* người đi đường: người đói thèm một món theo kiểu khách, khách quen ghé, khách đặc biệt hiếm */
function spawn(force){const st=D.st,mx=mixAt(st.l);let type=force||pickW(Object.keys(mx),t=>mx[t]),R=null;
  if(!force&&Math.random()<.035*(1+S.lv*.2))type=pick(SPECIALS);
  const regsHere=S.regs.filter(r=>(r.home===st.l||L0().quan)&&r.last!==S.day&&!D.cust.some(c=>c.reg===r));
  if(!force&&regsHere.length&&Math.random()<.13){R=pick(regsHere);type=R.type}
  const T0=TYPES[type],hungry=R||force||T0.sp_?true:Math.random()<.62;
  const c={id:++D.cid,type,spr:R?R.spr:pick(T0.spr),x:172,tx:-24,sp:rnd(15,20),st:'walk',hungry,dec:false,bob:Math.random()*6,reg:R,name:R?regName(R):null};
  if(hungry){const ks=Object.keys(T0.like).filter(k=>!ITEMS[k].rare||k===S.mk.rare);c.crave=pickW(ks,k=>T0.like[k])}
  D.cust.push(c);return c}
/* số que món i còn làm được: nguyên liệu đủ ghép bao nhiêu que + que đã vớt + que trong chảo */
const mMake=i=>{const c=mCount(S.menu[i]);return Math.min(...Object.keys(c).map(k=>Math.floor((D.stock[k]||0)/c[k])))};
const qAv=i=>mMake(i)+xeHave(i)+xeIn(i);
const say=(c,L,ms=2200,k)=>{if(!L||!L.length)return;c.say=pick(L).replace('{k}',k?ITEMS[k].n.toLowerCase():'');c.sayT=now+ms/1000};
const orderTxt=o=>o.bs.map(i=>`${qN(o,i)} que ${mName(S.menu[i]).toLowerCase()}`).join(', ')+(o.ss.length?' thêm '+o.ss.map(s=>SAUCES[s].n.toLowerCase()).join(', '):'');
/* khách đói tới gần xe xem thực đơn: có món hợp khẩu vị (≥ 0,2) còn làm được thì gọi, không thì 😕 đi tiếp; khách quen gọi món ruột */
function decide(c,big){c.dec=true;const T0=TYPES[c.type];let ms=S.menu.map((m,i)=>({i,a:appeal(m,c.type)})).filter(x=>x.a>=.2&&qAv(x.i)>0);
  if(c.reg){const f=S.menu.findIndex(m=>mKey(m.v)===mKey(c.reg.fav));if(f>=0&&qAv(f)>0)ms=[{i:f,a:9},...ms.filter(x=>x.i!==f)]}
  if(!ms.length){D.miss[c.crave]=(D.miss[c.crave]||0)+1;D.st.miss++;c.bub={k:c.crave,no:1,t:now+1.4};say(c,TYPES[c.type].miss,2600,c.crave);if(c.reg)c.reg.love=Math.max(0,c.reg.love-1);return}
  const first=c.reg&&ms[0].a===9?ms[0]:pickW(ms,x=>x.a*x.a);
  if(queue().length>=QMAX&&!big){D.full++;c.bub={m:first.i,full:1,t:now+1.6};c.say='Đông quá, thôi!';c.sayT=now+1.6;return}
  const kinds=big?Math.min(3,ms.length):Math.min(ri(T0.k[0],T0.k[1]),ms.length),bs=[first.i];
  while(bs.length<kinds){const x=pickW(ms.filter(y=>!bs.includes(y.i)),y=>y.a*y.a);if(!x)break;bs.push(x.i)}
  const q={};bs.forEach(i=>q[i]=Math.max(1,Math.min(big?ri(2,4):ri(T0.q[0],T0.q[1])+(L0().quan&&Math.random()<.3?1:0),qAv(i))));
  const ss=[];if(D.sauces.length&&Math.random()<T0.sp){const sw=D.sauces.filter(s=>T0.sa[s]);ss.push(sw.length?pickW(sw,s=>T0.sa[s]):pick(D.sauces))}
  const bad=D.luck&&!D.luck.good&&D.luck.n>0;if(bad)D.luck.n--;
  c.o={bs,q,ss};const tot=bs.reduce((a,x)=>a+q[x],0);c.max=c.p=(T0.pat+tot*5)*(1+perk('⏳'))*(big?1.6:1)*(bad?.8:1);c.st='q';c.big=big;
  c.bub={m:first.i,t:now+1};c.say=c.reg?`${pick(['Như mọi khi nha!','Lại là mình nè!','Món ruột nha!'])} ${orderTxt(c.o)}!`:big?`Công ty đặt tiệc nè: ${orderTxt(c.o)}!`:`${pick(T0.hi)} ${orderTxt(c.o)}!`;c.sayT=now+2.8;sfx('bell');layoutQ()}
function layoutQ(){queue().forEach((c,i)=>{c.tx=70+i*12.5})}
function leave(c,mood){c.st='go';c.tx=-26;c.mood=mood;layoutQ()}
/* nhân viên duyên dáng: khách đỡ sốt ruột */
const pmul=()=>{const d=D.staff.reduce((a,w)=>a+w.s.duyen,0);return clamp(1-.025*d,.7,1)};
function tick(dt){const st=D.st;st.t+=dt;
  /* sự kiện */
  if(st.evAt&&!st.ev&&st.t>=st.evAt.t){if(st.evAt.k==='tttd'){st.ev={k:'tttd',x:178};$('#evBtn').hidden=false;sfx('err');toast('🚓 Trật tự đô thị!',1600)}
    else{st.ev={k:'tiec',done:1};const c=spawn('vanphong');c.tiec=1}st.evAt=null}
  if(st.ev&&st.ev.k==='tttd'&&!st.ev.done){st.ev.x-=dt*14;if(st.ev.x<=92){st.ev.done=1;$('#evBtn').hidden=true;const f=Math.max(50000,r1k(S.money*.04));S.money-=f;D.fines+=f;toast(`🚓 Phạt ${fk(f)}`,2200);sfx('err')}}
  if(st.ev&&st.ev.k==='tttd'&&st.ev.done&&st.ev.x<180)st.ev.x+=dt*30;
  if(st.pause>0)st.pause-=dt;
  if(!st.done&&st.t<st.dur&&st.pause<=0){st.next-=dt;if(st.next<=0){spawn();const walkers=st.N/.62,f=1+.6*Math.sin(Math.PI*st.t/st.dur);st.next=st.dur/Math.max(1,walkers)/f*rnd(.55,1.45)}}
  const pm=pmul();
  D.cust.forEach(c=>{const d=c.tx-c.x;if(Math.abs(d)>.3)c.x+=Math.sign(d)*Math.min(Math.abs(d),c.sp*(c.st==='run'?2.4:1)*dt);
    if(c.st==='walk'&&c.hungry&&!c.dec&&c.x<118&&st.t<st.dur)decide(c,c.tiec);
    if(c.st==='q'&&Math.abs(d)<1){c.p-=dt*pm;if(c.p<=0){D.angry++;st.angry++;D.combo=0;S.rep[st.l]=clamp(rep(st.l)-1.5,0,100);say(c,TYPES[c.type].quit,1800);review(c,1,{quit:1,slow:1,m:c.o.bs[0]});if(c.reg)c.reg.love=Math.max(0,c.reg.love-2);leave(c,0);sfx('err')}}
    if(c.st==='run'&&c.x<=-20&&!c.lost){c.lost=1;D.lostQuyt+=c.owe;toast(`🏃 Mất ${fk(c.owe)}`,1600)}});
  if(now>(D.chatT||0)){D.chatT=now+rnd(4,7);const q=queue().filter(c=>Math.abs(c.tx-c.x)<1&&!(c.sayT>now));if(q.length){const c=pick(q);say(c,TYPES[c.type].wait,2600)}}
  /* khách đầu hàng cần món mà xe hết hẳn thì đi */
  const f=queue()[0];if(f&&Math.abs(f.tx-f.x)<1){const lack=f.o.bs.find(i=>qN(f.o,i)>qAv(i));if(lack!=null){const k=S.menu[lack].v.find(k=>!(D.stock[k]>0))||S.menu[lack].v[0];D.miss[k]=(D.miss[k]||0)+1;st.miss++;say(f,TYPES[f.type].miss,2400,k);review(f,2,{miss:1,k,m:lack});leave(f,0)}}
  D.cust=D.cust.filter(c=>c.x>-24&&c.x<180||c.st==='q');
  xeTick(dt);staffTick(dt);
  D.fx=D.fx.filter(x=>now-x.t<1.4);
  if(st.t>=st.dur&&!queue().length&&!st.done&&!D.cust.some(c=>c.st==='run')){st.done=true;$('#evBtn').hidden=true;stopEnd()}}
$('#evBtn').onclick=()=>{if(!D||!D.st.ev||D.st.ev.done)return;D.st.ev.done=1;D.st.ev.ok=1;D.st.pause=5;$('#evBtn').hidden=true;sfx('pop');toast('🏃 Thoát!',1400)};
/* nhân viên phụ chảo: chậm, mỗi lúc một que: lấy que (2,9–1,5 giây theo ⚡), nhúng, chờ vàng, vớt; vụng tay (🍳 thấp) thì có khi vớt muộn */
function staffTick(dt){const X=xs(),Q=queue().filter(c=>Math.abs(c.tx-c.x)<2).slice(0,4);
  D.staff.forEach(w=>{const s=w.s;if(w.st==='idle'){w.t-=dt;if(w.t>0)return;
      const busy=D.staff.filter(o=>o.st==='prep').length;if(X.fq.length+busy>=L0().fry)return;
      const claimed=i=>D.staff.filter(o=>o.st==='prep'&&o.m===i).length;let m=null;
      for(const c of Q){for(const i of c.o.bs){const need=qN(c.o,i)-xeHave(i)-xeIn(i)-claimed(i);if(need>0&&mMake(i)>0){m=i;break}}if(m!=null)break}
      if(m==null)return;w.st='prep';w.m=m;w.t=3.2-.35*s.spd}
    else if(w.st==='prep'){w.t-=dt;if(w.t>0)return;if(X.fq.length>=L0().fry||!(mMake(w.m)>0)){w.st='idle';w.t=.5;return}
      for(const k of S.menu[w.m].v)D.stock[k]--;w.f={m:w.m,v:[...S.menu[w.m].v],c:0,by:s.id};X.fq.push(w.f);w.st='fry';w.tg=1+Math.max(0,rnd(-.1,.5)*(5-s.kheo)/4);sfx('fry')}
    else if(w.st==='fry'){if(!X.fq.includes(w.f)){w.st='idle';w.t=.4;return}if(w.f.c>=w.tg){X.fq=X.fq.filter(f=>f!==w.f);X.tray.push({m:w.f.m,v:w.f.v,q:w.f.c});w.st='idle';w.t=.6}}})}
function stopEnd(){const st=D.st,l=LOCS[st.l],last=D.si>=S.route.length-1,nx=last?null:LOCS[S.route[D.si+1]];D.stops.push(st);sfx('chime');
  $('#stopCard').innerHTML=`<div class="big">${l.i} ✓</div><div class="row"><span>💰 ${fk(st.rev)}</span><span>😊 ${st.served}</span>${st.miss?`<span>😕 ${st.miss}</span>`:''}${st.angry?`<span>😤 ${st.angry}</span>`:''}</div>
    <div class="acts"><button class="btn wide" id="goNext">${last?(L0().quan?'🌙 Đóng cửa':'🏠 Về nhà'):L0().quan?`${SLOTS[D.si+1].i} ${SLOTS[D.si+1].n} →`:`${L0().i} → ${nx.i} ${nx.n}`}</button></div>`;
  $('#stopOv').hidden=false;$('#goNext').onclick=()=>{sfx('pop');nextStop()}}
/* mục tiêu: cấp kế tiếp (tổng kết và màn sáng), mua khi đủ tiền; lên quán thì chọn khu mở quán */
function goalHTML(){const nx=LV[S.lv+1];if(!nx)return'';const f=clamp(S.money/nx.price,0,1),nl=Object.keys(LOCS).filter(l=>LOCS[l].lv===S.lv+1).map(l=>LOCS[l].i).join('');
  return`<div class="goal"><img src="${img(lvSpr(S.lv+1))}" alt=""><div class="gm"><b>🎯 ${nx.n}</b><small>📋${nx.menu} 🧺${nx.bags} 🥫${nx.sauces} 🍳${nx.fry} 👥${nx.staff}${nl?' · '+nl:''}${nx.quan&&!L0().quan?' · 🏠'+fk(nx.cost)+'/ngày':''}${nx.chain?' · 🏙️':''}</small><div class="gbar"><i style="width:${(f*100).toFixed(0)}%"></i></div></div>
    <button class="btn sm" id="upBtn" ${S.money>=nx.price?'':'disabled'}>${fk(nx.price)}</button></div>`}
function lvUp(){const nx=LV[S.lv+1];if(!nx||S.money<nx.price)return;
  if(nx.quan&&!S.quan){$('#pickCard').innerHTML=`<div class="big">🏪</div><div class="picks">${locsOpen().sort((a,b)=>rep(b)-rep(a)).map(l=>`<button class="pk" data-pq="${l}"><span>${LOCS[l].i}</span><b>${LOCS[l].n}</b><small>❤️${Math.round(rep(l))}</small></button>`).join('')}</div><button class="btn ghost wide" id="pickX">✕</button>`;
    $('#pickOv').hidden=false;$('#pickX').onclick=()=>{$('#pickOv').hidden=true};return}
  S.money-=nx.price;S.lv++;S.cands=[];S.mk=S.mk&&{...S.mk,day:-1};save();hud();sfx('win');toast(`${nx.i} ${nx.n}!`,2400);achCheck();if(!$('#sum').hidden)$('#goalBox').innerHTML=goalHTML()}
$('#pickCard').addEventListener('click',e=>{const b=e.target.closest('[data-pq]');if(!b)return;S.quan=b.dataset.pq;$('#pickOv').hidden=true;lvUp()});
document.addEventListener('click',e=>{if(e.target.closest('#upBtn'))lvUp()});
function endDay(){stopLoop();$('#evBtn').hidden=true;
  const left=Object.values(D.stock).reduce((a,b)=>a+b,0)+(XS?(XS.fq.length+XS.tray.length)*QUE:0),lost=Object.keys(D.stock).reduce((a,k)=>a+D.stock[k]*ITEMS[k].c*S.mk.f[k],0);
  const wages=S.staff.reduce((a,s)=>a+s.wage,0);S.money-=wages;S.staff.forEach(s=>s.days++);
  const br=L0().chain?Math.round(S.branches.reduce((a,l)=>a+BRANCH_IN*(.8+.005*rep(l)),0)):0;S.money+=br;
  let pay=0;const net=D.rev+D.tips-D.cost-D.fuel-wages-D.fines+br;if(S.debt&&net>0){pay=Math.min(S.debt,Math.round(net*.3/1000)*1000);S.money-=pay;S.debt-=pay}
  S.stat.bestDay=Math.max(S.stat.bestDay,net);
  const avg=D.stars.length?D.stars.reduce((a,b)=>a+b,0)/D.stars.length:0,newR=S.reviews.filter(r=>r.day===S.day),badR=newR.filter(r=>r.s<=2&&!r.fought).length;
  S.hist.push({day:S.day,rev:D.rev+D.tips,cost:D.cost+D.fuel+wages,net,served:D.served,miss:D.miss,lv:S.lv});if(S.hist.length>60)S.hist.shift();achCheck();
  $('#sumBody').innerHTML=hubBar()+`<h2>🌙 Ngày ${S.day}</h2><div class="sumg">
    <div class="sbox net"><small>Lời / lỗ</small><b class="${net>=0?'dn':'up'}">${net>=0?'+':''}${fmt(net)}</b></div>
    <div class="sbox"><small>💰 Bán</small><b>${fk(D.rev)}</b>${D.tips?` <small>+ tip ${fk(D.tips)}</small>`:''}</div><div class="sbox"><small>🛒 Chợ · ${L0().quan?'🏠':'⛽'}${wages?' · 👥':''}</small><b>${fk(D.cost+D.fuel+wages)}</b></div>
    <div class="sbox"><small>😊 Khách</small><b>${D.served}</b> <small>⭐ ${avg.toFixed(1)}</small></div><div class="sbox"><small>😤 Bỏ về · 🚶 Đông quá</small><b>${D.angry} · ${D.full}</b></div>
    ${br?`<div class="sbox"><small>🏙️ Chi nhánh</small><b>+${fk(br)}</b></div>`:''}${D.fines?`<div class="sbox"><small>🚓 Phạt</small><b>−${fk(D.fines)}</b></div>`:''}${D.lostQuyt?`<div class="sbox"><small>🏃 Quỵt</small><b>−${fk(D.lostQuyt)}</b></div>`:''}</div>
    <div id="goalBox">${goalHTML()}</div>
    ${newR.length?`<button class="rvsum" data-hub="rv">⭐ ${newR.length} review${badR?` · <b>⚔️ ${badR}</b>`:''}<span>›</span></button>`:''}
    ${Object.keys(D.miss).length?`<div class="sec">😕 Khách muốn mà thực đơn không có</div><div class="mlist">${Object.entries(D.miss).sort((a,b)=>b[1]-a[1]).map(([k,n])=>`<span><img src="${img(k)}" alt="">${ITEMS[k].n} ×${n}</span>`).join('')}</div>`:''}
    ${left?`<div class="sec">🗑️ Dư ${left} viên${lost?` · −${fk(lost)}`:''}</div>`:''}${pay?`<div class="sec">🏦 Trả nợ ${fk(pay)} · còn ${fk(S.debt)}</div>`:''}`;
  S.day++;D=null;XS=null;save();show('sum');sfx('win')}
$('#nextBtn').onclick=()=>{sfx('pop');renderRoute()};

/* ===================== xe: chảo, khay vớt, sốt, giao ===================== */
/* XS trong ngày: fq que trong chảo [{m,v,c,by}], tray que đã vớt [{m,v,q}], sauce sốt đã xịt cho khách cid, spray nét xịt [{k,p}] */
let XS=null,XR=[],XD=null,XG={},XSM=[];
const xs=()=>XS||(XS={fq:[],tray:[],sauce:[],spray:[],cid:null});
const qN=(o,k)=>(o.q&&o.q[k])||0;
const xeHave=i=>xs().tray.filter(f=>f.m===i).length,xeIn=i=>xs().fq.filter(f=>f.m===i).length;
const xeCk=v=>1.5*Math.max(...v.map(k=>ITEMS[k].ck));
const xeOrd=()=>{if(!D)return null;const c=queue()[0];return c&&Math.abs(c.tx-c.x)<2?{c,o:c.o}:null};
/* chạm món: một que của món đó vào chảo; giữ ngón thì thả liên tục tới khi chảo đầy */
function xeTray(i){const X=xs(),m=S.menu[i];if(X.fq.length>=L0().fry)return toast('🍳 Chảo đầy',900),false;
  if(!(mMake(i)>0)){const c=mCount(m),k=Object.keys(c).find(k=>(D.stock[k]||0)<c[k]);return toast('Hết '+ITEMS[k].n.toLowerCase(),1100),false}
  for(const k of m.v)D.stock[k]--;X.fq.push({m:i,v:[...m.v],c:0});sfx('fry');return true}
/* chạm chảo: vớt mọi que đã vàng (ưu tiên que của mình, que nhân viên để họ tự vớt) */
function xeFry(){const X=xs(),rd=X.fq.filter(g=>g.c>=FRY_MIN&&!g.by);if(rd.length)return xeLift(rd);const sr=X.fq.filter(g=>g.c>=FRY_MIN);if(sr.length)return xeLift(sr);if(X.fq.length)toast('⏳',700)}
function xeLift(rd){const X=xs();X.fq=X.fq.filter(f=>!rd.includes(f));rd.forEach(f=>X.tray.push({m:f.m,v:f.v,q:f.c}));sfx('tick');if(rd.some(f=>f.c>FRY_OK))toast('Hơi cháy…',1000)}
function xeSauce(k,free){const t=xeOrd();if(!t)return toast('⏳',700);const X=xs();X.cid=t.c.id;
  if(!free&&X.sauce.includes(k)){X.sauce=X.sauce.filter(x=>x!==k);X.spray=X.spray.filter(s=>s.k!==k);return sfx('tick')}
  if(!((S.sauce[k]||0)>0))return toast('Hết '+SAUCES[k].n.toLowerCase(),1100);
  if(!free){const G=XG.k;if(G){const p=[],n=9,y0=G.y+G.h*(.22+.1*(X.spray.length%4));for(let i=0;i<=n;i++)p.push([G.x+6+i*(G.w-12)/n,y0+(i%2?3:-1)]);X.spray.push({k,p})}}
  if(!X.sauce.includes(k))X.sauce.push(k);sfx('pop')}
/* chọn que cho đơn: mỗi món lấy đủ số que, que chín đẹp nhất trước */
function xePick(o){const X=xs(),got=[];for(const k of o.bs){const L=X.tray.filter(f=>f.m===k).sort((a,b)=>Math.abs(a.q-1)-Math.abs(b.q-1));if(L.length<qN(o,k))return null;got.push(...L.slice(0,qN(o,k)))}return got}
function xeServe(){const t=xeOrd();if(!t)return;const {c,o}=t,X=xs(),nm=k=>(S.menu[k]?mName(S.menu[k]):(ITEMS[k]||SAUCES[k]).n).toLowerCase();
  const short=o.bs.map(k=>[k,qN(o,k)-xeHave(k)]).filter(([,n])=>n>0);
  if(short.length)return sfx('err'),toast(short.map(([k,n])=>`${n} que ${nm(k)}`).join(' · ')+(short.some(([k])=>xeIn(k))?' ⏳':''),1300);
  const sm=o.ss.filter(k=>!X.sauce.includes(k));if(sm.length)return sfx('err'),toast('🥫 '+sm.map(nm).join(', '),1200);
  const got=xePick(o);X.tray=X.tray.filter(f=>!got.includes(f));
  /* sao: chờ lâu, hơi cháy, xịt sai sốt */
  let s=5;const slow=c.p/c.max<.3,burnt=got.some(f=>f.q>FRY_OK),sauceBad=X.sauce.some(k=>!o.ss.includes(k));if(slow)s--;if(burnt)s--;if(sauceBad)s--;
  X.sauce.forEach(k=>S.sauce[k]=Math.max(0,(S.sauce[k]||0)-1));const ssUsed=[...o.ss];X.sauce=[];X.spray=[];X.cid=null;
  D.combo=s>=5?D.combo+1:0;S.stat.maxCombo=Math.max(S.stat.maxCombo,D.combo);
  const T0=TYPES[c.type];let pay=o.bs.reduce((a,i)=>a+qN(o,i)*priceM(S.menu[i]),0),tip=(s>=5&&T0.tip&&Math.random()<T0.tip*(1+perk('💰'))?r1k(pay*rnd(.1,.25)):0)+(D.combo>=3?1000*Math.min(10,D.combo):0)+(c.reg?r1k(pay*.1):0)+(c.big?r1k(pay*.2):0);
  if(D.luck&&D.luck.good&&D.luck.n>0){tip+=2000;D.luck.n--}
  let fxt='';
  if(c.type==='tay'){pay=r1k(pay*1.5);fxt='💵 '}
  if(c.type==='betthu'){const h=Math.random()<.5;pay=r1k(pay*(h?2:.5));fxt=h?'🪙 ×2 ':'🪙 ×½ '}
  if(c.type==='thayboi'){const g=Math.random()<.6;D.luck={good:g,n:g?5:3};fxt=g?'🎴 Đại cát ':'🎴 Hung '}
  /* sưu tập: album khách, que bí truyền */
  S.coll.album[c.type]=S.coll.album[c.type]||S.day;let rec=null;
  o.bs.forEach(i=>{const r=recipeOf(S.menu[i]);if(r&&!S.coll.recipe[r.id]){S.coll.recipe[r.id]=S.day;rec=r;toast(`📜 ${r.n}!`,2600);sfx('win')}});
  const f={m:o.bs[0],ss:ssUsed,burnt,slow,sauceBad,fast:c.p/c.max>.7,combo:D.combo>=3,night:D.st.sl==='toi'||D.st.sl==='khuya',rec:rec&&rec.n};
  if(c.type==='quyt'&&Math.random()<.7){c.st='run';c.tx=-30;c.owe=pay+tip;c.say='🏃 Chuồn!';c.sayT=now+1.5;D.fx.push({t:now,x:c.x,txt:'🏃 Bắt!',s:0});layoutQ();finishServe(c,s,f,0);sfx('err');return}
  if(c.type==='betthu')say(c,[fxt.includes('2')?'Ngửa! Trả gấp đôi!':'Sấp… trả nửa thôi!'],1800);else say(c,s>=5?T0.thx:s>=3?T0.meh:T0.bad,2000);
  S.money+=pay+tip;D.rev+=pay;D.tips+=tip;D.st.rev+=pay+tip;
  D.fx.push({t:now,x:c.x,txt:fxt+'+'+fk(pay+tip),s,combo:D.combo>=3?D.combo:0});
  finishServe(c,s,f,1);leave(c,s>=4?2:1);sfx('cash')}
function finishServe(c,s,f,paid){D.served++;D.st.served++;D.stars.push(s);S.stat.served++;if(s>=5)S.stat.five++;
  S.rep[D.st.l]=clamp(rep(D.st.l)+(s>=5?1:s>=4?.5:s<=2?-1:0)*(1+perk('❤️')),0,100);
  if(c.reg){c.reg.visits++;c.reg.last=S.day;if(s>=5)c.reg.love++}
  else if(paid&&s>=5&&Math.random()<.22){const R=makeRegular(c,f.m);if(R){c.reg=R;R.last=S.day;D.fx.push({t:now+.5,x:c.x,txt:'💛 '+R.nick,s:0});toast(`💛 ${regName(R)}`,2000)}}
  review(c,s,f);achCheck()}
function xeTick(dt){const X=xs(),t=xeOrd();if(X.cid!=null&&(!t||t.c.id!==X.cid)){X.sauce=[];X.spray=[];X.cid=null}
  if(!X.fq.length)return;X.fq.forEach(f=>{f.c+=dt/xeCk(f.v)});
  const b=X.fq.filter(f=>f.c>FRY_BURN);if(b.length){X.fq=X.fq.filter(f=>f.c<=FRY_BURN);sfx('err');b.forEach(f=>XSM.push({t:now,i:f.slot}));toast(`🔥 −${b.length} que`,1200)}}

/* ---- vẽ khung xe ---- */
const XEC=mk($('#xe'),160,200);let XEW=0,XEH=0;
function xeBox(R,f){XR.push({...R,f})}
const xeIn2=(R,x,y)=>R&&x>=R.x&&x<=R.x+R.w&&y>=R.y&&y<=R.y+R.h;
/* lưới khay món: cột theo số món, ô không dưới ~44px */
function menuGrid(n){const cols=n<=3?3:n<=4?4:n<=6?3:n<=8?4:n<=10?5:n<=12?4:n<=15?5:4;return{cols,rows:Math.ceil(n/cols)}}
function drawXe(){if(!XEW||!XEH||!D)return;XEC.LH=160*XEH/XEW;fit(XEC,XEW,XEH);const c=begin(XEC),W=160,H=XEC.LH,t=now,X=xs();XR=[];
  const T0=xeOrd(),o=T0&&T0.o,need={};if(o)o.bs.forEach(k=>need[k]=Math.max(0,qN(o,k)-xeHave(k)-xeIn(k)));
  const n=S.menu.length,{cols,rows}=menuGrid(n),tight=rows>2;
  RR(0,0,W,H,0,'#f4e6cc',null);for(let y=6;y<H;y+=9)LN(0,y,W,y,'rgba(31,45,77,.05)',.4);
  const fh=tight?clamp(H*.27,48,72):clamp(H*.32,56,80),hy=fh+2,hh=tight?clamp(H*.2,36,50):clamp(H*.23,42,56),sy=hy+hh+3;
  /* chảo chung, que dựng dọc */
  const F=X.fq,N=L0().fry,cx=W/2,oy=fh*.5,rx=72,ry=fh*.41;
  RR(14,oy+ry*.4,W-28,fh-oy-ry*.4-1,3,'#2f8f8a',LINE,.6);for(let i=0;i<4;i++)EL(30+i*33,fh-3.4,3.2,1,'#1f2d4d',null);
  if(F.length)for(let i=0;i<9;i++){const fx=22+i*14.5,fl=1.6+Math.sin(t*14+i*1.7)*.6;PT([[fx-1.3,fh-1.5],[fx,fh-1.5-fl],[fx+1.3,fh-1.5]],i%2?'#ffb03a':'#ff7a3c',null)}
  EL(cx,oy,rx+2.4,ry+2.2,'#6b7178',LINE,.7);RR(2,oy-2,7,4,1.6,'#3d4048',LINE,.4);RR(W-9,oy-2,7,4,1.6,'#3d4048',LINE,.4);
  EL(cx,oy+.4,rx,ry,LG(0,oy-ry,0,oy+ry,[[0,'#f6cf66'],[1,'#d8902a']]),null);
  if(F.length)for(let i=0;i<18;i++){const a=i*2.39+t*1.3,rr=.2+.75*((i*.37+t*.6)%1),z=(i*.61+t*2.2)%1;EL(cx+Math.cos(a)*rx*.9*rr,oy+Math.sin(a)*ry*.8*rr,.5+.7*z,.35+.45*z,'rgba(255,250,225,.85)',null)}
  else EL(cx-rx*.4,oy-ry*.35,rx*.22,ry*.2,'rgba(255,255,255,.35)',null);
  xeBox({x:0,y:0,w:W,h:fh},xeFry);XG.fry={x:0,y:0,w:W,h:fh};
  const sw=2*rx*.84/N,qs=Math.min(3.4,(2*ry-4)/(QUE*2.15+1.5),sw*.3),qb=oy+QUE*qs*2.15/2-qs*.6,qt=qb-QUE*qs*2.15,slot=i=>cx+(i-(N-1)/2)*sw;
  for(let i=0;i<N;i++){const x=slot(i),f=F[i];if(f)f.slot=i;
    if(!f){RR(x-.8,qt,1.6,qb-qt,.8,'rgba(150,90,30,.15)',null);continue}
    const rd=f.c>=FRY_MIN&&f.c<=FRY_OK;if(rd&&!f.by){const p=.5+.5*Math.sin(t*9);AL(.3+.3*p,()=>RR(x-sw/2+1,qt-3,sw-2,qb-qt+6,4,'#fff6c8',null))}
    xeQueV(f.v,x,qb,qs,f.c);for(let j=0;j<3;j++){const z=(t*1.7+j*.37+i*.21)%1;EL(x+qs*.9,qb-4-j*9-z*3,.6+z*.5,.4+z*.3,'rgba(255,250,225,.8)',null)}
    const ty=Math.max(3.4,qt-4),fr=Math.min(1,f.c/FRY_BURN),tr=2.8;EL(x,ty,tr+.4,tr+.4,f.by?'#cfe9db':'#fffaf5',LINE,.4);c.beginPath();c.moveTo(x,ty);c.arc(x,ty,tr,-Math.PI/2,-Math.PI/2+fr*Math.PI*2);c.closePath();
    c.fillStyle=f.c>FRY_OK?'#d9534f':f.c>=FRY_MIN?'#3f8f66':'#f0a83a';c.fill();if(f.by){const w=D.staff.find(w=>w.s.id===f.by);if(w)T(w.s.name[0],x,qb+qs*2.4,3,'#2f6a4c','center',800)}
    if(f.c>FRY_OK)for(let j=0;j<3;j++){const k=(t*.8+j/3)%1;AL(.5*(1-k),()=>EL(x+Math.sin(j*2+t*2)*3,qt-k*10,1.6+k*2,1.2+k*1.5,'#a4aab0',null))}
    xeBox({x:x-sw/2,y:0,w:sw,h:fh},xeFry)}
  XSM=XSM.filter(s=>now-s.t<1.4);XSM.forEach(s=>{const k=(now-s.t)/1.4,x=slot(s.i||0);AL(.6*(1-k),()=>EL(x,oy-k*18,4+k*5,3+k*4,'#5a5a60',null))});
  if(F.some(f=>f.c>=FRY_MIN&&f.c<=FRY_OK&&!f.by)){RR(W-27,2,24,7,3.5,'#3f8f66','#fff',.5);T('VỚT!',W-15,5.7,4,'#fff','center',800)}
  /* khay vớt: que đã chiên xếp dọc, dùng chung cho mọi khách; xịt sốt lên đây */
  const ts=Math.min(3.6,(hh-9)/(QUE*2.15+1.6)),px=2,pw=W-px-2-30;RR(px,hy,pw,hh,4,'#e9c48c',LINE,.5);RR(px+2,hy+2,pw-4,hh-4,3,'#f2d7a6',null);
  const pk=o?xePick(o)||[]:[],nq=X.tray.length,gx2=Math.min(13,(pw-8)/Math.max(1,nq)),qx=px+4+gx2/2+Math.max(0,(pw-8-gx2*nq)/2);
  X.tray.forEach((f,i)=>{const x=qx+i*gx2;if(pk.includes(f))RR(x-gx2/2+.6,hy+3,gx2-1.2,hh-6,2.5,'rgba(63,143,102,.2)',null);xeQueV(f.v,x,hy+hh-ts*1.6-2.5,ts,f.q)});
  if(!nq)T('🍢',px+pw/2,hy+hh/2,8,'rgba(31,45,77,.12)','center');
  XG.k={x:px,y:hy,w:pw,h:hh};c.save();rrPath(px+1,hy+1,pw-2,hh-2,3.5);c.clip();X.spray.forEach(s=>{const Y=SAUCES[s.k];if(!Y||s.p.length<2)return;
    if(Y.bot){s.p.forEach(([x,y],i)=>EL(x+((i*.7)%1-.5)*3,y+((i*.37)%1-.5)*3,.45,.45,Y.col,null));return}
    c.beginPath();s.p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=shade(Y.col,-.2);c.lineWidth=1.7;c.stroke();c.strokeStyle=Y.col;c.lineWidth=1.2;c.stroke();c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=.35;c.stroke()});c.restore();
  /* GIAO */
  const ok=!!(o&&o.bs.every(k=>xeHave(k)>=qN(o,k))&&o.ss.every(k=>X.sauce.includes(k)));
  const gx=W-31;if(ok){const p=.5+.5*Math.sin(t*6);AL(.25+.25*p,()=>RR(gx-1.5,hy-1.5,32,hh+3,6,'#9fd4b8',null))}RR(gx,hy,29,hh,5,ok?'#3f8f66':'#e8ddd0',ok?'#1f2d4d':LINE,.6);T('GIAO',gx+14.5,hy+hh/2,5.2,ok?'#fff':'#a8968a','center',800);
  xeBox({x:gx,y:hy,w:29,h:hh},xeServe);
  /* sốt + khay món (số que còn làm được; chạm thả một que vào chảo, giữ ngón thả liên tục) */
  const SS=D.sauces,avail=H-sy-2,sh=SS.length?(tight?clamp(avail*.25,22,30):clamp(avail*.3,26,38)):0,ty0=sy+sh+(SS.length?3:0);
  if(SS.length){const cw=Math.min(30,(W-4)/SS.length);SS.forEach((k,i)=>{const r={x:2+i*cw+(W-4-cw*SS.length)/2,y:sy,w:cw-1.5,h:sh},on=X.sauce.includes(k),nd=o&&o.ss.includes(k)&&!on,q=S.sauce[k]||0;
    RR(r.x,r.y,r.w,r.h,3,nd?'#ffe8d2':on?'#e4f4ea':'rgba(255,255,255,.5)',nd?'#ee7a1f':on?'#3f8f66':'#c9bdb5',nd||on?1.2:.5);
    if(!drawSprite(SPR[k],r.x+1,r.y+1,r.w-2,r.h-10.5,!q))RR(r.x+r.w/2-3,r.y+3,6,r.h-14,2,SAUCES[k].col,LINE,.4);
    TF(SAUCES[k].n,r.x+r.w/2,r.y+r.h-6.4,3.2,INK,r.w-2);T(String(q),r.x+r.w/2,r.y+r.h-2.6,2.9,q?'#7d7466':'#d9534f','center',800);if(on)T('✓',r.x+r.w-3.6,r.y+4,4.2,'#2f6a4c','center',800);xeBox({...r,drag:'sauce',k},()=>xeSauce(k))})}
  if(n){const cw=(W-4)/cols,ch=Math.min(cw*1.25,(H-ty0-2)/rows),ox=n<cols?(cols-n)*cw/2:0;
    S.menu.forEach((m,i)=>{const r={x:2+ox+(i%cols)*cw,y:ty0+Math.floor(i/cols)*ch,w:cw-1.5,h:ch-1.5},nd=need[i]>0,q=mMake(i);
      RR(r.x,r.y,r.w,r.h,3.4,nd?'#ffe8d2':'rgba(255,255,255,.55)',nd?'#ee7a1f':'#c9bdb5',nd?1.3:.5);
      const qs2=Math.min(r.w*.16,(r.h-13)/(QUE*2.15+1.6));AL(q?1:.4,()=>xeQueV(m.v,r.x+r.w/2,r.y+r.h-10-qs2*1.3,qs2,null));
      TF(mName(m),r.x+r.w/2,r.y+r.h-7.6,3.3,INK,r.w-2);T(q+' que',r.x+r.w/2,r.y+r.h-3.3,3,q?'#7d7466':'#d9534f','center',800);
      if(nd){RR(r.x+1.5,r.y+1.5,13,6.4,3.2,'#ee7a1f','#fff',.4);T('+'+need[i]+'🍢',r.x+8,r.y+4.8,3.6,'#fff','center',800)}xeBox({...r,hold:1},()=>xeTray(i))})}
  /* đang kéo chai sốt: chai nghiêng theo tay, vòi ở đầu ngón */
  if(XD&&XD.moved&&XD.kind==='sauce'){const Y=SAUCES[XD.k],im=SPR[XD.k];c.save();c.translate(XD.x,XD.y-2);c.rotate(Math.PI*.82);if(im&&im.width){const h=26,w=h*im.width/im.height;c.drawImage(im,-w/2,-h,w,h)}else RR(-4,-22,8,20,2,Y.col,LINE,.5);c.restore();EL(XD.x,XD.y,1.2,1.2,Y.col,null)}}
const xePt=e=>{const r=$('#xe').getBoundingClientRect();return[(e.clientX-r.left)*160/r.width,(e.clientY-r.top)*XEC.LH/r.height]};
$('#xe').addEventListener('pointerdown',e=>{if(!D||PAUSED||!$('#stopOv').hidden)return;const [x,y]=xePt(e);
  for(let i=XR.length-1;i>=0;i--){const R=XR[i];if(!xeIn2(R,x,y))continue;e.preventDefault();try{e.currentTarget.setPointerCapture(e.pointerId)}catch(_){}
    if(R.drag)XD={kind:R.drag,k:R.k,f:R.f,x0:x,y0:y,x,y,moved:false,st:null};
    else if(R.hold){R.f();XD={kind:'hold',f:R.f,nx:performance.now()+260}}
    else R.f();return}});
$('#xe').addEventListener('pointermove',e=>{if(!XD||XD.kind==='hold')return;const [x,y]=xePt(e);XD.x=x;XD.y=y;if(!XD.moved&&Math.hypot(x-XD.x0,y-XD.y0)>3)XD.moved=true;
  if(XD.kind==='sauce'&&XD.moved&&xeIn2(XG.k,x,y)){const X=xs(),t=xeOrd();if(!t)return;if(!XD.st){if(!((S.sauce[XD.k]||0)>0)){const k=XD.k;XD=null;return toast('Hết '+SAUCES[k].n.toLowerCase(),1100)}XD.st={k:XD.k,p:[]};X.spray.push(XD.st);X.cid=t.c.id}
    const L=XD.st.p[XD.st.p.length-1];if(!L||Math.hypot(x-L[0],y-L[1])>.8)XD.st.p.push([x,y]);
    let len=0;for(let i=1;i<XD.st.p.length;i++)len+=Math.hypot(XD.st.p[i][0]-XD.st.p[i-1][0],XD.st.p[i][1]-XD.st.p[i-1][1]);if(len>14&&!X.sauce.includes(XD.k))xeSauce(XD.k,true)}});
$('#xe').addEventListener('pointerup',()=>{if(!XD)return;const d=XD;XD=null;if(d.kind!=='hold'&&!d.moved)d.f()});
$('#xe').addEventListener('pointercancel',()=>{XD=null});
function holdTick(){if(!XD||XD.kind!=='hold'||PAUSED)return;const t=performance.now();if(t<XD.nx)return;XD.nx=t+110;if(XD.f()===false)XD=null}

/* ---- đơn khách đầu hàng + khách đang chờ phía sau (HTML) ---- */
function renderXord(){const el=$('#xord'),t=xeOrd(),X=xs(),Q=queue();let h;
  const mini=c=>`<span class="qn${c.reg?' reg':''}">${c.o.bs.map(i=>`<img class="qi" src="${queImg(S.menu[i].v)}" alt="">${qN(c.o,i)}`).join('')}${c.o.ss.length?`<i>🥫</i>`:''}</span>`;
  const stf=D&&D.staff.length?`<span class="sws">${D.staff.map(w=>`<span class="sw ${w.st}">${esc(w.s.name)}${w.st==='prep'?' 🍢':w.st==='fry'?' 🍳':''}</span>`).join('')}</span>`:'';
  if(!t)h=`<div class="xn">${D&&D.st&&D.st.t>=D.st.dur?'🌙':'⏳'}</div>${stf}`;
  else{const {c,o}=t,chips=o.bs.map(i=>{const q=qN(o,i),g=Math.min(xeHave(i),q),w=xeIn(i);return`<span class="xc${g>=q?' ok':w?' wip':''}"><img class="qi" src="${queImg(S.menu[i].v)}" alt="">${mName(S.menu[i])} <b>${g}/${q}</b></span>`}).join('')
      +o.ss.map(k=>`<span class="xc s${X.sauce.includes(k)?' ok':''}">🥫 ${SAUCES[k].n}</span>`).join('')+X.sauce.filter(k=>!o.ss.includes(k)).map(k=>`<span class="xc s bad">🥫 ${SAUCES[k].n}</span>`).join('');
    h=`<div class="xh">${c.reg?`<b class="rg">💛 ${esc(c.reg.nick)}</b>`:''}<i class="xp"><i></i></i><small>👥${Q.length}</small></div><div class="xcs">${chips}</div>`+(Q.length>1?`<div class="xq">${Q.slice(1).map(mini).join('')}</div>`:'')+stf}
  if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h}
  const bar=el.querySelector('.xp>i');if(bar&&t){const f=clamp(t.c.p/t.c.max,0,1);bar.style.width=(f*100).toFixed(0)+'%';bar.style.background=f>.55?'#3f8f66':f>.25?'#e0962a':'#d9534f'}}

/* ===================== cảnh đường phố ===================== */
const SC=mk($('#sc'),160,70);
const SKY={trua:['#bfe6ee','#e8f6f2'],chieu:['#f6b36a','#fbe0a8'],toi:['#1f2d4d','#3d4f7c'],khuya:['#141d36','#26345a']};
function drawBg(l,sl){const c=K.ctx,night=sl==='toi'||sl==='khuya',win=night?'#f6c24a':'#9fd0d8',bgk='bg_'+l,has=SPR[bgk]&&SPR[bgk].width;
  c.fillStyle=LG(0,0,0,48,[[0,SKY[sl][0]],[1,SKY[sl][1]]]);c.fillRect(0,0,160,48);
  if(sl==='chieu')EL(132,14,7,7,'#fff1c4',null);if(night){EL(136,10,4.5,4.5,'#fdf3df',null);for(let i=0;i<10;i++)EL((i*37)%160,(i*13)%28+2,.35,.35,'#fdf3df',null)}
  /* có hình nền vẽ tay của địa điểm (bg_<mã>, 160×60) thì dùng, không thì vẽ bằng code */
  if(has)c.drawImage(SPR[bgk],0,0,160,60);
  else if(l==='truong'){RR(-2,18,164,32,0,'#f6c24a',LINE,.6);for(let i=0;i<6;i++)RR(6+i*25,24,12,8,1,win,LINE,.4);RR(84,30,40,20,1,'#e2503c',LINE,.6);RR(88,34,32,16,1,'#5a3a2a',LINE,.4);LN(104,34,104,50,'#3a2a20',.5);
    RR(86,26,36,6,2,'#fdf3df',LINE,.5);T('TRƯỜNG',104,29.2,3.4,'#e2503c','center',800);LN(140,8,140,30,'#6b7178',.8);PT([[140,8],[150,11],[140,14]],'#e2503c',null)}
  else if(l==='cho'){RR(-2,22,164,28,0,'#e9d4ae',LINE,.6);for(let i=0;i<7;i++){const x=-4+i*24,cl=i%2?'#2f8f8a':'#e2503c';PT([[x,22],[x+22,22],[x+24,30],[x-2,30]],cl,LINE,.5);for(let j=0;j<4;j++)PT([[x+2+j*6,22],[x+5+j*6,22],[x+6+j*6,30],[x+3+j*6,30]],'#fdf3df',null);
    RR(x+3,36,16,8,2,'#c99a5e',LINE,.4);EL(x+7,36,2.5,1.6,i%3?'#3f8f66':'#f6c24a',null);EL(x+13,36,2.5,1.6,'#e2503c',null)}}
  else if(l==='congvien'){RR(-2,36,164,14,0,'#7fb069',null);for(let i=0;i<6;i++){const x=10+i*29;RR(x-1,26,2.4,18,1,'#7a5646',null);EL(x,22,9,9,i%2?'#2f8f8a':'#3f8f66',LINE,.5);EL(x-3,19,3,2.5,'rgba(255,255,255,.18)',null)}
    RR(96,40,22,3,1,'#c99a5e',LINE,.4);LN(99,43,99,47,LINE,.6);LN(115,43,115,47,LINE,.6)}
  else if(l==='vanphong'){for(let i=0;i<5;i++){const x=i*34-4,h=30+(i%2)*12;RR(x,50-h,30,h,0,i%2?'#2f8f8a':'#3d4f7c',LINE,.6);for(let r=0;r<h/7-1;r++)for(let q=0;q<3;q++)RR(x+4+q*8,54-h+r*7,5,4,.5,win,null)}}
  else if(l==='benxe'){RR(-2,26,164,24,0,'#d9c6a4',LINE,.6);RR(70,20,60,4,1,'#2f8f8a',LINE,.5);LN(74,24,74,48,LINE,.8);LN(126,24,126,48,LINE,.8);RR(96,31,52,15,3,'#e2503c',LINE,.6);for(let i=0;i<5;i++)RR(100+i*9,33,7,6,1,win,LINE,.3);EL(104,47,3,3,'#3d4048',LINE,.4);EL(140,47,3,3,'#3d4048',LINE,.4);T('BẾN XE',100,22,3.2,'#fdf3df','center',800)}
  else if(l==='chodem'){RR(-2,28,164,22,0,'#3d2f4a',LINE,.6);for(let i=0;i<8;i++){const x=i*21;RR(x+2,32,17,14,2,i%2?'#e2503c':'#2f8f8a',LINE,.5);RR(x+4,34,13,5,1,'#f6c24a',null)}}
  else if(l==='ktx'){RR(10,8,140,42,0,'#e9d4ae',LINE,.6);for(let r=0;r<5;r++)for(let q=0;q<9;q++){RR(16+q*15,12+r*8,9,5,.8,(r+q)%3===0&&night?'#f6c24a':win,LINE,.3);if((r*q)%4===1)LN(16+q*15,17+r*8,25+q*15,17+r*8,'#e2503c',.4)}}
  if(night&&l!=='congvien'&&!has){for(let i=0;i<9;i++){const x=6+i*19;LN(x,4+((i%2)?1:0),x+19,4+((i%2)?0:1),'#7a5646',.3);EL(x+9,6,1.8,2.2,i%2?'#e2503c':'#f6c24a',null)}}
  if(!has){RR(-2,48,164,12,0,'#e9dcc2',LINE,.5);for(let x=0;x<160;x+=12)LN(x,48,x,60,'rgba(31,45,77,.12)',.3)}
  RR(-2,60,164,12,0,'#5d636b',null);for(let x=4;x<160;x+=16)RR(x,65.5,8,1,.5,'#fdf3df',null);
  if(night)AL(sl==='khuya'?.26:.18,()=>RR(0,0,160,70,0,'#1f2d4d',null));
  if(S.weather==='mua')for(let i=0;i<40;i++){const x=(i*41+now*90)%170-5,y=(i*23+now*140)%70;LN(x,y,x-1.5,y+4,'rgba(200,220,255,.55)',.3)}}
function drawPerson(c){const im=SPR[c.spr],h=31,bob=c.st==='q'&&Math.abs(c.tx-c.x)<1?0:Math.abs(Math.sin(now*9+c.bob))*.8;
  if(c.reg&&c.st!=='go')AL(.3+.15*Math.sin(now*4),()=>EL(c.x,61-h*.5,8,h*.55,'#f6c24a',null));
  if(!(im&&im.width))return RR(c.x-4,61-h,8,h,3,'#9fd0d8');const w=h*im.width/im.height;drawSprite(im,c.x-w/2,61-h-bob,w,h,false,c.tx<c.x&&c.st!=='q')}
/* bong bóng ý nghĩ: hình que món khách chọn, món thèm mà xe không có (gạch chéo), hoặc 👥 đông quá */
function bubble(x,y,b){RR(x-6,y-14,12,12,4,'#fffaf0',LINE,.5);PT([[x-1.5,y-2.2],[x+1.5,y-2.2],[x,y]],'#fffaf0',null);
  if(b.full){T('👥',x,y-8,5.5,INK,'center');return}if(b.m!=null&&S.menu[b.m]){const v=S.menu[b.m].v;for(let j=0;j<5;j++)drawPiece(v[j],x,y-4.6-j*1.95,.9,ITEMS[v[j]].col);LN(x,y-3,x,y-13,'#c99a5e',.3);return}
  drawPiece(b.k,x,y-8,2.6,ITEMS[b.k].col,.3);if(b.no){LN(x-4,y-12,x+4,y-4,'#d9534f',.9)}}
/* bong bóng lời nói: tự xuống dòng (tối đa 3 dòng), không tràn khỏi cảnh */
function sayBox(x,y,t){const c=K.ctx,fs=4.2;c.font=`800 ${fs}px "Baloo 2",system-ui`;const W0=70,L=[];let cur='';t.split(' ').forEach(w=>{const n=cur?cur+' '+w:w;if(c.measureText(n).width>W0&&cur){L.push(cur);cur=w}else cur=n});L.push(cur);
  const ls=L.slice(0,3),w=Math.max(...ls.map(l=>c.measureText(l).width))+5,h=ls.length*5+2,bx=clamp(x-w/2,1,159-w),by=Math.max(h+1,y);RR(bx,by-h,w,h,3,'#fffaf0',LINE,.45);PT([[x-1.5,by-.2],[x+1.5,by-.2],[x,by+2]],'#fffaf0',null);
  ls.forEach((l,i)=>T(l,bx+w/2,by-h+3.6+i*5,fs,INK,'center'))}
/* trang trí quanh xe/quán */
function drawDecor(cx,cw,top){const has=k=>S.decor.includes(k);
  if(has('r_ke'))drawSprite(SPR.r_ke,cx+2,58,cw-4,5);
  if(has('w_dongho'))drawSprite(SPR.w_dongho,cx+cw+6,12,9,9);if(has('w_tranh'))drawSprite(SPR.w_tranh,cx+cw+17,10,11,14);if(has('w_ke'))drawSprite(SPR.w_ke,cx+cw+30,16,16,9);
  if(has('f_cay'))drawSprite(SPR.f_cay,cx-9,40,12,20);if(has('f_xuongrong'))drawSprite(SPR.f_xuongrong,cx+cw-3,49,7,11);if(has('f_don'))drawSprite(SPR.f_don,cx+cw+2,54,9,6);
  if(has('c_senda'))drawSprite(SPR.c_senda,cx+cw*.1,top-5,5,5);if(has('c_hoa'))drawSprite(SPR.c_hoa,cx+cw*.2,top-7,5,7);if(has('c_meothantai'))drawSprite(SPR.c_meothantai,cx+cw*.72,top-7,6,7);
  if(has('w_daylo'))drawSprite(SPR.w_daylo,cx+cw*.02,top-22,8,10);if(has('w_neon')){AL(.3+.2*Math.sin(now*3),()=>EL(cx+cw*.92,top-16,6,8,'#f6c24a',null));drawSprite(SPR.w_neon,cx+cw*.88,top-22,7,12)}}
function drawScene(){if(!D||!D.st)return;begin(SC);const st=D.st;drawBg(st.l,st.sl);
  const lv=L0(),sp=SPR[lvSpr(S.lv)],quan=lv.quan,h=quan?56:50,w=sp&&sp.width?h*sp.width/sp.height:50,cx=quan?2:10,top=62-h*(quan?.55:.45);
  /* chủ xe và nhân viên đứng sau quầy */
  const people=[{spr:'me_o_xanh'},...D.staff.slice(0,2).map(w=>({spr:w.s.spr,w}))];
  people.forEach((p,i)=>{const im=SPR[p.spr];if(!(im&&im.width))return;const hh=30,ww=hh*im.width/im.height,x=cx+w*(.3+i*.2);K.ctx.drawImage(im,x-ww/2,top-14,ww,hh);if(p.w&&p.w.st!=='idle')T(p.w.st==='prep'?'🍢':'🍳',x+4,top-15,4,INK,'center')});
  if(sp&&sp.width)K.ctx.drawImage(sp,cx,62-h,w,h);drawDecor(cx,w,top);
  /* trật tự đô thị chạy tới từ bên phải */
  if(st.ev&&st.ev.k==='tttd'&&st.ev.x<178){drawSprite(SPR.xecongan,st.ev.x-4,48,22,11);if(!st.ev.ok)drawSprite(SPR.congan,st.ev.x+14,31,10,30)}
  D.cust.slice().sort((a,b)=>(a.st==='q')-(b.st==='q')).forEach(drawPerson);
  queue().forEach((c,i)=>{if(Math.abs(c.tx-c.x)>1)return;const f=clamp(c.p/c.max,0,1);RR(c.x-5,26,10,2.2,1.1,'#fffaf0',LINE,.3);RR(c.x-4.6,26.4,9.2*f,1.4,.7,f>.55?'#3f8f66':f>.25?'#e0962a':'#d9534f',null);
    if(i===0)PT([[c.x-2,22],[c.x+2,22],[c.x,24.5]],'#e2503c',null)});
  D.cust.forEach(c=>{if(c.bub&&now<c.bub.t)bubble(c.x,27,c.bub);else if(c.say&&now<c.sayT)sayBox(c.x,25,c.say)});
  D.fx.forEach(f=>{if(now<f.t)return;const k=clamp((now-f.t)/1.4,0,1);AL(1-k,()=>{T(f.txt,f.x,20-k*10,5,'#3f8f66','center');if(f.s)T('★'.repeat(f.s),f.x,25-k*10,3.4,'#e0962a','center');if(f.combo)T('🔥 Combo ×'+f.combo,f.x,14-k*10,4.4,'#e2503c','center')})});
  /* giờ, nơi, tiền, tiến độ buổi */
  const L=LOCS[st.l];RR(2,2,30,8,4,'rgba(31,45,77,.78)',null);T(`${L.i} ${clock()}`,17,6.2,4.4,'#fff','center');
  RR(34,2,26,8,4,'rgba(31,45,77,.78)',null);T('💰'+fk(S.money),47,6.2,4.2,'#fff','center');
  const pr=clamp(st.t/st.dur,0,1);RR(62,4.5,40,3,1.5,'rgba(255,255,255,.6)',null);RR(62,4.5,40*pr,3,1.5,'#f6c24a',null)}
/* chạm cảnh: bắt kẻ quỵt đang chạy, vuốt mèo dưới xe */
$('#sc').addEventListener('pointerdown',e=>{if(!D||PAUSED)return;const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.left)*160/r.width,y=(e.clientY-r.top)*70/r.height;
  const run=D.cust.find(c=>c.st==='run'&&Math.abs(c.x-x)<14);if(run){run.st='go';S.money+=run.owe;D.rev+=run.owe;D.st.rev+=run.owe;S.stat.catch++;say(run,['Xin lỗi! Xin lỗi!'],1600);D.fx.push({t:now,x:run.x,txt:'+'+fk(run.owe),s:0});sfx('cash');achCheck();return}
  if(x>18&&x<48&&y>50&&!L0().quan){sfx('meow');D.fx.push({t:now,x:32,txt:'❤️',s:0})}});

/* ===================== bố cục, vòng lặp ===================== */
function layout(){const W=$('#app').clientWidth,h=Math.round(W*70/160);fit(SC,W,h);$('#sc').parentElement.style.height=h+'px'}
addEventListener('resize',()=>{if(D)layout()});
if(window.ResizeObserver){new ResizeObserver(en=>{const r=en[0].contentRect;PW=Math.round(r.width);PH=Math.round(r.height)}).observe($('#pcWrap'));
  new ResizeObserver(en=>{const r=en[0].contentRect;XEW=Math.round(r.width);XEH=Math.round(r.height);document.documentElement.style.setProperty('--tb',XEH+'px')}).observe($('#xeWrap'))}
/* ?speed=N cho test chạy nhanh */
const SPEED=clamp(+(new URLSearchParams(location.search).get('speed'))||1,1,30);
let now=0,last=0,RAF=0,lastX=0;
function frame(ts){RAF=0;if(!D)return;const sec=ts/1000,dt=Math.min(.1,Math.max(0,sec-last))*SPEED;last=sec;
  if(!PAUSED&&$('#stopOv').hidden){let r=dt;while(r>1e-6){const d=Math.min(r,.1);now+=d;tick(d);if(!D||!$('#stopOv').hidden)break;r-=d}holdTick()}
  if(!D)return;drawScene();drawXe();if(ts-lastX>120){lastX=ts;renderXord()}
  RAF=requestAnimationFrame(frame)}
function loop(){if(!RAF){last=performance.now()/1000;RAF=requestAnimationFrame(frame)}}
function stopLoop(){if(RAF)cancelAnimationFrame(RAF);RAF=0}
function pause(on){PAUSED=on;$('#pauseOv').hidden=!on;$('#sndBtn').textContent=SND?'🔊 Âm thanh':'🔇 Âm thanh';$('#musBtn').textContent=MUSON?'🎵 Nhạc':'🔕 Nhạc'}
$('#pauseBtn').onclick=()=>pause(true);$('#resumeBtn').onclick=()=>pause(false);
$('#sndBtn').onclick=()=>{SND=!SND;localStorage.setItem('cv2_snd',SND?'1':'0');pause(true)};
$('#musBtn').onclick=()=>{music(!MUSON);pause(true)};

/* ===================== bắt đầu ===================== */
hud();renderRoute();
