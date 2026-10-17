'use strict';
/* Cá Viên Chiên Bé Ba v2: xe đẩy mỗi sáng chọn lộ trình, đi chợ, bán ở 3 điểm (trưa, chiều, tối), tối về tổng kết.
   Lúc bán: chạm khay xiên viên vào que, que đủ và đúng thì tự vào chảo (hoặc kéo que vào chảo), vàng thì chạm vớt ra khay,
   kéo chai sốt xịt theo tay, GIAO. Ít chữ: hình, số, biểu tượng. */

/* ===================== tiện ích ===================== */
const $=s=>document.querySelector(s);
const rnd=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(rnd(a,b+1)),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pickW=(L,f)=>{const w=L.map(f),t=w.reduce((a,b)=>a+b,0);let r=Math.random()*t;for(let i=0;i<L.length;i++){r-=w[i];if(r<=0)return L[i]}return L[L.length-1]};
const r1k=v=>Math.max(1000,Math.round(v/1000)*1000);
const fk=v=>{const a=Math.abs(v),s=v<0?'−':'';return a>=1e6?s+(a/1e6).toFixed(a>=1e7?0:1).replace('.',',')+'tr':a>=1000?s+Math.round(a/1000)+'k':s+a+'đ'};
const fmt=v=>(v<0?'−':'')+Math.abs(Math.round(v)).toLocaleString('vi-VN')+'đ';

/* ===================== dữ liệu ===================== */
/* đồ chiên: c giá vốn mỗi viên, ck giây chiên tới vàng (trong game nhân 1,5), col màu sống */
const ITEMS={
  cavien:{n:'Cá viên',col:'#f1d9a2',c:1000,ck:3.2},
  bovien:{n:'Bò viên',col:'#9a6a4e',c:1500,ck:3.6},
  tomvien:{n:'Tôm viên',col:'#f3a88e',c:1800,ck:3},
  mucvien:{n:'Mực viên',col:'#efe4d2',c:1800,ck:3},
  xucxich:{n:'Xúc xích',col:'#d65a48',c:2500,ck:3.4},
  dauhu:{n:'Đậu hũ PM',col:'#f6e3a6',c:2000,ck:2.6},
  chaca:{n:'Chả cá',col:'#e6c08a',c:1500,ck:3.8},
  khoailang:{n:'Khoai lang',col:'#f0a64c',c:1000,ck:3},
  tomhum:{n:'Tôm hùm',col:'#e8735c',c:4000,ck:3,rare:1},
  kani:{n:'Kani',col:'#f07a5c',c:3500,ck:2.4,rare:1},
  chabusan:{n:'Busan',col:'#efd59c',c:3500,ck:3,rare:1},
  xxduc:{n:'XX Đức',col:'#b9523e',c:4000,ck:3.6,rare:1}
};
const SAUCES={
  s_tuongot:{n:'Tương ớt',col:'#d83a28',c:1500},s_tuongca:{n:'Tương cà',col:'#e2503c',c:1500},s_tuongden:{n:'Tương đen',col:'#5a2c20',c:2000},
  s_me:{n:'Sốt me',col:'#a8642c',c:2000},s_phomai:{n:'Sốt PM',col:'#f4c64a',c:2500},s_mayo:{n:'Mayo',col:'#f6edcc',c:2000},
  s_mutat:{n:'Mù tạt',col:'#e6be22',c:2000},s_sate:{n:'Sa tế',col:'#b8361e',c:2500},s_mattong:{n:'Mật ong',col:'#efae2e',c:2500},
  b_phomai:{n:'Bột PM',col:'#f6d062',c:3500,bot:1},b_ot:{n:'Bột ớt',col:'#e0522c',c:2500,bot:1},b_muoitom:{n:'Muối tôm',col:'#f08c5c',c:3000,bot:1},
  s_gochu:{n:'Gochujang',col:'#c22c2a',c:6000,rare:1},s_kewpie:{n:'Kewpie',col:'#fbf2d4',c:6500,rare:1},s_teri:{n:'Teriyaki',col:'#6a3a1e',c:6000,rare:1},s_sriracha:{n:'Sriracha',col:'#e2402a',c:6000,rare:1}
};
const BAG=20,CHAI=30,FUEL=10000;
const price=k=>Math.max(1000,Math.round(ITEMS[k].c*2.2/500)*500);
/* buổi bán: giờ trong game, mỗi buổi khoảng STOP_SEC giây thật */
const SLOTS=[{id:'trua',n:'Trưa',i:'🕚',h0:11,h1:13},{id:'chieu',n:'Chiều',i:'🕓',h0:16,h1:18},{id:'toi',n:'Tối',i:'🕖',h0:19,h1:21}];
const STOP_SEC=80;
/* kiểu khách: hình, mỗi loại gọi n viên, mấy loại, thích món nào, sốt nào, xác suất có sốt, kiên nhẫn (giây) */
const TYPES={
  hocsinh:{spr:['kt1','kt4','kt5','kt8','k_hocsinh'],n:[1,3],k:[1,2],like:{cavien:4,xucxich:4,bovien:2,tomvien:2,khoailang:2,dauhu:2},sa:{s_tuongot:4,s_tuongca:3,b_phomai:4,s_mayo:2},sp:.85,pat:22,
    say:['Cô ơi con lấy','Cho con','Bán con'],thx:['Ngon quá!','Cảm ơn cô!','Mai con ghé nữa!']},
  ba:{spr:['kt3','kt_ba','k_batam','kt7'],n:[2,5],k:[1,2],like:{cavien:3,bovien:3,chaca:4,mucvien:2,tomvien:2},sa:{s_tuongot:3,s_tuongden:3,s_me:2},sp:.7,pat:26,
    say:['Bán cô','Lấy cho bà','Cho cô'],thx:['Được đó con.','Giòn ghê!','Ngon nha con.']},
  giadinh:{spr:['kt6','kt2','kt4','kt5','k_songao'],n:[2,5],k:[1,3],like:{cavien:3,xucxich:3,dauhu:3,khoailang:3,bovien:2,tomvien:2},sa:{s_tuongca:4,s_mayo:3,s_phomai:3,s_tuongot:2},sp:.8,pat:28,
    say:['Cho mình','Lấy giùm','Bán cho'],thx:['Bé thích lắm!','Ngon ghê!','Cảm ơn nha!']},
  vanphong:{spr:['k_vanphong','k_voi','k_khotinh','kt6'],n:[3,6],k:[1,3],like:{bovien:3,tomvien:3,mucvien:3,xucxich:2,dauhu:2,chaca:2,kani:2,chabusan:2},sa:{s_sate:3,s_mayo:2,s_tuongot:3,s_phomai:2,s_kewpie:2},sp:.85,pat:21,
    say:['Lấy mình','Gói giùm','Cho mình'],thx:['Ổn áp!','Ngon, mai ghé.','Tuyệt!'],tip:.3},
  taixe:{spr:['k_xeom','k_shipper','kt2','kt7'],n:[2,4],k:[1,2],like:{bovien:4,cavien:3,chaca:2,xucxich:2},sa:{s_tuongot:4,s_sate:4},sp:.9,pat:18,
    say:['Lẹ giùm anh','Cho chú','Lấy anh'],thx:['Được!','Cay đã!','Ngon, cảm ơn!']},
  gioitre:{spr:['k_songao','k_streamer','k_reviewer','k_sigai','k_bangai'],n:[2,5],k:[1,3],like:{dauhu:3,tomvien:3,xucxich:3,mucvien:2,kani:4,tomhum:4,chabusan:3,xxduc:3},sa:{s_phomai:3,b_phomai:3,s_mayo:2,s_kewpie:3,s_gochu:3,s_sriracha:2},sp:.95,pat:24,
    say:['Cho em','Lấy em','Bán em'],thx:['Xinh xỉu!','Lên hình đẹp ghê!','Đỉnh!'],tip:.35},
  sinhvien:{spr:['kt2','kt6','k_ghino','k_reviewer'],n:[3,6],k:[1,2],like:{cavien:4,bovien:3,khoailang:3,xucxich:2},sa:{s_tuongot:4,s_tuongca:2,s_mayo:2},sp:.85,pat:22,
    say:['Cho em','Lấy em','Bán em'],thx:['No rồi!','Rẻ mà ngon!','Cảm ơn chị!']}
};
/* địa điểm: c độ đông theo buổi (0..1), mix kiểu khách, cart cấp xe mở được */
const LOCS={
  truong:{n:'Cổng trường',i:'🏫',c:{trua:.8,chieu:1,toi:.08},mix:{hocsinh:8,giadinh:2},cart:1},
  cho:{n:'Chợ',i:'🧺',c:{trua:.65,chieu:.8,toi:.15},mix:{ba:7,giadinh:2,taixe:1},cart:1},
  congvien:{n:'Công viên',i:'🌳',c:{trua:.25,chieu:.75,toi:1},mix:{giadinh:6,gioitre:2,hocsinh:2},cart:1},
  vanphong:{n:'Văn phòng',i:'🏢',c:{trua:1,chieu:.9,toi:.15},mix:{vanphong:8,taixe:1},cart:2},
  benxe:{n:'Bến xe',i:'🚌',c:{trua:.4,chieu:.55,toi:.9},mix:{taixe:6,sinhvien:2,ba:1},cart:2},
  chodem:{n:'Chợ đêm',i:'🏮',c:{trua:.05,chieu:.3,toi:1},mix:{gioitre:6,sinhvien:2},cart:3},
  ktx:{n:'Ký túc xá',i:'🏠',c:{trua:.3,chieu:.45,toi:.9},mix:{sinhvien:8,gioitre:1},cart:3}
};
const WEATHER={nang:{i:'☀️',m:1},mua:{i:'🌧️',m:.75,park:.4},nong:{i:'🔥',m:1.1}};
/* xe: số khay đồ chiên, số chai sốt mang theo, số que trong chảo */
const CARTS=[null,{n:'Xe đẩy',trays:3,sauces:2,fry:5,spr:'tiem_1'}];
const cart=()=>CARTS[S.cart]||CARTS[1];

