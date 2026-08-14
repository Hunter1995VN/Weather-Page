import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  createIcons, 
  Search, 
  X, 
  Crosshair, 
  RefreshCw, 
  MapPin, 
  ArrowDown, 
  ArrowUp, 
  Clock, 
  Calendar, 
  Droplets, 
  Wind, 
  Sun, 
  SunMedium, 
  SunDim, 
  Activity, 
  Gauge, 
  Layers, 
  LocateFixed, 
  ShieldCheck 
} from 'lucide';

// Initialize Lucide Icons
function refreshIcons() {
  createIcons({
    icons: {
      Search, X, Crosshair, RefreshCw, MapPin, ArrowDown, ArrowUp, Clock, Calendar,
      Droplets, Wind, Sun, SunMedium, SunDim, Activity, Gauge, Layers, LocateFixed, ShieldCheck
    }
  });
}

// Application State
const state = {
  lat: 16.0544, // Default Da Nang
  lon: 108.2022,
  locationName: 'Đà Nẵng',
  locationSub: 'Việt Nam',
  isUserLocation: false,
  unit: 'C', // 'C' or 'F'
  activeLayer: 'dark', // 'dark', 'satellite', 'street'
  map: null,
  tileLayer: null,
  marker: null,
  radarCircle: null,
  weatherData: null,
  aqiData: null
};

// Map Tile Providers
const TILE_PROVIDERS = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye'
  },
  street: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  }
};

// Weather Code Interpretation (WMO Code Standard)
const WMO_CODES = {
  0: { desc: 'Trời quang đãng', icon: '☀️', theme: 'sunny', isRain: false },
  1: { desc: 'Nắng ít mây', icon: '🌤️', theme: 'sunny', isRain: false },
  2: { desc: 'Mây rải rác', icon: '⛅', theme: 'cloudy', isRain: false },
  3: { desc: 'Nhiều mây âm u', icon: '☁️', theme: 'cloudy', isRain: false },
  45: { desc: 'Sương mù dày', icon: '🌫️', theme: 'cloudy', isRain: false },
  48: { desc: 'Sương muối', icon: '🌫️', theme: 'cloudy', isRain: false },
  51: { desc: 'Mưa phùn nhẹ', icon: '🌦️', theme: 'rainy', isRain: true },
  53: { desc: 'Mưa phùn vừa', icon: '🌧️', theme: 'rainy', isRain: true },
  55: { desc: 'Mưa phùn nặng hạt', icon: '🌧️', theme: 'rainy', isRain: true },
  61: { desc: 'Mưa rào nhẹ', icon: '🌧️', theme: 'rainy', isRain: true },
  63: { desc: 'Mưa rào vừa', icon: '🌧️', theme: 'rainy', isRain: true },
  65: { desc: 'Mưa rào xối xả', icon: '🌧️', theme: 'rainy', isRain: true },
  71: { desc: 'Tuyết rơi nhẹ', icon: '🌨️', theme: 'cloudy', isRain: false },
  73: { desc: 'Tuyết rơi vừa', icon: '🌨️', theme: 'cloudy', isRain: false },
  75: { desc: 'Tuyết rơi dày', icon: '❄️', theme: 'cloudy', isRain: false },
  80: { desc: 'Mưa rào rải rác', icon: '🌦️', theme: 'rainy', isRain: true },
  81: { desc: 'Mưa rào mạnh', icon: '🌧️', theme: 'rainy', isRain: true },
  82: { desc: 'Mưa rào dữ dội', icon: '⛈️', theme: 'storm', isRain: true },
  95: { desc: 'Dông bão sấm sét', icon: '⛈️', theme: 'storm', isRain: true },
  96: { desc: 'Dông kèm mưa đá', icon: '⛈️', theme: 'storm', isRain: true },
  99: { desc: 'Dông bão dữ dội', icon: '⛈️', theme: 'storm', isRain: true }
};

