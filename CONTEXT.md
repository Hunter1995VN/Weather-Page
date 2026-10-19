# CONTEXT.md - Aether: Sổ Tay Thời Tiết

## Giới thiệu dự án
**Aether: Sổ Tay Thời Tiết** là phiên bản thiết kế lại hoàn chỉnh dựa trên bản vẽ mẫu độc quyền trên Stitch (`Aether: Sổ Tay Thời Tiết` - Screen `Aether - Sổ tay thời tiết minh hoạ Đà Nẵng`). Website kết hợp hài hòa giữa tính chính xác khí tượng vệ tinh và ngôn ngữ mỹ thuật báo chí / risograph ấm áp lấy cảm hứng từ thành phố biển Đà Nẵng.

## Các quyết định thiết kế & Kỹ thuật chính
1. **Ngôn ngữ Thị giác & Bảng màu Báo chí (Risograph / Editorial Warmth)**:
   - Màu nền giấy kem thủ công ấm áp (`--paper: #F6F0E4; --paper-warm: #FAF5EB; --ink: #2A2320;`).
   - Lớp vân sần giấy thủ công SVG Fractal Noise (`paper-noise-overlay`).
   - Phông chữ kết hợp: `Fraunces` (warm vintage display serif) và `Be Vietnam Pro` (sans-serif thanh thoát chuẩn tiếng Việt).
2. **Minh hoạ Parallax Bầu trời & Bờ biển Đà Nẵng (SVG tự vẽ)**:
   - Mặt trời vàng bơ / Mặt trăng dịu dàng với vòng hào quang và tia nắng xoay chậm.
   - Các tầng mây bồng bềnh phong cách risograph bóng đôi trôi dạt nhẹ nhàng.
   - Rặng núi sương khói Bán đảo Sơn Trà và đường nét Cầu Rồng biểu tượng.
   - Bãi biển Mỹ Khê với sóng biển lăn tăn và thuyền thúng nhấp nhô của ngư dân.
   - Bờ cát thoai thoải và rặng dừa xanh đung đưa theo nhịp gió (`palmBreeze`).
3. **Biểu đồ 24 Giờ Dạng Đường Cong Mượt (Cubic Spline Chart)**:
   - Đường spline liên tục Bézier Catmull-Rom kết hợp vùng tô gradient và cột xác suất mưa ở chân biểu đồ.
   - Vạch chỉ báo thời điểm Bình minh & Hoàng hôn nét đứt kèm chú thích chính xác.
   - Tương tác rê chuột hiển thị tooltip chú thích viết tay chi tiết từng mốc giờ.
4. **Dự báo 7 Ngày Dạng Cột Sống Dọc (Weekly Editorial Spine)**:
   - Mỗi ngày là một hàng tinh tế với câu văn thơ miêu tả khí hậu miền duyên hải.
   - Dải vệt cọ biên độ nhiệt tuần chuyển màu từ xanh phi lao sang cam san hô.
5. **Bộ 6 Widget Đo lường Khí tượng Tinh xảo**:
   - Gió & La bàn: Kim la bàn vẽ tay hình chiếc lá chỉ đúng độ hướng gió, kèm đoạn văn miêu tả gió giật.
   - Tia cực tím UV: Mặt trời 11 tia với các tia phát sáng theo mức độ và khuyến nghị y tế.
   - Quỹ đạo mặt trời: Cung nhật thực cong trên sóng biển với quả cầu mặt trời di chuyển theo thời gian thực và thời gian nắng còn lại.
   - Chất lượng không khí (AQI): Nhánh lá cây tươi sạch, điểm AQI, thanh phân tích bụi mịn PM2.5 và bụi hạt PM10.
   - Độ ẩm tương đối: Giọt nước minh hoạ dâng mực nước sóng sánh theo tỷ lệ phần trăm độ ẩm và điểm sương.
   - Khí áp & Tầm nhìn: Đồng hồ barometer cổ điển và tầm nhìn xa trên biển.
6. **Bản đồ Vị trí Bức Ảnh Nghiêng (-0.6°) Đính Băng Keo Washi**:
   - Khung viền ảnh in bo tròn đính băng dính washi tape thủ công.
   - Tích hợp Leaflet với OpenStreetMap và Esri Satellite với bộ lọc ấm tone sepia, chấm định vị san hô nhấp nháy (`custom-map-pin`).
7. **Tìm kiếm & Phím tắt Nhanh**:
   - Modal tìm kiếm phím tắt `⌘K` / `Ctrl+K`, gợi ý nhanh các thành phố (Hội An, Huế, Đà Lạt, Nha Trang).
   - Nút chuyển đổi đơn vị `°C / °F`, định vị vệ tinh GPS `Vị trí của tôi`.

## Trạng thái triển khai
- **Mã nguồn**: Hoàn thành và tự kiểm tra visual trực tiếp trên trình duyệt `agent-browser`.
- **Build**: Vite 6 + Tailwind v4 biên dịch production sạch trong < 1s.
- **Trang chủ triển khai**: [https://hunter1995vn.github.io/Weather-Page/](https://hunter1995vn.github.io/Weather-Page/)