/* ===================== hình ===================== */
const SPR={};
for(const k in window.ART||{}){const im=new Image();im.src=ART[k];SPR[k]=im}
const img=k=>(window.ART||{})[k]||'';

/* ===================== lưu ===================== */
const SAVE='cvc2';
const NEW=()=>({v:1,day:1,money:300000,cart:1,rep:{},sauce:{s_tuongot:CHAI},stat:{served:0,five:0},hist:[],mk:null,routes:null,buy:{},bring:['s_tuongot'],debt:0});
let S;try{S=JSON.parse(localStorage.getItem(SAVE))}catch(e){}if(!S||S.v!==1)S=NEW();
const save=()=>{try{localStorage.setItem(SAVE,JSON.stringify(S))}catch(e){}};
const rep=l=>S.rep[l]||0,repF=l=>.8+rep(l)*.006;

/* ===================== âm thanh ===================== */
let AC=null,SBUF={},SND=localStorage.getItem('cv2_snd')!=='0',MUSON=localStorage.getItem('cv2_mus')!=='0',MUS=null;
const SFX={bell:'bell',cash:'cash',err:'err',win:'win',meow:'meow',chime:'chime',fry:'pour'};
function audio(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();try{if(navigator.audioSession)navigator.audioSession.type='ambient'}catch(e){}
  for(const k in SFX)fetch('../sfx/'+SFX[k]+'.mp3').then(r=>r.arrayBuffer()).then(b=>AC.decodeAudioData(b)).then(b=>SBUF[k]=b).catch(()=>{})}catch(e){}}
  if(AC&&AC.state==='suspended')AC.resume();return AC}
function beep(f,d,type='sine',v=.12){const a=AC;if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+d);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+d)}
function sfx(n){if(!SND||!AC)return;try{if(SBUF[n]){const s=AC.createBufferSource(),g=AC.createGain();g.gain.value=n==='fry'?.25:.5;s.buffer=SBUF[n];s.connect(g);g.connect(AC.destination);s.start();return}
  if(n==='pop')beep(620,.08,'triangle',.14);else if(n==='tick')beep(980,.05,'square',.05);else if(n==='err')beep(180,.18,'sawtooth',.08);else if(n==='cash'){beep(1320,.08);setTimeout(()=>beep(1760,.12),70)}}catch(e){}}
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
function rrPath(x,y,w,h,r){const c=K.ctx;r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function paint(f,st,lw){const c=K.ctx;if(f){c.fillStyle=f;c.fill()}if(st){c.strokeStyle=st;c.lineWidth=lw??.6;c.stroke()}}
function RR(x,y,w,h,r,f,st=LINE,lw){rrPath(x,y,w,h,r);paint(f,st,lw)}
function EL(x,y,rx,ry,f,st=LINE,lw){const c=K.ctx;c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,Math.PI*2);paint(f,st,lw)}
function ELR(x,y,rx,ry,a,f,st=LINE,lw){const c=K.ctx;c.beginPath();c.ellipse(x,y,rx,ry,a,0,Math.PI*2);paint(f,st,lw)}
function PT(p,f,st=LINE,lw){const c=K.ctx;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();paint(f,st,lw)}
function LN(x1,y1,x2,y2,col,lw=.6){const c=K.ctx;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=col;c.lineWidth=lw;c.stroke()}
function T(t,x,y,size,col,align='left',wt=800){const c=K.ctx;c.font=`${wt} ${size}px "Baloo 2","Be Vietnam Pro",system-ui,sans-serif`;c.fillStyle=col;c.textAlign=align;c.textBaseline='middle';c.fillText(t,x,y)}
function AL(a,f){const c=K.ctx,o=c.globalAlpha;c.globalAlpha=o*a;f();c.globalAlpha=o}
function LG(x0,y0,x1,y1,st){const g=K.ctx.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>g.addColorStop(o,c));return g}
const hx=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
function mixCol(L){let r=0,g=0,b=0,t=0;L.forEach(([c,w])=>{const [R,G,B]=hx(c);r+=R*w;g+=G*w;b+=B*w;t+=w});return`rgb(${r/t|0},${g/t|0},${b/t|0})`}
function shade(c,f){if(c[0]!=='#')return c;const [r,g,b]=hx(c),m=v=>clamp(Math.round(f<0?v*(1+f):v+(255-v)*f),0,255);return`rgb(${m(r)},${m(g)},${m(b)})`}
function drawSprite(im,x,y,w,h,dim){if(!im||!im.complete||!im.width)return false;const c=K.ctx,sc=Math.min(w/im.width,h/im.height),dw=im.width*sc,dh=im.height*sc;c.save();if(dim)c.globalAlpha*=.4;c.drawImage(im,x+(w-dw)/2,y+h-dh,dw,dh);c.restore();return true}
const FRY_MIN=.85,FRY_OK=1.2,FRY_BURN=1.5;
function cookCol(k,c){const raw=ITEMS[k]?ITEMS[k].col:'#f0d9a0';if(c==null)return raw;const g=mixCol([[raw,.3],[GOLD,.7]]);
  if(c<1)return mixCol([[raw,1-c*.7+.001],[GOLD,c*.7+.001]]);if(c<FRY_BURN){const f=(c-1)/(FRY_BURN-1);return mixCol([[g,1-f+.001],[BROWN,f+.001]])}
  const f=Math.min(1,(c-FRY_BURN)/.4);return mixCol([[BROWN,1-f+.001],[BURNT,f+.001]])}
function drawPiece(k,x,y,s,col,rot=0){const st=shade(col[0]==='#'?col:'#888888',-.38),c=K.ctx,sc=col[0]==='#'?st:'rgba(0,0,0,.45)';
  if(k==='xucxich'||k==='xxduc'){c.save();c.translate(x,y);c.rotate(rot);RR(-1.5*s,-.62*s,3*s,1.24*s,.62*s,col,sc,.3);c.restore()}
  else if(k==='kani'){c.save();c.translate(x,y);c.rotate(rot);RR(-1.4*s,-.55*s,2.8*s,1.1*s,.3*s,col,sc,.3);c.restore()}
  else if(k==='dauhu'){c.save();c.translate(x,y);c.rotate(rot*.3);RR(-.95*s,-.95*s,1.9*s,1.9*s,.45*s,col,sc,.3);EL(0,0,.42*s,.36*s,'#fff3b8',null);c.restore()}
  else if(k==='chaca'||k==='chabusan')ELR(x,y,1.35*s,.82*s,rot*.4,col,sc,.3);
  else if(k==='khoailang')ELR(x,y,1.5*s,.62*s,rot*.5+.4,col,sc,.3);
  else{EL(x,y,s,s,col,sc,.3);if(k==='bovien'){EL(x+.35*s,y+.25*s,.16*s,.16*s,'rgba(60,30,20,.5)',null);EL(x-.3*s,y+.35*s,.12*s,.12*s,'rgba(60,30,20,.5)',null)}}
  EL(x-.38*s,y-.4*s,.28*s,.2*s,'rgba(255,255,255,.5)',null)}

/* ===================== chợ và lộ trình (mỗi sáng) ===================== */
function morning(){
  if(S.mk&&S.mk.day===S.day)return;
  const prev=S.mk?S.mk.f:{},f={};for(const k in ITEMS)f[k]=clamp((prev[k]||rnd(.85,1.15))*rnd(.87,1.15),.7,1.4);
  let ev=null;const r=Math.random();
  if(r<.12){ev={t:'🌀 Bão',up:['tomvien','mucvien','tomhum']};ev.up.forEach(k=>f[k]=Math.max(f[k],1.35))}
  else if(r<.22){ev={t:'🐟 Mùa cá',dn:['cavien','chaca']};ev.dn.forEach(k=>f[k]=Math.min(f[k],.72))}
  const rares=Object.keys(ITEMS).filter(k=>ITEMS[k].rare),rareS=Object.keys(SAUCES).filter(k=>SAUCES[k].rare);
  S.mk={day:S.day,f,prevF:prev,ev,rare:Math.random()<.35?pick(rares):null,rareS:Math.random()<.3?pick(rareS):null};
  const wr=Math.random();S.weather=wr<.18?'mua':wr<.3?'nong':'nang';
  S.routes=genRoutes();S.route=null;S.buy={};save()}
