'use strict';
/* Dữ liệu và câu chữ của Cá Viên Chiên Bé Ba v2. Phần chạy nằm ở game.js. */

/* ===================== đồ chiên, sốt ===================== */
/* c giá vốn mỗi viên, ck giây chiên tới vàng (trong game nhân 1,5), col màu sống; rare là hàng nhập, chỉ có ở chợ vài ngày */
const ITEMS={
  cavien:{n:'Cá viên',col:'#f1d9a2',c:1000,ck:3.2},
  bovien:{n:'Bò viên',col:'#9a6a4e',c:1500,ck:3.6},
  tomvien:{n:'Tôm viên',col:'#f3a88e',c:1800,ck:3},
  mucvien:{n:'Mực viên',col:'#e6e2ef',c:1800,ck:3},
  xucxich:{n:'Xúc xích',col:'#d65a48',c:2500,ck:3.4},
  dauhu:{n:'Đậu hũ PM',col:'#f6e3a6',c:2000,ck:2.6},
  chaca:{n:'Chả cá',col:'#e6c08a',c:1500,ck:3.8},
  khoailang:{n:'Khoai lang',col:'#f0a64c',c:1000,ck:3},
  tomhum:{n:'Tôm hùm',col:'#e8735c',c:4000,ck:3,rare:1},
  kani:{n:'Kani',col:'#f07a5c',c:3500,ck:2.4,rare:1},
  chabusan:{n:'Busan',col:'#efd59c',c:3500,ck:3,rare:1},
  xxduc:{n:'XX Đức',col:'#b9523e',c:4000,ck:3.6,rare:1}
};
const SAUCES={
  s_tuongot:{n:'Tương ớt',col:'#d83a28',c:1500},s_tuongca:{n:'Tương cà',col:'#e2503c',c:1500},s_tuongden:{n:'Tương đen',col:'#5a2c20',c:2000},
  s_me:{n:'Sốt me',col:'#a8642c',c:2000},s_phomai:{n:'Sốt PM',col:'#f4c64a',c:2500},s_mayo:{n:'Mayo',col:'#f6edcc',c:2000},
  s_mutat:{n:'Mù tạt',col:'#e6be22',c:2000},s_sate:{n:'Sa tế',col:'#b8361e',c:2500},s_mattong:{n:'Mật ong',col:'#efae2e',c:2500},
  b_phomai:{n:'Bột PM',col:'#f6d062',c:3500,bot:1},b_ot:{n:'Bột ớt',col:'#e0522c',c:2500,bot:1},b_muoitom:{n:'Muối tôm',col:'#f08c5c',c:3000,bot:1},
  s_gochu:{n:'Gochujang',col:'#c22c2a',c:6000,rare:1},s_kewpie:{n:'Kewpie',col:'#fbf2d4',c:6500,rare:1},s_teri:{n:'Teriyaki',col:'#6a3a1e',c:6000,rare:1},s_sriracha:{n:'Sriracha',col:'#e2402a',c:6000,rare:1}
};
/* một bịch 40 viên (8 que): trước đây 20 viên nên xe đẩy chở 10 bịch chỉ đủ nửa ngày, buổi đầu đã hết hàng */
const BAG=40,CHAI=30,QUE=5;
/* giá bán một que = MARK lần giá vốn 5 viên, nhân hệ số cấp (quán bán đắt hơn) */
const MARK=2.4;

/* ===================== buổi bán, địa điểm ===================== */
const SLOTS=[{id:'trua',n:'Trưa',i:'🕚',h0:11,h1:13},{id:'chieu',n:'Chiều',i:'🕓',h0:16,h1:18},{id:'toi',n:'Tối',i:'🕖',h0:19,h1:21},{id:'khuya',n:'Khuya',i:'🌙',h0:21.5,h1:23}];
const STOP_SEC=80;
/* c: độ đông theo buổi (0..1), mix: tỉ lệ kiểu khách, lv: cấp mở được */
const LOCS={
  truong:{n:'Cổng trường',i:'🏫',c:{trua:.8,chieu:1,toi:.08,khuya:.02},mix:{hocsinh:8,giadinh:2},lv:1},
  cho:{n:'Chợ',i:'🧺',c:{trua:.65,chieu:.8,toi:.15,khuya:.05},mix:{ba:7,giadinh:2,taixe:1},lv:1},
  congvien:{n:'Công viên',i:'🌳',c:{trua:.25,chieu:.75,toi:1,khuya:.45},mix:{giadinh:6,gioitre:2,hocsinh:2},lv:1},
  vanphong:{n:'Văn phòng',i:'🏢',c:{trua:1,chieu:.9,toi:.15,khuya:.05},mix:{vanphong:8,taixe:1},lv:2},
  benxe:{n:'Bến xe',i:'🚌',c:{trua:.4,chieu:.55,toi:.9,khuya:.8},mix:{taixe:6,sinhvien:2,ba:1},lv:2},
  chodem:{n:'Chợ đêm',i:'🏮',c:{trua:.05,chieu:.3,toi:1,khuya:.8},mix:{gioitre:6,sinhvien:2},lv:3},
  ktx:{n:'Ký túc xá',i:'🏠',c:{trua:.3,chieu:.45,toi:.9,khuya:1},mix:{sinhvien:8,gioitre:1},lv:3}
};
const WEATHER={nang:{i:'☀️',m:1},mua:{i:'🌧️',m:.75,park:.4},nong:{i:'🔥',m:1.1}};