// DOM References
const el = {
  loader: document.getElementById('loader'),
  loaderText: document.getElementById('loaderText'),
  
  citySearch: document.getElementById('citySearch'),
  clearSearch: document.getElementById('clearSearch'),
  searchSuggestions: document.getElementById('searchSuggestions'),
  btnGeo: document.getElementById('btnGeo'),
  btnRefresh: document.getElementById('btnRefresh'),
  btnRecenter: document.getElementById('btnRecenter'),
  quickCities: document.getElementById('quickCities'),
  unitSwitch: document.getElementById('unitSwitch'),

  locationName: document.getElementById('locationName'),
  locationSub: document.getElementById('locationSub'),
  currentTime: document.getElementById('currentTime'),
  currentTemp: document.getElementById('currentTemp'),
  unitDisplay: document.getElementById('unitDisplay'),
  weatherIcon: document.getElementById('weatherIcon'),
  weatherDesc: document.getElementById('weatherDesc'),
  feelsLike: document.getElementById('feelsLike'),
  tempMin: document.getElementById('tempMin'),
  tempMax: document.getElementById('tempMax'),
  heroUv: document.getElementById('heroUv'),
  heroAqi: document.getElementById('heroAqi'),

  mapCoords: document.getElementById('mapCoords'),
  hourlyForecast: document.getElementById('hourlyForecast'),
  dailyForecast: document.getElementById('dailyForecast'),

  windSpeed: document.getElementById('windSpeed'),
  windSpeedUnit: document.getElementById('windSpeedUnit'),
  windDirText: document.getElementById('windDirText'),
  windGust: document.getElementById('windGust'),
  compassNeedle: document.getElementById('compassNeedle'),

  uvVal: document.getElementById('uvVal'),
  uvCatPill: document.getElementById('uvCatPill'),
  uvGaugeFill: document.getElementById('uvGaugeFill'),
  uvAdvice: document.getElementById('uvAdvice'),

  sunriseTime: document.getElementById('sunriseTime'),
  sunsetTime: document.getElementById('sunsetTime'),
  sunOrb: document.getElementById('sunOrb'),
  sunArcProgress: document.getElementById('sunArcProgress'),
  sunPhasePill: document.getElementById('sunPhasePill'),

  aqiScore: document.getElementById('aqiScore'),
  aqiCatPill: document.getElementById('aqiCatPill'),
  aqiHealthBadge: document.getElementById('aqiHealthBadge'),
  pm25Val: document.getElementById('pm25Val'),
  pm25Bar: document.getElementById('pm25Bar'),
  pm10Val: document.getElementById('pm10Val'),
  pm10Bar: document.getElementById('pm10Bar'),

  humidityVal: document.getElementById('humidityVal'),
  humidityComfort: document.getElementById('humidityComfort'),
  humidityGaugeFill: document.getElementById('humidityGaugeFill'),
  dewPointVal: document.getElementById('dewPointVal'),

  pressureVal: document.getElementById('pressureVal'),
  visibilityVal: document.getElementById('visibilityVal')
};

// Unit Conversion Helpers
function toTemp(celsius, withUnit = true) {
  if (celsius === null || celsius === undefined || isNaN(celsius)) return '--';
  const val = state.unit === 'F' ? Math.round((celsius * 9/5) + 32) : Math.round(celsius);
  return withUnit ? `${val}°` : `${val}`;
}

function toSpeed(kmh) {
  if (kmh === null || kmh === undefined || isNaN(kmh)) return { val: '--', unit: 'km/h' };
  if (state.unit === 'F') {
    return { val: Math.round(kmh * 0.621371), unit: 'mph' };
  }
  return { val: Math.round(kmh), unit: 'km/h' };
}

// Loader Utilities
function showLoader(text = 'Đang đồng bộ dữ liệu thời tiết...') {
  if (el.loaderText) el.loaderText.textContent = text;
  if (el.loader) el.loader.classList.remove('hidden');
}

function hideLoader() {
  if (el.loader) el.loader.classList.add('hidden');
}

// Helper Formatters
function getDayName(timeSec, isToday = false) {
  if (isToday) return 'Hôm nay';
  const date = new Date(timeSec * 1000);
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return days[date.getDay()];
}

function getWindDirection(deg) {
  const directions = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc'];
  return directions[Math.round(deg / 45) % 8];
}