const bagPrice=k=>r1k(ITEMS[k].c*BAG*S.mk.f[k]);
const chaiPrice=k=>r1k(SAUCES[k].c*CHAI*.5);
const locsOpen=()=>Object.keys(LOCS).filter(l=>LOCS[l].cart<=S.cart);
/* khách dự kiến ở một điểm (khách đói ghé xe) */
function expect(l,sl){const W=WEATHER[S.weather]||WEATHER.nang;return 13*LOCS[l].c[sl]*W.m*(W.park&&l==='congvien'?W.park:1)*repF(l)}
function genRoutes(){const L=locsOpen(),sc=r=>r.reduce((a,l,i)=>a+expect(l,SLOTS[i].id),0);let all=[];
  for(let n=0;n<40;n++)all.push(SLOTS.map(()=>pick(L)));
  all=all.filter((r,i)=>all.findIndex(x=>x.join()===r.join())===i).sort((a,b)=>sc(b)-sc(a));
  const best=all[Math.min(all.length-1,ri(0,2))],other=all.filter(r=>r.join()!==best.join()&&r.some((l,i)=>l!==best[i]));
  return [best,other.length?pick(other.slice(0,Math.max(1,other.length>>1))):best].sort(()=>Math.random()-.5)}
/* nhu cầu viên mỗi loại cho lộ trình (dùng cho gợi ý và thẻ lộ trình) */
function demand(route){const d={};route.forEach((l,i)=>{const N=expect(l,SLOTS[i].id),mx=LOCS[l].mix,tw=Object.values(mx).reduce((a,b)=>a+b,0);
  for(const t in mx){const T0=TYPES[t],lw=Object.values(T0.like).reduce((a,b)=>a+b,0),per=(T0.n[0]+T0.n[1])/2*(T0.k[0]+T0.k[1])/2;
    for(const k in T0.like)if(ITEMS[k]&&(!ITEMS[k].rare||k===S.mk.rare))d[k]=(d[k]||0)+N*mx[t]/tw*T0.like[k]/lw*per}});return d}
function topLikes(l,n=3){const mx=LOCS[l].mix,s={};for(const t in mx)for(const k in TYPES[t].like)s[k]=(s[k]||0)+mx[t]*TYPES[t].like[k];return Object.keys(s).filter(k=>!ITEMS[k].rare).sort((a,b)=>s[b]-s[a]).slice(0,n)}

/* ===================== màn hình ===================== */
function show(id){['route','market','sell','sum'].forEach(s=>$('#'+s).hidden=s!==id);$('#app').classList.toggle('selling',id==='sell');$('#hud').hidden=id==='sell';hud()}
function hud(){$('#hDay').textContent='Ngày '+S.day;$('#hMoney').textContent='💰 '+fk(S.money);const L=locsOpen(),rv=Math.round(L.reduce((a,l)=>a+rep(l),0)/L.length);$('#hRep').textContent='❤️ '+rv}

/* ---- chọn lộ trình ---- */
function renderRoute(){morning();show('route');const W=WEATHER[S.weather];
  $('#routeBody').innerHTML=`<h2>${W.i} Hôm nay đi đâu?</h2>`+S.routes.map((r,ri)=>`<div class="rcard"><div class="rh"><span>${['🅰','🅱'][ri]}</span><button class="btn sm teal" data-route="${ri}">Chọn</button></div>`+
    r.map((l,i)=>{const L=LOCS[l],sl=SLOTS[i],N=expect(l,sl.id),bars=Math.round(clamp(N/3,0,5)),mx=L.mix,tops=Object.keys(mx).sort((a,b)=>mx[b]-mx[a]).slice(0,2);
      return`<div class="stop"><div class="tm"><i>${sl.i}</i>${sl.n}</div><div class="ln">${L.i} ${L.n}${rep(l)?` <small>❤️${Math.round(rep(l))}</small>`:''}</div>
      <div class="crowd"><div class="bars">${[1,2,3,4,5].map(b=>`<i class="${b<=bars?'on':''}" style="height:${6+b*3}px"></i>`).join('')}</div>👥${Math.round(N)}</div>
      <div class="lk">${tops.map(t=>`<img class="hd" src="${img(TYPES[t].spr[0])}" alt="">`).join('')}<span style="width:6px"></span>${topLikes(l).map(k=>`<img src="${img(k)}" alt="">`).join('')}</div></div>`}).join('')+'</div>').join('');}
$('#routeBody').addEventListener('click',e=>{const b=e.target.closest('[data-route]');if(!b)return;S.route=S.routes[+b.dataset.route];save();renderMarket()});

/* ---- đi chợ ---- */
function mItems(){return Object.keys(ITEMS).filter(k=>!ITEMS[k].rare||k===S.mk.rare)}
function mSauces(){return Object.keys(SAUCES).filter(k=>!SAUCES[k].rare||k===S.mk.rareS||(S.sauce[k]||0)>0)}
const buyCost=()=>Object.entries(S.buy).reduce((a,[k,n])=>a+(ITEMS[k]?bagPrice(k)*n:chaiPrice(k)*n),0);
const trayUse=()=>Object.keys(S.buy).filter(k=>ITEMS[k]&&S.buy[k]>0).length;
function renderMarket(){show('market');const cost=buyCost(),C=cart(),mk=S.mk,arrow=k=>{const p=mk.prevF[k];if(!p)return'';const d=mk.f[k]/p-1;return Math.abs(d)<.04?'':d>0?`<span class="up">↑</span>`:`<span class="dn">↓</span>`};
  const dm=demand(S.route);
  let h=`<div class="mtop"><span class="chip">${S.route.map(l=>LOCS[l].i).join(' → ')}</span><span class="chip ${trayUse()>C.trays?'warn':''}">🧺 ${trayUse()}/${C.trays}</span><span class="chip ${cost>S.money?'warn':''}">🛒 ${fk(cost)}</span>${mk.ev?`<span class="chip">${mk.ev.t}</span>`:''}</div>`;
  h+=mItems().map(k=>{const n=S.buy[k]||0;return`<div class="mrow ${n?'on':''}"><img src="${img(k)}" alt=""><div><div class="nm">${ITEMS[k].n} ${ITEMS[k].rare?'<span class="tag">✈️</span>':''}${dm[k]>BAG*.8?' 🔥':''}</div><div class="pr">${fk(bagPrice(k))}/${BAG} ${arrow(k)} · bán ${fk(price(k))}</div></div>
    <div class="step"><button data-b="${k}" data-d="-1">−</button><b>${n}</b><button data-b="${k}" data-d="1">+</button></div></div>`}).join('');
  h+=`<div class="sec">🥫 ${S.bring.length}/${C.sauces}</div>`+mSauces().map(k=>{const on=S.bring.includes(k),left=S.sauce[k]||0,n=S.buy[k]||0;return`<div class="mrow ${on?'on':''}"><img src="${img(k)}" alt=""><div><div class="nm">${SAUCES[k].n} ${SAUCES[k].rare?'<span class="tag">✈️</span>':''}</div><div class="pr">${left+n*CHAI} lần · +${fk(chaiPrice(k))}</div></div>
    <div class="step"><button data-b="${k}" data-d="1">+</button><button class="tog ${on?'on':''}" data-tog="${k}">${on?'✓':''}</button></div></div>`}).join('');
  if(S.money<80000&&!S.debt)h+=`<div style="margin-top:10px"><button class="btn sm ghost" id="loanBtn">🏦 Vay 300k</button></div>`;
  $('#mBody').innerHTML=h;$('#mGo').disabled=!trayUse()||cost>S.money||trayUse()>C.trays}
$('#mBody').addEventListener('click',e=>{const b=e.target.closest('[data-b],[data-tog],#loanBtn');if(!b)return;sfx('tick');const C=cart();
  if(b.id==='loanBtn'){S.money+=300000;S.debt=330000;toast('🏦 +300k');save();return renderMarket()}
  if(b.dataset.tog){const k=b.dataset.tog;if(S.bring.includes(k))S.bring=S.bring.filter(x=>x!==k);else{if((S.sauce[k]||0)+(S.buy[k]||0)*CHAI<=0)S.buy[k]=1;S.bring.push(k);if(S.bring.length>C.sauces)S.bring.shift()}return renderMarket()}
  const k=b.dataset.b,d=+b.dataset.d,n=(S.buy[k]||0)+d;
  if(ITEMS[k]&&d>0&&!(S.buy[k]>0)&&trayUse()>=C.trays)return toast(`🧺 ${C.trays} khay thôi`);
  if(ITEMS[k]&&n>4)return toast('🧺 Khay đầy');
  if(SAUCES[k]&&d>0&&!S.bring.includes(k)){S.bring.push(k);if(S.bring.length>C.sauces)S.bring.shift()}
  if(n<=0)delete S.buy[k];else S.buy[k]=n;renderMarket()});
