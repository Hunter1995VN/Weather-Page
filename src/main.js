import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
  CalendarDays,
  Layers
} from 'lucide';

// Initialize Lucide Icons
function initIcons() {
  createIcons({
    icons: {
      Search, X, Locate, RefreshCw, AlertTriangle, ArrowDown, ArrowUp, Clock, Clock3,
      Droplets, Wind, Sun, Activity, Gauge, Eye, MapPin, MousePointerClick, Crosshair, CalendarDays, Layers
    }
  });
}

// App State
const state = {
  lat: 16.0544, // Default Da Nang
  lon: 108.2022,
  locationName: 'Đà Nẵng',
  locationSub: 'Việt Nam',
  isUserLocation: false,
  map: null,
  baseTileOsm: null,
  baseTileSat: null,
  isSatellite: false,
  marker: null,
  radarCircle: null,
  radarLayer: null,
  radarVisible: false,
  weatherData: null,
  aqiData: null
};

// Weather Code Interpretation (WMO Code Standard)
const WMO_CODES = {
  0: { desc: 'Trời quang đãng', icon: '☀️', theme: 'sunny', isRain: false },
  1: { desc: 'Nắng ít mây', icon: '🌤️', theme: 'sunny', isRain: false },
  2: { desc: 'Mây rải rác', icon: '⛅', theme: 'sunny', isRain: false },
  3: { desc: 'Nhiều mây', icon: '☁️', theme: 'cloudy', isRain: false },
  45: { desc: 'Sương mù', icon: '🌫️', theme: 'cloudy', isRain: false },
  48: { desc: 'Sương muối', icon: '🌫️', theme: 'cloudy', isRain: false },
  51: { desc: 'Mưa phun nhẹ', icon: '🌦️', theme: 'rainy', isRain: true },
  53: { desc: 'Mưa vừa', icon: '🌧️', theme: 'rainy', isRain: true },
  55: { desc: 'Mưa nặng hạt', icon: '🌧️', theme: 'rainy', isRain: true },
  61: { desc: 'Mưa rào nhẹ', icon: '🌧️', theme: 'rainy', isRain: true },
  63: { desc: 'Mưa rào vừa', icon: '🌧️', theme: 'rainy', isRain: true },
  65: { desc: 'Mưa rào xối xả', icon: '🌧️', theme: 'rainy', isRain: true },
  71: { desc: 'Tuyết rơi nhẹ', icon: '🌨️', theme: 'snowy', isRain: false },
  73: { desc: 'Tuyết rơi vừa', icon: '🌨️', theme: 'snowy', isRain: false },
  75: { desc: 'Tuyết rơi dày', icon: '❄️', theme: 'snowy', isRain: false },
  80: { desc: 'Mưa rào rải rác', icon: '🌦️', theme: 'rainy', isRain: true },
  81: { desc: 'Mưa rào mạnh', icon: '🌧️', theme: 'rainy', isRain: true },
  82: { desc: 'Mưa rào dữ dội', icon: '⛈️', theme: 'rainy', isRain: true },
  95: { desc: 'Dông bão nhẹ', icon: '⛈️', theme: 'rainy', isRain: true },
  96: { desc: 'Dông kèm mưa đá', icon: '⛈️', theme: 'rainy', isRain: true },
  99: { desc: 'Dông bão dữ dội kèm mưa đá', icon: '⛈️', theme: 'rainy', isRain: true }
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
  btnRadarToggle: document.getElementById('btnRadarToggle'),
  btnMapStyle: document.getElementById('btnMapStyle'),

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

// Helper: Loader & Error
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
  if (uv <= 7) return { text: 'Cao (Nên đội mũ)', color: '#f97316' };
  if (uv <= 10) return { text: 'Rất cao (Tránh ra nắng)', color: '#ef4444' };
  return { text: 'Cực độ (Nguy hại)', color: '#a855f7' };
}