function getUVDetails(uv) {
  if (uv <= 2) return { text: 'Thấp (An toàn)', pill: 'An toàn', advice: 'Bảo vệ da an toàn, không cần che chắn', color: '#10b981' };
  if (uv <= 5) return { text: 'Trung bình', pill: 'Trung bình', advice: 'Nên đội mũ & đeo kính khi ra ngoài', color: '#f59e0b' };
  if (uv <= 7) return { text: 'Cao (Nguy hại)', pill: 'Cao', advice: 'Cần thoa kem chống nắng & che chắn', color: '#f97316' };
  if (uv <= 10) return { text: 'Rất cao (Nguy hiểm)', pill: 'Rất cao', advice: 'Hạn chế ở ngoài trời từ 11h - 15h', color: '#ef4444' };
  return { text: 'Cực độ (Cực nguy hại)', pill: 'Cực độ', advice: 'Tránh ra ngoài trời, gây bỏng rát da', color: '#a855f7' };
}

function getAQIDetails(aqi) {
  if (aqi <= 50) return { text: 'Trong lành', badge: 'Tốt', color: '#10b981' };
  if (aqi <= 100) return { text: 'Chấp nhận được', badge: 'Trung bình', color: '#f59e0b' };
  if (aqi <= 150) return { text: 'Kém (Nhạy cảm)', badge: 'Kém', color: '#f97316' };
  if (aqi <= 200) return { text: 'Xấu (Ô nhiễm)', badge: 'Xấu', color: '#ef4444' };
  return { text: 'Rất nguy hại', badge: 'Nguy hại', color: '#a855f7' };
}

// Leaflet Map Initialization
function initMap() {
  if (state.map) return;
  try {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    state.map = L.map('map', {
      center: [state.lat, state.lon],
      zoom: 13,
      zoomControl: true
    });

    // Default Dark Matter Tile Layer
    setMapLayer('dark');

    // Custom Neon Radar Pin
    const customIcon = L.divIcon({
      className: 'custom-neon-beacon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
          <div style="
            position: absolute;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: rgba(56, 189, 248, 0.35);
            animation: beacon-wave 2s infinite cubic-bezier(0, 0, 0.2, 1);
          "></div>
          <div style="
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, #0284c7, #38bdf8);
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 16px rgba(56, 189, 248, 1), 0 4px 10px rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 2;
          "></div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    state.marker = L.marker([state.lat, state.lon], { icon: customIcon }).addTo(state.map);

    // Accuracy Circle
    state.radarCircle = L.circle([state.lat, state.lon], {
      radius: 1200,
      color: '#38bdf8',
      fillColor: '#38bdf8',
      fillOpacity: 0.1,
      weight: 2,
      dashArray: '6, 8'
    }).addTo(state.map);

    // Map Click Interaction
    state.map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      fetchWeatherForCoords(lat, lng, false);
    });

    [150, 400, 800, 1500].forEach(delay => {
      setTimeout(() => {
        if (state.map) state.map.invalidateSize();
      }, delay);
    });
  } catch (err) {
    console.warn('Leaflet map error:', err);
  }
}

function setMapLayer(layerName) {
  if (!state.map || !TILE_PROVIDERS[layerName]) return;
  state.activeLayer = layerName;

  if (state.tileLayer) {
    state.map.removeLayer(state.tileLayer);
  }

  const prov = TILE_PROVIDERS[layerName];
  state.tileLayer = L.tileLayer(prov.url, {
    minZoom: 1,
    maxZoom: 19,
    attribution: prov.attribution
  }).addTo(state.map);

  // Update toggle active buttons
  document.querySelectorAll('.layer-tab[data-layer]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.layer === layerName);
  });
}

function updateMapPosition(lat, lon, title, tempStr, rainInfo) {
  if (!state.map) return;
  state.map.flyTo([lat, lon], 13, { duration: 1.5 });
  state.marker.setLatLng([lat, lon]);
  if (state.radarCircle) {
    state.radarCircle.setLatLng([lat, lon]);
  }

  const popupContent = `
    <div style="text-align: center; padding: 4px 6px; font-family: inherit;">
      <div style="font-size: 11px; font-weight: 700; color: #38bdf8; margin-bottom: 2px;">📍 ${title}</div>
      <div style="font-size: 18px; font-weight: 800; color: #ffffff;">${tempStr}</div>
      <div style="font-size: 11px; margin-top: 2px; color: ${rainInfo.isRain ? '#38bdf8' : '#10b981'}; font-weight: 600;">
        ${rainInfo.text}
      </div>
    </div>
  `;

  state.marker.setPopupContent(popupContent);
  state.marker.openPopup();
  el.mapCoords.textContent = `📍 ${title} (${lat.toFixed(4)}, ${lon.toFixed(4)})`;

  setTimeout(() => {
    if (state.map) state.map.invalidateSize();
  }, 250);
}

