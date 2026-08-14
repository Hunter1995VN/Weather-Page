# CONTEXT.md - AETHER Spatial Atmospheric Weather Studio

## Overview
AETHER là nền tảng dự báo thời tiết không gian & khí tượng trực quan thế hệ mới, tích hợp bản đồ radar đa tầng Leaflet (Dark OpenStreetMap / Satellite / Street), dự báo 24 giờ liên tục theo múi giờ địa phương, dự báo 7 ngày với dải nhiệt độ quang phổ động, cùng bộ 6 widget đo lường khí tượng thông minh.

## Progress & Recent Activity
- **Fix Map & Tracking Prevention Issue (2026-08-14)**:
  - Loại bỏ link ngoài `unpkg.com` trong `index.html` (nguyên nhân gây cảnh báo "Tracking Prevention blocked access to storage").
  - Đóng gói trực tiếp `leaflet.css` vào trong bundle Vite của dự án.
  - Sử dụng OpenStreetMap Tile Server tiêu chuẩn với `crossOrigin: true` và bộ lọc `osm-dark-tiles` tương thích 100% với mọi trình duyệt và chế độ bảo vệ theo dõi.
  - Chuẩn hóa cấu hình Rollup hash trong `vite.config.js` để triệt tiêu lỗi 404 cache.
  - Đã chụp màn hình xác minh bản đồ hiển thị rõ nét 100%.
  - Đã build production, commit `fix(map): ...`, push lên `main` và Deploy thành công lên GitHub Pages.

## Active Status & Next Steps
- **Branch**: `main`
- **Deployment**: Live trên GitHub Pages (`https://hunter1995vn.github.io/Weather-Page/`)
- **Status**: Bản đồ và toàn bộ tính năng hoạt động hoàn hảo 100%.