/* ===================== cấp: xe → quán → chuỗi ===================== */
/* menu số món, bags số bịch chở được, sauces số chai sốt mang theo, fry số que trong chảo, staff số nhân viên, cost chi mỗi ngày (xăng hoặc thuê mặt bằng),
   base khách đói dự kiến mỗi điểm lúc đông nhất, pm hệ số giá (khách quán sang hơn), stops số buổi bán, quan: bán cố định ở một khu, chain: có chi nhánh */
const LV=[null,
  {n:'Xe đẩy',i:'🛒',spr:'tiem_1',menu:6,bags:12,sauces:2,fry:5,staff:1,cost:10000,base:15,pm:1,stops:3},
  {n:'Ki-ốt lưu động',i:'🛺',spr:'tiem_2',price:4e6,menu:8,bags:16,sauces:3,fry:6,staff:1,cost:20000,base:17,pm:1.1,stops:3},
  {n:'Xe máy kéo',i:'🛵',spr:'xe_maykeo',price:12e6,menu:10,bags:24,sauces:4,fry:7,staff:2,cost:35000,base:18,pm:1.2,stops:4},
  {n:'Quán nhỏ',i:'🏪',spr:'tiem_3',price:40e6,menu:12,bags:36,sauces:5,fry:8,staff:3,cost:250000,base:22,pm:1.5,stops:4,quan:1},
  {n:'Quán hai tầng',i:'🏬',spr:'tiem_4',price:130e6,menu:14,bags:50,sauces:6,fry:10,staff:4,cost:600000,base:26,pm:1.9,stops:4,quan:1},
  {n:'Chuỗi cá viên',i:'🏙️',spr:'tiem_5',price:400e6,menu:16,bags:60,sauces:6,fry:10,staff:5,cost:900000,base:28,pm:2.2,stops:4,quan:1,chain:1}];
/* chi nhánh (cấp chuỗi): mỗi khu một chi nhánh, tự bán, thu tiền mỗi ngày */
const BRANCH_PRICE=180e6,BRANCH_IN=1.6e6;

/* ===================== kiểu khách ===================== */
/* hình, q số que mỗi món, k số món, like độ thích từng viên, sa sốt hay chọn, sp xác suất có sốt, pat kiên nhẫn (giây);
   câu nói: hi mở lời, wait lúc chờ, thx 5★, meh 3–4★, bad 1–2★, miss xe không có món ({k}), quit bỏ về;
   rv giọng review riêng, mixLike thích que thập cẩm, tip xác suất tip khi 5★ */
