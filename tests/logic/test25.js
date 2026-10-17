// Xe bán mới (ke-hoach.md bước 1): xiên từng viên vào que, nhúng que vào chảo, vớt khi vàng, rưới sốt, giao; khách thèm món xe không có thì bỏ đi.
const fs=require('fs'),vm=require('vm');const src=fs.readFileSync(process.argv[2],'utf8');
const stub=new Proxy(function(){},{get:(t,p)=>p===Symbol.toPrimitive?()=>0:p==='length'?0:p===Symbol.iterator?[][Symbol.iterator]:stub,apply:()=>stub,construct:()=>stub,set:()=>true});
let fails=0;const ok=(c,m)=>{if(!c){fails++;console.log('FAIL',m)}else console.log('ok  ',m)};
const M=Object.create(Math);const store={};
const ctx={console,Math:M,JSON,Date,Object,Array,Set,Map,Promise,String,Number,Symbol,Proxy,Error,setTimeout:(f)=>{f();return 0},clearTimeout:()=>{},requestAnimationFrame:()=>0,performance:{now:()=>0},devicePixelRatio:2,btoa:s=>s,atob:s=>s,unescape,escape,encodeURIComponent,decodeURIComponent,
document:{querySelector:()=>stub,querySelectorAll:()=>[],createElement:()=>stub,body:stub,addEventListener:()=>{}},localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v)}},Image:function(){return{}},navigator:stub,addEventListener:()=>{},ok,M};
ctx.window=ctx;vm.createContext(ctx);vm.runInContext(src+`;let TO='';toast=m=>{TO=m};
(function(){
  ok(XE_LITE===true,'mặc định dùng xe bán mới');
  S.day=4;['cavien','bovien','s_tuongot'].forEach(k=>S.stock[k]=[{q:60,e:20}]);syncBasics();syncLayout();startDay();D.evPlan=[];D.insp=null;
  const o0=makeOrder();ok(!o0.ts.length&&!o0.fs.length&&!o0.sugar&&!o0.ice&&!o0.gem,'đơn chỉ có viên và sốt');
  spawn('thuong');const c=D.queue[0],o=c.items[0];c.items=[o];c.p=c.max=999;Object.assign(o,{bs:['cavien'],n:{cavien:7},ss:['s_tuongot'],fam:null});c.price=priceOf(o);
  const X=xs(),q0=qty('cavien');for(let i=0;i<5;i++)xeTray('cavien');
  ok(X.fq.length===1&&!X.hand.length&&qty('cavien')===q0-5,'xiên đủ 5 viên: que tự nhúng vào chảo, mỗi viên trừ kho ngay');
  xeTray('cavien');xeTray('cavien');xeTray('bovien');xeUndo();ok(X.hand.length===2&&qty('bovien')===60,'chạm que đang cầm: gỡ viên cuối, trả lại kho');
  xeFry();ok(X.fq.length===2,'chạm chảo: nhúng que đang cầm');
  for(let i=0;i<4;i++){for(let j=0;j<5;j++)xeTray('bovien')}ok(X.fq.length===6,'chảo chung chiên được 6 que cùng lúc (xe đẩy)');
  for(let j=0;j<5;j++)xeTray('bovien');for(let j=0;j<3;j++)xeTray('bovien');ok(X.hand.length===5&&/Chảo đầy/.test(TO),'chảo đầy thì que nằm trên tay, nhắc chảo đầy');
  xeServe();ok(D.served===0,'chưa vớt thì chưa giao');
  xeFry(0);ok(X.fq.length===6,'chưa vàng thì không vớt');
  let n=0;while(X.fq.some(f=>f.c<FRY_MIN)&&n++<400)xeTick(.05);ok(X.fq.every(f=>f.c<FRY_OK),'chín đều');
  xeFry(1);ok(X.fq.length===0&&xeHave('cavien')===7&&xeHave('bovien')===20,'chạm que vàng: vớt mọi que vàng ra khay vớt');
  xeServe();ok(D.served===0&&/🥫/.test(TO),'chưa chọn sốt thì chưa giao');
  xeSauce('s_tuongot');ok(X.sauce.includes('s_tuongot'),'chạm sốt: chọn tương ớt cho khách');
  const s0=qty('s_tuongot');xeServe();ok(!cup&&D.served===1&&xeHave('cavien')===0&&xeHave('bovien')===20&&qty('s_tuongot')===s0-1,'giao: lấy đúng 7 cá viên từ khay, bò viên còn lại cho khách sau');
  ok(!X.sauce.length,'giao xong thì bỏ chọn sốt');
  // khách sau dùng viên còn trong khay
  spawn('thuong');const c3=D.queue[D.queue.length-1];c3.items=[c3.items[0]];c3.p=c3.max=999;Object.assign(c3.items[0],{bs:['bovien'],n:{bovien:4},ss:[],fam:null});D.queue=[c3];
  xeServe();ok(D.served===2&&xeHave('bovien')===16,'khách sau lấy viên đã chiên sẵn trong khay');
  // cháy khét: mất que
  xeTray('cavien');xeTray('cavien');xeFry();const q1=qty('cavien');
  for(let i=0;i<300;i++)xeTick(.05);ok(!X.fq.length&&qty('cavien')===q1&&/🔥/.test(TO),'để quá lâu: que cháy khét, mất viên');
  // khách thèm món xe không có
  D.queue=[];D.walk=[];S.drinks.includes('xucxich')||S.drinks.push('xucxich');D.miss={};let w=0;for(let i=0;i<300;i++){D.queue=[];spawn();if(!D.queue.length)w++}
  ok(D.miss.xucxich>15&&w===D.miss.xucxich&&!D.miss.cavien,'thèm xúc xích mà xe không có thì bỏ đi ('+w+'/300)');
  ok(D.walk.every(x=>x.peek),'khách ghé nhìn rồi đi');
})();`,ctx);
console.log(fails?fails+' FAILED':'ALL PASSED');