/* gợi ý: 3 món khách lộ trình này thèm nhiều nhất, đủ số viên dự kiến; sốt hợp khách, mua thêm chai nếu sắp hết */
function autoBuy(){const C=cart(),dm=demand(S.route),ks=Object.keys(dm).sort((a,b)=>dm[b]-dm[a]).slice(0,C.trays);S.buy={};let budget=S.money*.92;
  /* khách thèm món không có thì một nửa lấy món khác trên xe: chia tổng viên dự kiến cho 3 món theo tỉ lệ */
  const tot=Object.values(dm).reduce((a,b)=>a+b,0),top=ks.reduce((a,k)=>a+dm[k],0),use=(top+(tot-top)*.5)*.9;
  ks.forEach(k=>{let n=clamp(Math.round(use*dm[k]/top/BAG),1,4);while(n>1&&bagPrice(k)*n>budget)n--;if(bagPrice(k)*n<=budget){S.buy[k]=n;budget-=bagPrice(k)*n}});
  const sw={};S.route.forEach(l=>{for(const t in LOCS[l].mix)for(const s in TYPES[t].sa)if(mSauces().includes(s))sw[s]=(sw[s]||0)+LOCS[l].mix[t]*TYPES[t].sa[s]});
  S.bring=Object.keys(sw).sort((a,b)=>sw[b]-sw[a]).slice(0,C.sauces);S.bring.forEach(k=>{if((S.sauce[k]||0)<15&&chaiPrice(k)<=budget){S.buy[k]=1;budget-=chaiPrice(k)}});
  sfx('pop');renderMarket()}
$('#mAuto').onclick=autoBuy;
$('#mGo').onclick=()=>{const cost=buyCost();if(cost>S.money||!trayUse())return;S.money-=cost;
  const stock={};for(const k in S.buy){if(ITEMS[k])stock[k]=S.buy[k]*BAG;else S.sauce[k]=(S.sauce[k]||0)+S.buy[k]*CHAI}
  startDay(stock,cost)};

/* ===================== ngày bán ===================== */
let D=null,PAUSED=false;
function startDay(stock,cost){
  D={stock,start:{...stock},cost,fuel:FUEL,rev:0,tips:0,served:0,stars:[],angry:0,miss:{},full:0,si:-1,cust:[],fx:[],cid:0,sauces:S.bring.filter(k=>(S.sauce[k]||0)>0),stops:[]};
  S.money-=FUEL;XS=null;show('sell');layout();nextStop()}
function nextStop(){D.si++;if(D.si>=S.route.length)return endDay();const l=S.route[D.si],sl=SLOTS[D.si];
  D.st={l,sl:sl.id,t:0,dur:STOP_SEC,next:1.2,rev:0,served:0,miss:0,angry:0,N:expect(l,sl.id),done:false};D.cust=[];
  $('#stopOv').hidden=true;PAUSED=false;toast(`${LOCS[l].i} ${LOCS[l].n} · ${sl.n}`,1600);loop()}
const clock=()=>{const st=D.st,sl=SLOTS[D.si],h=sl.h0+(sl.h1-sl.h0)*clamp(st.t/st.dur,0,1),hh=Math.floor(h),mm=Math.floor((h-hh)*6)*10;return`${hh}:${String(mm).padStart(2,'0')}`};
const queue=()=>D.cust.filter(c=>c.st==='q');
const QMAX=5;
/* khách đi ngang: mỗi người có thể đói (thèm một món) hoặc chỉ đi qua */
function spawn(){const st=D.st,mx=LOCS[st.l].mix,type=pickW(Object.keys(mx),t=>mx[t]),T0=TYPES[type],hungry=Math.random()<.62;
  const c={id:++D.cid,type,spr:pick(T0.spr),x:172,tx:-24,y:0,sp:rnd(15,20),st:'walk',hungry,dec:false,bob:Math.random()*6};
  if(hungry){const ks=Object.keys(T0.like).filter(k=>!ITEMS[k].rare||k===S.mk.rare);c.crave=pickW(ks,k=>T0.like[k])}
  D.cust.push(c)}
const has=k=>(D.stock[k]||0)>0||xeHave(k)>0;
/* khách đói tới gần xe thì quyết: có món thèm thì xếp hàng gọi, không thì 😕 đi tiếp */
function decide(c){c.dec=true;const T0=TYPES[c.type];let k=c.crave;
  if(!has(k)){const alt=Object.keys(T0.like).filter(x=>has(x));if(alt.length&&Math.random()<.5)k=pickW(alt,x=>T0.like[x]);else{D.miss[c.crave]=(D.miss[c.crave]||0)+1;D.st.miss++;c.bub={k:c.crave,no:1,t:now+1.8};return}}
  if(queue().length>=QMAX){D.full++;c.bub={k,full:1,t:now+1.6};return}
  const avail=Object.keys(T0.like).filter(x=>x!==k&&has(x)),kinds=Math.min(ri(T0.k[0],T0.k[1]),1+avail.length),bs=[k];
  while(bs.length<kinds){const x=pickW(avail.filter(a=>!bs.includes(a)),a=>T0.like[a]);if(!x)break;bs.push(x)}
  const n={};bs.forEach(x=>n[x]=Math.max(1,Math.min(ri(T0.n[0],T0.n[1]),(D.stock[x]||0)+xeHave(x))));
  const ss=[];if(D.sauces.length&&Math.random()<T0.sp){const sw=D.sauces.filter(s=>T0.sa[s]);ss.push(sw.length?pickW(sw,s=>T0.sa[s]):pick(D.sauces))}
  c.o={bs,n,ss};const tot=bs.reduce((a,x)=>a+n[x],0);c.max=c.p=T0.pat+tot*1.3;c.st='q';c.bub={k,t:now+1.2};c.say=pick(T0.say);c.sayT=now+1.6;sfx('bell');layoutQ()}
function layoutQ(){queue().forEach((c,i)=>{c.tx=70+i*12.5})}
function leave(c,mood){c.st='go';c.tx=-26;c.mood=mood;layoutQ()}
function tick(dt){const st=D.st;st.t+=dt;
  if(!st.done&&st.t<st.dur){st.next-=dt;if(st.next<=0){spawn();const walkers=st.N/.62,f=1+.6*Math.sin(Math.PI*st.t/st.dur);st.next=st.dur/walkers/f*rnd(.55,1.45)}}
  D.cust.forEach(c=>{const d=c.tx-c.x;if(Math.abs(d)>.3)c.x+=Math.sign(d)*Math.min(Math.abs(d),c.sp*dt);
    if(c.st==='walk'&&c.hungry&&!c.dec&&c.x<118&&st.t<st.dur)decide(c);
    if(c.st==='q'&&Math.abs(d)<1){c.p-=dt;if(c.p<=0){D.angry++;st.angry++;S.rep[st.l]=clamp(rep(st.l)-1.5,0,100);c.say='Lâu quá!';c.sayT=now+1.5;leave(c,0);sfx('err')}}});
  /* khách đầu hàng cần món mà xe hết hẳn thì đi */
  const f=queue()[0];if(f&&Math.abs(f.tx-f.x)<1){const lack=f.o.bs.find(k=>xN(f.o,k)>(D.stock[k]||0)+xeHave(k)+xeIn(k));if(lack){D.miss[lack]=(D.miss[lack]||0)+1;st.miss++;f.say='Hết rồi à…';f.sayT=now+1.6;leave(f,0)}}
  D.cust=D.cust.filter(c=>c.x>-24&&c.x<175||c.st==='q');
  xeTick(dt);
  D.fx=D.fx.filter(x=>now-x.t<1.2);
  if(st.t>=st.dur&&!queue().length&&!st.done){st.done=true;stopEnd()}}
function stopEnd(){const st=D.st,l=LOCS[st.l],last=D.si>=S.route.length-1,nx=last?null:LOCS[S.route[D.si+1]];D.stops.push(st);sfx('chime');
  $('#stopCard').innerHTML=`<div class="big">${l.i} ✓</div><div class="row"><span>💰 ${fk(st.rev)}</span><span>😊 ${st.served}</span>${st.miss?`<span>😕 ${st.miss}</span>`:''}${st.angry?`<span>😤 ${st.angry}</span>`:''}</div>
    <div class="acts"><button class="btn wide" id="goNext">${last?'🏠 Về nhà':`🛒 → ${nx.i} ${nx.n}`}</button></div>`;
  $('#stopOv').hidden=false;$('#goNext').onclick=()=>{sfx('pop');nextStop()}}
