// Đồ siêu hiếm: phiếu có bước rắc (chạm được), rắc xong ly lấp lánh; ảnh 6 loại đồ trên ly
const L=require('./a2lib');let fails=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await L.chromium.launch({channel:'chrome',headless:true});const {page:p}=await L.open(b,375,667);
 await p.evaluate(()=>{document.body.classList.remove('help');S.notice=[];S.day=12;S.money=5e6;['cavien','bovien'].forEach(k=>S.stock[k]=[{q:99,e:99}]);syncBasics();S.recipes.forEach(r=>r.on=false);
  Object.assign(itemRec('cavien'),{on:true,gem:1});S.gems=[{id:1,k:'lavang'}];syncLayout();renderPrep()});
 await p.click('#openBtn');await p.waitForTimeout(600);
 await p.evaluate(()=>{D.next=1e9;D.evPlan=[];D.queue=[];spawn('thuong');const c=D.queue[0];const r=itemRec('cavien');c.items=[Object.assign(makeOrder(r),{bs:['cavien'],n:{cavien:2},ss:[],fs:[],xf:null,fam:null})];c.items[0].ts=[];c.o=c.items[0];c.price=priceOf(c.o);c.p=c.max=999;renderTicket()});
 await p.waitForTimeout(2500);const nb=await p.$('.nextBtn:not([disabled])');await nb.click();await p.waitForTimeout(800);
 const o=await p.evaluate(()=>{const c=target();return c.items[c.cur]});ok(o.gem==='lavang','đơn của khách có Lá vàng');
 await L.tap(p,'cavien');await L.tap(p,'cavien');await p.waitForFunction(()=>cup.fry.every(f=>f.c>=1),null,{timeout:8000});await L.tap(p,'chao');
 await p.evaluate(()=>{const it=target().items[0];cup.sugar=it.sugar?SUGAR[it.sugar]:0;cup.ice=it.ice?ICE[it.ice][1]:0;renderTicket();renderOrd()});await p.waitForTimeout(300);
 const pill=await p.$('#ordp [data-gemput]');ok(!!pill,'phiếu order có nút "🌟 Lá vàng 24K"');await p.screenshot({path:'gem0.png'});
 await pill.tap();await p.waitForTimeout(400);ok(await p.evaluate(()=>cup.gem==='lavang'&&/Đủ rồi/.test(document.querySelector('#ordp').textContent)),'chạm: rắc lên ly, phiếu báo ✓ Đủ rồi');
 await p.screenshot({path:'gem1.png'});
 // ảnh 6 loại đồ trên ly (vẽ bằng code)
 await p.evaluate(()=>{const box=document.createElement('div');box.id='gemrow';box.style.cssText='position:fixed;left:0;top:0;right:0;background:#fff;z-index:9999;display:flex;flex-wrap:wrap;gap:4px;padding:6px';Object.keys(GEMS).forEach(k=>{const im=new Image();im.src=drinkPic(['cavien','bovien'],[],[],'L',[],k);im.style.width='60px';box.appendChild(im)});document.body.appendChild(box)});
 await p.waitForTimeout(400);const gr=await p.$('#gemrow');await gr.screenshot({path:'gem_all.png'});
 await p.evaluate(()=>{document.getElementById('gemrow').remove()});
 // ly lớn trên màn pha với từng loại đồ (chưa đóng nắp)
 const shots=[];for(const k of ['kimtuyen','tobiko','lavang','cahoi','truffle','caviar']){await p.evaluate(k=>{cup.gem=k;target().items[0].gem=k},k);await p.waitForTimeout(250);const st=await p.$('#stg');await st.screenshot({path:'gemcup_'+k+'.png'});shots.push(k)}
 // tab Kho có đồ ở chợ, khung đặt giá có nút gắn
 await p.evaluate(()=>{D=null;cup=null;S.mkt={k:'truffle',d:S.day};S.gems.push({id:2,k:'kimtuyen'});itemRec('cavien').gem=null;tab='menu';renderPrep()});await p.waitForTimeout(400);
 const km=await p.$('.kmkt');ok(!!km&&/Nấm truffle/.test(await km.textContent()),'tab Kho: thẻ chợ có Nấm truffle');await km.screenshot({path:'gem_kho.png'});
 await p.evaluate(()=>{tab='thucdon';menuSel=itemRec('cavien').id;renderPrep()});await p.waitForTimeout(400);
 const gr2=await p.$('.gemrow');ok(!!gr2&&(await gr2.$$('img.gemi')).length>=2,'khung đặt giá: nút gắn đồ có hình');if(gr2){await gr2.scrollIntoViewIfNeeded();const card=await p.$('.rcard');await card.screenshot({path:'gem_card.png'})}
 {const E=p.errs.filter(e=>!/CORS|ERR_FAILED/.test(e));ok(!E.length,'không lỗi JS '+E.join('|'))}await b.close();console.log(fails?fails+' FAILED':'ALL PASSED')})();