// Reverse Geocoding
async function fetchReverseGeocoding(lat, lon) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&accept-language=vi`, {
      headers: { 'Accept-Language': 'vi' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      const road = addr.road || addr.pedestrian || '';
      const ward = addr.suburb || addr.quarter || addr.neighbourhood || addr.village || addr.town || '';
      const district = addr.city_district || addr.district || addr.county || '';
      const city = addr.city || addr.state || addr.province || '';
      const country = addr.country || 'Việt Nam';

      let primaryName = '';
      if (ward && district) {
        primaryName = `${ward}, ${district}`;
      } else if (road && district) {
        primaryName = `${road}, ${district}`;
      } else if (district && city) {
        primaryName = `${district}, ${city}`;
      } else if (ward && city) {
        primaryName = `${ward}, ${city}`;
      } else if (city) {
        primaryName = city;
      } else {
        primaryName = data.display_name ? data.display_name.split(',')[0] : `Vùng (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
      }

      let subName = '';
      if (city && !primaryName.includes(city)) {
        subName = `${city}, ${country}`;
      } else {
        subName = country;
      }

      return { primaryName, subName };
    }
  } catch (err) {
    console.warn('Geocoding error:', err);
  }
  return { primaryName: `Tọa độ (${lat.toFixed(2)}, ${lon.toFixed(2)})`, subName: 'Việt Nam' };
}

// Primary Data Fetch
async function fetchWeatherForCoords(lat, lon, isUserGeo = false) {
  showLoader('Đang kết nối vệ tinh & nạp dữ liệu thời tiết...');
  state.lat = lat;
  state.lon = lon;
  state.isUserLocation = isUserGeo;

  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset&timezone=auto&timeformat=unixtime`;
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10`;

    const [weatherRes, aqiRes, geoInfo] = await Promise.all([
      fetch(weatherUrl).then(r => r.json()),
      fetch(aqiUrl).then(r => r.json()).catch(() => null),
      fetchReverseGeocoding(lat, lon).catch(() => ({ primaryName: `Vùng (${lat.toFixed(2)}, ${lon.toFixed(2)})`, subName: 'Việt Nam' }))
    ]);

    state.weatherData = weatherRes;
    state.aqiData = aqiRes;
    state.locationName = geoInfo.primaryName;
    state.locationSub = geoInfo.subName;

    renderAllData();
  } catch (err) {
    console.error('Fetch Weather Failed:', err);
  } finally {
    hideLoader();
  }
}

// Full Render Pipeline
function renderAllData() {
  const w = state.weatherData;
  if (!w || !w.current) return;

  const current = w.current;
  const daily = w.daily;
  const hourly = w.hourly;
  const code = current.weather_code;
  const info = WMO_CODES[code] || { desc: 'Không xác định', icon: '🌤️', theme: 'sunny', isRain: false };

  // Set Atmospheric Theme
  document.body.className = current.is_day ? `theme-${info.theme}` : 'theme-night';

  // Hero Card
  el.locationName.textContent = state.locationName;
  el.locationSub.querySelector('span').textContent = state.isUserLocation ? `Vị trí GPS của bạn • ${state.locationSub}` : state.locationSub;
  
  const now = new Date();
  el.currentTime.textContent = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  
  el.currentTemp.textContent = toTemp(current.temperature_2m, false);
  el.unitDisplay.textContent = `°${state.unit}`;
  el.weatherIcon.textContent = info.icon;
  el.weatherDesc.textContent = info.desc;
  el.feelsLike.textContent = `Cảm giác như ${toTemp(current.apparent_temperature)}`;

  if (daily && daily.temperature_2m_min && daily.temperature_2m_max) {
    el.tempMin.textContent = toTemp(daily.temperature_2m_min[0]);
    el.tempMax.textContent = toTemp(daily.temperature_2m_max[0]);
  }

  const maxUV = daily && daily.uv_index_max ? daily.uv_index_max[0] : 3;
  el.heroUv.textContent = maxUV.toFixed(1);

  const aqiScore = (state.aqiData && state.aqiData.current && state.aqiData.current.us_aqi) ? state.aqiData.current.us_aqi : 42;
  el.heroAqi.textContent = `${aqiScore} AQI`;

  // Render 6 Telemetry Widgets
  renderTelemetryWidgets(current, daily);

  // Render Forecasts
  renderHourlyForecast(hourly);
  renderDailyForecast(daily);

  // Rain info
  const hasRain = current.precipitation > 0 || info.isRain;
  const rainInfo = {
    isRain: hasRain,
    text: hasRain ? `🌧️ Có mưa (${current.precipitation || 1} mm)` : `🌤️ Khô ráo, không có mưa`
  };

  // Update Map Position
  updateMapPosition(state.lat, state.lon, state.locationName, `${toTemp(current.temperature_2m)} ${info.icon}`, rainInfo);
  refreshIcons();
}