function endDay(){stopLoop();const left=Object.values(D.stock).reduce((a,b)=>a+b,0)+(XS?XS.hand.length+XS.fq.reduce((a,f)=>a+f.v.length,0)+XS.tray.reduce((a,f)=>a+f.v.length,0):0);
  const lost=Object.keys(D.stock).reduce((a,k)=>a+D.stock[k]*ITEMS[k].c*S.mk.f[k],0);
  let pay=0;const net=D.rev+D.tips-D.cost-D.fuel;if(S.debt&&net>0){pay=Math.min(S.debt,Math.round(net*.3/1000)*1000);S.money-=pay;S.debt-=pay}
  const avg=D.stars.length?D.stars.reduce((a,b)=>a+b,0)/D.stars.length:0;
  S.hist.push({day:S.day,rev:D.rev+D.tips,cost:D.cost+D.fuel,served:D.served,miss:D.miss});if(S.hist.length>30)S.hist.shift();
  $('#sumBody').innerHTML=`<h2>🌙 Ngày ${S.day}</h2><div class="sumg">
    <div class="sbox net"><small>Lời / lỗ</small><b class="${net>=0?'dn':'up'}">${net>=0?'+':''}${fmt(net)}</b></div>
    <div class="sbox"><small>💰 Bán</small><b>${fk(D.rev)}</b>${D.tips?` <small>+ tip ${fk(D.tips)}</small>`:''}</div><div class="sbox"><small>🛒 Chợ + ⛽</small><b>${fk(D.cost+D.fuel)}</b></div>
    <div class="sbox"><small>😊 Khách</small><b>${D.served}</b> <small>⭐ ${avg.toFixed(1)}</small></div><div class="sbox"><small>😤 Bỏ về · 🚶 Đông quá</small><b>${D.angry} · ${D.full}</b></div></div>
    ${Object.keys(D.miss).length?`<div class="sec">😕 Khách muốn mà xe không có</div><div class="mlist">${Object.entries(D.miss).sort((a,b)=>b[1]-a[1]).map(([k,n])=>`<span><img src="${img(k)}" alt="">${ITEMS[k].n} ×${n}</span>`).join('')}</div>`:''}
    ${left?`<div class="sec">🗑️ Dư ${left} viên${lost?` · −${fk(lost)}`:''}</div>`:''}${pay?`<div class="sec">🏦 Trả nợ ${fk(pay)} · còn ${fk(S.debt)}</div>`:''}`;
  S.day++;D=null;XS=null;save();show('sum');sfx('win')}
$('#nextBtn').onclick=()=>{sfx('pop');renderRoute()};

/* ===================== xe: chảo, que, khay vớt, sốt ===================== */
/* XS trong ngày: hand que đang cầm, fq que trong chảo [{v,c}], tray que đã vớt [{v,q}], sauce sốt đã xịt cho khách cid, spray nét xịt [{k,p}] */
const QUE_MAX=5;let XS=null,XR=[],XD=null,XG={},XSM=[];
const xs=()=>XS||(XS={hand:[],fq:[],tray:[],sauce:[],spray:[],cid:null});
const xN=(o,k)=>(o.n&&o.n[k])||0;
const xeHave=k=>xs().tray.reduce((a,f)=>a+f.v.filter(x=>x===k).length,0),xeIn=k=>{const X=xs();return X.fq.reduce((a,f)=>a+f.v.filter(x=>x===k).length,0)+X.hand.filter(x=>x===k).length};
const xeCk=v=>1.5*Math.max(...v.map(k=>ITEMS[k].ck));
const xeOrd=()=>{if(!D)return null;const c=queue()[0];return c&&Math.abs(c.tx-c.x)<2?{c,o:c.o}:null};
function xeTray(k){const X=xs();if(X.hand.length>=QUE_MAX)return toast('🍳 Chảo đầy',1000);if(!(D.stock[k]>0))return toast('Hết '+ITEMS[k].n.toLowerCase(),1100);
  D.stock[k]--;X.hand.push(k);sfx('pop');if((X.hand.length>=QUE_MAX||xeFits())&&X.fq.length<cart().fry)xeDip()}
/* que đủ và đúng: mọi viên trên que là phần khách đầu hàng còn thiếu, và que gom hết phần thiếu (tối đa 5) */
function xeFits(){const t=xeOrd(),X=xs();if(!t||!X.hand.length)return false;const hc={};X.hand.forEach(k=>hc[k]=(hc[k]||0)+1);let need=0,ok=true;
  t.o.bs.forEach(k=>{const r=Math.max(0,xN(t.o,k)-xeHave(k)-X.fq.reduce((a,f)=>a+f.v.filter(x=>x===k).length,0));need+=r;if((hc[k]||0)>r)ok=false});
  return ok&&Object.keys(hc).every(k=>t.o.bs.includes(k))&&X.hand.length===Math.min(QUE_MAX,need)}
function xeDip(){const X=xs();if(!X.hand.length)return;if(X.fq.length>=cart().fry)return toast('🍳 Chảo đầy',1000);X.fq.push({v:X.hand,c:0});X.hand=[];sfx('fry')}
function xeUndo(){const X=xs();if(!X.hand.length)return;D.stock[X.hand.pop()]++;sfx('tick')}
function xeFry(i){const X=xs(),f=i!=null&&X.fq[i],rd=X.fq.filter(g=>g.c>=FRY_MIN);if(f&&f.c>=FRY_MIN)return xeLift(rd);if(X.hand.length)return xeDip();if(rd.length)return xeLift(rd);if(X.fq.length)toast('⏳',700)}
function xeLift(rd){const X=xs();X.fq=X.fq.filter(f=>!rd.includes(f));rd.forEach(f=>X.tray.push({v:f.v,q:f.c}));sfx('tick');if(rd.some(f=>f.c>FRY_OK))toast('Hơi cháy…',1000)}
function xeSauce(k,free){const t=xeOrd();if(!t)return toast('⏳',700);const X=xs();X.cid=t.c.id;
  if(!free&&X.sauce.includes(k)){X.sauce=X.sauce.filter(x=>x!==k);X.spray=X.spray.filter(s=>s.k!==k);return sfx('tick')}
  if(!((S.sauce[k]||0)>0))return toast('Hết '+SAUCES[k].n.toLowerCase(),1100);
  if(!free){const G=XG.k;if(G){const p=[],n=9,y0=G.y+G.h*(.22+.1*(X.spray.length%4));for(let i=0;i<=n;i++)p.push([G.x+6+i*(G.w-12)/n,y0+(i%2?3:-1)]);X.spray.push({k,p})}}
  if(!X.sauce.includes(k))X.sauce.push(k);sfx('pop')}
/* chọn que cho đơn: que chỉ có viên khách cần trước (que dài trước), còn thiếu thì que có viên cần ít dư nhất */
function xePick(o){const X=xs(),need={};o.bs.forEach(k=>need[k]=xN(o,k));const left=()=>Object.values(need).reduce((a,n)=>a+Math.max(0,n),0),cnt=f=>{const m={};f.v.forEach(k=>m[k]=(m[k]||0)+1);return m},got=[];
  X.tray.slice().sort((a,b)=>b.v.length-a.v.length).forEach(f=>{const m=cnt(f);if(left()&&Object.keys(m).every(k=>need[k]!=null&&m[k]<=need[k])){got.push(f);Object.keys(m).forEach(k=>need[k]-=m[k])}});
  while(left()){let best=null,bs=-1e9;X.tray.forEach(f=>{if(got.includes(f))return;const m=cnt(f),u=Object.keys(m).reduce((a,k)=>a+Math.min(m[k],Math.max(0,need[k]||0)),0),sc=u*10-(f.v.length-u);if(u&&sc>bs){bs=sc;best=f}});
    if(!best)return null;got.push(best);const m=cnt(best);Object.keys(m).forEach(k=>{if(need[k]!=null)need[k]-=m[k]})}return got}
function xeServe(){const t=xeOrd();if(!t)return;const {c,o}=t,X=xs(),nm=k=>(ITEMS[k]||SAUCES[k]).n.toLowerCase();
  const short=o.bs.map(k=>[k,xN(o,k)-xeHave(k)]).filter(([,n])=>n>0);
  if(short.length)return sfx('err'),toast(short.map(([k,n])=>`${n} ${nm(k)}`).join(' · ')+(short.some(([k])=>xeIn(k))?' ⏳':''),1300);
  const sm=o.ss.filter(k=>!X.sauce.includes(k));if(sm.length)return sfx('err'),toast('🥫 '+sm.map(nm).join(', '),1200);
  const got=xePick(o);if(!got)return toast('⏳',700);X.tray=X.tray.filter(f=>!got.includes(f));
  /* sao: chờ lâu, hơi cháy, gắp dư, xịt sai sốt */
  let s=5;const ex=got.reduce((a,f)=>a+f.v.length,0)-o.bs.reduce((a,k)=>a+xN(o,k),0);
  if(c.p/c.max<.35)s--;if(got.some(f=>f.q>FRY_OK))s--;if(ex>0)s--;if(X.sauce.some(k=>!o.ss.includes(k)))s--;
  X.sauce.forEach(k=>S.sauce[k]=Math.max(0,(S.sauce[k]||0)-1));X.sauce=[];X.spray=[];X.cid=null;
  const pay=o.bs.reduce((a,k)=>a+xN(o,k)*price(k),0),T0=TYPES[c.type],tip=s>=5&&T0.tip&&Math.random()<T0.tip?r1k(pay*rnd(.1,.25)):0;
  S.money+=pay+tip;D.rev+=pay;D.tips+=tip;D.st.rev+=pay+tip;D.served++;D.st.served++;D.stars.push(s);S.stat.served++;if(s>=5)S.stat.five++;
  S.rep[D.st.l]=clamp(rep(D.st.l)+(s>=5?1:s>=4?.5:s<=2?-1:0),0,100);
  D.fx.push({t:now,x:c.x,txt:'+'+fk(pay+tip),s});c.say=s>=4?pick(T0.thx):s===3?'Cũng được.':'Hơi dở…';c.sayT=now+1.6;leave(c,s>=4?2:1);sfx('cash')}
