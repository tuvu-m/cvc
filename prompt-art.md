# Prompt vẽ hình cho Cá Viên Chiên

Game đang dùng lại hình khách, mèo, nhân viên, đồ trang trí, cúp từ Tiệm Trà Bobơ. Mọi thứ riêng của cá viên chiên (đồ chiên, sốt, rau, lớp phủ, quầy gói, ly giấy) hiện đang **vẽ bằng code**. Vẽ xong hình nào thì gửi mình, mình cắt, tách nền, thu nhỏ còn khoảng 200px, đổi sang webp rồi thêm vào `SPRSRC` với đúng tên file bên dưới. Có hình thì game tự dùng hình, chưa có thì vẫn vẽ bằng code.

Phong cách giữ giống Bobơ: chibi vẽ tay, màu gouache và chì màu, viền nâu ấm mảnh, pastel. Mỗi prompt ra **một tấm** nhiều món, xếp lưới, cách nhau rộng để dễ cắt.

Phần mở đầu chung (đã gắn sẵn trong từng prompt):

> Cute cozy hand-painted game asset sprite sheet for a mobile Vietnamese street-food game about fried fish balls. Soft pastel palette, gouache and colored-pencil texture, thin warm brown outline, gentle soft shading. Every item is drawn straight from the front, same style, fully separated with generous empty space around each one. Plain flat cream background. No text, no letters, no logo, no ground shadow.

---

## Prompt 1 · Khay đồ chiên sống (12 món + khoai mì)

Trên quầy mỗi món là một khay inox nhỏ (ô 1×2, đứng dọc) đựng đồ còn sống. Tên file theo thứ tự trái sang phải, trên xuống dưới:

`cavien` · `bovien` · `tomvien` · `mucvien` · `xucxich` · `dauhu` · `chaca` · `khoailang` · `tomhum` · `kani` · `chabusan` · `xxduc` · `khoaimi`

```
Cute cozy hand-painted game asset sprite sheet for a mobile Vietnamese street-food game about fried fish balls. Soft pastel palette, gouache and colored-pencil texture, thin warm brown outline, gentle soft shading. Every item is drawn straight from the front, same style, fully separated with generous empty space around each one. Plain flat cream background. No text, no letters, no logo, no ground shadow. Show 13 small tall stainless steel food trays seen from the front and slightly above, each tray heaped with raw uncooked street food, in a grid of 5 columns: pale cream round fish balls; brown round beef balls with tiny dark specks; pink round shrimp balls; off-white round squid balls; short red cocktail sausages; pale yellow cubes of cheese tofu; flat beige oval fish cakes; orange sweet potato sticks; coral pink round lobster balls with a tiny blue airplane sticker on the tray; red and white crab sticks with a tiny blue airplane sticker; folded pale yellow Korean fish cake sheets on a skewer with a tiny blue airplane sticker; long dark red German sausages with a tiny blue airplane sticker; thick pale cassava root chunks in a woven bamboo basket instead of a tray. Transparent background PNG.
```

## Prompt 2 · Sốt và bột lắc (16 món)

Chai sốt bóp hoặc hũ bột, ô 1×2. Tên file:

`s_tuongot` · `s_tuongca` · `s_tuongden` · `s_me` · `s_phomai` · `s_mayo` · `s_mutat` · `s_sate` · `s_mattong` · `b_phomai` · `b_ot` · `b_muoitom` · `s_gochu` · `s_kewpie` · `s_teri` · `s_sriracha`

