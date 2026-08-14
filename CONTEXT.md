# CONTEXT.md - SkyPulse Weather Page

## Overview
SkyPulse Weather Page là ứng dụng dự báo thời tiết trực quan thời gian thực, tích hợp bản đồ định vị Leaflet & OpenStreetMap (CartoDB Voyager), dự báo 24h & 7 ngày (với Visual Temp Range Bar), cùng các chỉ số môi trường AQI.

## Progress & Recent Activity
- **Fix Timezone Mismatch in 24h Hourly Forecast (2026-08-14)**:
  - Khắc phục triệt để lỗi logic múi giờ: so sánh `now.toISOString().slice(0, 13)` (trả về giờ UTC `07:00`) với chuỗi giờ địa phương của API làm nhảy mốc giờ từ "Bây giờ" sang "8:00" thay vì "15:00".
  - Sửa thuật toán tìm `startIndex` bằng so sánh timestamp tuyệt đối (`new Date(hourly.time[idx]).getTime()`), đảm bảo giờ sau "Bây giờ" (14:00) hiển thị chính xác là `15:00`, `16:00`, `17:00`... theo giờ local Việt Nam (ICT).
  - Đã commit `fix(forecast): ...`, push lên `main` và Deploy lại bản mới nhất lên GitHub Pages.

## Active Status & Next Steps
- **Branch**: `main`
- **Deployment**: Live trên GitHub Pages (`https://hunter1995vn.github.io/Weather-Page/`)
- **Status**: Dự báo 24 giờ tới hiển thị đúng theo thứ tự giờ địa phương thực tế.