function xeTick(dt){const X=xs(),t=xeOrd();if(X.cid!=null&&(!t||t.c.id!==X.cid)){X.sauce=[];X.spray=[];X.cid=null}
  if(!X.fq.length)return;X.fq.forEach(f=>{f.c+=dt/xeCk(f.v)});
  const b=X.fq.filter(f=>f.c>FRY_BURN);if(b.length){X.fq=X.fq.filter(f=>f.c<=FRY_BURN);sfx('err');b.forEach(f=>XSM.push({t:now,i:f.slot}));toast(`🔥 −${b.reduce((a,f)=>a+f.v.length,0)} viên`,1200)}}

/* ---- vẽ khung xe ---- */
const XEC=mk($('#xe'),160,200);let XEW=0,XEH=0;
function xeQueV(v,x,yb,s,c){const g=s*2.15;LN(x,yb+s*1.3,x,yb-g*QUE_MAX-s*.2,'#c99a5e',.9);LN(x,yb+s*1.3,x,yb-g*QUE_MAX-s*.2,'#f2d8a0',.3);v.forEach((k,j)=>drawPiece(k,x,yb-j*g,s,cookCol(k,c),j*1.3+.5))}
function xeBox(R,f){XR.push({...R,f})}
const xeIn2=(R,x,y)=>R&&x>=R.x&&x<=R.x+R.w&&y>=R.y&&y<=R.y+R.h;
function drawXe(){if(!XEW||!XEH||!D)return;XEC.LH=160*XEH/XEW;fit(XEC,XEW,XEH);const c=begin(XEC),W=160,H=XEC.LH,t=now,X=xs();XR=[];
  const T0=xeOrd(),o=T0&&T0.o,need={};if(o)o.bs.forEach(k=>need[k]=Math.max(0,xN(o,k)-xeHave(k)-xeIn(k)));
  RR(0,0,W,H,0,'#f4e6cc',null);for(let y=6;y<H;y+=9)LN(0,y,W,y,'rgba(31,45,77,.05)',.4);
  const fh=clamp(H*.32,56,80),hy=fh+2,hh=clamp(H*.23,42,56),sy=hy+hh+3;
  /* chảo chung, que dựng dọc */
  const F=X.fq,N=cart().fry,cx=W/2,oy=fh*.5,rx=72,ry=fh*.41;
  RR(14,oy+ry*.4,W-28,fh-oy-ry*.4-1,3,'#2f8f8a',LINE,.6);for(let i=0;i<4;i++)EL(30+i*33,fh-3.4,3.2,1,'#1f2d4d',null);
  if(F.length)for(let i=0;i<9;i++){const fx=22+i*14.5,fl=1.6+Math.sin(t*14+i*1.7)*.6;PT([[fx-1.3,fh-1.5],[fx,fh-1.5-fl],[fx+1.3,fh-1.5]],i%2?'#ffb03a':'#ff7a3c',null)}
  EL(cx,oy,rx+2.4,ry+2.2,'#6b7178',LINE,.7);RR(2,oy-2,7,4,1.6,'#3d4048',LINE,.4);RR(W-9,oy-2,7,4,1.6,'#3d4048',LINE,.4);
  EL(cx,oy+.4,rx,ry,LG(0,oy-ry,0,oy+ry,[[0,'#f6cf66'],[1,'#d8902a']]),null);
  if(F.length)for(let i=0;i<18;i++){const a=i*2.39+t*1.3,rr=.2+.75*((i*.37+t*.6)%1),z=(i*.61+t*2.2)%1;EL(cx+Math.cos(a)*rx*.9*rr,oy+Math.sin(a)*ry*.8*rr,.5+.7*z,.35+.45*z,'rgba(255,250,225,.85)',null)}
  else EL(cx-rx*.4,oy-ry*.35,rx*.22,ry*.2,'rgba(255,255,255,.35)',null);
  xeBox({x:0,y:0,w:W,h:fh},()=>xeFry(null));XG.fry={x:0,y:0,w:W,h:fh};
  const sw=2*rx*.84/N,qs=Math.min(3.4,(2*ry-4)/(QUE_MAX*2.15+1.5)),qb=oy+QUE_MAX*qs*2.15/2-qs*.6,qt=qb-QUE_MAX*qs*2.15,slot=i=>cx+(i-(N-1)/2)*sw;
  for(let i=0;i<N;i++){const x=slot(i),f=F[i];if(f)f.slot=i;
    if(!f){RR(x-.8,qt,1.6,qb-qt,.8,'rgba(150,90,30,.15)',null);continue}
    const rd=f.c>=FRY_MIN&&f.c<=FRY_OK;if(rd){const p=.5+.5*Math.sin(t*9);AL(.3+.3*p,()=>RR(x-sw/2+1,qt-3,sw-2,qb-qt+6,4,'#fff6c8',null))}
    xeQueV(f.v,x,qb,qs,f.c);for(let j=0;j<3;j++){const z=(t*1.7+j*.37+i*.21)%1;EL(x+qs*.9,qb-4-j*9-z*3,.6+z*.5,.4+z*.3,'rgba(255,250,225,.8)',null)}
    const ty=Math.max(3.4,qt-4),fr=Math.min(1,f.c/FRY_BURN),tr=2.8;EL(x,ty,tr+.4,tr+.4,'#fffaf5',LINE,.4);c.beginPath();c.moveTo(x,ty);c.arc(x,ty,tr,-Math.PI/2,-Math.PI/2+fr*Math.PI*2);c.closePath();
    c.fillStyle=f.c>FRY_OK?'#d9534f':f.c>=FRY_MIN?'#3f8f66':'#f0a83a';c.fill();
    if(f.c>FRY_OK)for(let j=0;j<3;j++){const k=(t*.8+j/3)%1;AL(.5*(1-k),()=>EL(x+Math.sin(j*2+t*2)*3,qt-k*10,1.6+k*2,1.2+k*1.5,'#a4aab0',null))}
    xeBox({x:x-sw/2,y:0,w:sw,h:fh},()=>xeFry(i))}
  XSM=XSM.filter(s=>now-s.t<1.4);XSM.forEach(s=>{const k=(now-s.t)/1.4,x=slot(s.i||0);AL(.6*(1-k),()=>EL(x,oy-k*18,4+k*5,3+k*4,'#5a5a60',null))});
  if(F.some(f=>f.c>=FRY_MIN&&f.c<=FRY_OK)){RR(W-27,2,24,7,3.5,'#3f8f66','#fff',.5);T('VỚT!',W-15,5.7,4,'#fff','center',800)}
  /* que đang cầm (dọc; chạm hoặc kéo vào chảo, ↩ gỡ viên cuối) */
  const hw=24,ts=Math.min(3.6,(hh-9)/(QUE_MAX*2.15+1.6));RR(2,hy,hw,hh,4,'#fffaf0',LINE,.5);if(!(XD&&XD.kind==='que'&&XD.moved))xeQueV(X.hand,2+hw/2,hy+hh-ts*1.6-2,ts,null);
  xeBox({x:2,y:hy,w:hw,h:hh,drag:'que'},xeDip);
  if(X.hand.length){RR(hw-8,hy+1.5,9,8,3,'#fde3e0',LINE,.35);T('↩',hw-3.5,hy+5.7,4.2,'#d9534f','center',800);xeBox({x:hw-10,y:hy,w:13,h:12},xeUndo)}
  /* khay vớt: que đã chiên xếp dọc, dùng chung cho mọi khách; xịt sốt lên đây */
  const px=hw+5,pw=W-px-2-30;RR(px,hy,pw,hh,4,'#e9c48c',LINE,.5);RR(px+2,hy+2,pw-4,hh-4,3,'#f2d7a6',null);
  const pk=o?xePick(o)||[]:[],nq=X.tray.length,gx2=Math.min(13,(pw-8)/Math.max(1,nq)),qx=px+4+gx2/2+Math.max(0,(pw-8-gx2*nq)/2);
  X.tray.forEach((f,i)=>{const x=qx+i*gx2;if(pk.includes(f))RR(x-gx2/2+.6,hy+3,gx2-1.2,hh-6,2.5,'rgba(63,143,102,.18)',null);xeQueV(f.v,x,hy+hh-ts*1.6-2.5,ts,f.q)});
  XG.k={x:px,y:hy,w:pw,h:hh};c.save();rrPath(px+1,hy+1,pw-2,hh-2,3.5);c.clip();X.spray.forEach(s=>{const Y=SAUCES[s.k];if(!Y||s.p.length<2)return;
    if(Y.bot){s.p.forEach(([x,y],i)=>EL(x+((i*.7)%1-.5)*3,y+((i*.37)%1-.5)*3,.45,.45,Y.col,null));return}
    c.beginPath();s.p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=shade(Y.col,-.2);c.lineWidth=1.7;c.stroke();c.strokeStyle=Y.col;c.lineWidth=1.2;c.stroke();c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=.35;c.stroke()});c.restore();
  /* GIAO */
  const ok=!!(o&&o.bs.every(k=>xeHave(k)>=xN(o,k))&&o.ss.every(k=>X.sauce.includes(k))&&xePick(o));
  const gx=W-31;if(ok){const p=.5+.5*Math.sin(t*6);AL(.25+.25*p,()=>RR(gx-1.5,hy-1.5,32,hh+3,6,'#9fd4b8',null))}RR(gx,hy,29,hh,5,ok?'#3f8f66':'#e8ddd0',ok?'#1f2d4d':LINE,.6);T('GIAO',gx+14.5,hy+hh/2,5.2,ok?'#fff':'#a8968a','center',800);
  xeBox({x:gx,y:hy,w:29,h:hh},xeServe);
  /* sốt + khay đồ chiên */
  const SS=D.sauces,TR=Object.keys(D.start),avail=H-sy-2,sh=SS.length?clamp(avail*.3,28,38):0,ty0=sy+sh+(SS.length?3:0);
  if(SS.length){const cw=Math.min(30,(W-4)/SS.length);SS.forEach((k,i)=>{const r={x:2+i*cw+(W-4-cw*SS.length)/2,y:sy,w:cw-1.5,h:sh},on=X.sauce.includes(k),nd=o&&o.ss.includes(k)&&!on,q=S.sauce[k]||0;
    RR(r.x,r.y,r.w,r.h,3,nd?'#ffe8d2':on?'#e4f4ea':'rgba(255,255,255,.5)',nd?'#ee7a1f':on?'#3f8f66':'#c9bdb5',nd||on?1.2:.5);
    if(!drawSprite(SPR[k],r.x+1,r.y+1,r.w-2,r.h-11,!q))RR(r.x+r.w/2-3,r.y+3,6,r.h-14,2,SAUCES[k].col,LINE,.4);
    T(SAUCES[k].n,r.x+r.w/2,r.y+r.h-6.6,3.1,INK,'center',800);T(String(q),r.x+r.w/2,r.y+r.h-2.8,2.9,q?'#7d7466':'#d9534f','center',800);if(on)T('✓',r.x+r.w-3.6,r.y+4,4.2,'#2f6a4c','center',800);xeBox({...r,drag:'sauce',k},()=>xeSauce(k))})}
  if(TR.length){const n=TR.length,cols=n<=3?3:n<=8?4:5,rows=Math.ceil(n/cols),cw=(W-4)/cols,ch=Math.min(cw*1.25,(H-ty0-2)/rows),ox=n<cols?(cols-n)*cw/2:0;
    TR.forEach((k,i)=>{const r={x:2+ox+(i%cols)*cw,y:ty0+Math.floor(i/cols)*ch,w:cw-1.5,h:ch-1.5},nd=need[k]>0,q=D.stock[k]||0;
      RR(r.x,r.y,r.w,r.h,3.4,nd?'#ffe8d2':'rgba(255,255,255,.55)',nd?'#ee7a1f':'#c9bdb5',nd?1.3:.5);
      if(!drawSprite(SPR[k],r.x+1,r.y+1,r.w-2,r.h-10,!q))for(let j=0;j<6;j++)drawPiece(k,r.x+r.w*.25+(j%3)*r.w*.25,r.y+r.h*.35+Math.floor(j/3)*6,3,ITEMS[k].col);
      RR(r.x+r.w/2-9,r.y+r.h-8.5,18,7,3.5,'#fffaf0',LINE,.4);T(String(q),r.x+r.w/2,r.y+r.h-5,4.2,q?INK:'#d9534f','center',800);
      if(nd){RR(r.x+1.5,r.y+1.5,10,6.4,3.2,'#ee7a1f','#fff',.4);T('+'+need[k],r.x+6.5,r.y+4.8,3.8,'#fff','center',800)}xeBox(r,()=>xeTray(k))})}
  /* đang kéo: que theo tay, chai sốt nghiêng theo tay */
  if(XD&&XD.moved){if(XD.kind==='que'){if(xeIn2(XG.fry,XD.x,XD.y))RR(1,1,W-2,fh-2,6,null,'#ee7a1f',1.2);xeQueV(X.hand,XD.x,XD.y+12,3.4,null)}
    else{const Y=SAUCES[XD.k],im=SPR[XD.k];c.save();c.translate(XD.x,XD.y-2);c.rotate(Math.PI*.82);if(im&&im.width){const h=26,w=h*im.width/im.height;c.drawImage(im,-w/2,-h,w,h)}else RR(-4,-22,8,20,2,Y.col,LINE,.5);c.restore();EL(XD.x,XD.y,1.2,1.2,Y.col,null)}}}
