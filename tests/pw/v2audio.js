// Bản mới v2: âm thanh và nhạc chạy (qua http như GitHub Pages), AudioContext "chết" thì lần chạm sau tạo lại, ẩn/hiện trang, chống phóng to
process.env.PW_NEWUI=1;
const { chromium } = require('playwright-core');const path=require('path'),http=require('http'),fs=require('fs');
let fails=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++};
const ROOT=path.dirname(process.argv[2]);const TY={'.html':'text/html','.js':'text/javascript','.mp3':'audio/mpeg','.mp4':'audio/mp4','.css':'text/css'};
/* Chromium headless không giải mã được AAC (.mp4) nên nhạc trả tạm một tệp mp3 ngắn; điện thoại và Chrome thật giải mã được */
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.startsWith('/nhac/'))u='/sfx/win.mp3';const f=path.join(ROOT,u);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':TY[path.extname(f)]||'application/octet-stream'});r.end(d)})});
(async()=>{await new Promise(o=>srv.listen(0,o));const url=`http://127.0.0.1:${srv.address().port}/v2/index.html`;
const b=await chromium.launch({channel:'chrome',headless:true});
const ctx=await b.newContext({viewport:{width:390,height:780},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(url);await p.waitForTimeout(400);
ok(await p.evaluate(()=>/user-scalable=no/.test(document.querySelector('meta[name=viewport]').content)&&document.doctype),'viewport chặn phóng to, có doctype');
ok(await p.evaluate(()=>!AC),'chưa chạm thì chưa tạo âm thanh');
await p.tap('h2');await p.waitForTimeout(300);
ok(await p.evaluate(()=>!!AC&&AC.state==='running'),'chạm: âm thanh chạy');
let mus=false;for(let i=0;i<40;i++){await p.waitForTimeout(250);if(await p.evaluate(()=>!!MUS.rs&&MUS.on)){mus=true;break}}ok(mus,'nhạc nền phát (nạp vào Web Audio)');
let sf=false;for(let i=0;i<20;i++){await p.waitForTimeout(200);if(await p.evaluate(()=>Object.keys(SBUF).length===Object.keys(SFX).length)){sf=true;break}}ok(sf,'nạp đủ tiếng hiệu ứng');
/* AudioContext chết (iPhone sau khi khoá máy): lần chạm thật kế tiếp tạo lại và nhạc phát lại */
const old=await p.evaluate(async()=>{await AC.suspend();window.__oldAC=AC;MUS.dead=1;return AC.state});
await p.tap('h2');let back=false;for(let i=0;i<40;i++){await p.waitForTimeout(250);if(await p.evaluate(()=>AC!==window.__oldAC&&AC.state==='running'&&!!MUS.rs)){back=true;break}}
ok(old==='suspended'&&back,'âm thanh chết: chạm lại thì tạo AudioContext mới, nhạc phát lại');
await p.evaluate(()=>music(false));ok(await p.evaluate(()=>!MUS.on&&!MUS.rs&&localStorage.getItem('cv2_mus')==='0'),'tắt nhạc: dừng và nhớ');
await p.tap('h2');await p.waitForTimeout(300);ok(await p.evaluate(()=>!MUS.on),'đã tắt nhạc thì chạm không bật lại');
await p.evaluate(()=>music(true));await p.waitForTimeout(1500);ok(await p.evaluate(()=>MUS.on),'bật nhạc lại');
/* chống phóng to */
const z=await p.evaluate(()=>{const g=new Event('gesturestart',{cancelable:true});document.dispatchEvent(g);const d=new Event('dblclick',{cancelable:true,bubbles:true});document.body.dispatchEvent(d);return g.defaultPrevented&&d.defaultPrevented});ok(z,'chặn cử chỉ phóng to và chạm đúp');
const tz=await p.evaluate(()=>[...document.querySelectorAll('*')].filter(e=>e.offsetParent).every(e=>{const t=getComputedStyle(e).touchAction;return t==='manipulation'||t==='none'||t==='pan-x'||t==='pan-y'}));ok(tz,'mọi phần tử chặn chạm hai lần phóng to (touch-action)');
await p.tap('h2');await p.tap('h2');await p.waitForTimeout(200);ok(await p.evaluate(()=>visualViewport.scale===1),'chạm đúp không phóng to');
ok(!errs.length,'không lỗi JS'+(errs.length?': '+errs.join(' | '):''));
await b.close();srv.close();console.log(fails?fails+' FAILED':'ALL PASSED')})();