```
Cute cozy hand-painted game asset sprite sheet for a mobile Vietnamese street-food game about fried fish balls. Soft pastel palette, gouache and colored-pencil texture, thin warm brown outline, gentle soft shading. Every item is drawn straight from the front, same style, fully separated with generous empty space around each one. Plain flat cream background. No text, no letters, no logo, no ground shadow. Show 16 tall narrow sauce containers in a grid of 4 columns, each with a blank label: a red chili sauce squeeze bottle; a bright tomato ketchup squeeze bottle; a dark brown hoisin sauce squeeze bottle; a brown tamarind sauce jar with a spoon; a yellow cheese sauce squeeze bottle; a creamy white mayonnaise squeeze bottle; a yellow mustard squeeze bottle; a small glass jar of red chili oil with chili flakes; a golden honey butter bottle with a honey dipper; a shaker jar of yellow cheese powder; a shaker jar of red chili powder; a small jar of orange Tay Ninh shrimp salt; a red Korean gochujang tub with a tiny blue airplane sticker; a soft Japanese mayonnaise bottle with a red star cap and a tiny blue airplane sticker; a dark teriyaki sauce bottle with a tiny blue airplane sticker; a red sriracha bottle with a green cap and a tiny blue airplane sticker. Transparent background PNG.
```

## Prompt 3 · Rau và món kèm (12 khay)

Khay vuông 2×2 nhìn từ trên xuống hơi nghiêng. Tên file:

`dualeo` · `dochua` · `hanhphi` · `rauram` · `xoai` · `merang` · `phomaibao` · `trungcut` · `khoaitay` · `chabong` · `kimchi` · `rongbien`

```
Cute cozy hand-painted game asset sprite sheet for a mobile Vietnamese street-food game about fried fish balls. Soft pastel palette, gouache and colored-pencil texture, thin warm brown outline, gentle soft shading. Every item is drawn straight from the front, same style, fully separated with generous empty space around each one. Plain flat cream background. No text, no letters, no logo, no ground shadow. Show 12 square shallow stainless steel side-dish trays seen from slightly above, in a grid of 4 columns, each filled: cucumber slices; Vietnamese pickled carrot and daikon strips; crispy fried shallots; fresh Vietnamese coriander leaves; julienned green mango; toasted sesame seeds; grated yellow cheese; peeled boiled quail eggs; golden french fries; fluffy pork floss; red kimchi with a tiny blue airplane sticker on the tray; dark green seaweed strips with a tiny blue airplane sticker. Transparent background PNG.
```

## Prompt 4 · Lớp phủ (5 tô) và dụng cụ

Tô lớp phủ ô 1×2: `f_mozza` · `f_trungmuoi` · `f_botoi` · `f_cheddar` · `f_kemchua`.
Dụng cụ ô 1×2: `duong` (chén ớt, giữ tên cũ), `da` (chén chanh, giữ tên cũ). Quầy gói ô 2×2: `maydonggoi` (giữ tên cũ; ly sẽ chui vào khoảng 30% bề ngang, đáy ly ở 76% chiều cao hình, nên chừa một chỗ trống ở đó).

```
Cute cozy hand-painted game asset sprite sheet for a mobile Vietnamese street-food game about fried fish balls. Soft pastel palette, gouache and colored-pencil texture, thin warm brown outline, gentle soft shading. Every item is drawn straight from the front, same style, fully separated with generous empty space around each one. Plain flat cream background. No text, no letters, no logo, no ground shadow. Top row, 5 small round ceramic bowls each with a little ladle: melted stretchy white mozzarella; golden salted egg yolk sauce; garlic butter with crispy garlic bits; melted orange cheddar; white sour cream with green onion. Bottom row: a small bowl of chopped red chilies with a tiny spoon; a small bowl of fresh lime wedges; a wide packing station made of a stack of brown kraft paper bags on the left, an empty spot in the middle where a paper cup will stand, and a glass jar full of bamboo skewers on the right. Transparent background PNG.
```

## Prompt 5 · Đồ siêu hiếm (4 hộp + 4 kiểu rắc)

Hai món Kim tuyến và Lá vàng 24K đã có hình từ Bobơ. Cần thêm hộp đựng `gem_i_<mã>` và đồ rắc trên mặt ly `gem_t_<mã>` cho: `tobiko` (trứng cá chuồn), `cahoi` (trứng cá hồi), `truffle` (nấm truffle đen), `caviar` (trứng cá tầm).