// Telemetry Widgets Render
function renderTelemetryWidgets(current, daily) {
  // 1. Wind Compass
  const speedObj = toSpeed(current.wind_speed_10m);
  el.windSpeed.textContent = speedObj.val;
  el.windSpeedUnit.textContent = speedObj.unit;
  const gustObj = toSpeed(current.wind_gusts_10m || (current.wind_speed_10m * 1.3));
  el.windGust.textContent = `Gió giật: ${gustObj.val} ${gustObj.unit}`;
  const windDirName = getWindDirection(current.wind_direction_10m);
  el.windDirText.textContent = `${windDirName} (${current.wind_direction_10m}°)`;
  el.compassNeedle.style.transform = `rotate(${current.wind_direction_10m}deg)`;

  // 2. UV Radiant Gauge
  const maxUV = daily && daily.uv_index_max ? daily.uv_index_max[0] : 3.5;
  const uvDetail = getUVDetails(maxUV);
  el.uvVal.textContent = maxUV.toFixed(1);
  el.uvCatPill.textContent = uvDetail.pill;
  el.uvCatPill.style.color = uvDetail.color;
  el.uvAdvice.textContent = uvDetail.advice;
  const uvPercent = Math.min(100, Math.max(8, (maxUV / 11) * 100));
  el.uvGaugeFill.style.width = `${uvPercent}%`;

  // 3. Sun & Moon Astral Arc Tracker
  if (daily && daily.sunrise && daily.sunset) {
    const sunriseSec = daily.sunrise[0];
    const sunsetSec = daily.sunset[0];
    const sunriseDate = new Date(sunriseSec * 1000);
    const sunsetDate = new Date(sunsetSec * 1000);
    
    el.sunriseTime.textContent = sunriseDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    el.sunsetTime.textContent = sunsetDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const nowSec = Math.floor(Date.now() / 1000);
    let sunProgress = 0;
    if (nowSec >= sunriseSec && nowSec <= sunsetSec) {
      sunProgress = (nowSec - sunriseSec) / (sunsetSec - sunriseSec);
      el.sunPhasePill.textContent = 'Ban ngày';
      el.sunPhasePill.style.color = 'var(--accent-gold)';
    } else {
      sunProgress = 0;
      el.sunPhasePill.textContent = 'Ban đêm';
      el.sunPhasePill.style.color = 'var(--accent-indigo)';
    }

    // Parabolic Arc Position Calculation
    const angle = Math.PI * (1 - sunProgress);
    const cx = 100 - 85 * Math.cos(angle);
    const cy = 70 - 55 * Math.sin(angle);
    el.sunOrb.setAttribute('cx', cx.toFixed(1));
    el.sunOrb.setAttribute('cy', cy.toFixed(1));
  }

  // 4. Air Quality (AQI)
  const aqiScore = (state.aqiData && state.aqiData.current && state.aqiData.current.us_aqi) ? state.aqiData.current.us_aqi : 38;
  const aqiDetail = getAQIDetails(aqiScore);
  el.aqiScore.textContent = aqiScore;
  el.aqiCatPill.textContent = aqiDetail.text;
  el.aqiCatPill.style.color = aqiDetail.color;
  el.aqiHealthBadge.textContent = aqiDetail.badge;
  el.aqiHealthBadge.style.color = aqiDetail.color;

  const pm25 = (state.aqiData && state.aqiData.current && state.aqiData.current.pm2_5) ? state.aqiData.current.pm2_5 : 12.4;
  const pm10 = (state.aqiData && state.aqiData.current && state.aqiData.current.pm10) ? state.aqiData.current.pm10 : 25.1;
  el.pm25Val.textContent = `${pm25.toFixed(1)} µg/m³`;
  el.pm10Val.textContent = `${pm10.toFixed(1)} µg/m³`;
  el.pm25Bar.style.width = `${Math.min(100, (pm25 / 50) * 100)}%`;
  el.pm10Bar.style.width = `${Math.min(100, (pm10 / 100) * 100)}%`;

  // 5. Humidity & Dew Point
  el.humidityVal.textContent = current.relative_humidity_2m;
  el.humidityGaugeFill.style.width = `${current.relative_humidity_2m}%`;
  const dewPoint = Math.round(current.temperature_2m - ((100 - current.relative_humidity_2m) / 5));
  el.dewPointVal.textContent = `Điểm sương: ${toTemp(dewPoint)}`;
  if (current.relative_humidity_2m < 40) el.humidityComfort.textContent = 'Hơi khô';
  else if (current.relative_humidity_2m <= 65) el.humidityComfort.textContent = 'Lý tưởng';
  else el.humidityComfort.textContent = 'Ẩm cao';

  // 6. Barometric Pressure & Visibility
  el.pressureVal.textContent = `${Math.round(current.surface_pressure)} hPa`;
  el.visibilityVal.textContent = '10.0 km';
}

