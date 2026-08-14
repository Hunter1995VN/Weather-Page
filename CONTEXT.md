# CONTEXT.md - AETHER Spatial Atmospheric Weather Studio

## Overview
AETHER là nền tảng dự báo thời tiết không gian & khí tượng trực quan thế hệ mới, tích hợp bản đồ radar đa tầng Leaflet (Dark Matter / Satellite / Street), dự báo 24 giờ liên tục theo múi giờ địa phương, dự báo 7 ngày với dải nhiệt độ quang phổ động, cùng bộ 6 widget đo lường khí tượng thông minh.

## Progress & Recent Activity
- **Full Architecture & UI/UX Transformation to AETHER Studio (2026-08-14)**:
  - Tái thiết kế 100% giao diện theo trường phái Spatial Atmospheric Craft (kính mờ Glassmorphism 32px, viền specular phản quang, dynamic background mesh).
  - Tích hợp thanh Quick Favorite Cities (Đà Nẵng, Hà Nội, TP.HCM, Tokyo, Paris, New York).
  - Bộ chuyển đổi nhanh đơn vị nhiệt độ `°C / °F` và tốc độ gió `km/h / mph`.
  - Thiết kế lại dự báo 24h mượt mà với mốc thời gian liên tục chuẩn xác (`unixtime`).
  - Thiết kế lại dự báo 7 ngày với thanh dải quang phổ nhiệt độ (Dynamic Temperature Spectrum Range Bar).
  - Tích hợp bộ 6 tiện ích đo lường Telemetry:
    1. La bàn gió xoay kim đỏ thời gian thực 360°.
    2. Thước đo chỉ số tia cực tím UV và khuyến cáo bảo vệ da.
    3. Mô hình vòng cung quỹ đạo Mặt trời (Sun & Moon Parabolic Arc Tracker).
    4. Đo lường chất lượng không khí AQI cùng hàm lượng bụi mịn PM2.5 / PM10.
    5. Đồng hồ độ ẩm và tính toán điểm sương (Dew point).
    6. Khí áp khí quyển và tầm nhìn quang học.
  - Bản đồ định vị đa lớp (Dark Matter, Vệ tinh Esri HD, Bản đồ đường phố Voyager).
  - Đã build production, commit `feat(aether): ...`, push lên `main` và Deploy thành công lên GitHub Pages.

## Active Status & Next Steps
- **Branch**: `main`
- **Deployment**: Live trên GitHub Pages (`https://hunter1995vn.github.io/Weather-Page/`)
- **Status**: Hoàn thành xuất sắc việc lột xác toàn diện giao diện.