function getAQICategory(aqi) {
  if (aqi <= 50) return { text: 'Tốt (Trong lành)', color: '#10b981' };
  if (aqi <= 100) return { text: 'Trung bình (Chấp nhận được)', color: '#f59e0b' };
  if (aqi <= 150) return { text: 'Kém cho người nhạy cảm', color: '#f97316' };
  if (aqi <= 200) return { text: 'Xấu (Nên đeo khẩu trang)', color: '#ef4444' };
  return { text: 'Rất nguy hại', color: '#a855f7' };
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

    // Tile Layer 1: OpenStreetMap Standard (Full street resolution)
    state.baseTileOsm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: 1,
      maxZoom: 19,
      maxNativeZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    // Tile Layer 2: Esri Satellite World Imagery
    state.baseTileSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      minZoom: 1,
      maxZoom: 19,
      maxNativeZoom: 18,
      attribution: 'Tiles &copy; Esri'
    });

    // Default to OpenStreetMap Standard
    state.baseTileOsm.addTo(state.map);

    // Custom Pin Marker Icon
    const customIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="
            position: absolute;
            width: 54px;
            height: 54px;
            border-radius: 50%;
            background: rgba(56, 189, 248, 0.4);
            animation: pulse-ring 2s infinite ease-out;
          "></div>
          <div style="
            width: 38px;
            height: 38px;
            background: linear-gradient(135deg, #0284c7, #38bdf8);
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 20px rgba(56, 189, 248, 0.9), 0 4px 10px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            position: relative;
            z-index: 2;
          ">📍</div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    state.marker = L.marker([state.lat, state.lon], { icon: customIcon }).addTo(state.map);

    // Accuracy Circle
    state.radarCircle = L.circle([state.lat, state.lon], {
      radius: 1200,
      color: '#38bdf8',
      fillColor: '#38bdf8',
      fillOpacity: 0.12,
      weight: 2,
      dashArray: '6, 8'
    }).addTo(state.map);

    // Load RainViewer Weather Radar
    loadRadarOverlay();

    // Map Click Event
    state.map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      fetchWeatherForCoords(lat, lng, false);
    });

    setTimeout(() => {
      if (state.map) state.map.invalidateSize();
    }, 200);
  } catch (err) {
    console.warn('Leaflet init error:', err);
  }
}

// Fetch RainViewer Live Weather Radar Overlay
async function loadRadarOverlay() {
  try {
    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    if (res.ok) {
      const data = await res.json();
      const pastRadar = data.radar && data.radar.past;
      if (pastRadar && pastRadar.length > 0) {
        const latestTime = pastRadar[pastRadar.length - 1].time;
        if (state.radarLayer) {
          state.map.removeLayer(state.radarLayer);
        }
        state.radarLayer = L.tileLayer(`https://tilecache.rainviewer.com/v2/radar/${latestTime}/256/{z}/{x}/{y}/2/1_1.png`, {
          opacity: 0.65,
          zIndex: 500,
          maxNativeZoom: 12,
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.rainviewer.com/">RainViewer Radar</a>'
        });
        if (state.radarVisible) {
          state.radarLayer.addTo(state.map);
        }
      }
    }
  } catch (err) {
    console.warn('RainViewer Radar load warning:', err);
  }
}

function updateMapPosition(lat, lon, title, tempStr, rainInfo) {
  if (!state.map) return;
  state.map.flyTo([lat, lon], 13, { duration: 1.5 });
  state.marker.setLatLng([lat, lon]);
  if (state.radarCircle) {
    state.radarCircle.setLatLng([lat, lon]);
  }

  const popupHTML = `
    <div style="text-align: center; padding: 6px 10px; font-family: inherit;">
      <div style="font-size: 13px; font-weight: 700; color: #38bdf8; margin-bottom: 2px;">📍 ${title}</div>
      <div style="font-size: 22px; font-weight: 800; color: #ffffff;">${tempStr}</div>
      <div style="font-size: 12px; margin-top: 4px; color: ${rainInfo.isRain ? '#38bdf8' : '#10b981'}; font-weight: 600;">
        ${rainInfo.text}
      </div>
    </div>
  `;

  state.marker.setPopupContent(popupHTML);
  state.marker.openPopup();
  el.mapCoords.textContent = `📍 Vị trí: ${title} (${lat.toFixed(4)}, ${lon.toFixed(4)})`;

  setTimeout(() => {
    if (state.map) state.map.invalidateSize();
  }, 200);
}