// 24-Hour Forecast Scroller
function renderHourlyForecast(hourly) {
  if (!hourly || !hourly.time) return;
  el.hourlyForecast.innerHTML = '';

  const nowSec = Math.floor(Date.now() / 1000);

  // Find index closest to now
  let startIndex = 0;
  let minDiff = Infinity;

  for (let idx = 0; idx < hourly.time.length; idx++) {
    const timeSec = hourly.time[idx];
    const diff = Math.abs(timeSec - nowSec);
    if (diff < minDiff) {
      minDiff = diff;
      startIndex = idx;
    }
  }

  // Slice 24 hours
  for (let i = 0; i < 24; i++) {
    const dataIdx = startIndex + i;
    if (dataIdx >= hourly.time.length) break;

    const date = new Date(hourly.time[dataIdx] * 1000);
    const hourNum = date.getHours();

    const code = hourly.weather_code[dataIdx];
    const info = WMO_CODES[code] || { icon: '🌤️' };
    const tempStr = toTemp(hourly.temperature_2m[dataIdx]);
    const pop = hourly.precipitation_probability ? hourly.precipitation_probability[dataIdx] : 0;

    const isNow = (i === 0);

    const card = document.createElement('div');
    card.className = `hourly-card ${isNow ? 'active-hour' : ''}`;
    card.innerHTML = `
      <span class="hour-timestamp">${isNow ? 'Bây giờ' : `${hourNum}:00`}</span>
      <span class="hour-icon">${info.icon}</span>
      <span class="hour-temp-tag">${tempStr}</span>
      ${pop > 15 ? `<span class="hour-pop-badge">☔ ${pop}%</span>` : ''}
    `;
    el.hourlyForecast.appendChild(card);
  }
}

// 7-Day Dynamic Temperature Spectrum Range Forecast
function renderDailyForecast(daily) {
  if (!daily || !daily.time) return;
  el.dailyForecast.innerHTML = '';

  const allMin = Math.min(...daily.temperature_2m_min);
  const allMax = Math.max(...daily.temperature_2m_max);
  const range = (allMax - allMin) || 1;

  for (let i = 0; i < daily.time.length; i++) {
    const isToday = i === 0;
    const dayText = getDayName(daily.time[i], isToday);
    const code = daily.weather_code[i];
    const info = WMO_CODES[code] || { desc: 'Nắng nhẹ', icon: '🌤️' };
    const minTemp = daily.temperature_2m_min[i];
    const maxTemp = daily.temperature_2m_max[i];

    const leftPercent = Math.max(0, Math.min(100, ((minTemp - allMin) / range) * 100));
    const widthPercent = Math.max(12, Math.min(100 - leftPercent, ((maxTemp - minTemp) / range) * 100));

    const row = document.createElement('div');
    row.className = 'daily-row';
    row.innerHTML = `
      <div class="daily-date-lbl">${dayText}</div>
      <div class="daily-ico">${info.icon}</div>
      <div class="daily-weather-desc">${info.desc}</div>
      <div class="spectrum-bar-wrap">
        <span class="temp-min-text">${toTemp(minTemp)}</span>
        <div class="spectrum-track">
          <div class="spectrum-gradient-fill" style="left: ${leftPercent.toFixed(1)}%; width: ${widthPercent.toFixed(1)}%;"></div>
        </div>
        <span class="temp-max-text">${toTemp(maxTemp)}</span>
      </div>
    `;
    el.dailyForecast.appendChild(row);
  }
}

