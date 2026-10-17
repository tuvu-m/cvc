// Xe bán mới bằng cú chạm thật: một màn (cảnh + đơn + khung xe), chạm khay xiên viên vào que, chạm chảo nhúng que, que vàng thì chạm vớt, chạm sốt, chạm GIAO
process.env.PW_NEWUI=1;
const { chromium } = require('playwright-core');const { pathToFileURL } = require('url');
let fails=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});
for(const [W,H] of [[390,780],[375,667]]){
const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(pathToFileURL(process.argv[2]).href);for(let i=0;i<60;i++){await p.waitForTimeout(150);if(await p.evaluate(()=>!document.getElementById('boot')))break}
await p.evaluate(()=>{document.body.classList.remove('help');S.notice=[];S.day=4;['cavien','bovien','s_tuongot'].forEach(k=>S.stock[k]=[{q:60,e:20}]);renderPrep()});
await p.click('#openBtn');await p.waitForTimeout(300);
await p.evaluate(()=>{D.evPlan=[];D.insp=null;D.next=0});
for(let i=0;i<40;i++){await p.waitForTimeout(250);if(await p.evaluate(()=>!!target()))break}
await p.evaluate(()=>{const c=target(),it=c.items[c.cur];c.items=[it];Object.assign(it,{bs:['cavien','bovien'],n:{cavien:4,bovien:3},ss:['s_tuongot'],fam:null});c.p=c.max=1e4;c.type='thuong';c.pay='Tiền mặt';D.next=1e9});
await p.waitForTimeout(300);
ok(await p.evaluate(()=>!MK&&!$('#xeWrap').hidden&&$('#xeWrap').offsetHeight>200&&getComputedStyle($('#qrow')).display==='none'),`${W}×${H}: một màn bán, khung xe hiện, không còn hàng thẻ order`);
ok(await p.evaluate(()=>/Cá viên/.test($('#xord').textContent)&&/0\/4/.test($("#xord").textContent)),'đơn khách hiện trên khung xe');
const bb=await (await p.$('#xe')).boundingBox(),s=bb.width/160;const tap=async R=>{await p.touchscreen.tap(bb.x+(R.x+R.w/2)*s,bb.y+(R.y+R.h/2)*s);await p.waitForTimeout(90)};
const R=async f=>p.evaluate(f=>XR.filter(r=>String(r.f).includes(f)).map(r=>({x:r.x,y:r.y,w:r.w,h:r.h})),f);
const trays=await R('xeTray'),tk=await p.evaluate(()=>xeTrays());const fry=(await R('xeFry(null)'))[0];
const drag=async(A,B)=>{const P=R=>[bb.x+(R.x+R.w/2)*s,bb.y+(R.y+R.h/2)*s],[x0,y0]=P(A),[x1,y1]=P(B);await p.mouse.move(x0,y0);await p.mouse.down();for(let i=1;i<=12;i++){await p.mouse.move(x0+(x1-x0)*i/12,y0+(y1-y0)*i/12+(B.zig?(i%2?-8:8):0));await p.waitForTimeout(16)}await p.mouse.up();await p.waitForTimeout(120)};
for(let i=0;i<4;i++)await tap(trays[tk.indexOf('cavien')]);await tap(trays[tk.indexOf('bovien')]);
ok(await p.evaluate(()=>{const X=xs();return X.fq.length===1&&X.fq[0].v.join()==='cavien,cavien,cavien,cavien,bovien'}),'chạm khay: mỗi chạm xiên một viên, đủ 5 viên tự vào chảo');
await tap(trays[tk.indexOf('bovien')]);await tap(trays[tk.indexOf('bovien')]);
ok(await p.evaluate(()=>xs().fq.length===2&&!xs().hand.length),'que đủ và đúng phần còn thiếu: tự vào chảo');
await tap(trays[tk.indexOf('cavien')]);await tap(trays[tk.indexOf('cavien')]);
ok(await p.evaluate(()=>xs().hand.length===2),'xiên dư thì que nằm trên tay');
const hand=(await R('xeDip'))[0];await drag(hand,fry);
ok(await p.evaluate(()=>xs().fq.length===3&&!xs().hand.length),'kéo que thả vào chảo');
await p.screenshot({path:`out/xe_fry_${W}.png`});
for(let i=0;i<60;i++){await p.waitForTimeout(150);if(await p.evaluate(()=>xs().fq.every(f=>f.c>=FRY_MIN)))break}
await tap(fry);ok(await p.evaluate(()=>!xs().fq.length&&xeHave('cavien')===6&&xeHave('bovien')===3),'que vàng: chạm chảo vớt hết ra khay');
const kh=await p.evaluate(()=>XG.k);await drag((await R('xeSauce'))[(await p.evaluate(()=>xeSauces())).indexOf('s_tuongot')],{...kh,zig:1});
ok(await p.evaluate(()=>xs().sauce.includes('s_tuongot')&&xs().spray.length===1&&xs().spray[0].p.length>4),'kéo chai sốt: xịt tương ớt lên khay theo tay');
await p.screenshot({path:`out/xe_ready_${W}.png`});
const m0=await p.evaluate(()=>S.money);await tap((await R('xeServe'))[0]);await p.waitForTimeout(400);
ok(await p.evaluate(m0=>!cup&&D.served===1&&S.money>m0&&xeHave('cavien')===2,m0),'chạm GIAO: khách nhận, trả tiền, viên dư còn trong khay');
ok(!errs.length,'không lỗi JS'+(errs.length?': '+errs.join(' | '):''));await ctx.close()}
await b.close();console.log(fails?fails+' FAILED':'ALL PASSED')})();
