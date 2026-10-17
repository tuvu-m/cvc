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
  const q0=qty('cavien');for(let i=0;i<6;i++)xeTray('cavien');
  ok(cup&&cup.hand.length===5&&qty('cavien')===q0-5,'que tối đa 5 viên, mỗi viên trừ kho ngay');ok(/Que đầy/.test(TO),'que đầy thì nhắc nhúng chảo');
  xeFry();ok(cup.fq.length===1&&!cup.hand.length,'chạm chảo: nhúng que');
  xeTray('cavien');xeTray('cavien');xeTray('bovien');xeUndo();ok(cup.hand.length===2&&qty('bovien')===60,'chạm que đang cầm: gỡ viên cuối, trả lại kho');
  xeFry();ok(cup.fq.length===2,'nhúng que thứ hai');
  xeServe();ok(D.served===0&&/vớt/.test(TO),'còn que trong chảo thì chưa giao được');
  xeFry(0);ok(/Chưa vàng/.test(TO)&&cup.fq.length===2,'chưa vàng thì không vớt');
  let n=0;while(cup.fq.some(f=>f.c<FRY_MIN)&&n++<400)xeTick(.05);ok(cup.fq.every(f=>f.c<FRY_OK),'chín đều cả hai que');
  xeFry(1);ok(!cup.fq.length&&cup.ques.length===2&&cpN(cup,'cavien')===7,'chạm que vàng: vớt hết que đã vàng');
  xeServe();ok(D.served===0&&/rưới/.test(TO),'chưa rưới sốt thì chưa giao');
  xeSauce('s_tuongot');ok(cup.syrups.includes('s_tuongot'),'rưới tương ớt');
  const m0=S.money;xeServe();ok(!cup&&D.served===1,'giao xong');
  // cháy khét: mất que
  spawn('thuong');const c2=D.queue[D.queue.length-1];c2.p=c2.max=999;D.queue=[c2];xeTray('cavien');xeTray('cavien');xeFry();const q1=qty('cavien');
  for(let i=0;i<300;i++)xeTick(.05);ok(cup&&!cup.fq.length&&qty('cavien')===q1&&/Cháy/.test(TO),'để quá lâu: que cháy khét, mất viên');
  // khách thèm món xe không có
  cup=null;D.queue=[];D.walk=[];S.drinks.includes('xucxich')||S.drinks.push('xucxich');D.miss={};let w=0;for(let i=0;i<300;i++){D.queue=[];spawn();if(!D.queue.length)w++}
  ok(D.miss.xucxich>15&&w===D.miss.xucxich&&!D.miss.cavien,'thèm xúc xích mà xe không có thì bỏ đi ('+w+'/300)');
  ok(D.walk.every(x=>x.peek),'khách ghé nhìn rồi đi');
})();`,ctx);
console.log(fails?fails+' FAILED':'ALL PASSED');