// Search Autocomplete
let searchTimeout;
async function handleSearchInput(e) {
  const query = e.target.value.trim();
  if (query.length > 0) {
    el.clearSearch.classList.remove('hidden');
  } else {
    el.clearSearch.classList.add('hidden');
    el.searchSuggestions.classList.add('hidden');
    return;
  }

  if (query.length < 2) return;

  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=vi`);
      if (res.ok) {
        const data = await res.json();
        renderSearchSuggestions(data.results || []);
      }
    } catch (err) {
      console.warn('Search geocoding error:', err);
    }
  }, 300);
}

function renderSearchSuggestions(results) {
  if (results.length === 0) {
    el.searchSuggestions.innerHTML = '<div class="dropdown-item">Không tìm thấy địa điểm phù hợp</div>';
    el.searchSuggestions.classList.remove('hidden');
    return;
  }

  el.searchSuggestions.innerHTML = '';
  results.forEach(item => {
    const div = document.createElement('div');
    div.className = 'dropdown-item';
    div.innerHTML = `
      <span>📍 <strong>${item.name}</strong> ${item.admin1 ? `, ${item.admin1}` : ''}</span>
      <span style="font-size: 11px; color: var(--text-sub);">${item.country || ''}</span>
    `;
    div.addEventListener('click', () => {
      el.citySearch.value = item.name;
      el.searchSuggestions.classList.add('hidden');
      fetchWeatherForCoords(item.latitude, item.longitude, false);
    });
    el.searchSuggestions.appendChild(div);
  });
  el.searchSuggestions.classList.remove('hidden');
}

// Geolocation
function getUserLocation() {
  if ('geolocation' in navigator) {
    showLoader('Đang xác định tọa độ GPS vệ tinh của bạn...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeatherForCoords(latitude, longitude, true);
      },
      (err) => {
        console.warn('Geolocation denied, fallback to default:', err.message);
        fetchWeatherForCoords(state.lat, state.lon, false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  } else {
    fetchWeatherForCoords(state.lat, state.lon, false);
  }
}

// Event Listeners Setup
function setupEventListeners() {
  // GPS & Refresh
  el.btnGeo.addEventListener('click', getUserLocation);
  el.btnRefresh.addEventListener('click', () => fetchWeatherForCoords(state.lat, state.lon, state.isUserLocation));

  // Map Recenter
  el.btnRecenter.addEventListener('click', () => {
    if (state.map) {
      state.map.flyTo([state.lat, state.lon], 13);
      setTimeout(() => state.map.invalidateSize(), 250);
    }
  });

  // Layer Toggles
  document.querySelectorAll('.layer-tab[data-layer]').forEach(btn => {
    btn.addEventListener('click', () => {
      setMapLayer(btn.dataset.layer);
    });
  });

  // Quick City Chips
  el.quickCities.addEventListener('click', (e) => {
    const chip = e.target.closest('.city-chip');
    if (!chip) return;
    document.querySelectorAll('.city-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const lat = parseFloat(chip.dataset.lat);
    const lon = parseFloat(chip.dataset.lon);
    fetchWeatherForCoords(lat, lon, false);
  });

  // Unit Switcher °C / °F
  el.unitSwitch.addEventListener('click', (e) => {
    const btn = e.target.closest('.unit-btn');
    if (!btn || btn.dataset.unit === state.unit) return;
    document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.unit = btn.dataset.unit;
    renderAllData();
  });

  // Search Input & Clear
  el.citySearch.addEventListener('input', handleSearchInput);
  el.clearSearch.addEventListener('click', () => {
    el.citySearch.value = '';
    el.clearSearch.classList.add('hidden');
    el.searchSuggestions.classList.add('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!el.citySearch.contains(e.target) && !el.searchSuggestions.contains(e.target)) {
      el.searchSuggestions.classList.add('hidden');
    }
  });

  // Window Resize Auto Fit
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (state.map) {
        state.map.invalidateSize();
      }
    }, 200);
  });
}

// App Initialization
function init() {
  refreshIcons();
  initMap();
  setupEventListeners();
  getUserLocation();
}

document.addEventListener('DOMContentLoaded', init);
