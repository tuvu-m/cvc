// Gắp xiên bằng cú chạm thật: lấy order (3 cá viên, 2 bò viên), mỗi lần chạm khay gắp một xiên vào chảo, chờ vàng rồi chạm chảo vớt, đủ số thì chạm quầy gói giao; gắp dư bị trừ sao; để quá lửa thì cháy khét
const { chromium } = require('playwright-core');const { pathToFileURL } = require('url');
let fails=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});
const ctx=await b.newContext({viewport:{width:390,height:780},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(pathToFileURL(process.argv[2]).href);for(let i=0;i<60;i++){await p.waitForTimeout(150);if(await p.evaluate(()=>!document.getElementById('boot')))break}
await p.evaluate(()=>{document.body.classList.remove('help');S.notice=[];renderPrep()});
await p.click('#openBtn');await p.waitForTimeout(300);
await p.evaluate(()=>{D.evPlan=[];D.next=0});
for(let i=0;i<40;i++){await p.waitForTimeout(250);if(await p.evaluate(()=>!!nextIt()))break}
await p.evaluate(()=>{const n=nextIt(),it=n.c.items[n.i];Object.assign(it,{bs:['cavien','bovien'],n:{cavien:3,bovien:2},ss:[],ts:[],fs:[],sugar:0,ice:0,sk:null,gem:null,fam:null});n.c.p=n.c.max=1e4;n.c.type='thuong';n.c.pay='Tiền mặt'});
await p.tap('[data-next]');await p.waitForTimeout(700);
ok(await p.evaluate(()=>MK&&!!cup),'chạm Lấy order: sang màn chiên, có ly');
const at=async id=>p.evaluate(id=>{const o=LAYG().find(o=>o.id===id),r=objRect(o),cv=document.querySelector('#st').getBoundingClientRect(),k=cv.width/SW;return{x:cv.left+(r.x+r.w/2)*k,y:cv.top+(r.y+r.h/2)*k}},id);
let q=await at('cavien');for(let i=0;i<3;i++){await p.touchscreen.tap(q.x,q.y);await p.waitForTimeout(60)}q=await at('bovien');for(let i=0;i<2;i++){await p.touchscreen.tap(q.x,q.y);await p.waitForTimeout(60)}await p.waitForTimeout(150);
ok(await p.evaluate(()=>cup.fry.length===2&&cpF(cup,'cavien')===3&&cpF(cup,'bovien')===2&&!cup.pours.length),'chạm khay 3 + 2 lần: 3 cá viên, 2 bò viên vào chảo');
ok(await p.evaluate(()=>[...document.querySelectorAll('#ordp .op')].map(e=>e.textContent).join('|').includes('Cá viên ×3')),'khung đơn ghi Cá viên ×3');
q=await at('chao');await p.touchscreen.tap(q.x,q.y);await p.waitForTimeout(100);
ok(await p.evaluate(()=>cup.fry.length===2),'chạm chảo khi chưa chín: chưa vớt');
await p.waitForTimeout(2600);await p.screenshot({path:'shots_fry1.png'});
await p.waitForFunction(()=>cup&&cup.fry.length&&cup.fry.every(f=>f.c>=FRY_MIN),null,{timeout:4000});
q=await at('chao');await p.touchscreen.tap(q.x,q.y);await p.waitForTimeout(150);
ok(await p.evaluate(()=>!cup.fry.length&&cpN(cup,'cavien')===3&&cpN(cup,'bovien')===2&&!cupMiss(curOrder())),'vàng rồi chạm chảo: vớt đủ 5 xiên ra ly, ly đạt');
await p.screenshot({path:'shots_fry2.png'});
const n0=await p.evaluate(()=>D.served);q=await at('seal');await p.touchscreen.tap(q.x,q.y);await p.waitForTimeout(1600);
ok(await p.evaluate(n0=>D.served===n0+1&&!cup&&D.stars.at(-1)===5,n0),'chạm quầy gói: giao xong, khách cho 5★');
// gắp dư một xiên: giao được nhưng −1★
await p.evaluate(()=>{D.next=0});for(let i=0;i<40;i++){await p.waitForTimeout(250);if(await p.evaluate(()=>!!nextIt()))break}
await p.evaluate(()=>{const n=nextIt(),it=n.c.items[n.i];Object.assign(it,{bs:['cavien'],n:{cavien:2},ss:[],ts:[],fs:[],sugar:0,ice:0,sk:null,gem:null,fam:null});n.c.items=[it];n.c.p=n.c.max=1e4;n.c.type='thuong';n.c.pay='Tiền mặt'});
await p.tap('[data-next]');await p.waitForTimeout(600);q=await at('cavien');for(let i=0;i<3;i++){await p.touchscreen.tap(q.x,q.y);await p.waitForTimeout(60)}
await p.waitForFunction(()=>cup&&cup.fry.length&&cup.fry.every(f=>f.c>=FRY_MIN),null,{timeout:5000});q=await at('chao');await p.touchscreen.tap(q.x,q.y);await p.waitForTimeout(150);
ok(await p.evaluate(()=>!cupMiss(curOrder())&&checks(curOrder())[0][3]),'gắp 3/2: vẫn giao được, nhãn đỏ');
const n1=await p.evaluate(()=>D.served);q=await at('seal');await p.touchscreen.tap(q.x,q.y);await p.waitForTimeout(1600);
ok(await p.evaluate(n1=>D.served===n1+1&&D.stars.at(-1)===4,n1),'gắp dư: khách cho 4★');
// để cháy khét
await p.evaluate(()=>{D.next=0});for(let i=0;i<40;i++){await p.waitForTimeout(250);if(await p.evaluate(()=>!!nextIt()))break}
await p.evaluate(()=>{const n=nextIt(),it=n.c.items[n.i];Object.assign(it,{bs:['cavien'],n:{cavien:2},ss:[],ts:[],fs:[],sugar:0,ice:0,sk:null,gem:null,fam:null});n.c.p=n.c.max=1e4;n.c.type='thuong';n.c.pay='Tiền mặt'});
await p.tap('[data-next]');await p.waitForTimeout(600);q=await at('cavien');await p.touchscreen.tap(q.x,q.y);
await p.waitForFunction(()=>cup&&cup.broken,null,{timeout:9000}).catch(()=>{});
ok(await p.evaluate(()=>cup&&cup.broken==='cháy khét'&&[...orderNeeds()].join()==='trash'),'quên vớt: cháy khét, ly hỏng, thùng rác sáng');await p.screenshot({path:'shots_fry3.png'});
q=await at('trash');await p.touchscreen.tap(q.x,q.y);await p.waitForTimeout(200);ok(await p.evaluate(()=>!cup),'chạm Bỏ ly: bỏ ly cháy');
ok(!errs.length,'không lỗi JS '+errs.join('|'));await b.close();console.log(fails?fails+' FAILED':'ALL PASSED')})();
