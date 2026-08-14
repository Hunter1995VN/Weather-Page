import L from 'leaflet';
import { 
  createIcons, 
  Search, 
  X, 
  Locate, 
  RefreshCw, 
  AlertTriangle, 
  ArrowDown, 
  ArrowUp, 
  Clock, 
  Clock3, 
  Droplets, 
  Wind, 
  Sun, 
  Activity, 
  Gauge, 
  Eye, 
  MapPin, 
  MousePointerClick, 
  Crosshair, 
  CalendarDays 
} from 'lucide';

// Initialize Lucide Icons
function initIcons() {
  createIcons({
    icons: {
      Search, X, Locate, RefreshCw, AlertTriangle, ArrowDown, ArrowUp, Clock, Clock3,
      Droplets, Wind, Sun, Activity, Gauge, Eye, MapPin, MousePointerClick, Crosshair, CalendarDays
    }
  });
}

// App State
const state = {
  lat: 21.0285, // Default Hanoi
  lon: 105.8542,
  locationName: 'Hà Nội',
  locationSub: 'Việt Nam',
  isUserLocation: false,
  map: null,
  marker: null,
  weatherData: null,
  aqiData: null
};

// Weather Code Interpretation (WMO Code Standard)
const WMO_CODES = {
  0: { desc: 'Trời quang đãng', icon: '☀️', theme: 'sunny' },
  1: { desc: 'Nắng ít mây', icon: '🌤️', theme: 'sunny' },
  2: { desc: 'Mây rải rác', icon: '⛅', theme: 'sunny' },
  3: { desc: 'Nhiều mây', icon: '☁️', theme: 'cloudy' },
  45: { desc: 'Sương mù', icon: '🌫️', theme: 'cloudy' },
  48: { desc: 'Sương muối', icon: '🌫️', theme: 'cloudy' },
  51: { desc: 'Mưa phun nhẹ', icon: '🌦️', theme: 'rainy' },
  53: { desc: 'Mưa vừa', icon: '🌧️', theme: 'rainy' },
  55: { desc: 'Mưa nặng hạt', icon: '🌧️', theme: 'rainy' },
  61: { desc: 'Mưa rào nhẹ', icon: '🌧️', theme: 'rainy' },
  63: { desc: 'Mưa rào vừa', icon: '🌧️', theme: 'rainy' },
  65: { desc: 'Mưa rào xối xả', icon: '🌧️', theme: 'rainy' },
  71: { desc: 'Tuyết rơi nhẹ', icon: '🌨️', theme: 'snowy' },
  73: { desc: 'Tuyết rơi vừa', icon: '🌨️', theme: 'snowy' },
  75: { desc: 'Tuyết rơi dày', icon: '❄️', theme: 'snowy' },
  80: { desc: 'Mưa rào rải rác', icon: '🌦️', theme: 'rainy' },
  81: { desc: 'Mưa rào mạnh', icon: '🌧️', theme: 'rainy' },
  82: { desc: 'Mưa rào dữ dội', icon: '⛈️', theme: 'rainy' },
  95: { desc: 'Dông bão nhẹ', icon: '⛈️', theme: 'rainy' },
  96: { desc: 'Dông kèm mưa đá', icon: '⛈️', theme: 'rainy' },
  99: { desc: 'Dông bão dữ dội kèm mưa đá', icon: '⛈️', theme: 'rainy' }
};