const TYPES={
  hocsinh:{n:'Học sinh',spr:['kt1','kt4','kt5','kt8','k_hocsinh'],q:[1,2],k:[1,2],like:{cavien:4,xucxich:4,bovien:2,tomvien:2,khoailang:2,dauhu:2},sa:{s_tuongot:4,s_tuongca:3,b_phomai:4,s_mayo:2},sp:.85,pat:32,sens:1,
    hi:['Cô ơi cho con','Bán con','Cô ơi lấy con'],wait:['Lẹ lẹ cô ơi, con trốn học thêm!','Mẹ con sắp tới đón rồi…','Thơm quá trời luôn!','Con đói xỉu luôn á…','Hôm nay con được 10 điểm nè cô!'],
    thx:['Ngon xỉu!','Mai con dẫn cả lớp ra!','Giòn rụm luôn cô!','Cô bán là nhất!'],meh:['Cũng được ạ.','Hơi nguội xíu…'],bad:['Con méc mẹ á!','Huhu cháy rồi…'],
    miss:['Không có {k} hả cô? Con đi ăn bánh tráng…','Tiếc ghê, con thèm {k}…'],quit:['Trễ giờ học rồi, con đi!','Thôi con về, mẹ la!'],
    rv:['cả lớp mê luôn','tiền ăn sáng mẹ cho vừa đủ','ăn xong học bài mới vô','xỉu up xỉu down','cô bán dễ thương lắm']},
  ba:{n:'Các bà, các cô',spr:['kt3','kt_ba','k_batam','kt7'],q:[1,2],k:[1,2],like:{cavien:3,bovien:3,chaca:4,mucvien:2,tomvien:2},sa:{s_tuongot:3,s_tuongden:3,s_me:2},sp:.7,pat:38,sens:1.1,
    hi:['Bán cô','Con ơi lấy bà','Cho cô'],wait:['Từ từ thôi con, cô kể chuyện nè…','Con dâu nhà bên mới mua xe hơi đó!','Rau hôm nay mắc quá trời!','Hồi xưa cá viên có 500 đồng thôi con.'],
    thx:['Ngon nha con, cô giới thiệu cả xóm!','Giòn như hồi xưa!','Được, mai cô ghé.'],meh:['Cũng tạm con.'],bad:['Trời đất, cháy rồi con ơi!'],
    miss:['Không có {k} hả? Thôi cô đi chợ tiếp.','Có {k} là cô mua chục que!'],quit:['Cô còn nấu cơm, thôi về!'],
    rv:['ăn giống hồi xưa','cô giới thiệu cả xóm rồi đó','con bé bán lễ phép','đi chợ về ghé ăn đỡ đói','bà già rồi mà còn ghiền']},
  giadinh:{n:'Gia đình',mixLike:1,spr:['kt6','kt2','kt4','kt5','k_songao'],q:[1,2],k:[1,3],like:{cavien:3,xucxich:3,dauhu:3,khoailang:3,bovien:2,tomvien:2},sa:{s_tuongca:4,s_mayo:3,s_phomai:3,s_tuongot:2},sp:.8,pat:38,sens:1.2,
    hi:['Cho mình','Lấy giùm chị','Bán anh'],wait:['Bé ơi đợi xíu nha!','Bé nhà mình ghiền cá viên lắm.','Ăn xong rồi về ăn cơm nha con!'],
    thx:['Bé thích lắm nè!','Cả nhà khen ngon!','Cuối tuần ghé nữa nha!'],meh:['Cũng được.'],bad:['Bé chê rồi…'],
    miss:['Bé đòi {k} mà không có… thôi về!'],quit:['Bé khóc rồi, thôi về!'],
    rv:['bé nhà mình ăn hết sạch','cả nhà đi dạo ghé ăn','cuối tuần nào cũng ghé','ông xã cũng khen','bé đòi mua thêm']},
  vanphong:{n:'Dân văn phòng',spr:['k_vanphong','k_voi','k_khotinh','kt6'],q:[1,3],k:[1,2],like:{bovien:3,tomvien:3,mucvien:3,xucxich:2,dauhu:2,chaca:2,kani:2,chabusan:2},sa:{s_sate:3,s_mayo:2,s_tuongot:3,s_phomai:2,s_kewpie:2},sp:.85,pat:32,sens:1.5,tip:.3,
    hi:['Cho chị','Lấy anh','Gói giùm anh'],wait:['Sếp gọi rồi, lẹ giùm anh!','Deadline dí sau lưng nè…','Tăng ca mà có cá viên là vui.'],
    thx:['Ổn áp! Mai mua cho cả phòng.','Ngon hơn cơm văn phòng!','Xả stress là đây!'],meh:['Tạm được.'],bad:['Thôi, mai ăn cơm hộp.'],
    miss:['Không có {k}? Chán vậy…'],quit:['Họp rồi, thôi đi!'],
    rv:['xả stress sau giờ làm','mua cho cả phòng ăn chung','deadline dí cũng phải ghé','sếp cũng ghiền','đáng đồng tiền bát gạo']},
  taixe:{n:'Tài xế',spr:['k_xeom','k_shipper','kt2','kt7'],q:[1,2],k:[1,2],like:{bovien:4,cavien:3,chaca:2,xucxich:2},sa:{s_tuongot:4,s_sate:4},sp:.9,pat:28,sens:1,
    hi:['Lấy anh','Cho chú','Lẹ giùm anh'],wait:['Đang có cuốc, lẹ giùm!','App báo đơn kìa…','Đói lả rồi nè.'],
    thx:['Được! Cay đã!','Ngon, chạy tiếp!','Mai anh ghé.'],meh:['Ừ được.'],bad:['Khét lẹt vậy em!'],
    miss:['Không có {k} thì thôi, chạy tiếp!'],quit:['Có khách rồi, đi đây!'],
    rv:['chạy cuốc xong ghé ăn','anh em tài xế giới thiệu nhau','ăn lẹ chạy tiếp','no bụng chạy cả đêm','sa tế cay đã']},
  gioitre:{n:'Giới trẻ',mixLike:1,spr:['k_songao','k_streamer','k_reviewer','k_sigai','k_bangai'],q:[1,2],k:[1,3],like:{dauhu:3,tomvien:3,xucxich:3,mucvien:2,kani:4,tomhum:4,chabusan:3,xxduc:3},sa:{s_phomai:3,b_phomai:3,s_mayo:2,s_kewpie:3,s_gochu:3,s_sriracha:2},sp:.95,pat:34,sens:1.6,tip:.35,
    hi:['Cho em','Chị ơi lấy em','Bán em'],wait:['Xếp đẹp đẹp em chụp hình nha!','Đợi em check-in cái…','Story nay có cá viên rồi!'],
    thx:['Lên hình đẹp xỉu!','Đỉnh nóc kịch trần!','5 sao cho chị!'],meh:['Cũng ổn.'],bad:['Hông lên hình nổi…'],
    miss:['Không có {k}? Hông trendy gì hết trơn.'],quit:['Đi quán khác check-in vậy…'],
    rv:['lên hình mlem','check-in đi mấy bà','chân ái của tui','đỉnh nóc kịch trần','story nay full cá viên']},
  sinhvien:{n:'Sinh viên',spr:['kt2','kt6','k_ghino','k_reviewer'],q:[1,2],k:[1,2],like:{cavien:4,bovien:3,khoailang:3,xucxich:2},sa:{s_tuongot:4,s_tuongca:2,s_mayo:2},sp:.85,pat:32,sens:.9,
    hi:['Cho em','Chị ơi lấy em','Bán em'],wait:['Cuối tháng rồi chị ơi…','Ăn xong học bài, hứa!','Bạn cùng phòng nhờ mua thêm nè.'],
    thx:['Rẻ mà no!','Cứu đói sinh viên!','Chị là ân nhân!'],meh:['Cũng no.'],bad:['Thôi ăn mì gói…'],
    miss:['Không có {k}? Thôi ăn mì gói…'],quit:['Trễ giờ điểm danh rồi!'],
    rv:['cứu đói cuối tháng','rẻ mà no','cả phòng ký túc ghiền','ăn xong ôn thi tỉnh hẳn','sinh viên nghèo cũng ăn được']},
  /* khách đặc biệt: hiếm, mỗi người một chiêu */
  tay:{n:'Tây ba lô',sp_:1,spr:['k_tay'],q:[1,3],k:[1,2],like:{tomvien:3,xucxich:3,cavien:2,bovien:2,kani:3,tomhum:3},sa:{s_tuongot:2,s_mayo:3,s_sriracha:3},sp:.9,pat:40,sens:2,tip:.6,
    hi:['Hello! Can I get','Hi! Please,'],wait:['So many smells! Wow!','Vietnam street food is the best!','I love fish balls!'],thx:['Delicious! Cảm ơn!','Amazing! 10/10!','So crispy!'],meh:['Okay!'],bad:['Hmm… burnt?'],
    miss:['No {k}? Oh no…'],quit:['Sorry, my bus is leaving!'],rv:['best street food in Saigon','must try when in Vietnam','crispy and cheap','the cats are so cute']},
  reviewer:{n:'Food reviewer',sp_:1,spr:['k_reviewer'],q:[1,2],k:[2,3],like:{tomvien:3,dauhu:3,mucvien:3,xucxich:2,chabusan:3,kani:3},sa:{s_phomai:3,s_kewpie:3,b_phomai:2},sp:1,pat:30,sens:1.6,
    hi:['Hello cả nhà, mình gọi thử','Chị chủ ơi cho em review'],wait:['Cả nhà nhìn nè, chảo sôi cực!','Mình đang quay nha!'],thx:['Chấm điểm 10!','Cả nhà phải ghé!'],meh:['Tạm ổn nha cả nhà.'],bad:['Hơi thất vọng nha cả nhà…'],
    miss:['Không có {k}, tiếc ghê cả nhà ơi.'],quit:['Thôi mình đi quay quán khác…'],rv:['điểm review chi tiết dưới bình luận','cả nhà nhớ ghé thử','mình chấm thang điểm 10']},
  betthu:{n:'Bet thủ',sp_:1,spr:['k_betthu'],q:[1,2],k:[1,2],like:{bovien:4,xucxich:3,cavien:2},sa:{s_sate:3,s_tuongot:3},sp:.8,pat:30,sens:1,
    hi:['Chơi một ván! Cho anh','Hên xui nha em, lấy anh'],wait:['Ngửa là anh trả gấp đôi!','Hôm nay anh đỏ lắm!'],thx:['Hên rồi!'],meh:['Hòa vốn!'],bad:['Xui quá!'],
    miss:['Không có {k}? Xui thiệt.'],quit:['Thôi, đi kiếm kèo khác!'],rv:['ăn xong thắng kèo','hên xui mà ngon chắc','đánh đâu thắng đó']},
  thayboi:{n:'Thầy bói',sp_:1,spr:['k_thayboi'],q:[1,2],k:[1,2],like:{chaca:4,cavien:3,bovien:2},sa:{s_tuongden:3,s_tuongot:2},sp:.6,pat:40,sens:1,
    hi:['Thầy xem quẻ rồi, lấy thầy','Con cho thầy'],wait:['Hôm nay tiệm con có lộc…','Thầy thấy sao Thái Bạch chiếu…'],thx:['Quẻ đại cát!'],meh:['Bình an thôi con.'],bad:['Quẻ hung…'],
    miss:['Không có {k}, đúng như quẻ…'],quit:['Thầy đi xem quẻ chỗ khác.'],rv:['quẻ báo tiệm này phát','ăn vô thấy sáng mắt','lộc lá đầy xe']},
  quyt:{n:'Kẻ quỵt',sp_:1,spr:['k_quyt'],q:[1,2],k:[1,2],like:{xucxich:3,bovien:3,cavien:3},sa:{s_tuongot:3},sp:.5,pat:30,sens:1,
    hi:['Lấy anh','Cho anh'],wait:['…','Lẹ giùm.'],thx:['Hehe.'],meh:['Ờ.'],bad:['Hừ.'],miss:['Hừ, không có {k}.'],quit:['Thôi.'],rv:['ăn ké được bữa']}
};
const SPECIALS=['tay','reviewer','betthu','thayboi','quyt'];

