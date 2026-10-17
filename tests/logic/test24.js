// Món nổi tiếng là combo: 12 combo có hàng hiếm; bán đủ đồ của combo thì khách thỉnh thoảng gọi (đắt hơn 20%), giao đúng lần đầu là khám phá, ghi vào sổ.
const fs = require('fs'), vm = require('vm');
const src = fs.readFileSync(process.argv[2], 'utf8');
const stub = new Proxy(function () {}, {
  get: (t, p) => p === Symbol.toPrimitive ? () => 0 : p === 'length' ? 0 : p === Symbol.iterator ? [][Symbol.iterator] : stub,
  apply: () => stub, construct: () => stub, set: () => true,
});
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m) } else console.log('ok  ', m) };
const toasts = [];
const store = {};
const M = Object.create(Math); // Math riêng để chỉnh random
const ctx = {
  console, Math: M, JSON, Date, Object, Array, Set, Map, Promise, String, Number, Symbol, Proxy, Error,
  setTimeout: () => 0, clearTimeout: () => {}, requestAnimationFrame: () => 0, performance: { now: () => 0 }, devicePixelRatio: 2,
  btoa: s => Buffer.from(s, 'binary').toString('base64'), atob: s => Buffer.from(s, 'base64').toString('binary'), unescape, escape, encodeURIComponent, decodeURIComponent,
  document: { querySelector: () => stub, querySelectorAll: () => [], createElement: () => stub, body: stub, addEventListener: () => {} },
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v) } },
  Image: function () { return {} }, navigator: stub, addEventListener: () => {}, ok, toasts, M,
};
ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(src + `
;toast=(m)=>toasts.push(m);
(function(){
  const R=Math.random;
  const hire=(n,o={})=>{S.staff=[];for(let i=0;i<n;i++){const s=genStaff();Object.assign(s,{role:'barista',trait:'chamchi',spd:3,skill:3,mood:80,name:'NV'+(i+1)},o);S.staff.push(s)}};
  /* mở cửa ngày 5 với 1 khách gọi món cố định, chặn khách mới vào */
  const setup=(order)=>{S.day=5;['cavien','bovien','s_tuongot','dualeo','dochua'].forEach(k=>S.stock[k]=[{q:99,e:99}]);startDay();D.next=1e9;D.total=99;D.evPlan=[];spawn('thuong');const c=D.queue[0];c.p=c.max=1e6;c.type='thuong';
    Object.assign(c.items[0],{n:null,fam:null,size:'M',ts:[],fs:[],ss:[],sugar:0,ice:0},order);c.items.length=1;c.o=c.items[0];c.price=99000;cup=null;return c};
  const run=(sec,dt=.05)=>{const steps=[];let t=0;for(;t<sec;t+=dt){now+=dt;tickDay(dt);if(!D)break;const A=D.as;if(A&&A.on){const st=ASTEPS[A.i];if(steps[steps.length-1]!==st)steps.push(st)}}return steps};
  const until=(cond,max=20,dt=.05)=>{let t=0;while(t<max&&!cond()){now+=dt;t+=dt;tickDay(dt);if(!D)break}return t};
  M.random=R;
  ok(FAMOUS.length===12&&FAMOUS.every(F=>F.ids.some(k=>ITEM(k).rare)),'12 món nổi tiếng, món nào cũng có nguyên liệu hiếm');
  S.drinks=Object.keys(BASES).filter(k=>!BASES[k].free);S.syrups=Object.keys(SYRUPS);S.foams=Object.keys(FOAMS);
  syncBasics();ok(S.recipes.length===S.drinks.length&&S.recipes.every(r=>r.basic&&r.bs.length===1&&!r.ss.length),'bảng giá: mỗi loại đồ chiên một dòng, không có món tự chế');
  ok(!(S.famous||[]).length,'chưa khám phá món nổi tiếng nào');
  S.recipes.forEach(r=>r.on=false);['cavien','xxduc'].forEach(k=>itemRec(k).on=true);S.qrows=12;
  S.day=5;['cavien','xxduc','s_mutat','s_tuongot'].forEach(k=>S.stock[k]=[{q:99,e:99}]);startDay();D.next=1e9;D.evPlan=[];D.queue=[];
  const F=FAMOUS.find(x=>x.id==='xxducmutat');ok(famOk(F),'đủ Xúc xích Đức (đang bán) và mù tạt trên quầy: combo gọi được');
  let nf=0,fo=null;for(let i=0;i<2000;i++){const o=makeOrder();if(o.fam==='xxducmutat'){nf++;fo=o}}
  ok(nf>100&&nf<320,'khách thỉnh thoảng gọi combo nổi tiếng ('+nf+'/2000)');
  ok(fo&&fo.name==='Xúc xích Đức mù tạt'&&sameSet(fo.bs,['xxduc'])&&fo.ss.includes('s_mutat'),'đơn combo: tên chuẩn, đúng đồ chiên và sốt');
  {const b=fo.bs.reduce((a,k)=>a+xN(fo,k)*unitPrice(k),0);ok(priceOf({...fo,ts:[]})===r1k(b*1.2),'combo nổi tiếng đắt hơn 20%')}
  spawn('thuong');const c=D.queue.at(-1);c.items=[{...fo,ts:[],sugar:0,ice:0}];c.o=c.items[0];c.price=priceOf(c.o);c.p=c.max=999;
  const cp=newCup('M');cp.pours=[{k:'xxduc',n:xN(fo,'xxduc'),amt:1,q:1}];cp.syrups=['s_mutat'];toasts.length=0;serveCup(c,0,cp,null);
  ok(S.famous.includes('xxducmutat')&&toasts.some(t=>/Món nổi tiếng mới: Xúc xích Đức mù tạt/.test(t)),'giao đúng combo lần đầu: khám phá, ghi vào sổ, có thông báo');
  ok(collHTML().includes('Món nổi tiếng'),'Sổ sưu tập vẫn có bộ món nổi tiếng');
})();`, ctx);
console.log(fails ? fails + ' FAILED' : 'ALL PASSED');
process.exit(fails ? 1 : 0);
