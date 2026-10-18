// Mô phỏng v2 nhiều ngày bằng bot trong trình duyệt (chạy tick trực tiếp, không vẽ): node sim/v2sim.js <số ngày> [tay chậm giây/thao tác]
process.env.PW_NEWUI=1;
const { chromium } = require('playwright-core');const { pathToFileURL } = require('url');const path=require('path');
const DAYS=+process.argv[2]||60,ACT=+process.argv[3]||.7;
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage({viewport:{width:390,height:780}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(pathToFileURL(path.join(__dirname,'../../v2/index.html')).href);await p.waitForTimeout(400);
await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(400);
for(let d=0;d<DAYS;d++){const r=await p.evaluate((ACT)=>{
  stopLoop();
  /* sáng: thuê, nâng cấp, trang trí */
  morning();
  if(S.cands.length&&S.staff.length<L0().staff){const c=S.cands.sort((a,b)=>(b.spd+b.kheo+b.duyen)-(a.spd+a.kheo+a.duyen))[0];if(S.money>c.wage*8){S.staff.push(c);S.cands=S.cands.filter(x=>x!==c)}}
  const nx=LV[S.lv+1];if(nx&&S.money>=nx.price*1.15){if(nx.quan&&!S.quan)S.quan=locsOpen().sort((a,b)=>rep(b)-rep(a))[0];S.money-=nx.price;S.lv++;S.mk.day=-1;morning()}
  for(const x of DECOR)if(!S.decor.includes(x.k)&&S.money>x.p*4){S.money-=x.p;S.decor.push(x.k)}
  if(L0().chain)for(const l of Object.keys(LOCS))if(l!==S.quan&&!S.branches.includes(l)&&S.money>BRANCH_PRICE*1.5){S.money-=BRANCH_PRICE;S.branches.push(l)}
  if(!L0().quan){const sc=r=>r.reduce((a,l,i)=>a+expect(l,SLOTS[i].id),0);S.route=S.routes.sort((a,b)=>sc(b)-sc(a))[0]}
  /* thực đơn: thêm que một loại cho các món khách thích nhất trên lộ trình tới đủ chỗ */
  const rt=routeTypes(),sc={};for(const t in rt)for(const k in TYPES[t].like)if(!ITEMS[k].rare)sc[k]=(sc[k]||0)+rt[t]*TYPES[t].like[k];
  const ks=Object.keys(sc).sort((a,b)=>sc[b]-sc[a]);S.menu=[];for(const k of ks){if(S.menu.length>=L0().menu)break;S.menu.push({v:Array(5).fill(k)})}
  for(let i=0;S.menu.length<L0().menu&&i<ks.length-1;i++)S.menu.push({v:[ks[i],ks[i],ks[i],ks[i+1],ks[i+1]]});
  autoBuy();const m0=S.money;$('#mGo').click();stopLoop();if(!D)return{err:'nostart',money:S.money};
  let act=0,guard=0;
  while(D&&guard++<20000){if(!$('#stopOv').hidden){$('#goNext').click();stopLoop();continue}
    if(D){window.__D0={angry:D.angry,full:D.full,avg:+(D.stars.reduce((a,b)=>a+b,0)/Math.max(1,D.stars.length)).toFixed(2)}}
    now+=.1;tick(.1);if(!D)break;act-=.1;if(act>0)continue;
    const t=xeOrd(),X=xs();if(!t){if(X.fq.some(f=>f.c>=1&&!f.by)){xeFry();act=ACT}continue}
    const o=t.o;let did=false;
    if(X.fq.some(f=>f.c>=1&&!f.by)){xeFry();did=true}
    else{for(const k of o.bs){const need=qN(o,k)-xeHave(k)-xeIn(k);if(need>0&&xeTray(k)){did=true;break}}
      if(!did){const s=o.ss.find(s=>!X.sauce.includes(s));if(s){xeSauce(s);did=true}else if(o.bs.every(k=>xeHave(k)>=qN(o,k))){xeServe();did=true}}}
    if(did)act=ACT}
  const h=S.hist[S.hist.length-1];const D0=window.__D0||{};return{day:h.day,lv:S.lv,money:S.money,net:h.net,served:h.served,angry:D0.angry,full:D0.full,avg:D0.avg,miss:Object.values(h.miss).reduce((a,b)=>a+b,0),rate:+rating().toFixed(2),staff:S.staff.length,regs:S.regs.length,rv:S.reviews.length,ach:Object.keys(S.coll.ach).length}},ACT);
  console.log(JSON.stringify(r));if(r.err)break}
console.log(errs.length?'ERR '+errs.slice(0,3).join(' | '):'no errors');await b.close()})();