/* ===================== biệt danh khách quen ===================== */
const NICK={hocsinh:['răng thỏ','lém lỉnh','cận thị','điệu đà','mít ướt','lớp trưởng','tóc mái','ham ăn'],ba:['bà tám','hay kể','tóc bạc','chợ búa','khó tính','dễ thương'],
  giadinh:['bố bỉm','mẹ bỉm','cuối tuần','dắt con','cưng vợ'],vanphong:['deadline','tăng ca','sếp nhỏ','kính cận','cà vạt'],taixe:['xe ôm','tốc độ','áo xanh','cuốc đêm'],
  gioitre:['sống ảo','check-in','tóc hồng','idol mạng','hot tiktok'],sinhvien:['cuối tháng','ôn thi','ký túc','mì gói','tóc rối'],adj:['mập','gầy','cao','lùn','tửng','vui tính','hiền khô','lanh chanh']};

/* ===================== review ===================== */
/* review ghép từ: mở đầu theo sao, nhận xét theo sự thật của đơn (chín, chờ, sốt, giá, món), câu riêng của kiểu khách, emoji */
const RV={
  open:{5:['Quá đỉnh!','10 điểm không có nhưng!','Ghiền luôn rồi!','Ngon xuất sắc!','Mê thật sự!','Đỉnh của chóp!','Hết nước chấm!'],
        4:['Ngon nha!','Khá ổn!','Được lắm!','Ăn được nè!','Sẽ quay lại!'],
        3:['Tạm được.','Cũng bình thường.','Không tệ.','Ăn cho biết.'],
        2:['Hơi thất vọng.','Chưa ổn lắm.','Không như mong đợi.'],
        1:['Tệ thật sự!','Không bao giờ quay lại!','Cạn lời!','Thất vọng toàn tập!']},
  good:{crisp:['Que {m} vàng ươm, giòn rụm','{m} chiên tới, cắn cái rộp','Viên nào viên nấy vàng đều'],fast:['ra món nhanh như chớp','chưa kịp lướt điện thoại đã có','chủ xe tay nhanh dã man'],
        sauce:['{s} xịt vừa miệng','{s} đậm đà','sốt {s} quá hợp'],price:['giá mềm','{p} một que mà no','giá sinh viên'],cat:['hai bé mèo dưới xe cute xỉu','bé mèo cam nằm ngủ dễ thương','vuốt mèo free'],
        combo:['xe đông mà vẫn chuẩn','đông nghẹt mà không lộn món'],rain:['trời mưa ăn nóng hổi đã ghê'],night:['tối ăn khuya hết sảy'],recipe:['que {r} đúng chuẩn bí truyền']},
  bad:{cold:['que {m} nguội ngắt','viên nguội, hết giòn','đồ chiên để nguội mất ngon'],burnt:['que {m} cháy khét lẹt','viên cháy đen như than','khét lẹt cả họng'],slow:['chờ dài cổ','đứng chờ muốn mọc rễ','đợi lâu quá trời'],
        sauce:['xịt nhầm {s}','sốt tùm lum','kêu {s} mà xịt sốt khác'],price:['{p} một que hơi chát','giá hơi cao so với xe đẩy'],miss:['không có {k} để ăn','hết {k} rồi còn bày'],
        quit:['đứng chờ xong bỏ về luôn','chờ hoài không tới lượt'],crowd:['đông quá không chen nổi']},
  end:{5:['🔥','😍','💯','🥰','⭐⭐⭐⭐⭐','❤️'],4:['👍','😋','🙂'],3:['😐','🤷'],2:['😕','👎'],1:['😤','💢','🤬']}
};
/* khách quen bênh tiệm: câu bênh và câu cãi lại của người chê */
const DEF={hit:['Ăn ở đây 3 năm chưa thấy cháy bao giờ!','Bạn đến đúng lúc đông thôi, bình thường nhanh lắm!','Cả xóm tui ăn, có ai kêu đâu!','Bé chủ xe tử tế lắm, đừng chê oan!','Xếp hàng chút có sao, ngon mà!','Chắc bạn đói quá nên khó tính!','Sốt nào cũng ngon, chọn lại đi bạn!','Tui đi làm về ngày nào cũng ghé, bảo đảm!'],
  back:['Tui ăn sao nói vậy!','Fan cuồng à?','Ai mướn bênh vậy?','Ủa liên quan?','Thôi né!'],
  win:['Thôi được, chắc hôm đó xui.','Ờ… để mai ăn lại xem.','Ok ok, tui sửa sao.','Nói vậy thì tui thử lại.'],
  lose:['Tui vẫn giữ ý kiến!','Không sửa đâu!','Kệ tui!']};