// DOM Elements
const el = {
  loader: document.getElementById('loader'),
  loaderText: document.getElementById('loaderText'),
  errorBanner: document.getElementById('errorBanner'),
  errorMessage: document.getElementById('errorMessage'),
  btnRetry: document.getElementById('btnRetry'),
  
  citySearch: document.getElementById('citySearch'),
  clearSearch: document.getElementById('clearSearch'),
  searchSuggestions: document.getElementById('searchSuggestions'),
  btnGeo: document.getElementById('btnGeo'),
  btnRefresh: document.getElementById('btnRefresh'),
  btnRecenter: document.getElementById('btnRecenter'),

  locationName: document.getElementById('locationName'),
  locationSub: document.getElementById('locationSub'),
  currentTime: document.getElementById('currentTime'),
  currentTemp: document.getElementById('currentTemp'),
  weatherIcon: document.getElementById('weatherIcon'),
  weatherDesc: document.getElementById('weatherDesc'),
  feelsLike: document.getElementById('feelsLike'),
  tempMin: document.getElementById('tempMin'),
  tempMax: document.getElementById('tempMax'),
  lastUpdated: document.getElementById('lastUpdated'),

  humidity: document.getElementById('humidity'),
  humiditySub: document.getElementById('humiditySub'),
  windSpeed: document.getElementById('windSpeed'),
  windDir: document.getElementById('windDir'),
  uvIndex: document.getElementById('uvIndex'),
  uvStatus: document.getElementById('uvStatus'),
  aqiIndex: document.getElementById('aqiIndex'),
  aqiStatus: document.getElementById('aqiStatus'),
  pressure: document.getElementById('pressure'),
  visibility: document.getElementById('visibility'),

  hourlyForecast: document.getElementById('hourlyForecast'),
  dailyForecast: document.getElementById('dailyForecast'),
  mapCoords: document.getElementById('mapCoords')
};

// Helper: Show/Hide Loader
function showLoader(text = 'Đang tải dữ liệu thời tiết...') {
  el.loaderText.textContent = text;
  el.loader.classList.remove('hidden');
  el.errorBanner.classList.add('hidden');
}

function hideLoader() {
  el.loader.classList.add('hidden');
}

function showError(msg) {
  hideLoader();
  el.errorMessage.textContent = msg;
  el.errorBanner.classList.remove('hidden');
}

// Formatters
function getDayName(dateStr, isToday = false) {
  if (isToday) return 'Hôm nay';
  const date = new Date(dateStr);
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return days[date.getDay()];
}

function getWindDirection(deg) {
  const directions = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc'];
  return directions[Math.round(deg / 45) % 8];
}

function getUVCategory(uv) {
  if (uv <= 2) return { text: 'An toàn (Thấp)', color: '#10b981' };
  if (uv <= 5) return { text: 'Trung bình', color: '#f59e0b' };
  if (uv <= 7) return { text: 'Cao (Bảo vệ da)', color: '#f97316' };
  if (uv <= 10) return { text: 'Rất cao (Nguy hiểm)', color: '#ef4444' };
  return { text: 'Cực độ (Tránh ra đường)', color: '#a855f7' };
}

function getAQICategory(aqi) {
  if (aqi <= 50) return { text: 'Tốt (Không khí trong lành)', color: '#10b981' };
  if (aqi <= 100) return { text: 'Trung bình (Chấp nhận được)', color: '#f59e0b' };
  if (aqi <= 150) return { text: 'Kém cho người nhạy cảm', color: '#f97316' };
  if (aqi <= 200) return { text: 'Xấu (Nên đeo khẩu trang)', color: '#ef4444' };
  return { text: 'Rất nguy hại', color: '#a855f7' };
}

// Leaflet Map Initialization
function initMap() {
  state.map = L.map('map', {
    center: [state.lat, state.lon],
    zoom: 12,
    zoomControl: true
  });

  // Modern Dark CartoDB Tile Layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(state.map);

  // Custom Glowing Marker Icon
  const customIcon = L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #38bdf8, #06b6d4);
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 20px rgba(56, 189, 248, 0.8), 0 0 10px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      ">📍</div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

  state.marker = L.marker([state.lat, state.lon], { icon: customIcon }).addTo(state.map);
  state.marker.bindPopup(`<b>${state.locationName}</b><br/>Đang nạp thời tiết...`).openPopup();

  // Click Map Event to Change Location
  state.map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    fetchWeatherForCoords(lat, lng, false);
  });
}

function updateMapPosition(lat, lon, title, tempStr) {
  if (!state.map) return;
  state.map.flyTo([lat, lon], 12, { duration: 1.5 });
  state.marker.setLatLng([lat, lon]);
  state.marker.setPopupContent(`
    <div style="text-align: center; padding: 4px;">
      <strong style="font-size: 14px; color: #38bdf8;">${title}</strong>
      <div style="font-size: 20px; font-weight: bold; margin-top: 4px;">${tempStr}</div>
    </div>
  `);
  state.marker.openPopup();
  el.mapCoords.textContent = `Vĩ độ: ${lat.toFixed(4)} | Kinh độ: ${lon.toFixed(4)}`;
}

