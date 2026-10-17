// Bản mới v2: chọn lộ trình, Gợi ý ở chợ, lên đường; phục vụ khách đầu tiên bằng cú chạm thật (khay, chảo, vớt, kéo chai sốt, GIAO); bot bán nốt 3 điểm; tổng kết, sang ngày 2
process.env.PW_NEWUI=1;
const { chromium } = require('playwright-core');const { pathToFileURL } = require('url');const path=require('path');
let fails=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++};
const V2=path.join(path.dirname(process.argv[2]),'v2','index.html');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});
for(const [W,H] of [[390,780],[375,667]]){
const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(pathToFileURL(V2).href+'?speed=6');await p.waitForTimeout(500);
ok(await p.evaluate(()=>!$('#route').hidden&&document.querySelectorAll('.rcard').length===2&&document.querySelectorAll('.stop').length===6),`${W}×${H}: 2 lộ trình, mỗi lộ trình 3 điểm`);
await p.tap('[data-route="0"]');await p.waitForTimeout(200);
ok(await p.evaluate(()=>!$('#market').hidden&&$('#mGo').disabled),'chợ: chưa mua gì thì chưa lên đường được');
await p.tap('#mAuto');await p.waitForTimeout(200);
const plan=await p.evaluate(()=>({t:trayUse(),c:buyCost(),m:S.money}));ok(plan.t===3&&plan.c<=plan.m,'gợi ý: mua đủ 3 khay trong số tiền đang có');
await p.tap('#mGo');await p.waitForTimeout(300);
ok(await p.evaluate(()=>!$('#sell').hidden&&$('#hud').hidden&&$('#xeWrap').offsetHeight>180),'lên đường: màn bán, khung xe hiện');
for(let i=0;i<80;i++){await p.waitForTimeout(150);if(await p.evaluate(()=>!!xeOrd()))break}
await p.evaluate(()=>{const t=xeOrd(),k=Object.keys(D.start)[0];t.c.o={bs:[k],n:{[k]:3},ss:[D.sauces[0]]};t.c.max=t.c.p=999});
const bb=await (await p.$('#xe')).boundingBox(),s=bb.width/160;const R=async f=>p.evaluate(f=>XR.filter(r=>String(r.f).includes(f)).map(r=>({x:r.x,y:r.y,w:r.w,h:r.h})),f);
const tap=async r=>{await p.touchscreen.tap(bb.x+(r.x+r.w/2)*s,bb.y+(r.y+r.h/2)*s);await p.waitForTimeout(60)};
const tr=(await R('xeTray'))[0];for(let i=0;i<3;i++)await tap(tr);
ok(await p.evaluate(()=>xs().fq.length===1&&xs().fq[0].v.length===3),'chạm khay 3 lần: que đủ và đúng tự vào chảo');
for(let i=0;i<60;i++){await p.waitForTimeout(100);if(await p.evaluate(()=>xs().fq[0]&&xs().fq[0].c>=FRY_MIN))break}
await tap((await R('xeFry(null)'))[0]);ok(await p.evaluate(()=>xs().tray.length===1),'que vàng: chạm chảo vớt ra khay');
const sa=(await R('xeSauce'))[0],kh=await p.evaluate(()=>XG.k);const P=r=>[bb.x+(r.x+r.w/2)*s,bb.y+(r.y+r.h/2)*s];const [x0,y0]=P(sa),[x1,y1]=P(kh);
await p.mouse.move(x0,y0);await p.mouse.down();for(let i=1;i<=14;i++){await p.mouse.move(x0+(x1-x0)*i/14+(i%2?-10:10),y0+(y1-y0)*i/14);await p.waitForTimeout(16)}await p.mouse.up();
ok(await p.evaluate(()=>xs().sauce.length===1&&xs().spray.length===1),'kéo chai sốt: xịt lên khay theo tay');
const m0=await p.evaluate(()=>S.money);await tap((await R('xeServe'))[0]);await p.waitForTimeout(200);
ok(await p.evaluate(m0=>D.served===1&&S.money>m0&&!xs().tray.length,m0),'GIAO: khách trả tiền, que rời khay');
await p.screenshot({path:`out/v2_sell_${W}.png`});
// bot bán nốt
let stops=0;for(let i=0;i<900;i++){const r=await p.evaluate(()=>{if(!D)return'end';if(!$('#stopOv').hidden){$('#goNext').click();return'stop'}
  const t=xeOrd(),X=xs();if(t){const o=t.o;for(const k of o.bs){const need=xN(o,k)-xeHave(k)-xeIn(k);for(let j=0;j<need;j++){if(X.hand.length>=5)xeDip();xeTray(k)}}if(X.hand.length)xeDip();
  if(X.fq.some(f=>f.c>=1))xeFry(X.fq.findIndex(f=>f.c>=1));for(const s of o.ss)if(!X.sauce.includes(s))xeSauce(s);xeServe()}return''});if(r==='stop')stops++;if(r==='end')break;await p.waitForTimeout(100)}
ok(stops===3,'bán xong mỗi điểm: thẻ kết thúc điểm, đẩy xe sang điểm kế, điểm cuối về nhà');
ok(await p.evaluate(()=>!$('#sum').hidden&&S.day===2&&S.hist.length===1&&S.hist[0].served>=3),'tổng kết ngày 1, sang ngày 2');
await p.screenshot({path:`out/v2_sum_${W}.png`});
await p.tap('#nextBtn');await p.waitForTimeout(200);ok(await p.evaluate(()=>!$('#route').hidden&&S.mk.day===2),'ngày 2: chọn lộ trình mới, giá chợ mới');
ok(!errs.length,'không lỗi JS'+(errs.length?': '+errs.join(' | '):''));await ctx.close()}
await b.close();console.log(fails?fails+' FAILED':'ALL PASSED')})();