/* chủ xe trả lời review: theo kiểu (💛 thx, 🙏 sorry, 😏 sass), review khen (g) hay chê (b), lý do review nhắc tới (r.why, _ là câu chung);
   {x} gọi khách ("chú Ba"), {X} viết hoa, {t} chủ xe tự xưng (con/em/mình), {m} món, {s} sốt, {k} viên hết, {p} giá */
const REPLY={
  thx:{g:{_:['Cảm ơn {x} nhiều nha! Mai ghé tiếp nhé 💛','Thương {x} ghê, cảm ơn nha!','Cảm ơn {x}, chúc {x} một ngày vui!','{X} khen vậy {t} chiên hăng say luôn 🔥','Được {x} khen là mai {t} dậy sớm chiên tiếp nè!','Cảm ơn {x}, nhớ ghé thường xuyên nha 🍢','Đọc review mà {t} vui cả buổi, cảm ơn {x}!','Cảm ơn {x} đã ủng hộ xe nhỏ của {t} 🙆','{X} dễ thương quá, lần sau {t} xịt sốt nhiều hơn nha!','Hihi cảm ơn {x}, mê {x} luôn 😍','Mai {x} ghé {t} tặng thêm viên nha 💛','Có {x} ủng hộ là có động lực liền!'],
      crisp:['Bí quyết là dầu nóng vừa tới đó {x} 😎','{t} canh từng giây cho {m} vàng giòn đó nha!','Giòn vậy là nhờ {t} vớt đúng lúc á!','Cảm ơn {x}, {m} phải giòn mới đáng tiền chứ!'],
      fast:['Tay {t} luyện cả năm mới nhanh vậy đó 😎','Nhanh là nghề của {t} rồi!','Không để {x} chờ lâu là nguyên tắc của xe!','Cảm ơn {x}, mai {t} chiên còn nhanh hơn nữa!'],
      sauce:['{s} là sốt tủ của xe luôn đó {x}!','{t} tự pha {s} mỗi sáng đó nha 🥫','Mê {s} thì mai ghé {t} xịt đậm hơn nha!','Sốt ngon là nhờ {x} chọn khéo á!'],
      price:['Giá vậy để ai cũng ăn được mà {x}!','Ăn no mà không xót ví là đúng ý {t} rồi 💸','Giá hạt dẻ, chất lượng hạt kim cương 😆'],
      cat:['Hai bé mèo gửi lời cảm ơn {x} 🐱','Chub với Bim được khen là kiêu lắm á 😹','Mai {x} ghé vuốt mèo tiếp nha, tụi nó nhớ {x} đó!'],
      combo:['Đông cỡ nào {t} cũng không lộn đơn đâu!','Cảm ơn {x} đã kiên nhẫn lúc đông nha!'],
      rain:['Mưa mà {x} vẫn ghé, thương ghê ☔','Trời mưa ăn đồ chiên là chân ái mà!'],
      night:['Xe mở khuya để {x} có chỗ ăn đó 🌙','Đói khuya cứ ghé {t} nha!'],
      recipe:['{X} biết món bí truyền là sành ăn rồi đó 📜','Que {m} là niềm tự hào của xe đó {x}!']},
    b:{_:['Cảm ơn {x} đã góp ý nha!','Cảm ơn {x}, {t} ghi nhận ạ.','{t} cảm ơn {x} đã nói thẳng 🙏','Cảm ơn {x}, mai {t} sẽ làm tốt hơn!','Góp ý của {x} quý lắm, cảm ơn nha.'],
      burnt:['Cảm ơn {x} nhắc, mai {t} canh lửa kỹ hơn.'],cold:['Cảm ơn {x}, {t} sẽ chiên mới cho nóng.'],slow:['Cảm ơn {x} đã chờ {t} nha.'],miss:['Cảm ơn {x}, mai {t} mua thêm {k}.']}},
  sorry:{g:{_:['Dạ {t} còn nhiều thiếu sót lắm ạ 🙏','Khen vậy chứ {t} còn phải cố nhiều!','{t} xin lỗi vì… quá ngon 😅','Dạ {t} chưa làm được gì nhiều đâu {x}!','Xin lỗi {x} vì để {x} ghiền 😆']},
    b:{_:['Xin lỗi {x}, lần sau {t} làm kỹ hơn ạ 🙏','Dạ {t} xin lỗi, mai ghé {t} tặng thêm que nha!','Cảm ơn góp ý, {t} sửa liền ạ!','{t} xin lỗi {x} nhiều lắm 😢','Hôm đó {t} sơ suất, mong {x} cho thêm cơ hội ạ!','Xin lỗi {x}, lần sau {t} bù thêm sốt nha!','Dạ {t} biết lỗi rồi, {x} bỏ qua cho {t} nha 🥺','{t} xin lỗi, review của {x} {t} dán lên xe để nhắc mình luôn!'],
      burnt:['Xin lỗi {x}, hôm đó {t} lỡ tay để {m} cháy 😭','Dạ {t} sẽ canh chảo kỹ hơn, xin lỗi {x}!','Xin lỗi {x}, que cháy đó lẽ ra {t} phải bỏ đi!','Lửa to quá {t} không để ý, xin lỗi {x} nhiều!'],
      cold:['Xin lỗi {x}, lẽ ra {t} phải chiên mới cho {x}!','Dạ {t} sẽ không đưa que nguội nữa ạ 🙏','Xin lỗi {x}, lần sau {t} chiên nóng hổi tại chỗ!'],
      slow:['Xin lỗi để {x} chờ lâu, hôm đó đông quá 😓','Dạ {t} sẽ thuê thêm người phụ, xin lỗi {x}!','Xin lỗi {x}, lần sau {t} ưu tiên {x} liền!','{t} xin lỗi, tay chiên tay giao nên chậm ạ 🙏'],
      sauce:['Xin lỗi {x}, {t} xịt nhầm sốt rồi 😣','Dạ lần sau {t} hỏi lại sốt cho chắc ạ!','Xin lỗi {x}, mai ghé {t} xịt đúng {s} gấp đôi!'],
      price:['Xin lỗi {x}, {t} sẽ xem lại giá ạ.','Dạ giá chợ tăng nên {t} phải tăng, xin lỗi {x} 🙏','Mai {x} ghé {t} bớt cho {x} nha!'],
      miss:['Xin lỗi {x}, hôm đó {t} hết {k} sớm quá 😢','Dạ mai {t} mua thêm {k} để dành cho {x} nha!','Xin lỗi {x}, {k} bán chạy quá {t} không kịp mua thêm!'],
      quit:['Xin lỗi để {x} chờ tới bỏ về, {t} áy náy lắm 😢','Dạ lần sau {x} ghé {t} làm cho {x} trước!','Xin lỗi {x}, {t} hứa không để ai chờ vậy nữa!'],
      crowd:['Xin lỗi {x}, hôm đó đông quá {t} không xoay kịp 🙏','Dạ {t} sẽ mở thêm chỗ, xin lỗi {x} nha!']}},
  sass:{g:{_:['Biết ngon rồi mà còn nói 😏','Khen ít vậy thôi hả {x}? 😜','Ngon vậy mà chỉ khen nhiêu đó à 😎','Biết ngay {x} sẽ quay lại mà 😏','Lại một người bị {t} chinh phục 😎','Nói nhỏ thôi kẻo xe bên cạnh nghe 🤫'],
      cat:['Mèo của {t} chảnh lắm đó, được vuốt là may 😼'],price:['Rẻ vậy chứ đừng mua hết của {t} nha 😏'],fast:['Nhanh vậy là còn chậm đó {x} 😎']},
    b:{_:['Ủa vậy hả, chắc {x} ăn nhầm xe bên cạnh 😏','Khẩu vị mỗi người mỗi khác mà 😜','Lần sau nhớ tới sớm nha {x} 😎','Cả xóm khen mà {x} chê là sao ta 🤔','Chắc hôm đó {x} đói quá nên khó tính 😏','{X} review vậy {t} buồn 3 giây thôi 😜','Không ngon thì sao {x} ăn hết vậy? 🤨','Ok {x}, để {t} báo mèo cắn {x} 😼'],
      burnt:['Cháy là phiên bản đặc biệt đó {x} 😏','Giòn quá tay thôi mà {x} 😜','{X} không biết ăn đồ "xém" là trend à? 🔥','Than hoa giải độc đó {x} 😎'],
      cold:['Ăn nguội cho mát mà {x} 😜','{X} đi chậm nên nó nguội đó chứ 😏','Đồ nguội mới thấm sốt nha {x} 🧊'],
      slow:['Đồ ngon phải chờ chứ {x} 😏','Chờ chút mà than, đi ăn mì gói đi {x} 😜','{X} đứng chờ là đang tập thể dục đó 🏃','Chậm mà chắc nha {x} 😎'],
      sauce:['Sốt nào chẳng là sốt {x} 😜','Đổi vị cho {x} khám phá đó 😏','{t} xịt theo cảm hứng nghệ sĩ á 🎨'],
      price:['Tiền nào của nấy nha {x} 😏','{p} mà chê đắt thì {x} ăn không khí nha 😜','Giá này là ưu đãi cho người đẹp rồi đó 😎'],
      miss:['Ngon quá nên hết sớm, ai bảo {x} tới trễ 😏','{k} bán đắt như tôm tươi mà {x} 😎','Mai tới sớm thì có {k} nha {x} 😜'],
      quit:['Bỏ về là {x} thiệt chứ {t} đâu thiệt 😏','Kiên nhẫn là một đức tính đó {x} 😜','Lần sau mang ghế theo nha {x} 🪑'],
      crowd:['Đông vậy là biết ngon rồi đó {x} 😎','Muốn ăn ngon thì phải chen nha {x} 😏']}}};