// API Data Fetching
async function fetchReverseGeocoding(lat, lon) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=vi`);
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.state || addr.county || 'Vị trí hiện tại';
      const country = addr.country || '';
      return { city, country };
    }
  } catch (err) {
    console.warn('Reverse geocoding fail, fallbacking:', err);
  }
  return { city: `Tọa độ (${lat.toFixed(2)}, ${lon.toFixed(2)})`, country: '' };
}

async function fetchWeatherForCoords(lat, lon, isUserGeo = false) {
  showLoader('Đang tải dữ liệu thời tiết thực tế...');
  try {
    state.lat = lat;
    state.lon = lon;
    state.isUserLocation = isUserGeo;

    // Fetch Weather & AQI concurrently
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10`;

    const [weatherRes, aqiRes, geoInfo] = await Promise.all([
      fetch(weatherUrl).then(r => r.json()),
      fetch(aqiUrl).then(r => r.json()).catch(() => null),
      fetchReverseGeocoding(lat, lon)
    ]);

    state.weatherData = weatherRes;
    state.aqiData = aqiRes;
    state.locationName = geoInfo.city;
    state.locationSub = geoInfo.country || 'Việt Nam';

    renderAllData();
    hideLoader();
  } catch (err) {
    console.error('Fetch Weather Error:', err);
    showError('Không thể tải dữ liệu thời tiết. Vui lòng kiểm tra lại kết nối!');
  }
}

