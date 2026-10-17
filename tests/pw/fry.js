// Chảo chiên bằng cú chạm thật: lấy order, chạm khay đồ chiên thả vào chảo, chờ vàng rồi chạm chảo vớt, đủ thì chạm quầy gói giao; để quá lửa thì cháy khét, ly hỏng
const { chromium } = require('playwright-core');const { pathToFileURL } = require('url');
let fails=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});
const ctx=await b.newContext({viewport:{width:390,height:780},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(pathToFileURL(process.argv[2]).href);for(let i=0;i<60;i++){await p.waitForTimeout(150);if(await p.evaluate(()=>!document.getElementById('boot')))break}
await p.evaluate(()=>{document.body.classList.remove('help');S.notice=[];renderPrep()});
await p.click('#openBtn');await p.waitForTimeout(300);
await p.evaluate(()=>{D.evPlan=[];D.next=0});
for(let i=0;i<40;i++){await p.waitForTimeout(250);if(await p.evaluate(()=>!!nextIt()))break}
await p.evaluate(()=>{const n=nextIt(),it=n.c.items[n.i];Object.assign(it,{bs:['cavien','bovien'],ss:[],ts:[],fs:[],sugar:0,ice:0,sk:null,gem:null});n.c.p=n.c.max=1e4});
await p.tap('[data-next]');await p.waitForTimeout(700);
ok(await p.evaluate(()=>MK&&!!cup),'chạm Lấy order: sang màn chiên, có ly');
const at=async id=>p.evaluate(id=>{const o=LAYG().find(o=>o.id===id),r=objRect(o),cv=document.querySelector('#st').getBoundingClientRect(),k=cv.width/SW;return{x:cv.left+(r.x+r.w/2)*k,y:cv.top+(r.y+r.h/2)*k}},id);
let q=await at('cavien');await p.touchscreen.tap(q.x,q.y);q=await at('bovien');await p.touchscreen.tap(q.x,q.y);await p.waitForTimeout(200);
ok(await p.evaluate(()=>cup.fry.length===2&&!cup.pours.length),'chạm 2 khay: 2 phần vào chảo');
q=await at('chao');await p.touchscreen.tap(q.x,q.y);await p.waitForTimeout(100);
ok(await p.evaluate(()=>cup.fry.length===2),'chạm chảo khi chưa chín: chưa vớt');
await p.waitForTimeout(2600);await p.screenshot({path:'shots_fry1.png'});
await p.waitForFunction(()=>cup&&cup.fry.length&&cup.fry.every(f=>f.c>=FRY_MIN),null,{timeout:4000});
q=await at('chao');await p.touchscreen.tap(q.x,q.y);await p.waitForTimeout(150);
ok(await p.evaluate(()=>!cup.fry.length&&cup.pours.length===2&&!cupMiss(curOrder())),'vàng rồi chạm chảo: vớt cả 2 ra ly, ly đạt');
await p.screenshot({path:'shots_fry2.png'});
const n0=await p.evaluate(()=>D.served);q=await at('seal');await p.touchscreen.tap(q.x,q.y);await p.waitForTimeout(1600);
ok(await p.evaluate(n0=>D.served===n0+1&&!cup&&D.stars.at(-1)===5,n0),'chạm quầy gói: giao xong, khách cho 5★');
// để cháy khét
await p.evaluate(()=>{D.next=0});for(let i=0;i<40;i++){await p.waitForTimeout(250);if(await p.evaluate(()=>!!nextIt()))break}
await p.evaluate(()=>{const n=nextIt(),it=n.c.items[n.i];Object.assign(it,{bs:['cavien'],ss:[],ts:[],fs:[],sugar:0,ice:0,sk:null,gem:null});n.c.p=n.c.max=1e4});
await p.tap('[data-next]');await p.waitForTimeout(600);q=await at('cavien');await p.touchscreen.tap(q.x,q.y);
await p.waitForFunction(()=>cup&&cup.broken,null,{timeout:9000}).catch(()=>{});
ok(await p.evaluate(()=>cup&&cup.broken==='cháy khét'&&[...orderNeeds()].join()==='trash'),'quên vớt: cháy khét, ly hỏng, thùng rác sáng');await p.screenshot({path:'shots_fry3.png'});
q=await at('trash');await p.touchscreen.tap(q.x,q.y);await p.waitForTimeout(200);ok(await p.evaluate(()=>!cup),'chạm Bỏ ly: bỏ ly cháy');
ok(!errs.length,'không lỗi JS '+errs.join('|'));await b.close();console.log(fails?fails+' FAILED':'ALL PASSED')})();