/* khách đáp lại câu trả lời: theo kiểu trả lời + kết quả (up/down/buzz/love) hoặc review tốt (good) / chê (bad) */
const BACK={
  thx:{love:['Hehe mai mình rủ cả nhóm ghé luôn! 🥰','Xe dễ thương ghê, ủng hộ dài dài nha!','Đã follow, mai gặp lại nha chủ xe 💛','Share lên group ăn vặt liền 📱','Trả lời dễ thương vậy ai không ghé 😍'],
    good:['Dạ không có chi, ngon thì khen thôi 😋','Hihi, mai ghé tiếp!','Nhớ giữ phong độ nha 👍','Có gì đâu, ngon thật mà!','Mai lại ghé ăn 10 que 😆','Chủ xe dễ thương quá 🥰','Ủa trả lời nhanh vậy, thích ghê!','Cảm ơn lại nè 🙆'],
    bad:['Cảm ơn gì, sửa đi chứ 😑','Ủa mình chê mà cảm ơn là sao 😶','Cảm ơn thì được, lần sau làm kỹ nha.','Nói vậy thôi chứ mai vẫn ghé 😒','Thấy có tâm đó, cho thêm cơ hội.']},
  sorry:{up:['Thôi được, thêm 1 sao nè, lần sau ngon hơn nha!','Thấy thành ý nên sửa review đó 😌','Ok bỏ qua, mai mình thử lại!','Xin lỗi dễ thương vậy ai giận nổi 🥺','Được rồi, sửa sao cho nè ⭐','Mai ghé nhớ tặng que như đã hứa nha 😏'],
    bad:['Hứa rồi đó nha, mai mình kiểm tra 👀','Xin lỗi thì ít, tặng que thì nhiều nha 😤','Để coi lần sau sao đã…','Ừ, mong là lần sau khác.','Nói thì dễ, làm mới khó nha.','Thôi được, cho thêm một cơ hội.'],
    good:['Ủa có gì đâu mà xin lỗi, ngon mà 😂','Xin lỗi gì trời, khen thiệt mà!','Chủ xe khiêm tốn ghê 🤭','Ủa sao khen mà bị xin lỗi 😆','Dễ thương quá, mai ghé tiếp!']},
  sass:{down:['Thái độ vậy hả?! Trừ thêm sao! 😤','Trả lời khách vậy đó hả, bye!','Chụp màn hình gửi group rồi nha 📸','Bán buôn kiểu gì vậy trời 😡','Đã chê còn bị cà khịa, hạ sao! 👎','Thôi khỏi ghé luôn!'],
    buzz:['Haha xe này lầy ghê, mai dắt bạn tới coi 🤣','Ủa cà khịa duyên vậy, chịu luôn 😂','Ok chủ xe thắng, mai ghé ăn tiếp 🤝','Trời ơi mặn mà, follow liền 😆','Chủ xe này đi diễn hài được đó 🎤','Cả group cười xỉu, mai kéo nhau ra 🤣'],
    bad:['Ừ thì… 🙄','Cãi hoài, không nói nữa 😒','Thôi kệ, ai ăn người nấy biết.','Ủa bán hàng mà cãi khách à 😑','Ừ, giỏi lắm 🙃','Nói chung là vẫn chê nha!'],
    good:['Ủa mình khen mà?? 😳','Khen cũng bị cà khịa là sao 🥲','Chủ xe mặn ghê 🧂😆','Haha chảnh ghê, mà thích 😆','Lần sau khen ít lại 😤']}};

