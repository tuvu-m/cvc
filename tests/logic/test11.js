// Giảm độ khó: giới hạn món theo cấp tiệm, mở tab dần, bày quầy theo thực đơn, nhập đủ hàng, thực đơn dạng lưới.
const fs = require('fs'), vm = require('vm');
const src = fs.readFileSync(process.argv[2], 'utf8');
const stub = new Proxy(function () {}, { get: (t, p) => p === Symbol.toPrimitive ? () => 0 : p === 'length' ? 0 : p === Symbol.iterator ? [][Symbol.iterator] : stub, apply: () => stub, construct: () => stub, set: () => true });
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m) } else console.log('ok  ', m) };
const M = Object.create(Math), store = {}, toasts = [];
const ctx = { console, Math: M, JSON, Date, Object, Array, Set, Map, Promise, String, Number, Symbol, Proxy, Error, setTimeout: (f) => { f(); return 0 }, clearTimeout: () => {}, requestAnimationFrame: () => 0, performance: { now: () => 0 }, devicePixelRatio: 2,
  btoa: s => s, atob: s => s, unescape, escape, encodeURIComponent, decodeURIComponent,
  document: { querySelector: sel => sel !== '#tbody' ? stub : new Proxy(function () {}, { get: (t, p) => p === 'addEventListener' ? (ev, f) => { if (ev === 'click') ctx.prepClick = f } : stub[p], apply: () => stub, set: () => true }), querySelectorAll: () => [], createElement: () => stub, body: stub, addEventListener: () => {} },
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v) } }, Image: function () { return {} }, navigator: stub, addEventListener: () => {}, ok, M, toasts };
ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(src + `;toast=m=>toasts.push(m);renderPrep=()=>{};
(function(){S.day=6;S.evDay=6;S.ev='binhthuong';['cavien','bovien','s_tuongot'].forEach(k=>S.stock[k]=[{q:30,e:99}]);syncLayout();startDay();D.next=1e9;D.evPlan=[];D.queue=[];
  spawn('thuong');const c=D.queue.at(-1);Object.assign(c.items[0],{n:null,fam:null,bs:['cavien','bovien'],size:'M',ts:[],ss:[],fs:[],sugar:0,ice:0});c.o=c.items[0];c.p=c.max=999;
  const pour=(k,sec)=>{startPour(k);for(let t=0;t<sec;t+=.05){now+=.05;tickDay(.05)}stopPour()};
  const t0=qty('cavien'),m0=qty('bovien');takeCup('M');
  for(let i=0;i<6;i++)pour('cavien',.15);for(let i=0;i<4;i++)pour('bovien',.1);
  ok(t0-qty('cavien')===6&&m0-qty('bovien')===4,'gắp 6 cá viên, 4 bò viên: kho trừ đúng 6 và 4 xiên');
  useTool('trash');takeCup('M');pour('cavien',.3);pour('bovien',.2);
  ok(t0-qty('cavien')===7&&m0-qty('bovien')===5,'bỏ ly làm ly khác: gắp lại tốn thêm (cá viên còn '+qty('cavien')+')');
  useTool('trash');takeCup('M');startPour('cavien');startPour('cavien');ok(t0-qty('cavien')===9&&cup.fry.length===1&&cup.fry[0].n===2,'chạm khay hai lần liền: một mẻ 2 xiên');
})();`, ctx);
console.log(fails ? fails + ' FAILED' : 'ALL PASSED'); process.exit(fails ? 1 : 0);
