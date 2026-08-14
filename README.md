# 🌤️ SkyPulse - Live Weather & Interactive Map App

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-38bdf8?style=for-the-badge&logo=github)](https://hunter1995vn.github.io/Weather-Page/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Built with Vite](https://img.shields.io/badge/Built_with-Vite-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

> 🚀 **SkyPulse** là ứng dụng dự báo thời tiết trực quan, thời gian thực tích hợp bản đồ địa lý tương tác chính xác dựa trên vị trí địa lý của bạn.

---

## 🔗 Live Demo & Deployment

👉 **Trải nghiệm ngay tại**: [https://hunter1995vn.github.io/Weather-Page/](https://hunter1995vn.github.io/Weather-Page/)

---

## ✨ Tính Năng Nổi Bật

- 📍 **Định vị tự động chính xác (Auto Geolocation)**: Tự động phát hiện vị trí GPS của người dùng thông qua trình duyệt và hiển thị ngay thời tiết thực tế.
- 🗺️ **Bản đồ tương tác 100% (Leaflet & OpenStreetMap)**:
  - Hiển thị vị trí pin marker chính xác từng tọa độ.
  - Cho phép nhấp trực tiếp vào bất kỳ địa điểm nào trên bản đồ thế giới để xem ngay thời tiết vùng đó.
  - Nút khôi phục vị trí (Recenter to My Location).
- 🌡️ **Dữ liệu thời tiết chuyên sâu (Open-Meteo API)**:
  - Nhiệt độ thực tế, Cảm giác thực (Feels like), Thấp nhất / Cao nhất trong ngày.
  - Dự báo theo từng giờ (24-Hour Hourly Forecast).
  - Dự báo 7 ngày tới (7-Day Forecast).
  - Các chỉ số mở rộng: Độ ẩm, Điểm sương, Tốc độ & Hướng gió, Chỉ số UV, Áp suất khí quyển, Tầm nhìn.
- 🍃 **Chất lượng Không khí (AQI Index)**: Cung cấp chỉ số bụi mịn PM2.5, PM10 và mức độ an toàn cho sức khỏe.
- 🔍 **Tìm kiếm địa danh thông minh**: Gợi ý thành phố/quốc gia toàn cầu theo thời gian thực (Real-time Autocomplete).
- 💎 **Giao diện Glassmorphism đỉnh cao**: Design system sang trọng, hiệu ứng đổ bóng glass, animation mượt mà, responsive hoàn hảo trên mọi thiết bị.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend Core**: Vanilla HTML5, CSS3 Variables, JavaScript ES6+
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Map Library**: [Leaflet.js](https://leafletjs.com/) + OpenStreetMap Tiles
- **Weather API**: [Open-Meteo API](https://open-meteo.com/) (No API Key Required & Fast Global Data)
- **Geocoding**: Open-Meteo Geocoding & OpenStreetMap Nominatim
- **Icons**: [Lucide Icons](https://lucide.dev/)

---

## 🚀 Hướng Dẫn Chạy Cục Bộ (Local Setup)

```bash
# 1. Clone repository
git clone https://github.com/Hunter1995VN/Weather-Page.git

# 2. Di chuyển vào thư mục dự án
cd Weather-Page

# 3. Cài đặt các gói phụ thuộc
npm install

# 4. Chạy môi trường phát triển (Dev server)
npm run dev

# 5. Build dự án cho Production
npm run build
```

---

## 📜 Giấy Phép (License)

Dự án phát triển dưới giấy phép MIT. Thỏa sức đóng góp và phát triển!