/* đồ nghề: mua một lần, rẻ hơn vài ngày lương nhân viên đầu tiên (~80–220k/ngày); chảo rộng cần ki-ốt */
const GEAR=[
  {k:'vot',i:'⏲️',n:'Chảo hẹn giờ',d:'Que vàng tự vớt ra khay',p:250000},
  {k:'xit',i:'🥫',n:'Chai xịt tự động',d:'Tự xịt đúng sốt khách gọi',p:200000},
  {k:'nong',i:'♨️',n:'Khay giữ nóng',d:'Que lâu nguội gấp đôi',p:400000},
  {k:'lua',i:'🔥',n:'Bếp lửa to',d:'Chiên nhanh hơn 25%',p:900000},
  {k:'chao',i:'🍳',n:'Chảo rộng',d:'+1 que trong chảo',p:2500000,lv:2}];
/* ===================== sưu tập ===================== */
/* que bí truyền: ghép đúng 5 viên (thứ tự nào cũng được) và bán ít nhất một que thì mở; món đó bán đắt hơn 15% */
const RECIPES=[
  {id:'cauvong',n:'Que Cầu Vồng',v:['cavien','bovien','tomvien','mucvien','xucxich'],h:'5 viên, 5 loại'},
  {id:'bienca',n:'Que Biển Cả',v:['tomvien','tomvien','mucvien','mucvien','chaca'],h:'tôm, mực và một miếng chả'},
  {id:'hoctro',n:'Que Học Trò',v:['xucxich','xucxich','cavien','cavien','cavien'],h:'món học trò mê nhất'},
  {id:'dongque',n:'Que Đồng Quê',v:['khoailang','khoailang','khoailang','cavien','cavien'],h:'khoai nhiều hơn cá'},
  {id:'bolac',n:'Que Bò Lắc',v:['bovien','bovien','bovien','bovien','xucxich'],h:'bò là chính'},
  {id:'phomai',n:'Que Phô Mai Tan Chảy',v:['dauhu','dauhu','dauhu','xucxich','xucxich'],h:'béo ngậy'},
  {id:'ngu',n:'Que Ngũ Hành',v:['dauhu','khoailang','chaca','mucvien','bovien'],h:'5 loại không trùng que Cầu Vồng'},
  {id:'daigia',n:'Que Đại Gia',v:['tomhum','tomhum','kani','kani','xxduc'],h:'toàn hàng nhập'},
  {id:'seoul',n:'Que Seoul',v:['chabusan','chabusan','chabusan','xucxich','xucxich'],h:'hàng Hàn'},
  {id:'tokyo',n:'Que Tokyo',v:['kani','kani','kani','tomvien','tomvien'],h:'hàng Nhật'},
  {id:'berlin',n:'Que Berlin',v:['xxduc','xxduc','xxduc','bovien','bovien'],h:'hàng Đức'},
  {id:'hoanggia',n:'Que Hoàng Gia',v:['tomhum','tomhum','tomhum','tomhum','tomhum'],h:'5 viên đắt nhất'}];