```
Cute cozy hand-painted game asset sprite sheet for a mobile Vietnamese street-food game about fried fish balls. Soft pastel palette, gouache and colored-pencil texture, thin warm brown outline, gentle soft shading. Every item is drawn straight from the front, same style, fully separated with generous empty space around each one. Plain flat cream background. No text, no letters, no logo, no ground shadow. Top row, 4 small luxury gift containers: a tiny glass jar of bright orange flying fish roe; a tiny glass jar of glossy red-orange salmon roe; a small wooden box holding one black truffle; a small round tin of black caviar with a mother-of-pearl spoon. Bottom row, the same 4 delicacies as a loose sprinkle seen from above, each as a small flat cluster: orange flying fish roe; glossy salmon roe pearls; thin black truffle shavings; tiny black caviar pearls. Transparent background PNG.
```

## Prompt 6–10 · Năm cấp tiệm

Mỗi tấm 4 món, cắt và đặt tên như Bobơ: quầy `k_quay_N`, mái hiên `k_maihien_N`, sàn `k_san_N` (ô vuông lặp liền), ảnh tiệm `tiem_N` (4:3). Quầy phải có **bảng tên trống ở chính giữa** (game tự viết tên tiệm lên đó). Hiện game đang dùng tạm hình tiệm trà của Bobơ.

```
Cute cozy hand-painted game asset sprite sheet for a mobile Vietnamese street-food game about fried fish balls. Soft pastel palette, gouache and colored-pencil texture, thin warm brown outline, gentle soft shading. Every item is drawn straight from the front, same style, fully separated with generous empty space around each one. Plain flat cream background. No text, no letters, no logo, no ground shadow. Theme: a humble fish ball push cart in front of a school gate. Show 4 items, top to bottom: a wide low counter made from the front of a small stainless steel push cart with a glass display case, two small rubber wheels at the bottom corners, and a blank empty rounded cream sign plate with a thin brown frame in the exact center; a very wide short faded red and cream striped umbrella-canopy strip; then in the last row side by side, a square seamless tileable top-down texture of grey Vietnamese sidewalk tiles with a few fallen leaves, and a small three-quarter view illustration of the fish ball push cart with a bubbling oil pot, a striped umbrella, two plastic stools and a sleepy orange cat under the cart. Transparent background PNG.
```

Bốn cấp sau dùng đúng khung prompt trên, chỉ đổi dòng `Theme:` và mô tả 4 món:

- **Cấp 2 · Ki-ốt chợ đêm**: ki-ốt gỗ sơn xanh bạc hà ở chợ đêm, dây đèn bóng tròn, mái sọc xanh kem; sàn gạch đất nung; ảnh ki-ốt có quầy kính đựng xiên que và khói chiên bay lên.
- **Cấp 3 · Quán mặt tiền**: quán một gian tông cam đào, quầy ốp gỗ, mái sọc cam kem; sàn gỗ mật ong; ảnh quán có cửa kính, đèn lồng giấy, chảo dầu lớn sau quầy.
- **Cấp 4 · Quán hai tầng**: quán hai tầng tông đỏ son kiểu ăn vặt Hàn, quầy mặt đá trắng, tủ kính đựng chả cá Busan, mái sọc đỏ kem viền vàng; sàn gỗ xương cá; ảnh quán có ban công hoa và xe đạp trước cửa.
- **Cấp 5 · Chuỗi cửa hàng**: cửa hàng góc phố cao cấp, mặt quầy terrazzo hồng cam chấm vàng, đường neon pastel; sàn terrazzo; ảnh cửa hàng lớn với hàng khách chibi đang chờ.

## Prompt 11 · Màn hình loading và đồ trang trí

- Màn loading (dọc 9:16, không chữ): hai bé mèo Chub (cam) và Bim (trắng, nơ hồng) ngồi bên ly giấy cá viên chiên cắm xiên que, phía sau là xe đẩy và chảo dầu bốc khói. Gửi mình để nhúng vào nền `#boot`.
- `w_neon`: bảng neon hình xiên cá viên (không chữ, game tự vẽ chữ nếu chưa có hình).
- `cup_ly`: cúp cho bộ "Giấy bọc ly", trên cúp có hình ly giấy cá viên (cùng kiểu với 8 cúp còn lại, cao 120px).