const xePt=e=>{const r=$('#xe').getBoundingClientRect();return[(e.clientX-r.left)*160/r.width,(e.clientY-r.top)*XEC.LH/r.height]};
$('#xe').addEventListener('pointerdown',e=>{if(!D||PAUSED||!$('#stopOv').hidden)return;const [x,y]=xePt(e);
  for(let i=XR.length-1;i>=0;i--){const R=XR[i];if(!xeIn2(R,x,y))continue;e.preventDefault();
    if(R.drag&&(R.drag==='sauce'||xs().hand.length)){XD={kind:R.drag,k:R.k,f:R.f,x0:x,y0:y,x,y,moved:false,st:null};try{e.currentTarget.setPointerCapture(e.pointerId)}catch(_){}}else R.f();return}});
$('#xe').addEventListener('pointermove',e=>{if(!XD)return;const [x,y]=xePt(e);XD.x=x;XD.y=y;if(!XD.moved&&Math.hypot(x-XD.x0,y-XD.y0)>3)XD.moved=true;
  if(XD.kind==='sauce'&&XD.moved&&xeIn2(XG.k,x,y)){const X=xs(),t=xeOrd();if(!t)return;if(!XD.st){if(!((S.sauce[XD.k]||0)>0)){const k=XD.k;XD=null;return toast('Hết '+SAUCES[k].n.toLowerCase(),1100)}XD.st={k:XD.k,p:[]};X.spray.push(XD.st);X.cid=t.c.id}
    const L=XD.st.p[XD.st.p.length-1];if(!L||Math.hypot(x-L[0],y-L[1])>.8)XD.st.p.push([x,y]);
    let len=0;for(let i=1;i<XD.st.p.length;i++)len+=Math.hypot(XD.st.p[i][0]-XD.st.p[i-1][0],XD.st.p[i][1]-XD.st.p[i-1][1]);if(len>14&&!X.sauce.includes(XD.k))xeSauce(XD.k,true)}});
$('#xe').addEventListener('pointerup',()=>{if(!XD)return;const d=XD;XD=null;if(!d.moved)return d.f();if(d.kind==='que'&&xeIn2(XG.fry,d.x,d.y))xeDip()});
$('#xe').addEventListener('pointercancel',()=>{XD=null});

/* ---- đơn khách đầu hàng (HTML) ---- */
function renderXord(){const el=$('#xord'),t=xeOrd(),X=xs();let h;
  if(!t)h=`<div class="xn">${D&&D.st&&D.st.t>=D.st.dur?'🌙':'⏳'}</div>`;
  else{const {c,o}=t,chips=o.bs.map(k=>{const q=xN(o,k),g=Math.min(xeHave(k),q),w=xeIn(k);return`<span class="xc${g>=q?' ok':w?' wip':''}"><img src="${img(k)}" alt="">${ITEMS[k].n} <b>${g}/${q}</b></span>`}).join('')
      +o.ss.map(k=>`<span class="xc s${X.sauce.includes(k)?' ok':''}">🥫 ${SAUCES[k].n}</span>`).join('')+X.sauce.filter(k=>!o.ss.includes(k)).map(k=>`<span class="xc s bad">🥫 ${SAUCES[k].n}</span>`).join('');
    h=`<div class="xh"><b>${c.say||''}</b><i class="xp"><i></i></i><small>👥${queue().length}</small></div><div class="xcs">${chips}</div>`}
  if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h}
  const bar=el.querySelector('.xp>i');if(bar&&t){const f=clamp(t.c.p/t.c.max,0,1);bar.style.width=(f*100).toFixed(0)+'%';bar.style.background=f>.55?'#3f8f66':f>.25?'#e0962a':'#d9534f'}}

