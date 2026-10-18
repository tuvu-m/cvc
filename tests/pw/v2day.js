// Bản mới v2: chọn lộ trình → thực đơn (tự xiên món mới) → chợ (Gợi ý) → bán: khách gọi món theo thực đơn, chạm món thả que vào chảo, vớt, kéo chai xịt sốt, GIAO; bot bán nốt; tổng kết, sang ngày 2
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
ok(await p.evaluate(()=>!$('#menu').hidden&&document.querySelectorAll('.mrow.menu').length===3&&!!$('.addm')),'thực đơn: 3 món có sẵn, còn chỗ thêm (tối đa 6)');
await p.tap('.addm');await p.waitForTimeout(300);
ok(await p.evaluate(()=>!$('#edOv').hidden&&$('#edOk').disabled),'thêm món: mở khung xiên, chưa đủ 5 viên thì chưa lưu');
{const bb=await (await p.$('#pc')).boundingBox(),s=bb.width/160;const R=await p.evaluate(()=>PR.map(r=>({x:r.x,y:r.y,w:r.w,h:r.h})));const P=r=>[bb.x+(r.x+r.w/2)*s,bb.y+(r.y+r.h/2)*s];
 const k0=await p.evaluate(()=>edItems().indexOf('xucxich')),k1=await p.evaluate(()=>edItems().indexOf('cavien'));
 for(const k of [k0,k0,k1,k1]){const [x,y]=P(R[k]);await p.touchscreen.tap(x,y);await p.waitForTimeout(60)}
 ok(await p.evaluate(()=>E.v.join()==='xucxich,xucxich,cavien,cavien'),'chạm tô viên: mỗi chạm xiên một viên lên que');
 const [qx,qy]=[bb.x+80*s,bb.y+20*s];await p.touchscreen.tap(qx,qy);await p.waitForTimeout(60);ok(await p.evaluate(()=>E.v.length===3),'chạm que: gỡ viên cuối');
 const [x1,y1]=P(R[k1]);await p.mouse.move(x1,y1);await p.mouse.down();await p.waitForTimeout(800);await p.mouse.up();
 ok(await p.evaluate(()=>E.v.length===5&&!$('#edOk').disabled),'giữ ngón trên tô: xiên liền, đủ 5 viên thì lưu được');
 await p.screenshot({path:`out/v2_edit_${W}.png`})}
