# CONTEXT.md - SkyPulse Weather Page

## Overview
SkyPulse Weather Page là ứng dụng dự báo thời tiết trực quan thời gian thực, tích hợp bản đồ định vị Leaflet & OpenStreetMap, dự báo 24h & 7 ngày, cùng các chỉ số môi trường AQI.

## Progress & Recent Activity
- **Layout Repair & Responsive Optimization (2026-08-14)**:
  - Khắc phục lỗi vỡ layout nghiêm trọng ở thẻ Hero, bản đồ Leaflet và lưới các chỉ số môi trường.
  - Sửa lỗi tràn bản đồ (`overflow: hidden; isolation: isolate`) trên `.map-wrapper`.
  - Cấu trúc lại Flex/Grid với `min-width: 0` giúp giao diện co giãn hoàn hảo trên các kích thước trình duyệt (Desktop, Tablet, Mobile).
  - Tối ưu hiển thị `.live-time` dạng badge ở góc phải thẻ Hero.
  - Cập nhật event listener `window.resize` cho `state.map.invalidateSize()`.
  - Đóng gói bản build Production (`npm run build`), commit với định dạng chuẩn (`fix(layout): ...`), push lên `origin main` và deploy lên GitHub Pages thành công.

## Active Status & Next Steps
- **Branch**: `main`
- **Deployment**: Live trên GitHub Pages (`https://hunter1995vn.github.io/Weather-Page/`)
- **Status**: Giao diện đã được khắc phục hoàn toàn, mượt mà và chuẩn responsive.