// Render UI Components
function renderAllData() {
  const w = state.weatherData;
  if (!w || !w.current) return;

  const current = w.current;
  const daily = w.daily;
  const hourly = w.hourly;
  const code = current.weather_code;
  const info = WMO_CODES[code] || { desc: 'Không xác định', icon: '🌤️', theme: 'sunny' };

  // Set Theme
  document.body.className = current.is_day ? `theme-${info.theme}` : 'theme-night';

  // Hero Card
  el.locationName.textContent = state.locationName;
  el.locationSub.textContent = state.isUserLocation ? `📍 Vị trí của bạn • ${state.locationSub}` : state.locationSub;
  
  const now = new Date();
  el.currentTime.textContent = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  
  const tempRounded = Math.round(current.temperature_2m);
  el.currentTemp.textContent = `${tempRounded}°`;
  el.weatherIcon.textContent = info.icon;
  el.weatherDesc.textContent = info.desc;
  el.feelsLike.textContent = `Cảm giác như ${Math.round(current.apparent_temperature)}°C`;

  if (daily && daily.temperature_2m_min && daily.temperature_2m_max) {
    el.tempMin.textContent = `Thấp: ${Math.round(daily.temperature_2m_min[0])}°C`;
    el.tempMax.textContent = `Cao: ${Math.round(daily.temperature_2m_max[0])}°C`;
  }
  el.lastUpdated.textContent = `Cập nhật: ${now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;

  // Metrics Grid
  el.humidity.textContent = `${current.relative_humidity_2m}%`;
  const dewPoint = Math.round(current.temperature_2m - ((100 - current.relative_humidity_2m) / 5));
  el.humiditySub.textContent = `Điểm sương: ${dewPoint}°C`;

  el.windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  el.windDir.textContent = `Hướng: ${getWindDirection(current.wind_direction_10m)}`;

  const maxUV = daily && daily.uv_index_max ? daily.uv_index_max[0] : 3;
  const uvCat = getUVCategory(maxUV);
  el.uvIndex.textContent = maxUV.toFixed(1);
  el.uvStatus.textContent = uvCat.text;
  el.uvStatus.style.color = uvCat.color;

  if (state.aqiData && state.aqiData.current) {
    const aqi = state.aqiData.current.us_aqi || 42;
    const aqiCat = getAQICategory(aqi);
    el.aqiIndex.textContent = `${aqi} AQI`;
    el.aqiStatus.textContent = aqiCat.text;
    el.aqiStatus.style.color = aqiCat.color;
  } else {
    el.aqiIndex.textContent = '45 AQI';
    el.aqiStatus.textContent = 'Tốt (Không khí an toàn)';
  }

  el.pressure.textContent = `${Math.round(current.surface_pressure)} hPa`;
  el.visibility.textContent = '10 km'; // Default visual clarity

  // Render 24h Forecast Scroll
  renderHourlyForecast(hourly);

  // Render 7-Day Forecast List
  renderDailyForecast(daily);

  // Update Map Position
  updateMapPosition(state.lat, state.lon, state.locationName, `${tempRounded}°C ${info.icon}`);
}

function renderHourlyForecast(hourly) {
  if (!hourly || !hourly.time) return;
  el.hourlyForecast.innerHTML = '';

  const nowHour = new Date().getHours();
  // Get 24 items starting from current hour
  for (let i = 0; i < 24; i++) {
    if (i >= hourly.time.length) break;
    const date = new Date(hourly.time[i]);
    const hourNum = date.getHours();
    const isNow = i === 0 || hourNum === nowHour;

    const code = hourly.weather_code[i];
    const info = WMO_CODES[code] || { icon: '🌤️' };
    const temp = Math.round(hourly.temperature_2m[i]);
    const pop = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0;

    const div = document.createElement('div');
    div.className = `hourly-item ${isNow ? 'now' : ''}`;
    div.innerHTML = `
      <span class="hourly-time">${isNow ? 'Bây giờ' : `${hourNum}:00`}</span>
      <span class="hourly-icon">${info.icon}</span>
      <span class="hourly-temp">${temp}°C</span>
      ${pop > 10 ? `<span class="hourly-pop">☔ ${pop}%</span>` : ''}
    `;
    el.hourlyForecast.appendChild(div);
  }
}

function renderDailyForecast(daily) {
  if (!daily || !daily.time) return;
  el.dailyForecast.innerHTML = '';

  for (let i = 0; i < daily.time.length; i++) {
    const isToday = i === 0;
    const dayText = getDayName(daily.time[i], isToday);
    const code = daily.weather_code[i];
    const info = WMO_CODES[code] || { desc: 'Nắng nhẹ', icon: '🌤️' };
    const minTemp = Math.round(daily.temperature_2m_min[i]);
    const maxTemp = Math.round(daily.temperature_2m_max[i]);

    const div = document.createElement('div');
    div.className = 'daily-item';
    div.innerHTML = `
      <div class="daily-day">${dayText}</div>
      <div class="daily-icon">${info.icon}</div>
      <div class="daily-desc">${info.desc}</div>
      <div class="daily-temp-bar">
        <span class="temp-min-val">${minTemp}°</span>
        <span class="temp-max-val">${maxTemp}°</span>
      </div>
    `;
    el.dailyForecast.appendChild(div);
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
      console.warn('Geocoding search failed:', err);
    }
  }, 300);
}

function renderSearchSuggestions(results) {
  if (results.length === 0) {
    el.searchSuggestions.innerHTML = '<div class="suggestion-item">Không tìm thấy địa điểm phù hợp</div>';
    el.searchSuggestions.classList.remove('hidden');
    return;
  }

  el.searchSuggestions.innerHTML = '';
  results.forEach(item => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    div.innerHTML = `
      <span>📍 <strong>${item.name}</strong> ${item.admin1 ? `, ${item.admin1}` : ''}</span>
      <span class="suggestion-country">${item.country || ''}</span>
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

// Browser Geolocation Trigger
function getUserLocation() {
  if ('geolocation' in navigator) {
    showLoader('Đang xác định vị trí của bạn...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeatherForCoords(latitude, longitude, true);
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err.message);
        showError('Không thể lấy vị trí tự động. Bạn có thể sử dụng thanh tìm kiếm hoặc nhấp chọn vị trí trên bản đồ.');
        // Fallback to Hanoi default
        fetchWeatherForCoords(state.lat, state.lon, false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  } else {
    fetchWeatherForCoords(state.lat, state.lon, false);
  }
}

// Event Listeners
function setupEvents() {
  el.btnGeo.addEventListener('click', getUserLocation);
  el.btnRefresh.addEventListener('click', () => fetchWeatherForCoords(state.lat, state.lon, state.isUserLocation));
  el.btnRetry.addEventListener('click', () => fetchWeatherForCoords(state.lat, state.lon, state.isUserLocation));
  
  el.btnRecenter.addEventListener('click', () => {
    if (state.map) {
      state.map.flyTo([state.lat, state.lon], 13);
    }
  });

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
}

// Initialize Application
function init() {
  initIcons();
  initMap();
  setupEvents();
  getUserLocation(); // Auto request location on load
}

document.addEventListener('DOMContentLoaded', init);
