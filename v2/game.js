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
const BAG=20,CHAI=30;
/* buổi bán: giờ trong game, mỗi buổi khoảng STOP_SEC giây thật */
const SLOTS=[{id:'trua',n:'Trưa',i:'🕚',h0:11,h1:13},{id:'chieu',n:'Chiều',i:'🕓',h0:16,h1:18},{id:'toi',n:'Tối',i:'🕖',h0:19,h1:21}];
const STOP_SEC=80;
/* kiểu khách: hình, gọi mấy que mỗi loại (q), mấy loại (k), thích món nào, sốt nào, xác suất có sốt, kiên nhẫn (giây);
   câu nói: hi (mở lời gọi món), wait (lúc chờ), thx (5★), meh (3–4★), bad (1–2★), miss (xe không có món thèm, {k}), quit (bỏ về) */
const TYPES={
  hocsinh:{spr:['kt1','kt4','kt5','kt8','k_hocsinh'],q:[1,2],k:[1,2],like:{cavien:4,xucxich:4,bovien:2,tomvien:2,khoailang:2,dauhu:2},sa:{s_tuongot:4,s_tuongca:3,b_phomai:4,s_mayo:2},sp:.85,pat:32,
    hi:['Cô ơi cho con','Bán con','Cô ơi lấy con'],wait:['Lẹ lẹ cô ơi, con trốn học thêm!','Mẹ con sắp tới đón rồi…','Thơm quá trời luôn!','Con đói xỉu luôn á…','Hôm nay con được 10 điểm nè cô!'],
    thx:['Ngon xỉu!','Mai con dẫn cả lớp ra!','Giòn rụm luôn cô!','Cô bán là nhất!'],meh:['Cũng được ạ.','Hơi nguội xíu…'],bad:['Con méc mẹ á!','Huhu cháy rồi…'],
    miss:['Không có {k} hả cô? Con đi ăn bánh tráng…','Tiếc ghê, con thèm {k}…'],quit:['Trễ giờ học rồi, con đi!','Thôi con về, mẹ la!']},
  ba:{spr:['kt3','kt_ba','k_batam','kt7'],q:[1,2],k:[1,2],like:{cavien:3,bovien:3,chaca:4,mucvien:2,tomvien:2},sa:{s_tuongot:3,s_tuongden:3,s_me:2},sp:.7,pat:38,
    hi:['Bán cô','Con ơi lấy bà','Cho cô'],wait:['Từ từ thôi con, cô kể chuyện nè…','Con dâu nhà bên mới mua xe hơi đó!','Rau hôm nay mắc quá trời!','Hồi xưa cá viên có 500 đồng thôi con.'],
    thx:['Ngon nha con, cô giới thiệu cả xóm!','Giòn như hồi xưa!','Được, mai cô ghé.'],meh:['Cũng tạm con.'],bad:['Trời đất, cháy rồi con ơi!'],
    miss:['Không có {k} hả? Thôi cô đi chợ tiếp.','Có {k} là cô mua chục que!'],quit:['Cô còn nấu cơm, thôi về!']},
  giadinh:{mixLike:1,spr:['kt6','kt2','kt4','kt5','k_songao'],q:[1,2],k:[1,3],like:{cavien:3,xucxich:3,dauhu:3,khoailang:3,bovien:2,tomvien:2},sa:{s_tuongca:4,s_mayo:3,s_phomai:3,s_tuongot:2},sp:.8,pat:38,
    hi:['Cho mình','Lấy giùm chị','Bán anh'],wait:['Bé ơi đợi xíu nha!','Bé nhà mình ghiền cá viên lắm.','Ăn xong rồi về ăn cơm nha con!'],
    thx:['Bé thích lắm nè!','Cả nhà khen ngon!','Cuối tuần ghé nữa nha!'],meh:['Cũng được.'],bad:['Bé chê rồi…'],
    miss:['Bé đòi {k} mà không có… thôi về!'],quit:['Bé khóc rồi, thôi về!']},
  vanphong:{spr:['k_vanphong','k_voi','k_khotinh','kt6'],q:[1,3],k:[1,2],like:{bovien:3,tomvien:3,mucvien:3,xucxich:2,dauhu:2,chaca:2,kani:2,chabusan:2},sa:{s_sate:3,s_mayo:2,s_tuongot:3,s_phomai:2,s_kewpie:2},sp:.85,pat:32,
    hi:['Cho chị','Lấy anh','Gói giùm anh'],wait:['Sếp gọi rồi, lẹ giùm anh!','Deadline dí sau lưng nè…','Tăng ca mà có cá viên là vui.'],
    thx:['Ổn áp! Mai mua cho cả phòng.','Ngon hơn cơm văn phòng!','Xả stress là đây!'],meh:['Tạm được.'],bad:['Thôi, mai ăn cơm hộp.'],
    miss:['Không có {k}? Chán vậy…'],quit:['Họp rồi, thôi đi!'],tip:.3},
  taixe:{spr:['k_xeom','k_shipper','kt2','kt7'],q:[1,2],k:[1,2],like:{bovien:4,cavien:3,chaca:2,xucxich:2},sa:{s_tuongot:4,s_sate:4},sp:.9,pat:28,
    hi:['Lấy anh','Cho chú','Lẹ giùm anh'],wait:['Đang có cuốc, lẹ giùm!','App báo đơn kìa…','Đói lả rồi nè.'],
    thx:['Được! Cay đã!','Ngon, chạy tiếp!','Mai anh ghé.'],meh:['Ừ được.'],bad:['Khét lẹt vậy em!'],
    miss:['Không có {k} thì thôi, chạy tiếp!'],quit:['Có khách rồi, đi đây!']},
  gioitre:{mixLike:1,spr:['k_songao','k_streamer','k_reviewer','k_sigai','k_bangai'],q:[1,2],k:[1,3],like:{dauhu:3,tomvien:3,xucxich:3,mucvien:2,kani:4,tomhum:4,chabusan:3,xxduc:3},sa:{s_phomai:3,b_phomai:3,s_mayo:2,s_kewpie:3,s_gochu:3,s_sriracha:2},sp:.95,pat:34,
    hi:['Cho em','Chị ơi lấy em','Bán em'],wait:['Xếp đẹp đẹp em chụp hình nha!','Đợi em check-in cái…','Story nay có cá viên rồi!'],
    thx:['Lên hình đẹp xỉu!','Đỉnh nóc kịch trần!','5 sao cho chị!'],meh:['Cũng ổn.'],bad:['Hông lên hình nổi…'],
    miss:['Không có {k}? Hông trendy gì hết trơn.'],quit:['Đi quán khác check-in vậy…'],tip:.35},
  sinhvien:{spr:['kt2','kt6','k_ghino','k_reviewer'],q:[1,2],k:[1,2],like:{cavien:4,bovien:3,khoailang:3,xucxich:2},sa:{s_tuongot:4,s_tuongca:2,s_mayo:2},sp:.85,pat:32,
    hi:['Cho em','Chị ơi lấy em','Bán em'],wait:['Cuối tháng rồi chị ơi…','Ăn xong học bài, hứa!','Bạn cùng phòng nhờ mua thêm nè.'],
    thx:['Rẻ mà no!','Cứu đói sinh viên!','Chị là ân nhân!'],meh:['Cũng no.'],bad:['Thôi ăn mì gói…'],
    miss:['Không có {k}? Thôi ăn mì gói…'],quit:['Trễ giờ điểm danh rồi!']}
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
/* xe: số món thực đơn, số bịch chở được, số chai sốt mang theo, số que trong chảo, xăng mỗi ngày, giá mua; xe lớn mở thêm địa điểm (LOCS.cart) */
const CARTS=[null,{n:'Xe đẩy',i:'🛒',menu:6,bags:10,sauces:2,fry:5,fuel:10000,spr:'tiem_1'},
  {n:'Ki-ốt lưu động',i:'🛺',menu:8,bags:16,sauces:3,fry:6,fuel:20000,price:2500000,spr:'tiem_2'},
  {n:'Xe máy kéo',i:'🛵',menu:10,bags:24,sauces:4,fry:7,fuel:35000,price:8000000,spr:'tiem_2'}];
const cart=()=>CARTS[S.cart]||CARTS[1];

/* ===================== hình ===================== */
const SPR={};
for(const k in window.ART||{}){const im=new Image();im.src=ART[k];SPR[k]=im}
const img=k=>(window.ART||{})[k]||'';

/* ===================== lưu ===================== */
const SAVE='cvc2';
const NEW=()=>({v:1,day:1,money:300000,cart:1,rep:{},sauce:{s_tuongot:CHAI},stat:{served:0,five:0},hist:[],mk:null,routes:null,buy:{},bring:['s_tuongot'],debt:0});
let S;try{S=JSON.parse(localStorage.getItem(SAVE))}catch(e){}if(!S||S.v!==1)S=NEW();
if(!S.menu)S.menu=[{v:Array(5).fill('cavien')},{v:Array(5).fill('bovien')},{v:['cavien','cavien','bovien','bovien','cavien']}];
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
const FRY_MIN=.85,FRY_OK=1.35,FRY_BURN=1.85;
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
function expect(l,sl){const W=WEATHER[S.weather]||WEATHER.nang;return 15*LOCS[l].c[sl]*W.m*(W.park&&l==='congvien'?W.park:1)*repF(l)}
function genRoutes(){const L=locsOpen(),sc=r=>r.reduce((a,l,i)=>a+expect(l,SLOTS[i].id),0);let all=[];
  for(let n=0;n<40;n++)all.push(SLOTS.map(()=>pick(L)));
  all=all.filter((r,i)=>all.findIndex(x=>x.join()===r.join())===i).sort((a,b)=>sc(b)-sc(a));
  const best=all[Math.min(all.length-1,ri(0,2))],other=all.filter(r=>r.join()!==best.join()&&r.some((l,i)=>l!==best[i]));
  return [best,other.length?pick(other.slice(0,Math.max(1,other.length>>1))):best].sort(()=>Math.random()-.5)}
function topLikes(l,n=3){const mx=LOCS[l].mix,s={};for(const t in mx)for(const k in TYPES[t].like)s[k]=(s[k]||0)+mx[t]*TYPES[t].like[k];return Object.keys(s).filter(k=>!ITEMS[k].rare).sort((a,b)=>s[b]-s[a]).slice(0,n)}

/* ===================== màn hình ===================== */
function show(id){['route','menu','market','sell','sum'].forEach(s=>$('#'+s).hidden=s!==id);$('#app').classList.toggle('selling',id==='sell');$('#hud').hidden=id==='sell';hud()}
function hud(){$('#hDay').textContent='Ngày '+S.day;$('#hMoney').textContent='💰 '+fk(S.money);const L=locsOpen(),rv=Math.round(L.reduce((a,l)=>a+rep(l),0)/L.length);$('#hRep').textContent='❤️ '+rv}

/* ---- chọn lộ trình ---- */
function renderRoute(){morning();show('route');const W=WEATHER[S.weather];
  const nx=CARTS[S.cart+1];
  $('#routeBody').innerHTML=`<h2>${W.i} Hôm nay đi đâu?</h2>${nx?`<div class="mtop"><span class="chip">🎯 ${nx.i} ${nx.n} · ${fk(S.money)}/${fk(nx.price)}</span></div>`:''}`+S.routes.map((r,ri)=>`<div class="rcard"><div class="rh"><span>${['🅰','🅱'][ri]}</span><button class="btn sm teal" data-route="${ri}">Chọn</button></div>`+
    r.map((l,i)=>{const L=LOCS[l],sl=SLOTS[i],N=expect(l,sl.id),bars=Math.round(clamp(N/3,0,5)),mx=L.mix,tops=Object.keys(mx).sort((a,b)=>mx[b]-mx[a]).slice(0,2);
      return`<div class="stop"><div class="tm"><i>${sl.i}</i>${sl.n}</div><div class="ln">${L.i} ${L.n}${rep(l)?` <small>❤️${Math.round(rep(l))}</small>`:''}</div>
      <div class="crowd"><div class="bars">${[1,2,3,4,5].map(b=>`<i class="${b<=bars?'on':''}" style="height:${6+b*3}px"></i>`).join('')}</div>👥${Math.round(N)}</div>
      <div class="lk">${tops.map(t=>`<img class="hd" src="${img(TYPES[t].spr[0])}" alt="">`).join('')}<span style="width:6px"></span>${topLikes(l).map(k=>`<img src="${img(k)}" alt="">`).join('')}</div></div>`}).join('')+'</div>').join('');}
$('#routeBody').addEventListener('click',e=>{const b=e.target.closest('[data-route]');if(!b)return;S.route=S.routes[+b.dataset.route];save();renderMenu()});

/* ---- đi chợ ---- */
/* ===================== thực đơn: tự xiên món (mỗi món một que 5 viên tự ghép) ===================== */
const menuCap=()=>cart().menu;
const mCount=m=>{const c={};m.v.forEach(k=>c[k]=(c[k]||0)+1);return c};
const mName=m=>{const ks=Object.keys(mCount(m));return ks.length===1?ITEMS[ks[0]].n:ks.length===2?ks.map(k=>ITEMS[k].n.split(' ')[0]).join(' + '):'Thập cẩm'};
const priceM=m=>r1k(m.v.reduce((a,k)=>a+ITEMS[k].c*2,0));
/* khách thích món: trung bình độ thích các viên trên que (0..1); gia đình, giới trẻ thích que thập cẩm hơn */
function appeal(m,t){const L=TYPES[t].like,mx=Math.max(...Object.values(L));let a=m.v.reduce((s,k)=>s+(L[k]||0),0)/(5*mx);if(TYPES[t].mixLike&&new Set(m.v).size>1)a+=.15;return a}
/* hình que (vẽ một lần, cache dataURL) cho thẻ thực đơn, đơn khách */
const QI={};function queImg(v){const key=v.join(',');if(QI[key])return QI[key];const cv=document.createElement('canvas');cv.width=40;cv.height=120;const C={cv,ctx:cv.getContext('2d'),LW:20,LH:60,s:2},old=K;K=C;C.ctx.setTransform(2,0,0,2,0,0);C.ctx.lineCap='round';xeQueV(v,10,52,3.6,null);K=old;return QI[key]=cv.toDataURL()}
const routeTypes=()=>{const s={};(S.route||[]).forEach(l=>{for(const t in LOCS[l].mix)s[t]=(s[t]||0)+LOCS[l].mix[t]});return s};
const likeFaces=m=>{const rt=routeTypes();return Object.keys(rt).filter(t=>appeal(m,t)>=.5).sort((a,b)=>appeal(m,b)-appeal(m,a)).slice(0,3).map(t=>`<img class="hd" src="${img(TYPES[t].spr[0])}" alt="">`).join('')};
function renderMenu(){show('menu');const cap=menuCap(),rt=routeTypes();
  $('#menuBody').innerHTML=`<h2>📋 Thực đơn <small class="cnt">${S.menu.length}/${cap}</small></h2><div class="mtop">${Object.keys(rt).sort((a,b)=>rt[b]-rt[a]).map(t=>`<span class="chip"><img class="hd" src="${img(TYPES[t].spr[0])}" alt="">${topOf(t).map(k=>`<img src="${img(k)}" alt="">`).join('')}</span>`).join('')}</div>`
    +S.menu.map((m,i)=>`<div class="mrow menu" data-ed="${i}"><img class="qimg" src="${queImg(m.v)}" alt=""><div><div class="nm">${mName(m)}</div><div class="pr">${fk(priceM(m))} <span class="faces">${likeFaces(m)}</span></div></div><span class="ed">✏️</span></div>`).join('')
    +(S.menu.length<cap?`<button class="addm" data-ed="new">＋ 🍢</button>`:'')}
const topOf=t=>{const L=TYPES[t].like;return Object.keys(L).filter(k=>!ITEMS[k].rare).sort((a,b)=>L[b]-L[a]).slice(0,3)};
$('#menuBody').addEventListener('click',e=>{const b=e.target.closest('[data-ed]');if(!b)return;sfx('tick');edOpen(b.dataset.ed==='new'?-1:+b.dataset.ed)});
$('#toMarket').onclick=()=>{if(!S.menu.length)return toast('📋 Thêm món đã');sfx('pop');renderMarket()};
/* ---- xiên món: chạm/giữ tô viên để xiên lên que, chạm que để gỡ viên cuối ---- */
let E=null,PW=0,PH=0,PR=[],PRAF=0,PD=null;const PC=mk($('#pc'),160,200);
const edItems=()=>Object.keys(ITEMS).filter(k=>!ITEMS[k].rare||k===(S.mk&&S.mk.rare));
function edOpen(i){E={i,v:i>=0?[...S.menu[i].v]:[]};$('#edOv').hidden=false;$('#edDel').hidden=i<0;edHead();if(!PRAF)PRAF=requestAnimationFrame(edFrame)}
function edHead(){const m={v:E.v};$('#edHead').innerHTML=E.v.length?`<b>${mName(m)}</b> · ${fk(priceM(m))} <span class="faces">${E.v.length===5?likeFaces(m):''}</span>`:'<b>🍢 0/5</b>';$('#edOk').disabled=E.v.length<5}
function edAdd(k){if(E.v.length>=5)return false;E.v.push(k);sfx('pop');edHead();return E.v.length<5}
function edUndo(){if(!E.v.length)return;E.v.pop();sfx('tick');edHead()}
function edClose(){E=null;$('#edOv').hidden=true;cancelAnimationFrame(PRAF);PRAF=0;PD=null;renderMenu()}
$('#edOk').onclick=()=>{if(E.v.length<5)return;const m={v:E.v};if(E.i>=0)S.menu[E.i]=m;else S.menu.push(m);save();sfx('win');edClose()};
$('#edDel').onclick=()=>{if(E.i>=0)S.menu.splice(E.i,1);save();edClose()};
$('#edX').onclick=()=>edClose();
function edFrame(ts){PRAF=0;if(!E)return;if(PD&&ts>=PD.nx){PD.nx=ts+150;if(PD.f()===false)PD=null}drawEd();PRAF=requestAnimationFrame(edFrame)}
function drawEd(){if(!PW||!PH)return;PC.LH=160*PH/PW;fit(PC,PW,PH);begin(PC);const W=160,H=PC.LH;PR=[];
  RR(0,0,W,H,0,'#f1d9ad',null);for(let y=4;y<H;y+=7)LN(0,y,W,y,'rgba(122,86,70,.12)',.5);
  const qh=H*.42,qs=Math.min(6,(qh-8)/(5*2.15+2));RR(W/2-20,3,40,qh,6,'rgba(255,250,240,.75)',LINE,.5);xeQueV(E.v,W/2,3+qh-qs*1.6-3,qs,null);
  T(E.v.length+'/5',W/2+14,10,5,E.v.length<5?'#c0702a':'#3f8f66','center',800);if(E.v.length)PR.push({x:W/2-20,y:3,w:40,h:qh,f:()=>{edUndo();return false}});
  const ks=edItems(),cols=4,cw=(W-4)/cols,rows=Math.ceil(ks.length/cols),by=qh+8,ch=Math.min(cw*1.05,(H-by-2)/rows);
  ks.forEach((k,i)=>{const r={x:2+(i%cols)*cw+1,y:by+Math.floor(i/cols)*ch,w:cw-2,h:ch-2};RR(r.x,r.y,r.w,r.h,4,'rgba(255,255,255,.65)','#c9bdb5',.6);
    if(!drawSprite(SPR[k],r.x+2,r.y+2,r.w-4,r.h-11))drawPiece(k,r.x+r.w/2,r.y+r.h/2,4,ITEMS[k].col);T(ITEMS[k].n,r.x+r.w/2,r.y+r.h-4.5,3.4,INK,'center',800);
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
/* số viên mỗi loại cần cho thực đơn trên lộ trình: khách mỗi điểm × món họ chọn (theo độ thích) × số que × số viên loại đó trên que */
function demandMenu(route){const d={};route.forEach((l,i)=>{const N=expect(l,SLOTS[i].id),mx=LOCS[l].mix,tw=Object.values(mx).reduce((a,b)=>a+b,0);
  for(const t in mx){const T0=TYPES[t],ap=S.menu.map(m=>appeal(m,t)),ok=ap.map(a=>a>=.2?a*a:0),sw=ok.reduce((a,b)=>a+b,0);if(!sw)continue;
    const ques=(T0.q[0]+T0.q[1])/2*Math.min((T0.k[0]+T0.k[1])/2,ok.filter(Boolean).length);
    S.menu.forEach((m,j)=>{if(!ok[j])return;const c=mCount(m);for(const k in c)d[k]=(d[k]||0)+N*mx[t]/tw*ques*ok[j]/sw*c[k]})}});return d}
function renderMarket(){show('market');const cost=buyCost(),C=cart(),mk=S.mk,arrow=k=>{const p=mk.prevF[k];if(!p)return'';const d=mk.f[k]/p-1;return Math.abs(d)<.04?'':d>0?`<span class="up">↑</span>`:`<span class="dn">↓</span>`};
  const dm=demandMenu(S.route),ks=mItems().sort((a,b)=>inMenu(b)-inMenu(a));
  let h=`<div class="mtop"><span class="chip">${S.route.map(l=>LOCS[l].i).join(' → ')}</span><span class="chip ${bagUse()>C.bags?'warn':''}">🧺 ${bagUse()}/${C.bags}</span><span class="chip ${cost>S.money?'warn':''}">🛒 ${fk(cost)}</span>${mk.ev?`<span class="chip">${mk.ev.t}</span>`:''}</div>`;
  h+=ks.map(k=>{const n=S.buy[k]||0,need=Math.round(dm[k]||0);return`<div class="mrow ${n?'on':''}"><img src="${img(k)}" alt=""><div><div class="nm">${ITEMS[k].n} ${ITEMS[k].rare?'<span class="tag">✈️</span>':''}${inMenu(k)?'<span class="tag m">📋</span>':''}</div><div class="pr">${fk(bagPrice(k))}/${BAG} ${arrow(k)}${need?` · 🎯${need}`:''}</div></div>
    <div class="step"><button data-b="${k}" data-d="-1">−</button><b>${n}</b><button data-b="${k}" data-d="1">+</button></div></div>`}).join('');
  h+=`<div class="sec">🥫 ${S.bring.length}/${C.sauces}</div>`+mSauces().map(k=>{const on=S.bring.includes(k),left=S.sauce[k]||0,n=S.buy[k]||0;return`<div class="mrow ${on?'on':''}"><img src="${img(k)}" alt=""><div><div class="nm">${SAUCES[k].n} ${SAUCES[k].rare?'<span class="tag">✈️</span>':''}</div><div class="pr">${left+n*CHAI} lần · +${fk(chaiPrice(k))}</div></div>
    <div class="step"><button data-b="${k}" data-d="1">+</button><button class="tog ${on?'on':''}" data-tog="${k}">${on?'✓':''}</button></div></div>`}).join('');
  if(S.money<80000&&!S.debt)h+=`<div style="margin-top:10px"><button class="btn sm ghost" id="loanBtn">🏦 Vay 300k</button></div>`;
  $('#mBody').innerHTML=h;$('#mGo').disabled=!bagUse()||cost>S.money||bagUse()>C.bags}
$('#mBody').addEventListener('click',e=>{const b=e.target.closest('[data-b],[data-tog],#loanBtn');if(!b)return;sfx('tick');const C=cart();
  if(b.id==='loanBtn'){S.money+=300000;S.debt=330000;toast('🏦 +300k');save();return renderMarket()}
  if(b.dataset.tog){const k=b.dataset.tog;if(S.bring.includes(k))S.bring=S.bring.filter(x=>x!==k);else{if((S.sauce[k]||0)+(S.buy[k]||0)*CHAI<=0)S.buy[k]=1;S.bring.push(k);if(S.bring.length>C.sauces)S.bring.shift()}return renderMarket()}
  const k=b.dataset.b,d=+b.dataset.d,n=(S.buy[k]||0)+d;
  if(ITEMS[k]&&d>0&&bagUse()>=C.bags)return toast(`🧺 ${C.bags} bịch thôi`);
  if(SAUCES[k]&&d>0&&!S.bring.includes(k)){S.bring.push(k);if(S.bring.length>C.sauces)S.bring.shift()}
  if(n<=0)delete S.buy[k];else S.buy[k]=n;renderMarket()});
/* gợi ý: đủ viên cho thực đơn trên lộ trình, trong số bịch xe chở và số tiền đang có; sốt hợp khách */
function autoBuy(){const C=cart(),dm=demandMenu(S.route);S.buy={};let budget=S.money*.92;
  for(const k in dm)if(dm[k]>2)S.buy[k]=Math.max(1,Math.ceil(dm[k]*1.1/BAG));
  const tc=()=>Object.keys(S.buy).reduce((a,k)=>a+bagPrice(k)*S.buy[k],0);
  while(bagUse()>C.bags||tc()>budget){const k=Object.keys(S.buy).sort((a,b)=>S.buy[b]-S.buy[a])[0];if(!k)break;if(S.buy[k]>1)S.buy[k]--;else delete S.buy[k]}budget-=tc();
  const sw={};S.route.forEach(l=>{for(const t in LOCS[l].mix)for(const s in TYPES[t].sa)if(mSauces().includes(s))sw[s]=(sw[s]||0)+LOCS[l].mix[t]*TYPES[t].sa[s]});
  S.bring=Object.keys(sw).sort((a,b)=>sw[b]-sw[a]).slice(0,C.sauces);S.bring.forEach(k=>{if((S.sauce[k]||0)<15&&chaiPrice(k)<=budget){S.buy[k]=1;budget-=chaiPrice(k)}});
  sfx('pop');renderMarket()}
$('#mAuto').onclick=autoBuy;
$('#mGo').onclick=()=>{const cost=buyCost();if(cost>S.money||!bagUse()||bagUse()>cart().bags)return;S.money-=cost;
  const stock={};for(const k in S.buy){if(ITEMS[k])stock[k]=S.buy[k]*BAG;else S.sauce[k]=(S.sauce[k]||0)+S.buy[k]*CHAI}
  startDay(stock,cost)};

/* ===================== ngày bán ===================== */
let D=null,PAUSED=false;
function startDay(stock,cost){
  D={stock,start:{...stock},cost,fuel:cart().fuel,rev:0,tips:0,served:0,stars:[],angry:0,miss:{},full:0,si:-1,cust:[],fx:[],cid:0,sauces:S.bring.filter(k=>(S.sauce[k]||0)>0),stops:[]};
  S.money-=D.fuel;XS=null;show('sell');layout();nextStop()}
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
/* số que còn làm được cho món k: viên trong kho (5 viên một que) + que đã vớt + que trong chảo/đang cầm */
/* số que món i còn làm được: nguyên liệu trong kho đủ ghép bao nhiêu que + que đã vớt + que trong chảo */
const mMake=i=>{const c=mCount(S.menu[i]);return Math.min(...Object.keys(c).map(k=>Math.floor((D.stock[k]||0)/c[k])))};
const qAv=i=>mMake(i)+xeHave(i)+xeIn(i);
const say=(c,L,ms=2200,k)=>{if(!L||!L.length)return;c.say=pick(L).replace('{k}',k?ITEMS[k].n.toLowerCase():'');c.sayT=now+ms/1000};
const orderTxt=o=>o.bs.map(i=>`${qN(o,i)} que ${mName(S.menu[i]).toLowerCase()}`).join(', ')+(o.ss.length?' thêm '+o.ss.map(s=>SAUCES[s].n.toLowerCase()).join(', '):'');
/* khách đói tới gần xe xem thực đơn: có món hợp khẩu vị (độ thích ≥ 0,2) và còn làm được thì xếp hàng gọi, không thì 😕 đi tiếp */
function decide(c){c.dec=true;const T0=TYPES[c.type],ms=S.menu.map((m,i)=>({i,a:appeal(m,c.type)})).filter(x=>x.a>=.2&&qAv(x.i)>0);
  if(!ms.length){D.miss[c.crave]=(D.miss[c.crave]||0)+1;D.st.miss++;c.bub={k:c.crave,no:1,t:now+1.4};say(c,T0.miss,2600,c.crave);return}
  const first=pickW(ms,x=>x.a*x.a);if(queue().length>=QMAX){D.full++;c.bub={m:first.i,full:1,t:now+1.6};c.say='Đông quá, thôi!';c.sayT=now+1.6;return}
  const kinds=Math.min(ri(T0.k[0],T0.k[1]),ms.length),bs=[first.i];
  while(bs.length<kinds){const x=pickW(ms.filter(y=>!bs.includes(y.i)),y=>y.a*y.a);if(!x)break;bs.push(x.i)}
  const q={};bs.forEach(i=>q[i]=Math.max(1,Math.min(ri(T0.q[0],T0.q[1]),qAv(i))));
  const ss=[];if(D.sauces.length&&Math.random()<T0.sp){const sw=D.sauces.filter(s=>T0.sa[s]);ss.push(sw.length?pickW(sw,s=>T0.sa[s]):pick(D.sauces))}
  c.o={bs,q,ss};const tot=bs.reduce((a,x)=>a+q[x],0);c.max=c.p=T0.pat+tot*5;c.st='q';c.bub={m:first.i,t:now+1};c.say=`${pick(T0.hi)} ${orderTxt(c.o)}!`;c.sayT=now+2.8;sfx('bell');layoutQ()}
function layoutQ(){queue().forEach((c,i)=>{c.tx=70+i*12.5})}
function leave(c,mood){c.st='go';c.tx=-26;c.mood=mood;layoutQ()}
function tick(dt){const st=D.st;st.t+=dt;
  if(!st.done&&st.t<st.dur){st.next-=dt;if(st.next<=0){spawn();const walkers=st.N/.62,f=1+.6*Math.sin(Math.PI*st.t/st.dur);st.next=st.dur/walkers/f*rnd(.55,1.45)}}
  D.cust.forEach(c=>{const d=c.tx-c.x;if(Math.abs(d)>.3)c.x+=Math.sign(d)*Math.min(Math.abs(d),c.sp*dt);
    if(c.st==='walk'&&c.hungry&&!c.dec&&c.x<118&&st.t<st.dur)decide(c);
    if(c.st==='q'&&Math.abs(d)<1){c.p-=dt;if(c.p<=0){D.angry++;st.angry++;D.combo=0;S.rep[st.l]=clamp(rep(st.l)-1.5,0,100);say(c,TYPES[c.type].quit,1800);leave(c,0);sfx('err')}}});
  /* khách chờ nói chuyện vui */
  if(now>(D.chatT||0)){D.chatT=now+rnd(4,7);const q=queue().filter(c=>Math.abs(c.tx-c.x)<1&&!(c.sayT>now));if(q.length){const c=pick(q);say(c,TYPES[c.type].wait,2600)}}
  /* khách đầu hàng cần món mà xe hết hẳn thì đi */
  const f=queue()[0];if(f&&Math.abs(f.tx-f.x)<1){const lack=f.o.bs.find(i=>qN(f.o,i)>qAv(i));if(lack!=null){const k=S.menu[lack].v.find(k=>!(D.stock[k]>0))||S.menu[lack].v[0];D.miss[k]=(D.miss[k]||0)+1;st.miss++;say(f,TYPES[f.type].miss,2400,k);leave(f,0)}}
  D.cust=D.cust.filter(c=>c.x>-24&&c.x<175||c.st==='q');
  xeTick(dt);
  D.fx=D.fx.filter(x=>now-x.t<1.4);
  if(st.t>=st.dur&&!queue().length&&!st.done){st.done=true;stopEnd()}}
function stopEnd(){const st=D.st,l=LOCS[st.l],last=D.si>=S.route.length-1,nx=last?null:LOCS[S.route[D.si+1]];D.stops.push(st);sfx('chime');
  $('#stopCard').innerHTML=`<div class="big">${l.i} ✓</div><div class="row"><span>💰 ${fk(st.rev)}</span><span>😊 ${st.served}</span>${st.miss?`<span>😕 ${st.miss}</span>`:''}${st.angry?`<span>😤 ${st.angry}</span>`:''}</div>
    <div class="acts"><button class="btn wide" id="goNext">${last?'🏠 Về nhà':`${cart().i} → ${nx.i} ${nx.n}`}</button></div>`;
  $('#stopOv').hidden=false;$('#goNext').onclick=()=>{sfx('pop');nextStop()}}
/* mục tiêu: xe kế tiếp (hiện ở tổng kết, đủ tiền thì mua) */
function goalHTML(){const nx=CARTS[S.cart+1];if(!nx)return'';const f=clamp(S.money/nx.price,0,1),nl=Object.keys(LOCS).filter(l=>LOCS[l].cart===S.cart+1).map(l=>LOCS[l].i).join('');
  return`<div class="goal"><img src="${img(nx.spr)}" alt=""><div class="gm"><b>🎯 ${nx.n}</b><small>📋${nx.menu} 🧺${nx.bags} 🥫${nx.sauces} 🍳${nx.fry} · ${nl}</small><div class="gbar"><i style="width:${(f*100).toFixed(0)}%"></i></div></div>
    <button class="btn sm" id="upBtn" ${S.money>=nx.price?'':'disabled'}>${fk(nx.price)}</button></div>`}
function endDay(){stopLoop();const left=Object.values(D.stock).reduce((a,b)=>a+b,0)+(XS?(XS.fq.length+XS.tray.length)*5:0);
  const lost=Object.keys(D.stock).reduce((a,k)=>a+D.stock[k]*ITEMS[k].c*S.mk.f[k],0);
  let pay=0;const net=D.rev+D.tips-D.cost-D.fuel;if(S.debt&&net>0){pay=Math.min(S.debt,Math.round(net*.3/1000)*1000);S.money-=pay;S.debt-=pay}
  const avg=D.stars.length?D.stars.reduce((a,b)=>a+b,0)/D.stars.length:0;
  S.hist.push({day:S.day,rev:D.rev+D.tips,cost:D.cost+D.fuel,served:D.served,miss:D.miss});if(S.hist.length>30)S.hist.shift();
  $('#sumBody').innerHTML=`<h2>🌙 Ngày ${S.day}</h2><div class="sumg">
    <div class="sbox net"><small>Lời / lỗ</small><b class="${net>=0?'dn':'up'}">${net>=0?'+':''}${fmt(net)}</b></div>
    <div class="sbox"><small>💰 Bán</small><b>${fk(D.rev)}</b>${D.tips?` <small>+ tip ${fk(D.tips)}</small>`:''}</div><div class="sbox"><small>🛒 Chợ + ⛽</small><b>${fk(D.cost+D.fuel)}</b></div>
    <div class="sbox"><small>😊 Khách</small><b>${D.served}</b> <small>⭐ ${avg.toFixed(1)}</small></div><div class="sbox"><small>😤 Bỏ về · 🚶 Đông quá</small><b>${D.angry} · ${D.full}</b></div></div>
    <div id="goalBox">${goalHTML()}</div>
    ${Object.keys(D.miss).length?`<div class="sec">😕 Khách muốn mà xe không có</div><div class="mlist">${Object.entries(D.miss).sort((a,b)=>b[1]-a[1]).map(([k,n])=>`<span><img src="${img(k)}" alt="">${ITEMS[k].n} ×${n}</span>`).join('')}</div>`:''}
    ${left?`<div class="sec">🗑️ Dư ${left} viên${lost?` · −${fk(lost)}`:''}</div>`:''}${pay?`<div class="sec">🏦 Trả nợ ${fk(pay)} · còn ${fk(S.debt)}</div>`:''}`;
  S.day++;D=null;XS=null;save();show('sum');sfx('win')}
$('#sumBody').addEventListener('click',e=>{if(!e.target.closest('#upBtn'))return;const nx=CARTS[S.cart+1];if(!nx||S.money<nx.price)return;
  S.money-=nx.price;S.cart++;save();hud();sfx('win');toast(`${nx.i} ${nx.n}!`,2200);$('#goalBox').innerHTML=`<div class="goal done"><img src="${img(nx.spr)}" alt=""><div class="gm"><b>✓ ${nx.n}</b><small>📋${nx.menu} 🧺${nx.bags} 🥫${nx.sauces} 🍳${nx.fry}</small></div></div>`+goalHTML()});
$('#nextBtn').onclick=()=>{sfx('pop');renderRoute()};

/* ===================== xe: chảo, que, khay vớt, sốt ===================== */
/* Que xiên sẵn buổi sáng (5 viên một loại); khách gọi theo que. XS trong ngày: fq que trong chảo [{v,c}], tray que đã vớt [{v,q}],
   sauce sốt đã xịt cho khách cid, spray nét xịt [{k,p}] */
const QUE_MAX=5;let XS=null,XR=[],XD=null,XG={},XSM=[];
const xs=()=>XS||(XS={hand:[],fq:[],tray:[],sauce:[],spray:[],cid:null});
const qN=(o,k)=>(o.q&&o.q[k])||0;
const xeHave=i=>xs().tray.filter(f=>f.m===i).length,xeIn=i=>xs().fq.filter(f=>f.m===i).length;
const xeCk=v=>1.5*Math.max(...v.map(k=>ITEMS[k].ck));
const xeOrd=()=>{if(!D)return null;const c=queue()[0];return c&&Math.abs(c.tx-c.x)<2?{c,o:c.o}:null};
/* chạm món: một que của món đó (5 viên theo thực đơn) vào chảo; giữ ngón thì thả liên tục tới khi chảo đầy */
function xeTray(i){const X=xs(),m=S.menu[i];if(X.fq.length>=cart().fry)return toast('🍳 Chảo đầy',900),false;
  if(!(mMake(i)>0)){const c=mCount(m),k=Object.keys(c).find(k=>(D.stock[k]||0)<c[k]);return toast('Hết '+ITEMS[k].n.toLowerCase(),1100),false}
  for(const k of m.v)D.stock[k]--;X.fq.push({m:i,v:[...m.v],c:0});sfx('fry');return true}
function xeFry(i){const X=xs(),rd=X.fq.filter(g=>g.c>=FRY_MIN);if(rd.length)return xeLift(rd);if(X.fq.length)toast('⏳',700)}
function xeLift(rd){const X=xs();X.fq=X.fq.filter(f=>!rd.includes(f));rd.forEach(f=>X.tray.push({m:f.m,v:f.v,q:f.c}));sfx('tick');if(rd.some(f=>f.c>FRY_OK))toast('Hơi cháy…',1000)}
function xeSauce(k,free){const t=xeOrd();if(!t)return toast('⏳',700);const X=xs();X.cid=t.c.id;
  if(!free&&X.sauce.includes(k)){X.sauce=X.sauce.filter(x=>x!==k);X.spray=X.spray.filter(s=>s.k!==k);return sfx('tick')}
  if(!((S.sauce[k]||0)>0))return toast('Hết '+SAUCES[k].n.toLowerCase(),1100);
  if(!free){const G=XG.k;if(G){const p=[],n=9,y0=G.y+G.h*(.22+.1*(X.spray.length%4));for(let i=0;i<=n;i++)p.push([G.x+6+i*(G.w-12)/n,y0+(i%2?3:-1)]);X.spray.push({k,p})}}
  if(!X.sauce.includes(k))X.sauce.push(k);sfx('pop')}
/* chọn que cho đơn: mỗi loại lấy đủ số que, que chín đẹp nhất trước */
function xePick(o){const X=xs(),got=[];for(const k of o.bs){const L=X.tray.filter(f=>f.m===k).sort((a,b)=>Math.abs(a.q-1)-Math.abs(b.q-1));if(L.length<qN(o,k))return null;got.push(...L.slice(0,qN(o,k)))}return got}
function xeServe(){const t=xeOrd();if(!t)return;const {c,o}=t,X=xs(),nm=k=>(S.menu[k]?mName(S.menu[k]):(ITEMS[k]||SAUCES[k]).n).toLowerCase();
  const short=o.bs.map(k=>[k,qN(o,k)-xeHave(k)]).filter(([,n])=>n>0);
  if(short.length)return sfx('err'),toast(short.map(([k,n])=>`${n} que ${nm(k)}`).join(' · ')+(short.some(([k])=>xeIn(k))?' ⏳':''),1300);
  const sm=o.ss.filter(k=>!X.sauce.includes(k));if(sm.length)return sfx('err'),toast('🥫 '+sm.map(nm).join(', '),1200);
  const got=xePick(o);X.tray=X.tray.filter(f=>!got.includes(f));
  /* sao: chờ lâu, hơi cháy, xịt sai sốt */
  let s=5;if(c.p/c.max<.3)s--;if(got.some(f=>f.q>FRY_OK))s--;if(X.sauce.some(k=>!o.ss.includes(k)))s--;
  X.sauce.forEach(k=>S.sauce[k]=Math.max(0,(S.sauce[k]||0)-1));X.sauce=[];X.spray=[];X.cid=null;
  D.combo=s>=5?(D.combo||0)+1:0;
  const T0=TYPES[c.type],pay=o.bs.reduce((a,i)=>a+qN(o,i)*priceM(S.menu[i]),0),tip=(s>=5&&T0.tip&&Math.random()<T0.tip?r1k(pay*rnd(.1,.25)):0)+(D.combo>=3?1000*Math.min(10,D.combo):0);
  S.money+=pay+tip;D.rev+=pay;D.tips+=tip;D.st.rev+=pay+tip;D.served++;D.st.served++;D.stars.push(s);S.stat.served++;if(s>=5)S.stat.five++;
  S.rep[D.st.l]=clamp(rep(D.st.l)+(s>=5?1:s>=4?.5:s<=2?-1:0),0,100);
  D.fx.push({t:now,x:c.x,txt:'+'+fk(pay+tip),s,combo:D.combo>=3?D.combo:0});say(c,s>=5?T0.thx:s>=3?T0.meh:T0.bad,2000);leave(c,s>=4?2:1);sfx('cash')}
function xeTick(dt){const X=xs(),t=xeOrd();if(X.cid!=null&&(!t||t.c.id!==X.cid)){X.sauce=[];X.spray=[];X.cid=null}
  if(!X.fq.length)return;X.fq.forEach(f=>{f.c+=dt/xeCk(f.v)});
  const b=X.fq.filter(f=>f.c>FRY_BURN);if(b.length){X.fq=X.fq.filter(f=>f.c<=FRY_BURN);sfx('err');b.forEach(f=>XSM.push({t:now,i:f.slot}));toast(`🔥 −${b.length} que`,1200)}}

/* ---- vẽ khung xe ---- */
const XEC=mk($('#xe'),160,200);let XEW=0,XEH=0;
function xeQueV(v,x,yb,s,c){const g=s*2.15;LN(x,yb+s*1.3,x,yb-g*QUE_MAX-s*.2,'#c99a5e',.9);LN(x,yb+s*1.3,x,yb-g*QUE_MAX-s*.2,'#f2d8a0',.3);v.forEach((k,j)=>drawPiece(k,x,yb-j*g,s,cookCol(k,c),j*1.3+.5))}
function xeBox(R,f){XR.push({...R,f})}
const xeIn2=(R,x,y)=>R&&x>=R.x&&x<=R.x+R.w&&y>=R.y&&y<=R.y+R.h;
function drawXe(){if(!XEW||!XEH||!D)return;XEC.LH=160*XEH/XEW;fit(XEC,XEW,XEH);const c=begin(XEC),W=160,H=XEC.LH,t=now,X=xs();XR=[];
  const T0=xeOrd(),o=T0&&T0.o,need={};if(o)o.bs.forEach(k=>need[k]=Math.max(0,qN(o,k)-xeHave(k)-xeIn(k)));
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
  const ts=Math.min(3.6,(hh-9)/(QUE_MAX*2.15+1.6));
  /* khay vớt: que đã chiên xếp dọc, dùng chung cho mọi khách; xịt sốt lên đây */
  const px=2,pw=W-px-2-30;RR(px,hy,pw,hh,4,'#e9c48c',LINE,.5);RR(px+2,hy+2,pw-4,hh-4,3,'#f2d7a6',null);
  const pk=o?xePick(o)||[]:[],nq=X.tray.length,gx2=Math.min(13,(pw-8)/Math.max(1,nq)),qx=px+4+gx2/2+Math.max(0,(pw-8-gx2*nq)/2);
  X.tray.forEach((f,i)=>{const x=qx+i*gx2;if(pk.includes(f))RR(x-gx2/2+.6,hy+3,gx2-1.2,hh-6,2.5,'rgba(63,143,102,.2)',null);xeQueV(f.v,x,hy+hh-ts*1.6-2.5,ts,f.q)});
  XG.k={x:px,y:hy,w:pw,h:hh};c.save();rrPath(px+1,hy+1,pw-2,hh-2,3.5);c.clip();X.spray.forEach(s=>{const Y=SAUCES[s.k];if(!Y||s.p.length<2)return;
    if(Y.bot){s.p.forEach(([x,y],i)=>EL(x+((i*.7)%1-.5)*3,y+((i*.37)%1-.5)*3,.45,.45,Y.col,null));return}
    c.beginPath();s.p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=shade(Y.col,-.2);c.lineWidth=1.7;c.stroke();c.strokeStyle=Y.col;c.lineWidth=1.2;c.stroke();c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=.35;c.stroke()});c.restore();
  /* GIAO */
  const ok=!!(o&&o.bs.every(k=>xeHave(k)>=qN(o,k))&&o.ss.every(k=>X.sauce.includes(k)));
  const gx=W-31;if(ok){const p=.5+.5*Math.sin(t*6);AL(.25+.25*p,()=>RR(gx-1.5,hy-1.5,32,hh+3,6,'#9fd4b8',null))}RR(gx,hy,29,hh,5,ok?'#3f8f66':'#e8ddd0',ok?'#1f2d4d':LINE,.6);T('GIAO',gx+14.5,hy+hh/2,5.2,ok?'#fff':'#a8968a','center',800);
  xeBox({x:gx,y:hy,w:29,h:hh},xeServe);
  /* sốt + khay que xiên sẵn (số trên khay là số que còn; chạm thả một que vào chảo, giữ ngón thả liên tục) */
  const SS=D.sauces,TR=S.menu.map((m,i)=>i),avail=H-sy-2,sh=SS.length?clamp(avail*.3,28,38):0,ty0=sy+sh+(SS.length?3:0);
  if(SS.length){const cw=Math.min(30,(W-4)/SS.length);SS.forEach((k,i)=>{const r={x:2+i*cw+(W-4-cw*SS.length)/2,y:sy,w:cw-1.5,h:sh},on=X.sauce.includes(k),nd=o&&o.ss.includes(k)&&!on,q=S.sauce[k]||0;
    RR(r.x,r.y,r.w,r.h,3,nd?'#ffe8d2':on?'#e4f4ea':'rgba(255,255,255,.5)',nd?'#ee7a1f':on?'#3f8f66':'#c9bdb5',nd||on?1.2:.5);
    if(!drawSprite(SPR[k],r.x+1,r.y+1,r.w-2,r.h-11,!q))RR(r.x+r.w/2-3,r.y+3,6,r.h-14,2,SAUCES[k].col,LINE,.4);
    T(SAUCES[k].n,r.x+r.w/2,r.y+r.h-6.6,3.1,INK,'center',800);T(String(q),r.x+r.w/2,r.y+r.h-2.8,2.9,q?'#7d7466':'#d9534f','center',800);if(on)T('✓',r.x+r.w-3.6,r.y+4,4.2,'#2f6a4c','center',800);xeBox({...r,drag:'sauce',k},()=>xeSauce(k))})}
  if(TR.length){const n=TR.length,cols=n<=4?n<=3?3:4:n<=6?3:n<=8?4:5,rows=Math.ceil(n/cols),cw=(W-4)/cols,ch=Math.min(cw*1.25,(H-ty0-2)/rows),ox=n<cols?(cols-n)*cw/2:0;
    TR.forEach(i=>{const m=S.menu[i],r={x:2+ox+(i%cols)*cw,y:ty0+Math.floor(i/cols)*ch,w:cw-1.5,h:ch-1.5},nd=need[i]>0,q=mMake(i);
      RR(r.x,r.y,r.w,r.h,3.4,nd?'#ffe8d2':'rgba(255,255,255,.55)',nd?'#ee7a1f':'#c9bdb5',nd?1.3:.5);
      const qs2=Math.min(r.w*.16,(r.h-13)/(QUE_MAX*2.15+1.6));AL(q?1:.4,()=>xeQueV(m.v,r.x+r.w/2,r.y+r.h-10-qs2*1.3,qs2,null));
      T(mName(m),r.x+r.w/2,r.y+r.h-7.6,3.2,INK,'center',800);T(q+' que',r.x+r.w/2,r.y+r.h-3.4,3,q?'#7d7466':'#d9534f','center',800);
      if(nd){RR(r.x+1.5,r.y+1.5,13,6.4,3.2,'#ee7a1f','#fff',.4);T('+'+need[i]+'🍢',r.x+8,r.y+4.8,3.6,'#fff','center',800)}xeBox({...r,hold:1},()=>xeTray(i))})}
  /* đang kéo chai sốt: chai nghiêng theo tay, vòi ở đầu ngón */
  if(XD&&XD.moved&&XD.kind==='sauce'){const Y=SAUCES[XD.k],im=SPR[XD.k];c.save();c.translate(XD.x,XD.y-2);c.rotate(Math.PI*.82);if(im&&im.width){const h=26,w=h*im.width/im.height;c.drawImage(im,-w/2,-h,w,h)}else RR(-4,-22,8,20,2,Y.col,LINE,.5);c.restore();EL(XD.x,XD.y,1.2,1.2,Y.col,null)}}
const xePt=e=>{const r=$('#xe').getBoundingClientRect();return[(e.clientX-r.left)*160/r.width,(e.clientY-r.top)*XEC.LH/r.height]};
$('#xe').addEventListener('pointerdown',e=>{if(!D||PAUSED||!$('#stopOv').hidden)return;const [x,y]=xePt(e);
  for(let i=XR.length-1;i>=0;i--){const R=XR[i];if(!xeIn2(R,x,y))continue;e.preventDefault();try{e.currentTarget.setPointerCapture(e.pointerId)}catch(_){}
    if(R.drag)XD={kind:R.drag,k:R.k,f:R.f,x0:x,y0:y,x,y,moved:false,st:null};
    /* giữ ngón trên khay: xiên liền từng viên */
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
  const mini=c=>`<span class="qn">${c.o.bs.map(i=>`<img class="qi" src="${queImg(S.menu[i].v)}" alt="">${qN(c.o,i)}`).join('')}${c.o.ss.length?`<i>🥫</i>`:''}</span>`;
  if(!t)h=`<div class="xn">${D&&D.st&&D.st.t>=D.st.dur?'🌙':'⏳'}</div>`;
  else{const {c,o}=t,chips=o.bs.map(i=>{const q=qN(o,i),g=Math.min(xeHave(i),q),w=xeIn(i);return`<span class="xc${g>=q?' ok':w?' wip':''}"><img class="qi" src="${queImg(S.menu[i].v)}" alt="">${mName(S.menu[i])} <b>${g}/${q}</b></span>`}).join('')
      +o.ss.map(k=>`<span class="xc s${X.sauce.includes(k)?' ok':''}">🥫 ${SAUCES[k].n}</span>`).join('')+X.sauce.filter(k=>!o.ss.includes(k)).map(k=>`<span class="xc s bad">🥫 ${SAUCES[k].n}</span>`).join('');
    h=`<div class="xh"><i class="xp"><i></i></i><small>👥${Q.length}</small></div><div class="xcs">${chips}</div>`+(Q.length>1?`<div class="xq">${Q.slice(1).map(mini).join('')}</div>`:'')}
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
/* bong bóng ý nghĩ: món thực đơn khách chọn (hình que), món thèm mà xe không có (gạch chéo), hoặc 👥 đông quá */
function bubble(x,y,b){RR(x-6,y-14,12,12,4,'#fffaf0',LINE,.5);PT([[x-1.5,y-2.2],[x+1.5,y-2.2],[x,y]],'#fffaf0',null);
  if(b.full){T('👥',x,y-8,5.5,INK,'center');return}if(b.m!=null&&S.menu[b.m]){const v=S.menu[b.m].v;for(let j=0;j<5;j++)drawPiece(v[j],x,y-4.6-j*1.95,.9,ITEMS[v[j]].col);LN(x,y-3,x,y-13,'#c99a5e',.3);return}
  drawPiece(b.k,x,y-8,2.6,ITEMS[b.k].col,.3);if(b.no){LN(x-4,y-12,x+4,y-4,'#d9534f',.9)}}
/* bong bóng lời nói: tự xuống dòng (tối đa 3 dòng), không tràn khỏi cảnh */
function sayBox(x,y,t){const c=K.ctx,fs=4.2;c.font=`800 ${fs}px "Baloo 2",system-ui`;const W0=70,L=[];let cur='';t.split(' ').forEach(w=>{const n=cur?cur+' '+w:w;if(c.measureText(n).width>W0&&cur){L.push(cur);cur=w}else cur=n});L.push(cur);
  const ls=L.slice(0,3),w=Math.max(...ls.map(l=>c.measureText(l).width))+5,h=ls.length*5+2,bx=clamp(x-w/2,1,159-w);RR(bx,y-h,w,h,3,'#fffaf0',LINE,.45);PT([[x-1.5,y-.2],[x+1.5,y-.2],[x,y+2]],'#fffaf0',null);
  ls.forEach((l,i)=>T(l,bx+w/2,y-h+3.6+i*5,fs,INK,'center'))}
function drawScene(){if(!D||!D.st)return;begin(SC);const st=D.st;drawBg(st.l,st.sl);
  const cs=D.cust.slice().sort((a,b)=>(a.st==='q')-(b.st==='q'));
  /* chủ xe đứng sau xe, xe ở bên trái */
  const me=SPR.me_o_xanh;if(me&&me.width){const h=30,w=h*me.width/me.height;K.ctx.drawImage(me,24-w/2,17,w,h)}
  const cv=SPR[cart().spr];if(cv&&cv.width){const h=50,w=h*cv.width/cv.height;K.ctx.drawImage(cv,4,62-h,w,h)}
  cs.forEach(drawPerson);
  const q=queue();q.forEach((c,i)=>{if(Math.abs(c.tx-c.x)>1)return;const f=clamp(c.p/c.max,0,1);RR(c.x-5,26,10,2.2,1.1,'#fffaf0',LINE,.3);RR(c.x-4.6,26.4,9.2*f,1.4,.7,f>.55?'#3f8f66':f>.25?'#e0962a':'#d9534f',null);
    if(i===0)PT([[c.x-2,22],[c.x+2,22],[c.x,24.5]],'#e2503c',null)});
  D.cust.forEach(c=>{if(c.bub&&now<c.bub.t)bubble(c.x,27,c.bub);else if(c.say&&now<c.sayT)sayBox(c.x,26,c.say)});
  D.fx.forEach(f=>{const k=(now-f.t)/1.4;AL(1-k,()=>{T(f.txt,f.x,20-k*10,5,'#3f8f66','center');if(f.s)T('★'.repeat(f.s),f.x,25-k*10,3.4,'#e0962a','center');if(f.combo)T('🔥 Combo ×'+f.combo,f.x,14-k*10,4.4,'#e2503c','center')})});
  /* giờ, nơi, tiền */
  const L=LOCS[st.l],txt=`${L.i} ${clock()}`;RR(2,2,30,8,4,'rgba(31,45,77,.78)',null);T(txt,17,6.2,4.4,'#fff','center');
  RR(34,2,26,8,4,'rgba(31,45,77,.78)',null);T('💰'+fk(S.money),47,6.2,4.2,'#fff','center');
  const pr=clamp(st.t/st.dur,0,1);RR(62,4.5,40,3,1.5,'rgba(255,255,255,.6)',null);RR(62,4.5,40*pr,3,1.5,'#f6c24a',null)}
$('#sc').addEventListener('pointerdown',e=>{if(!D)return;const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.left)*160/r.width,y=(e.clientY-r.top)*70/r.height;
  if(x>8&&x<30&&y>50){sfx('meow');D.fx.push({t:now,x:20,txt:'❤️'})}});

/* ===================== bố cục, vòng lặp ===================== */
function layout(){const W=$('#app').clientWidth,h=Math.round(W*70/160);fit(SC,W,h);$('#sc').parentElement.style.height=h+'px'}
addEventListener('resize',()=>{if(D)layout()});
if(window.ResizeObserver)new ResizeObserver(en=>{const r=en[0].contentRect;PW=Math.round(r.width);PH=Math.round(r.height)}).observe($('#pcWrap'));
if(window.ResizeObserver)new ResizeObserver(en=>{const r=en[0].contentRect;XEW=Math.round(r.width);XEH=Math.round(r.height);document.documentElement.style.setProperty('--tb',XEH+'px')}).observe($('#xeWrap'));
/* ?speed=N cho test chạy nhanh */
const SPEED=clamp(+(new URLSearchParams(location.search).get('speed'))||1,1,20);
let now=0,last=0,RAF=0,lastX=0;
function frame(ts){RAF=0;if(!D)return;const sec=ts/1000,dt=Math.min(.1,Math.max(0,sec-last))*SPEED;last=sec;
  if(!PAUSED&&$('#stopOv').hidden){now+=dt;tick(dt);holdTick()}if(!D)return;
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