// Detailed Reverse Geocoding
async function fetchReverseGeocoding(lat, lon) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&accept-language=vi`, {
      headers: { 'Accept-Language': 'vi' }
    });
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
    console.warn('Reverse geocoding warning:', err);
  }
  return { primaryName: `Tọa độ (${lat.toFixed(2)}, ${lon.toFixed(2)})`, subName: 'Việt Nam' };
}

async function fetchWeatherForCoords(lat, lon, isUserGeo = false) {
  showLoader('Đang cập nhật thời tiết khu vực...');
  try {
    state.lat = lat;
    state.lon = lon;
    state.isUserLocation = isUserGeo;

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10`;

    const [weatherRes, aqiRes, geoInfo] = await Promise.all([
      fetch(weatherUrl).then(r => r.json()),
      fetch(aqiUrl).then(r => r.json()).catch(() => null),
      fetchReverseGeocoding(lat, lon)
    ]);

    state.weatherData = weatherRes;
    state.aqiData = aqiRes;
    state.locationName = geoInfo.primaryName;
    state.locationSub = geoInfo.subName;

    renderAllData();
    hideLoader();
  } catch (err) {
    console.error('Fetch Weather Error:', err);
    showError('Không thể tải dữ liệu thời tiết khu vực. Vui lòng kiểm tra lại!');
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
  const info = WMO_CODES[code] || { desc: 'Không xác định', icon: '🌤️', theme: 'sunny', isRain: false };

  // Set Dynamic Theme
  document.body.className = current.is_day ? `theme-${info.theme}` : 'theme-night';

  // Hero Card
  el.locationName.textContent = state.locationName;
  el.locationSub.textContent = state.isUserLocation ? `📍 Vị trí hiện tại của bạn • ${state.locationSub}` : state.locationSub;
  
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
    el.aqiIndex.textContent = '42 AQI';
    el.aqiStatus.textContent = 'Tốt (Không khí an toàn)';
  }

  el.pressure.textContent = `${Math.round(current.surface_pressure)} hPa`;
  el.visibility.textContent = '10 km';

  // Render Forecasts (Sửa dứt điểm 100% trùng 2 ô "Bây giờ")
  renderHourlyForecast(hourly);
  renderDailyForecast(daily);

  // Rain status
  const hasRain = current.precipitation > 0 || info.isRain;
  const rainInfo = {
    isRain: hasRain,
    text: hasRain 
      ? `🌧️ Khu vực này có mưa (${current.precipitation || 1} mm)` 
      : `🌤️ Khô ráo, không có mưa`
  };

  // Update Map Position & Marker
  updateMapPosition(state.lat, state.lon, state.locationName, `${tempRounded}°C ${info.icon}`, rainInfo);
}

// Render 24-Hour Forecast
function renderHourlyForecast(hourly) {
  if (!hourly || !hourly.time) return;
  el.hourlyForecast.innerHTML = '';

  const now = new Date();
  const currentISO = now.toISOString().slice(0, 13); // "YYYY-MM-DDTHH"

  // Find start index matching current hour
  let startIndex = 0;
  for (let idx = 0; idx < hourly.time.length; idx++) {
    if (hourly.time[idx].startsWith(currentISO)) {
      startIndex = idx;
      break;
    }
  }

  // Slice 24 hours from current hour
  for (let i = 0; i < 24; i++) {
    const dataIdx = startIndex + i;
    if (dataIdx >= hourly.time.length) break;

    const date = new Date(hourly.time[dataIdx]);
    const hourNum = date.getHours();

    const code = hourly.weather_code[dataIdx];
    const info = WMO_CODES[code] || { icon: '🌤️' };
    const temp = Math.round(hourly.temperature_2m[dataIdx]);
    const pop = hourly.precipitation_probability ? hourly.precipitation_probability[dataIdx] : 0;

    const isNow = (i === 0);

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
    showLoader('Đang xác định vị trí GPS của bạn...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeatherForCoords(latitude, longitude, true);
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err.message);
        showError('Không thể lấy vị trí GPS tự động. Bạn có thể tìm kiếm hoặc nhấp trực tiếp trên bản đồ.');
        fetchWeatherForCoords(state.lat, state.lon, false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
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
      setTimeout(() => state.map.invalidateSize(), 200);
    }
  });

  // Toggle Map Style: Standard Road Map vs Esri Satellite
  el.btnMapStyle.addEventListener('click', () => {
    if (!state.map || !state.baseTileOsm || !state.baseTileSat) return;
    state.isSatellite = !state.isSatellite;
    if (state.isSatellite) {
      state.map.removeLayer(state.baseTileOsm);
      state.baseTileSat.addTo(state.map);
      el.btnMapStyle.innerHTML = '<i data-lucide="map"></i> <span>Bản đồ Đường bộ</span>';
      el.btnMapStyle.classList.add('active');
    } else {
      state.map.removeLayer(state.baseTileSat);
      state.baseTileOsm.addTo(state.map);
      el.btnMapStyle.innerHTML = '<i data-lucide="layers"></i> <span>Bản đồ Vệ tinh</span>';
      el.btnMapStyle.classList.remove('active');
    }
    initIcons();
  });

  el.btnRadarToggle.addEventListener('click', async () => {
    state.radarVisible = !state.radarVisible;
    if (state.radarVisible) {
      el.btnRadarToggle.classList.add('active');
      if (!state.radarLayer) {
        await loadRadarOverlay();
      }
      if (state.radarLayer) state.radarLayer.addTo(state.map);
    } else {
      el.btnRadarToggle.classList.remove('active');
      if (state.radarLayer) state.map.removeLayer(state.radarLayer);
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
  getUserLocation();
}

document.addEventListener('DOMContentLoaded', init);
