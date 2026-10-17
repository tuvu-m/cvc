// nạp trước mọi test giao diện: thêm cờ cho Chrome (PW_ARGS, cách nhau bằng dấu cách);
// không có Chrome cài sẵn (máy chủ đám mây) thì đặt PW_EXE là đường dẫn Chromium, test sẽ dùng nó thay cho channel:'chrome'
const pw=require('playwright-core');const extra=(process.env.PW_ARGS||'').split(' ').filter(Boolean);
const orig=pw.chromium.launch.bind(pw.chromium);pw.chromium.launch=async(o={})=>{o={...o,args:[...(o.args||[]),...extra]};if(process.env.PW_EXE){delete o.channel;o.executablePath=process.env.PW_EXE}const b=await orig(o);
  /* test giao diện cũ (màn quán/màn pha) chạy với cờ PW_OLDUI; test của xe bán mới đặt process.env.PW_NEWUI=1 */
  const old=x=>process.env.PW_NEWUI?x:x.addInitScript('window.PW_OLDUI=1').then(()=>x);
  const nc=b.newContext.bind(b),np=b.newPage.bind(b);b.newContext=(...a)=>nc(...a).then(old);b.newPage=(...a)=>np(...a).then(old);return b};