/* trang trí xe/quán: mua một lần, hiện trong cảnh, có chút lợi */
const DECOR=[
  {k:'c_senda',n:'Chậu sen đá',p:150000,perk:'❤️ +5%',slot:'top'},
  {k:'f_xuongrong',n:'Xương rồng',p:250000,perk:'❤️ +5%',slot:'ground'},
  {k:'f_don',n:'Ghế đôn',p:400000,perk:'⏳ +8%',slot:'ground'},
  {k:'c_hoa',n:'Bình hoa',p:600000,perk:'❤️ +5%',slot:'top'},
  {k:'w_daylo',n:'Giỏ cây treo',p:900000,perk:'⏳ +5%',slot:'hang'},
  {k:'r_ke',n:'Thảm caro',p:1200000,perk:'⏳ +5%',slot:'rug'},
  {k:'f_cay',n:'Cây trầu bà',p:2000000,perk:'❤️ +8%',slot:'ground'},
  {k:'c_meothantai',n:'Mèo thần tài',p:3500000,perk:'💰 tip +10%',slot:'top'},
  {k:'w_neon',n:'Neon que cá viên',p:6000000,perk:'👥 tối +10%',slot:'hang'},
  {k:'w_dongho',n:'Đồng hồ',p:10000000,perk:'⏳ +5%',slot:'wall'},
  {k:'w_tranh',n:'Tranh Sài Gòn',p:25000000,perk:'❤️ +10%',slot:'wall'},
  {k:'w_ke',n:'Kệ gia vị',p:60000000,perk:'💰 tip +10%',slot:'wall'}];