await p.tap('#edOk');await p.waitForTimeout(200);
ok(await p.evaluate(()=>S.menu.length===4&&S.menu[3].v.join()==='xucxich,xucxich,cavien,cavien,cavien'&&mName(S.menu[3])==='Xúc + Cá'),'lưu món mới vào thực đơn (tên tự đặt "Xúc + Cá")');
await p.screenshot({path:`out/v2_menu_${W}.png`});
ok(await p.evaluate(()=>{edOpen(-1);E.v=Array(5).fill('cavien');edHead();$('#edOk').click();const r=S.menu.length===4&&!$('#edOv').hidden;edClose();return r}),'thực đơn không cho hai món giống hệt nhau');
ok(await p.evaluate(()=>[0,.5,1,1.3,1.7].every(c=>Object.keys(ITEMS).every(k=>{const [r,g,b]=hx(cookCol(k,c));return r>=g&&g>=b-40&&r>60}))),'màu đồ chiên theo độ chín luôn vàng nâu (không đen/xanh)');
await p.tap('#toMarket');await p.waitForTimeout(200);
ok(await p.evaluate(()=>!$('#market').hidden&&$('#mGo').disabled),'chợ: chưa mua gì thì chưa lên đường được');
await p.tap('#mAuto');await p.waitForTimeout(200);
const plan=await p.evaluate(()=>({u:bagUse(),c:buyCost(),m:S.money,cap:L0().bags,ks:Object.keys(S.buy).filter(k=>ITEMS[k])}));
ok(plan.u>=3&&plan.u<=plan.cap&&plan.c<=plan.m,'gợi ý: mua nguyên liệu cho thực đơn trong sức chở và số tiền');
await p.tap('#mGo');await p.waitForTimeout(300);
ok(await p.evaluate(()=>!$('#sell').hidden&&$('#hud').hidden&&$('#xeWrap').offsetHeight>180),'lên đường: màn bán, khung xe hiện');
for(let i=0;i<80;i++){await p.waitForTimeout(150);if(await p.evaluate(()=>!!xeOrd()))break}
const mi=await p.evaluate(()=>{const t=xeOrd(),i=S.menu.findIndex((m,i)=>mMake(i)>=2);t.c.o={bs:[i],q:{[i]:2},ss:[D.sauces[0]]};t.c.max=t.c.p=999;return i});
const bb=await (await p.$('#xe')).boundingBox(),s=bb.width/160;const R=async f=>p.evaluate(f=>XR.filter(r=>String(r.f).includes(f)).map(r=>({x:r.x,y:r.y,w:r.w,h:r.h})),f);
const tap=async r=>{await p.touchscreen.tap(bb.x+(r.x+r.w/2)*s,bb.y+(r.y+r.h/2)*s);await p.waitForTimeout(60)};
const tr=(await R('xeTray'))[mi],st0=await p.evaluate(mi=>S.menu[mi].v.map(k=>D.stock[k]),mi);await tap(tr);await tap(tr);
ok(await p.evaluate(([mi,st0])=>xs().fq.length===2&&xs().fq.every(f=>f.m===mi&&f.v.length===5)&&mCount(S.menu[mi])&&Object.entries(mCount(S.menu[mi])).every(([k,n])=>D.stock[k]===st0[S.menu[mi].v.indexOf(k)]-2*n),[mi,st0]),'chạm món: mỗi chạm một que 5 viên vào chảo, trừ nguyên liệu theo món');
for(let i=0;i<60;i++){await p.waitForTimeout(100);if(await p.evaluate(()=>xs().fq.every(f=>f.c>=FRY_MIN)))break}
await tap((await R('function xeFry'))[0]);ok(await p.evaluate(()=>xs().tray.length===2),'que vàng: chạm chảo vớt ra khay');
const sa=(await R('xeSauce'))[0],kh=await p.evaluate(()=>XG.k);const P=r=>[bb.x+(r.x+r.w/2)*s,bb.y+(r.y+r.h/2)*s];const [x0,y0]=P(sa),[x1,y1]=P(kh);
await p.mouse.move(x0,y0);await p.mouse.down();for(let i=1;i<=14;i++){await p.mouse.move(x0+(x1-x0)*i/14+(i%2?-10:10),y0+(y1-y0)*i/14);await p.waitForTimeout(16)}await p.mouse.up();
ok(await p.evaluate(()=>xs().sauce.length===1&&xs().spray.length===1),'kéo chai sốt: xịt lên khay theo tay');
const m0=await p.evaluate(()=>S.money);await tap((await R('xeServe'))[0]);await p.waitForTimeout(200);
ok(await p.evaluate(m0=>D.served===1&&S.money>m0&&!xs().tray.length,m0),'GIAO: khách trả tiền, que rời khay');
await p.screenshot({path:`out/v2_sell_${W}.png`});
let stops=0,shot=0,rs=null;for(let i=0;i<900;i++){const r=await p.evaluate(()=>{if(!D)return'end';if(!$('#stopOv').hidden){if(!window.__rs){const b=document.querySelector('[data-rs]:not([disabled])');if(b){const k=b.dataset.rs,n=D.stock[k]||0,m=S.money;b.click();window.__rs=D.stock[k]===n+BAG&&S.money<m}else window.__rs='none'}$('#goNext').click();return'stop'}
  const t=xeOrd(),X=xs();if(t){const o=t.o;for(const k of o.bs){const need=qN(o,k)-xeHave(k)-xeIn(k);for(let j=0;j<need;j++)xeTray(k)}
  if(X.fq.some(f=>f.c>=1))xeFry(0);for(const s of o.ss)if(!X.sauce.includes(s))xeSauce(s);xeServe()}return queue().length});
  if(r==='stop')stops++;if(r==='end')break;if(!shot&&r>=3){shot=1;await p.screenshot({path:`out/v2_busy_${W}.png`})}await p.waitForTimeout(100)}
ok(await p.evaluate(()=>window.__rs===true),'giữa hai buổi: mua thêm một bịch viên đang thiếu');
ok(stops===3,'bán xong mỗi điểm: thẻ kết thúc điểm, đẩy xe sang điểm kế, điểm cuối về nhà');
{const r=await p.evaluate(()=>({sum:!$('#sum').hidden,day:S.day,h:S.hist.length,sv:S.hist[0]&&S.hist[0].served}));ok(r.sum&&r.day===2&&r.h===1&&r.sv>=5,'tổng kết ngày 1, sang ngày 2 '+JSON.stringify(r))}
await p.screenshot({path:`out/v2_sum_${W}.png`});
await p.tap('#nextBtn');await p.waitForTimeout(200);ok(await p.evaluate(()=>!$('#route').hidden&&S.mk.day===2),'ngày 2: chọn lộ trình mới, giá chợ mới');
ok(!errs.length,'không lỗi JS'+(errs.length?': '+errs.join(' | '):''));await ctx.close()}
await b.close();console.log(fails?fails+' FAILED':'ALL PASSED')})();