/* ===================== cảnh đường phố ===================== */
const SC=mk($('#sc'),160,70);
const SKY={trua:['#bfe6ee','#e8f6f2'],chieu:['#f6b36a','#fbe0a8'],toi:['#1f2d4d','#3d4f7c']};
function drawBg(l,sl){const c=K.ctx,night=sl==='toi',win=night?'#f6c24a':'#9fd0d8';
  c.fillStyle=LG(0,0,0,48,[[0,SKY[sl][0]],[1,SKY[sl][1]]]);c.fillRect(0,0,160,48);
  if(sl==='chieu')EL(132,14,7,7,'#fff1c4',null);if(night){EL(136,10,4.5,4.5,'#fdf3df',null);for(let i=0;i<10;i++)EL((i*37)%160,(i*13)%28+2,.35,.35,'#fdf3df',null)}
  if(l==='truong'){RR(-2,18,164,32,0,'#f6c24a',LINE,.6);for(let i=0;i<6;i++)RR(6+i*25,24,12,8,1,win,LINE,.4);RR(84,30,40,20,1,'#e2503c',LINE,.6);RR(88,34,32,16,1,'#5a3a2a',LINE,.4);LN(104,34,104,50,'#3a2a20',.5);
    RR(86,26,36,6,2,'#fdf3df',LINE,.5);T('TRƯỜNG',104,29.2,3.4,'#e2503c','center',800);LN(140,8,140,30,'#6b7178',.8);PT([[140,8],[150,11],[140,14]],'#e2503c',null)}
  else if(l==='cho'){RR(-2,22,164,28,0,'#e9d4ae',LINE,.6);for(let i=0;i<7;i++){const x=-4+i*24,cl=i%2?'#2f8f8a':'#e2503c';PT([[x,22],[x+22,22],[x+24,30],[x-2,30]],cl,LINE,.5);for(let j=0;j<4;j++)PT([[x+2+j*6,22],[x+5+j*6,22],[x+6+j*6,30],[x+3+j*6,30]],'#fdf3df',null);
    RR(x+3,36,16,8,2,'#c99a5e',LINE,.4);EL(x+7,36,2.5,1.6,i%3?'#3f8f66':'#f6c24a',null);EL(x+13,36,2.5,1.6,'#e2503c',null)}}
  else if(l==='congvien'){RR(-2,36,164,14,0,'#7fb069',null);for(let i=0;i<6;i++){const x=10+i*29;RR(x-1,26,2.4,18,1,'#7a5646',null);EL(x,22,9,9,i%2?'#2f8f8a':'#3f8f66',LINE,.5);EL(x-3,19,3,2.5,'rgba(255,255,255,.18)',null)}
    RR(96,40,22,3,1,'#c99a5e',LINE,.4);LN(99,43,99,47,LINE,.6);LN(115,43,115,47,LINE,.6)}
  else if(l==='vanphong'){for(let i=0;i<5;i++){const x=i*34-4,h=30+(i%2)*12;RR(x,50-h,30,h,0,i%2?'#2f8f8a':'#3d4f7c',LINE,.6);for(let r=0;r<h/7-1;r++)for(let q=0;q<3;q++)RR(x+4+q*8,54-h+r*7,5,4,.5,win,null)}}
  else{RR(-2,24,164,26,0,'#d9c6a4',LINE,.6);for(let i=0;i<8;i++)RR(4+i*20,28,10,7,1,win,LINE,.4)}
  if(night&&l!=='congvien'){for(let i=0;i<9;i++){const x=6+i*19;LN(x,4+((i%2)?1:0),x+19,4+((i%2)?0:1),'#7a5646',.3);EL(x+9,6,1.8,2.2,i%2?'#e2503c':'#f6c24a',null)}}
  RR(-2,48,164,12,0,'#e9dcc2',LINE,.5);for(let x=0;x<160;x+=12)LN(x,48,x,60,'rgba(31,45,77,.12)',.3);RR(-2,60,164,12,0,'#5d636b',null);for(let x=4;x<160;x+=16)RR(x,65.5,8,1,.5,'#fdf3df',null);
  if(night)AL(.18,()=>RR(0,0,160,70,0,'#1f2d4d',null));
  if(S.weather==='mua')for(let i=0;i<40;i++){const x=(i*41+now*90)%170-5,y=(i*23+now*140)%70;LN(x,y,x-1.5,y+4,'rgba(200,220,255,.55)',.3)}}
function drawPerson(c){const im=SPR[c.spr],h=31,bob=c.st==='q'&&Math.abs(c.tx-c.x)<1?0:Math.abs(Math.sin(now*9+c.bob))*.8;
  if(im&&im.width){const w=h*im.width/im.height,ctx=K.ctx;ctx.save();if(c.tx<c.x&&c.st!=='q'){ctx.translate(c.x,0);ctx.scale(-1,1);ctx.translate(-c.x,0)}ctx.drawImage(im,c.x-w/2,61-h-bob,w,h);ctx.restore()}
  else RR(c.x-4,61-h,8,h,3,'#9fd0d8')}
function bubble(x,y,k,no,full){RR(x-6,y-12,12,10,4,'#fffaf0',LINE,.5);PT([[x-1.5,y-2.2],[x+1.5,y-2.2],[x,y]],'#fffaf0',null);
  if(full){T('👥',x,y-7,5.5,INK,'center');return}drawPiece(k,x,y-7,2.6,ITEMS[k].col,.3);if(no){LN(x-4,y-11,x+4,y-3,'#d9534f',.9)}}
function sayBox(x,y,t){const c=K.ctx;c.font='800 4.4px "Baloo 2",system-ui';const w=Math.min(60,c.measureText(t).width+5);RR(x-w/2,y-7,w,7,3.5,'#fffaf0',LINE,.4);T(t,x,y-3.4,4.4,INK,'center')}
function drawScene(){if(!D||!D.st)return;begin(SC);const st=D.st;drawBg(st.l,st.sl);
  const cs=D.cust.slice().sort((a,b)=>(a.st==='q')-(b.st==='q'));
  /* chủ xe đứng sau xe, xe ở bên trái */
  const me=SPR.me_o_xanh;if(me&&me.width){const h=30,w=h*me.width/me.height;K.ctx.drawImage(me,44-w/2,21,w,h)}
  const cv=SPR[cart().spr];if(cv&&cv.width){const h=50,w=h*cv.width/cv.height;K.ctx.drawImage(cv,4,62-h,w,h)}
  cs.forEach(drawPerson);
  const q=queue();q.forEach((c,i)=>{if(Math.abs(c.tx-c.x)>1)return;const f=clamp(c.p/c.max,0,1);RR(c.x-5,26,10,2.2,1.1,'#fffaf0',LINE,.3);RR(c.x-4.6,26.4,9.2*f,1.4,.7,f>.55?'#3f8f66':f>.25?'#e0962a':'#d9534f',null);
    if(i===0)PT([[c.x-2,22],[c.x+2,22],[c.x,24.5]],'#e2503c',null)});
  D.cust.forEach(c=>{if(c.bub&&now<c.bub.t)bubble(c.x,27,c.bub.k,c.bub.no,c.bub.full);else if(c.say&&now<c.sayT)sayBox(c.x,26,c.say)});
  D.fx.forEach(f=>{const k=(now-f.t)/1.2;AL(1-k,()=>{T(f.txt,f.x,20-k*10,5,'#3f8f66','center');if(f.s)T('★'.repeat(f.s),f.x,25-k*10,3.4,'#e0962a','center')})});
  /* giờ, nơi, tiền */
  const L=LOCS[st.l],txt=`${L.i} ${clock()}`;RR(2,2,30,8,4,'rgba(31,45,77,.78)',null);T(txt,17,6.2,4.4,'#fff','center');
  RR(34,2,26,8,4,'rgba(31,45,77,.78)',null);T('💰'+fk(S.money),47,6.2,4.2,'#fff','center');
  const pr=clamp(st.t/st.dur,0,1);RR(62,4.5,40,3,1.5,'rgba(255,255,255,.6)',null);RR(62,4.5,40*pr,3,1.5,'#f6c24a',null)}
$('#sc').addEventListener('pointerdown',e=>{if(!D)return;const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.left)*160/r.width,y=(e.clientY-r.top)*70/r.height;
  if(x>8&&x<30&&y>50){sfx('meow');D.fx.push({t:now,x:20,txt:'❤️'})}});

/* ===================== bố cục, vòng lặp ===================== */
function layout(){const W=$('#app').clientWidth,h=Math.round(W*70/160);fit(SC,W,h);$('#sc').parentElement.style.height=h+'px'}
addEventListener('resize',()=>{if(D)layout()});
if(window.ResizeObserver)new ResizeObserver(en=>{const r=en[0].contentRect;XEW=Math.round(r.width);XEH=Math.round(r.height);document.documentElement.style.setProperty('--tb',XEH+'px')}).observe($('#xeWrap'));
/* ?speed=N cho test chạy nhanh */
const SPEED=clamp(+(new URLSearchParams(location.search).get('speed'))||1,1,20);
let now=0,last=0,RAF=0,lastX=0;
function frame(ts){RAF=0;if(!D)return;const sec=ts/1000,dt=Math.min(.1,Math.max(0,sec-last))*SPEED;last=sec;
  if(!PAUSED&&$('#stopOv').hidden){now+=dt;tick(dt)}if(!D)return;
  drawScene();drawXe();if(ts-lastX>120){lastX=ts;renderXord()}
  RAF=requestAnimationFrame(frame)}
function loop(){if(!RAF){last=performance.now()/1000;RAF=requestAnimationFrame(frame)}}
function stopLoop(){if(RAF)cancelAnimationFrame(RAF);RAF=0}
/* tạm dừng */
function pause(on){PAUSED=on;$('#pauseOv').hidden=!on;$('#sndBtn').textContent=SND?'🔊 Âm thanh':'🔇 Âm thanh';$('#musBtn').textContent=MUSON?'🎵 Nhạc':'🔕 Nhạc'}
$('#pauseBtn').onclick=()=>pause(true);$('#resumeBtn').onclick=()=>pause(false);
$('#sndBtn').onclick=()=>{SND=!SND;localStorage.setItem('cv2_snd',SND?'1':'0');pause(true)};
$('#musBtn').onclick=()=>{music(!MUSON);pause(true)};

/* ===================== bắt đầu ===================== */
hud();renderRoute();
