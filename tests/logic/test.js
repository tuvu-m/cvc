// Chạy script game trong Node với DOM giả, rồi kiểm tra logic topping-addon.
const fs = require('fs'), vm = require('vm');
const src = fs.readFileSync(process.argv[2], 'utf8');

const stub = new Proxy(function () {}, {
  get: (t, p) => p === Symbol.toPrimitive ? () => 0 : p === 'length' ? 0 : p === Symbol.iterator ? [][Symbol.iterator] : stub,
  apply: () => stub, construct: () => stub, set: () => true,
});
function makeStore(init) { const m = { ...init }; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v) }, _m: m } }

function run(saveJson, test) {
  const ctx = {
    console, Math, JSON, Date, Object, Array, Set, Map, Promise, String, Number, Symbol, Proxy, Error,
    setTimeout: () => 0, clearTimeout: () => {}, requestAnimationFrame: () => 0,
    performance: { now: () => 0 }, devicePixelRatio: 2, btoa: s => Buffer.from(s, 'binary').toString('base64'),
    atob: s => Buffer.from(s, 'base64').toString('binary'), unescape, escape, encodeURIComponent, decodeURIComponent,
    document: { querySelector: () => stub, querySelectorAll: () => [], createElement: () => stub, body: stub, addEventListener: () => {} },
    localStorage: makeStore(saveJson ? { cvc1: saveJson } : {}),
    Image: function () { return {} }, navigator: stub, addEventListener: () => {},
  };
  ctx.window = ctx; ctx.ok = ok;
  vm.createContext(ctx);
  vm.runInContext(src + '\nXE_LITE=false;;' + test, ctx);
  return ctx;
}

let fails = 0;
var ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m) } else console.log('ok  ', m) };
globalThis.ok = ok;

// 1) Save mới: không có topping trong công thức, khách chọn topping từ quầy, giá cộng thêm
run(null, `
  ok(S.addon===1,'save mới có cờ addon');
  ok(S.recipes.every(r=>r.ts.length===0),'công thức mặc định không có topping');
  startDay();
  let withTop=0,two=0,bad=0,priceOk=true;
  for(let i=0;i<2000;i++){const o=makeOrder();if(o.ts.length)withTop++;if(o.ts.length>1)two++;
    if(o.ts.some(k=>!onCounter(k)))bad++;
    const b=o.bs.reduce((a,k)=>a+xN(o,k)*unitPrice(k),0);const exp=(o.fam?r1k(b*1.2):b)+o.ts.reduce((a,k)=>a+topPrice(k),0);if(priceOf(o)!==exp)priceOk=false}
  ok(withTop>900&&withTop<1500,'ngày 1, quầy có 2 topping: khoảng 60% đơn có topping ('+withTop+'/2000)');
  ok(two>0,'có thể gọi nhiều topping ('+two+' đơn có 2 topping)');
  ok(bad===0,'chỉ gọi topping đang bày trên quầy');
  ok(priceOk,'giá đơn = số xiên × giá mỗi xiên + tiền rau');
  ok(topPrice('dualeo')===5000&&topPrice('kimchi')===14000,'giá topping: TC đen 5k, mochi 14k');
  S.day=5;let n2=0,n0=0;for(let i=0;i<2000;i++){const o=makeOrder();if(o.ts.length===2)n2++;if(!o.ts.length)n0++}
  ok(n2>0&&n0>400,'ngày 5: có đơn 2 topping ('+n2+') và đơn không topping ('+n0+')');
  S.stock.dualeo=[];S.stock.dochua=[];let any=0;for(let i=0;i<300;i++)if(makeOrder().ts.length)any++;
  ok(any===0,'hết hàng topping thì khách không gọi');
  ok(thucdonHTML().includes('Giá rau')&&thucdonHTML().includes('data-tpd'),'tab Thực đơn có bảng giá topping (chỉnh được)');
  tab='quay';ok(quayHTML().includes('khoBox')&&quayHTML().includes('Kho'),'tab Quầy luôn có ô Kho');
  ok(!quayHTML().includes('không món nào dùng'),'sốt trên quầy là đồ khách chọn, rau là đồ kèm: không bị tính là đồ thừa');
`);


console.log(fails ? fails + ' FAILED' : 'ALL PASSED');
process.exit(fails ? 1 : 0);
