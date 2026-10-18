// Bản mới v2: hub (nhân viên, đánh giá + khách quen bênh review chê, khách quen, sưu tập, trang trí), lên cấp quán chọn khu, bán ở quán có nhân viên phụ chảo; nhiều cỡ màn
process.env.PW_NEWUI=1;
const { chromium } = require('playwright-core');const { pathToFileURL } = require('url');const path=require('path');
let fails=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++};
const V2=path.join(path.dirname(process.argv[2]),'v2','index.html');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});
for(const [W,H] of [[360,640],[390,780],[430,932]]){
const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(pathToFileURL(V2).href+'?speed=8');await p.waitForTimeout(400);
await p.evaluate(()=>{S.day=5;S.money=30e6;S.mk=null;const mkR=(i,t)=>({id:'r'+i,name:'Anh '+i,nick:NICK.adj[i%NICK.adj.length],type:t,spr:TYPES[t].spr[0],home:'truong',fav:['cavien','cavien','cavien','cavien','cavien'],visits:3+i,love:2+i,day:1});
  S.regs=[mkR(1,'hocsinh'),mkR(2,'vanphong'),mkR(3,'taixe')];
  S.reviews=[{id:'v1',day:4,name:'Chị Lan',spr:'kt3',type:'vanphong',s:1,t:'Chờ lâu quá trời.',w:1,loc:'truong'},{id:'v2',day:4,name:'Bé Na',spr:'kt1',type:'hocsinh',s:5,t:'Ngon xỉu!',w:1,loc:'truong'},{id:'v3',day:4,name:'Chú Ba',spr:'kt7',type:'taixe',s:2,t:'Cháy khét.',w:1,loc:'truong'}];
  save();renderRoute()});
await p.waitForTimeout(200);
ok(await p.evaluate(()=>document.querySelectorAll('#routeBody [data-hub]').length===5),`${W}×${H}: màn sáng có 5 nút hub`);
const small=await p.evaluate(()=>[...document.querySelectorAll('#routeBody button')].filter(b=>b.offsetParent&&(b.offsetHeight<34||b.offsetWidth<34)).map(b=>b.textContent));ok(!small.length,'nút đủ to để chạm (≥34px)'+(small.length?': '+small.join(','):''));
const over=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth||[...document.querySelectorAll('.scr:not([hidden]) .body')].some(e=>e.scrollWidth>e.clientWidth+1));ok(!over,'không tràn ngang');
await p.screenshot({path:`out/v2h_route_${W}.png`});
await p.tap('[data-hub="staff"]');await p.waitForTimeout(150);
ok(await p.evaluate(()=>!$('#hub').hidden&&S.cands.length===3&&document.querySelectorAll('[data-hire]').length===3),'hub nhân viên: 3 ứng viên từ ngày 3');
await p.screenshot({path:`out/v2h_staff_${W}.png`});
await p.tap('[data-hire]');await p.waitForTimeout(100);ok(await p.evaluate(()=>S.staff.length===1&&!document.querySelectorAll('[data-hire]').length),'thuê: đủ chỗ (xe đẩy 1 người) thì hết ứng viên');
await p.tap('[data-hubt="rv"]');await p.waitForTimeout(100);
ok(await p.evaluate(()=>document.querySelectorAll('.rv').length===3&&document.querySelectorAll('[data-fight]').length===2),'đánh giá: review chê có nút ⚔️');
await p.screenshot({path:`out/v2h_rv_${W}.png`});
await p.tap('[data-fight="v1"]');await p.waitForTimeout(100);ok(await p.evaluate(()=>!$('#fightOv').hidden&&document.querySelectorAll('[data-fr]').length===3),'⚔️: chọn khách quen ra bênh');
await p.screenshot({path:`out/v2h_fight_${W}.png`});
await p.tap('[data-fr]');await p.waitForTimeout(100);ok(await p.evaluate(()=>!!S.reviews[0].def&&S.reviews[0].fought&&!!$('#fightX')),'bênh xong: có kết quả thắng/thua');
await p.screenshot({path:`out/v2h_fight2_${W}.png`});
await p.tap('#fightX');await p.waitForTimeout(100);
await p.tap('[data-rp="v3"][data-k="sorry"]');await p.waitForTimeout(100);ok(await p.evaluate(()=>!!S.reviews[2].rep&&!!document.querySelector('.rep')),'trả lời review (xin lỗi)');
await p.tap('[data-rvf="5"]');await p.waitForTimeout(100);ok(await p.evaluate(()=>document.querySelectorAll('.rv').length===1),'lọc 5★');
await p.tap('[data-hubt="reg"]');await p.waitForTimeout(100);ok(await p.evaluate(()=>document.querySelectorAll('#hubBody .srow').length===3),'khách quen: 3 người');
await p.tap('[data-hubt="coll"]');await p.waitForTimeout(100);ok(await p.evaluate(()=>document.querySelectorAll('.cset').length===7),'sưu tập: 7 bộ');
await p.tap('[data-cs="recipe"]');await p.waitForTimeout(100);ok(await p.evaluate(()=>document.querySelectorAll('.cl span').length===12),'mở bộ que bí truyền: 12 món (gợi ý ❔)');
await p.screenshot({path:`out/v2h_coll_${W}.png`});
await p.tap('[data-hubt="decor"]');await p.waitForTimeout(100);await p.tap('[data-buyd="c_senda"]');await p.waitForTimeout(100);
ok(await p.evaluate(()=>S.decor.includes('c_senda')&&perk('❤️')>0),'mua trang trí: có lợi ích');
await p.screenshot({path:`out/v2h_decor_${W}.png`});
await p.tap('#hubBack');await p.waitForTimeout(100);ok(await p.evaluate(()=>!$('#route').hidden),'← về màn sáng');
/* lên cấp tới quán: chọn khu */
await p.evaluate(()=>{S.lv=3;S.money=40e6;S.mk.day=-1;save();renderRoute()});await p.waitForTimeout(100);
ok(await p.evaluate(()=>document.querySelectorAll('.stop').length===8),'xe máy kéo: 4 điểm mỗi lộ trình (có khuya)');
await p.evaluate(()=>lvUp());await p.waitForTimeout(100);ok(await p.evaluate(()=>!$('#pickOv').hidden&&document.querySelectorAll('[data-pq]').length>=5),'lên quán: chọn khu mở quán');
await p.screenshot({path:`out/v2h_pick_${W}.png`});
await p.tap('[data-pq="vanphong"]');await p.waitForTimeout(100);await p.evaluate(()=>{S.mk.day=-1;renderRoute()});await p.waitForTimeout(100);
ok(await p.evaluate(()=>S.lv===4&&S.quan==='vanphong'&&S.route.every(l=>l==='vanphong')&&!!$('[data-route="q"]')),'quán: mở cửa một chỗ cả ngày');
await p.screenshot({path:`out/v2h_quan_${W}.png`});
await p.evaluate(()=>{S.staff=[genStaff(),genStaff()];S.staff.forEach(s=>s.spd=5)});
await p.tap('[data-route="q"]');await p.waitForTimeout(100);await p.tap('#toMarket');await p.waitForTimeout(100);await p.tap('#mAuto');await p.waitForTimeout(100);await p.tap('#mGo');await p.waitForTimeout(300);
let sawStaff=false;for(let i=0;i<120;i++){await p.waitForTimeout(100);if(await p.evaluate(()=>xs().fq.some(f=>f.by)||xs().tray.length>0)){sawStaff=true;break}}
ok(sawStaff,'nhân viên tự lấy que nhúng chảo cho khách đang chờ');
await p.screenshot({path:`out/v2h_sellquan_${W}.png`});
const xeOk=await p.evaluate(()=>{const b=$('#xe').getBoundingClientRect();return XR.every(r=>r.x>=0&&r.x+r.w<=160.5&&r.y>=0&&r.y+r.h<=XEC.LH+.5)&&b.bottom<=innerHeight+1});ok(xeOk,'mọi vùng chạm trên xe nằm trong khung'+(xeOk?'':' '+JSON.stringify(await p.evaluate(()=>({H:XEC.LH,bad:XR.filter(r=>!(r.x>=0&&r.x+r.w<=160.5&&r.y>=0&&r.y+r.h<=XEC.LH+.5)).map(r=>[r.x,r.y,r.w,r.h].map(v=>+v.toFixed(1))),bot:$('#xe').getBoundingClientRect().bottom,ih:innerHeight})))));
const tr=await p.evaluate(()=>{const s=$('#xe').getBoundingClientRect().width/160;return Math.min(...XR.filter(r=>r.hold).map(r=>Math.min(r.w,r.h)*s))});ok(tr>=36,`khay món ≥36px (${tr.toFixed(0)}px) với ${await p.evaluate(()=>S.menu.length)} món`);
ok(!errs.length,'không lỗi JS'+(errs.length?': '+errs.join(' | '):''));await ctx.close()}
await b.close();console.log(fails?fails+' FAILED':'ALL PASSED')})();
