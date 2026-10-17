// nạp trước mọi test giao diện: thêm cờ cho Chrome (PW_ARGS, cách nhau bằng dấu cách);
// không có Chrome cài sẵn (máy chủ đám mây) thì đặt PW_EXE là đường dẫn Chromium, test sẽ dùng nó thay cho channel:'chrome'
const pw=require('playwright-core');const extra=(process.env.PW_ARGS||'').split(' ').filter(Boolean);
const orig=pw.chromium.launch.bind(pw.chromium);pw.chromium.launch=(o={})=>{o={...o,args:[...(o.args||[]),...extra]};if(process.env.PW_EXE){delete o.channel;o.executablePath=process.env.PW_EXE}return orig(o)};
