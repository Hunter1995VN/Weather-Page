import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Application State
const state = {
  lat: 16.0544,
  lon: 108.2022,
  cityName: 'Hòa Cường, Đà Nẵng',
  unit: 'C',
  currentTempC: 31,
  map: null,
  marker: null,
  tileLayer: null,
  mapLayer: 'voyager',
  weatherData: null,
  aqiData: null,
  forcedTime: null // null for auto or 'dawn' | 'day' | 'dusk' | 'night'
};

// Map Tile Layers (with crossOrigin: true)
const TILE_LAYERS = {
  voyager: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
      crossOrigin: true,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 18,
      crossOrigin: true,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS'
    }
  },
  street: {
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
      crossOrigin: true,
      subdomains: 'abc',
      attribution: '&copy; OpenStreetMap contributors, Humanitarian style'
    }
  }
};

// Poetic WMO Weather Dictionary (Vietnamese Literary Tone)
const WMO_WEATHER = {
  0: { label: 'Trời quang đãng', desc: 'Trời trong vắt, ánh nắng ngập tràn bờ cát.', advice: 'Thời tiết tuyệt vời để dạo biển ngắm bình minh và hoàng hôn.', type: 'clear' },
  1: { label: 'Nắng ít mây', desc: 'Nắng ấm dịu, vài gợn mây trắng xốp trôi lơ lửng.', advice: 'Khí trời rất êm ả, thoải mái cho mọi hoạt động ngoài trời.', type: 'clear' },
  2: { label: 'Mây rải rác', desc: 'Gió nhè nhẹ mơn man, nắng xen lẫn bóng mây mát mẻ.', advice: 'Thời tiết lý tưởng để nhâm nhi cà phê ngắm phố biển.', type: 'cloudy' },
  3: { label: 'Nhiều mây âm u', desc: 'Bầu trời phủ một lớp xám ấm, gió biển se se lạnh.', advice: 'Nên mang theo áo khoác nhẹ khi ra bờ biển vào chiều tối.', type: 'cloudy' },
  45: { label: 'Sương mù nhẹ', desc: 'Hơi sương mờ ảo bao phủ rặng núi Sơn Trà xa xa.', advice: 'Tầm nhìn giảm nhẹ trên các cung đèo dốc ven biển.', type: 'cloudy' },
  48: { label: 'Sương mù đọng', desc: 'Sương đọng ướt lá cây, không khí ẩm đượm mùi biển.', advice: 'Đường ven biển hơi ẩm ướt, chú ý quan sát khi lái xe.', type: 'cloudy' },
  51: { label: 'Mưa phùn thoảng', desc: 'Mưa bụi lất phất nghiêng theo từng làn gió thoảng.', advice: 'Cơn mưa nhỏ làm không khí mát dịu, có thể tản bộ với chiếc ô mỏng.', type: 'rain' },
  53: { label: 'Mưa phùn hạt', desc: 'Mưa rơi tí tách bên hiên nhà, không khí mát lành.', advice: 'Nhớ mang theo ô khi tản bộ ngắm phố.', type: 'rain' },
  55: { label: 'Mưa phùn dày', desc: 'Màn mưa giăng kín bãi biển, gió thổi từng cơn.', advice: 'Nên chọn một góc quán ngắm mưa rơi bên ô cửa sổ.', type: 'rain' },
  61: { label: 'Mưa rào nhẹ', desc: 'Cơn mưa rào mát rượi gội sạch bụi đường thành phố.', advice: 'Mưa tạnh nhanh sau ít phút, không khí trong lành.', type: 'rain' },
  63: { label: 'Mưa vừa', desc: 'Mưa đều hạt, mặt biển nổi những bọt sóng trắng xóa.', advice: 'Hạn chế tắm biển và mang theo dù che.', type: 'rain' },
  65: { label: 'Mưa to xối xả', desc: 'Mưa nặng hạt giăng kín, bãi cát vắng tiếng người.', advice: 'Nên ở trong không gian ấm áp, tránh di chuyển ngoài trời.', type: 'rain' },
  80: { label: 'Mưa rào rải rác', desc: 'Cơn mưa chợt đến rồi chợt đi đặc trưng miền duyên hải.', advice: 'Thời tiết thay đổi nhanh, nên đem theo áo mưa gọn nhẹ.', type: 'rain' },
  81: { label: 'Mưa rào mạnh', desc: 'Mưa dồn dập kèm gió giật mạnh từ biển khơi.', advice: 'Tránh xa các tuyến đường ven biển có sóng lớn.', type: 'rain' },
  82: { label: 'Mưa rất dữ dội', desc: 'Mưa trắng trời, sóng biển dâng cao cuồn cuộn.', advice: 'Ở yên nơi an toàn, không tham gia các hoạt động trên sông biển.', type: 'storm' },
  95: { label: 'Dông sét', desc: 'Mây tím tro vần vũ, sấm sét vang dội bên bờ sóng.', advice: 'Cảnh báo dông sét: tuyệt đối không tắm biển hay đứng dưới gốc cây to.', type: 'storm' },
  96: { label: 'Dông mưa đá', desc: 'Gió giật mạnh kèm dông sét dữ dội, khí trời biến động.', advice: 'Tìm nơi kiên cố trú ẩn ngay lập tức.', type: 'storm' },
  99: { label: 'Dông bão dữ dội', desc: 'Gió bão sấm chớp cuồn cuộn gầm rú ngoài biển khơi.', advice: 'Khí tượng nguy hiểm, tuân thủ hướng dẫn an toàn địa phương.', type: 'storm' }
};

// DOM Elements
const el = {
  hero: document.getElementById('hero'),
  locationTitle: document.getElementById('locationTitle'),
  locationSubtitle: document.getElementById('locationSubtitle'),
  localTimeDisplay: document.getElementById('localTimeDisplay'),
  heroTemp: document.getElementById('heroTemp'),
  weatherNarrative: document.getElementById('weatherNarrative'),
  heroFeelsLike: document.getElementById('heroFeelsLike'),
  heroMinMax: document.getElementById('heroMinMax'),
  heroUVBadge: document.getElementById('heroUVBadge'),
  weatherAdvice: document.getElementById('weatherAdvice'),
  sunTimesDesc: document.getElementById('sunTimesDesc'),

  // Hourly Chart
  hourlySvg: document.getElementById('hourlySvg'),
  tempLinePath: document.getElementById('tempLinePath'),
  tempAreaPath: document.getElementById('tempAreaPath'),
  rainBarsGroup: document.getElementById('rainBarsGroup'),
  tempPointsGroup: document.getElementById('tempPointsGroup'),
  hourLabelsGroup: document.getElementById('hourLabelsGroup'),
  sunEventsGroup: document.getElementById('sunEventsGroup'),
  chartTooltip: document.getElementById('chartTooltip'),
  hourlyChartContainer: document.getElementById('hourlyChartContainer'),

  // Weekly Forecast
  weeklyForecastList: document.getElementById('weeklyForecastList'),

  // Insights Widgets
  windLevelPill: document.getElementById('windLevelPill'),
  windCompassNeedle: document.getElementById('windCompassNeedle'),
  windSpeedVal: document.getElementById('windSpeedVal'),
  windDirLabel: document.getElementById('windDirLabel'),
  windGustDesc: document.getElementById('windGustDesc'),

  uvStatusLabel: document.getElementById('uvStatusLabel'),
  uvScoreText: document.getElementById('uvScoreText'),
  uvAdviceText: document.getElementById('uvAdviceText'),
  uvRaysGroup: document.getElementById('uvRaysGroup'),

  sunlightRemaining: document.getElementById('sunlightRemaining'),
  solarOrbOnArc: document.getElementById('solarOrbOnArc'),
  sunriseLabel: document.getElementById('sunriseLabel'),
  sunsetLabel: document.getElementById('sunsetLabel'),

  aqiStatusLabel: document.getElementById('aqiStatusLabel'),
  aqiScoreVal: document.getElementById('aqiScoreVal'),
  aqiDescText: document.getElementById('aqiDescText'),
  pm25Val: document.getElementById('pm25Val'),
  pm25Bar: document.getElementById('pm25Bar'),
  pm10Val: document.getElementById('pm10Val'),
  pm10Bar: document.getElementById('pm10Bar'),

  humidityPill: document.getElementById('humidityPill'),
  humidityWaterLevel: document.getElementById('humidityWaterLevel'),
  humidityVal: document.getElementById('humidityVal'),
  dewPointVal: document.getElementById('dewPointVal'),
  humidityDesc: document.getElementById('humidityDesc'),

  pressurePill: document.getElementById('pressurePill'),
  barometerNeedle: document.getElementById('barometerNeedle'),
  visibilityDist: document.getElementById('visibilityDist'),
  pressureDesc: document.getElementById('pressureDesc'),

  // Map
  weatherMap: document.getElementById('weatherMap'),
  mapLocationFootnote: document.getElementById('mapLocationFootnote'),
  btnLayerVoyager: document.getElementById('btnLayerVoyager'),
  btnLayerSatellite: document.getElementById('btnLayerSatellite'),
  btnLayerStreet: document.getElementById('btnLayerStreet'),

  // Controls
  cityNav: document.getElementById('cityNav'),
  btnOpenSearch: document.getElementById('btnOpenSearch'),
  btnCloseSearch: document.getElementById('btnCloseSearch'),
  searchModal: document.getElementById('searchModal'),
  citySearchInput: document.getElementById('citySearchInput'),
  searchResultsList: document.getElementById('searchResultsList'),
  searchSpinner: document.getElementById('searchSpinner'),
  btnGeoLocation: document.getElementById('btnGeoLocation'),
  btnToggleAtmosphere: document.getElementById('btnToggleAtmosphere'),
  atmosphereIcon: document.getElementById('atmosphereIcon'),
  unitC: document.getElementById('unitC'),
  unitF: document.getElementById('unitF')
};

// Unit Conversion Helpers
function cToF(c) {
  return Math.round((c * 9) / 5 + 32);
}

function formatTemp(celsius, withDegree = true) {
  if (celsius === null || celsius === undefined || isNaN(celsius)) return '--';
  const val = state.unit === 'F' ? cToF(celsius) : Math.round(celsius);
  return withDegree ? `${val}°` : `${val}`;
}

// 1. Atmosphere & Sky Theming
function applyAtmosphereTheme(hour, weatherType) {
  const body = document.body;

  let timeOfDay = state.forcedTime;
  if (!timeOfDay) {
    if (hour >= 5 && hour < 8) timeOfDay = 'dawn';
    else if (hour >= 8 && hour < 16) timeOfDay = 'day';
    else if (hour >= 16 && hour < 19) timeOfDay = 'dusk';
    else timeOfDay = 'night';
  }

  body.setAttribute('data-time', timeOfDay);
  body.setAttribute('data-weather', weatherType || 'clear');

  // Update Atmosphere Switcher Icon
  const icons = {
    dawn: '🌅',
    day: '🌤️',
    dusk: '🌇',
    night: '🌙'
  };
  if (el.atmosphereIcon) {
    el.atmosphereIcon.textContent = icons[timeOfDay] || '🌤️';
  }

  // Soften Dragon Bridge on heavy precipitation
  const bridge = document.getElementById('dragonBridgeIllustration');
  if (bridge) {
    bridge.style.opacity = (weatherType === 'rain' || weatherType === 'storm') ? '0.12' : '0.35';
  }
}

// 2. Fetch Open-Meteo Weather & Air Quality Data
async function fetchWeatherData(lat, lon, cityName) {
  state.lat = lat;
  state.lon = lon;
  if (cityName) state.cityName = cityName;

  updateLocationHeader(state.cityName);

  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,weather_code,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto&timeformat=unixtime`;
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5&timezone=auto`;

    const [weatherRes, aqiRes] = await Promise.all([
      fetch(weatherUrl).then(r => r.json()),
      fetch(aqiUrl).then(r => r.json()).catch(() => null)
    ]);

    state.weatherData = weatherRes;
    state.aqiData = aqiRes;

    renderCurrentWeather(weatherRes);
    renderHourlySplineChart(weatherRes);
    renderWeeklyForecast(weatherRes);
    renderTelemetryWidgets(weatherRes, aqiRes);
    updateMapMarker(lat, lon, state.cityName);

  } catch (error) {
    console.error('Lỗi nạp dữ liệu khí tượng:', error);
  }
}

// 3. Render Hero Section Weather
function renderCurrentWeather(data) {
  if (!data || !data.current) return;
  const current = data.current;
  const daily = data.daily;
  const wmo = WMO_WEATHER[current.weather_code] || { label: 'Ấm dịu', desc: 'Khí trời mát mẻ thanh bình.', advice: 'Thời tiết êm đềm, thuận lợi cho mọi hoạt động.', type: 'clear' };

  const now = new Date();
  applyAtmosphereTheme(now.getHours(), wmo.type);

  state.currentTempC = Math.round(current.temperature_2m);
  animateNumber('heroTemp', state.unit === 'C' ? state.currentTempC : cToF(state.currentTempC));

  el.weatherNarrative.textContent = `${wmo.label}. ${wmo.desc}`;
  el.weatherAdvice.textContent = wmo.advice;

  const feelsLike = Math.round(current.apparent_temperature);
  el.heroFeelsLike.innerHTML = `Cảm giác như <strong class="text-[var(--ink)] font-medium tabular-nums">${formatTemp(feelsLike)}</strong>`;

  if (daily && daily.temperature_2m_min && daily.temperature_2m_max) {
    const minT = Math.round(daily.temperature_2m_min[0]);
    const maxT = Math.round(daily.temperature_2m_max[0]);
    el.heroMinMax.innerHTML = `Thấp <span class="tabular-nums">${formatTemp(minT)}</span> — Cao <span class="tabular-nums">${formatTemp(maxT)}</span>`;
  }

  const uvVal = daily && daily.uv_index_max ? daily.uv_index_max[0] : 7.8;
  const uvLevel = getUvLevel(uvVal);
  el.heroUVBadge.textContent = `UV ${uvVal.toFixed(1)} ${uvLevel.label}`;
  el.heroUVBadge.style.color = uvLevel.color;

  updateClockDisplay();
}

// 4. Render 24-Hour Continuous Cubic Spline Chart
function renderHourlySplineChart(data) {
  const hourly = data.hourly;
  if (!hourly || !hourly.time) return;

  const nowSec = Math.floor(Date.now() / 1000);
  let startIndex = 0;
  for (let idx = 0; idx < hourly.time.length; idx++) {
    if (hourly.time[idx] <= nowSec) {
      startIndex = idx;
    } else {
      break;
    }
  }

  const count = 24;
  const pointsData = [];
  for (let i = 0; i < count; i++) {
    const dataIdx = startIndex + i;
    if (dataIdx >= hourly.time.length) break;
    pointsData.push({
      timeSec: hourly.time[dataIdx],
      temp: hourly.temperature_2m[dataIdx],
      rain: hourly.precipitation_probability ? hourly.precipitation_probability[dataIdx] : 0,
      code: hourly.weather_code[dataIdx]
    });
  }

  if (pointsData.length < 2) return;

  const temps = pointsData.map(p => p.temp);
  const minTemp = Math.min(...temps) - 1.5;
  const maxTemp = Math.max(...temps) + 1.5;
  const tempRange = maxTemp - minTemp || 1;

  const svgWidth = 1000;
  const graphTop = 40;
  const graphBottom = 165;
  const stepX = (svgWidth - 60) / (pointsData.length - 1);

  const coords = pointsData.map((p, i) => {
    const x = 30 + i * stepX;
    const normalized = (p.temp - minTemp) / tempRange;
    const y = graphBottom - normalized * (graphBottom - graphTop);
    return { ...p, x, y, index: i };
  });

  // Build Catmull-Rom Cubic Bézier Spline
  let dLine = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = i > 0 ? coords[i - 1] : coords[i];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = i !== coords.length - 2 ? coords[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    dLine += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  el.tempLinePath.setAttribute('d', dLine);

  // Area under spline
  const lastX = coords[coords.length - 1].x;
  const firstX = coords[0].x;
  const dArea = `${dLine} L ${lastX.toFixed(1)} 180 L ${firstX.toFixed(1)} 180 Z`;
  el.tempAreaPath.setAttribute('d', dArea);

  // Rain probability bars
  el.rainBarsGroup.innerHTML = '';
  coords.forEach(p => {
    if (p.rain > 5) {
      const barH = (p.rain / 100) * 36;
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', (p.x - 2.5).toFixed(1));
      rect.setAttribute('y', (180 - barH).toFixed(1));
      rect.setAttribute('width', '5');
      rect.setAttribute('height', barH.toFixed(1));
      rect.setAttribute('rx', '2');
      rect.setAttribute('fill', 'var(--slate-blue)');
      rect.setAttribute('opacity', p.rain > 50 ? '0.85' : '0.45');
      el.rainBarsGroup.appendChild(rect);
    }
  });

  // Hour labels & temperature dots
  el.tempPointsGroup.innerHTML = '';
  el.hourLabelsGroup.innerHTML = '';

  coords.forEach((p, idx) => {
    const date = new Date(p.timeSec * 1000);
    const hourNum = date.getHours();
    const hourStr = idx === 0 ? 'Bây giờ' : `${hourNum < 10 ? '0' + hourNum : hourNum}:00`;

    // Hour Labels on X-axis (every 2-3 hours)
    if (idx === 0 || idx % 2 === 0) {
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', p.x.toFixed(1));
      txt.setAttribute('y', '205');
      txt.setAttribute('font-size', '11');
      txt.setAttribute('font-family', "'Be Vietnam Pro', sans-serif");
      txt.setAttribute('fill', idx === 0 ? 'var(--ink)' : 'var(--ink-muted)');
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('font-weight', idx === 0 ? '600' : '400');
      txt.textContent = hourStr;
      el.hourLabelsGroup.appendChild(txt);
    }

    // Temperature Point Dot
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', p.x.toFixed(1));
    circle.setAttribute('cy', p.y.toFixed(1));
    circle.setAttribute('r', idx === 0 ? '5' : '2.5');
    circle.setAttribute('fill', idx === 0 ? 'var(--accent)' : 'var(--ink)');
    circle.setAttribute('class', 'transition-all cursor-pointer hover:scale-150');

    // Interactive Hover Tooltip
    circle.addEventListener('mouseenter', (e) => {
      const wmo = WMO_WEATHER[p.code] || { label: 'Ấm áp' };
      showChartTooltip(e, `${hourStr} · ${formatTemp(p.temp)} · ${wmo.label}${p.rain > 0 ? ` · Mưa ${p.rain}%` : ''}`);
    });
    circle.addEventListener('mouseleave', hideChartTooltip);

    el.tempPointsGroup.appendChild(circle);

    // Mini weather icon every 3 hours
    if (idx % 3 === 1) {
      const iconGroup = createMiniWeatherIcon(p.code, p.x, p.y - 18);
      el.tempPointsGroup.appendChild(iconGroup);
    }
  });

  // Sunrise / Sunset event markers
  if (data.daily && data.daily.sunrise && data.daily.sunset) {
    const sunriseSec = data.daily.sunrise[0];
    const sunsetSec = data.daily.sunset[0];
    const sunriseDate = new Date(sunriseSec * 1000);
    const sunsetDate = new Date(sunsetSec * 1000);
    const sunriseStr = sunriseDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const sunsetStr = sunsetDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    if (el.sunTimesDesc) {
      el.sunTimesDesc.innerHTML = `Đường cong nhiệt độ liên tục kết hợp xác suất mưa, bình minh lúc <strong class="text-[var(--ink)]">${sunriseStr}</strong> và hoàng hôn buông lúc <strong class="text-[var(--ink)]">${sunsetStr}</strong>.`;
    }

    // Find closest coords to sunrise/sunset
    el.sunEventsGroup.innerHTML = '';
    const findClosestPoint = (targetSec) => {
      let closest = coords[0];
      let minDiff = Infinity;
      coords.forEach(pt => {
        const diff = Math.abs(pt.timeSec - targetSec);
        if (diff < minDiff) {
          minDiff = diff;
          closest = pt;
        }
      });
      return closest;
    };

    const sunrisePt = findClosestPoint(sunriseSec);
    const sunsetPt = findClosestPoint(sunsetSec);

    const renderSunMarker = (pt, label) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', pt.x.toFixed(1));
      line.setAttribute('y1', '20');
      line.setAttribute('x2', pt.x.toFixed(1));
      line.setAttribute('y2', '180');
      line.setAttribute('stroke', 'var(--accent)');
      line.setAttribute('stroke-width', '1.2');
      line.setAttribute('stroke-dasharray', '3 3');
      line.setAttribute('opacity', '0.65');

      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', pt.x.toFixed(1));
      txt.setAttribute('y', '15');
      txt.setAttribute('fill', 'var(--accent)');
      txt.setAttribute('font-size', '11');
      txt.setAttribute('font-family', "'Fraunces', serif");
      txt.setAttribute('text-anchor', 'middle');
      txt.textContent = label;

      el.sunEventsGroup.appendChild(line);
      el.sunEventsGroup.appendChild(txt);
    };

    if (sunrisePt && sunrisePt.timeSec >= pointsData[0].timeSec) {
      renderSunMarker(sunrisePt, `Bình minh ${sunriseStr}`);
    }
    if (sunsetPt && sunsetPt.timeSec >= pointsData[0].timeSec) {
      renderSunMarker(sunsetPt, `Hoàng hôn ${sunsetStr}`);
    }
  }
}

// Mini Weather SVG Icon Generator
function createMiniWeatherIcon(code, x, y) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${(x - 7).toFixed(1)}, ${(y - 7).toFixed(1)})`);
  g.setAttribute('opacity', '0.75');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  if (code === 0 || code === 1) {
    path.setAttribute('d', 'M 7 3 A 4 4 0 1 1 6.9 3 Z');
    path.setAttribute('fill', 'var(--sun-gold)');
  } else if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) {
    path.setAttribute('d', 'M 2 7 Q 7 3 12 7 Z M 5 10 L 4 13 M 9 10 L 8 13');
    path.setAttribute('stroke', 'var(--slate-blue)');
    path.setAttribute('stroke-width', '1.2');
    path.setAttribute('fill', 'none');
  } else {
    path.setAttribute('d', 'M 2 8 C 2 5 6 4 8 6 C 10 4 14 5 13 8 Z');
    path.setAttribute('fill', 'var(--ink)');
    path.setAttribute('opacity', '0.45');
  }
  g.appendChild(path);
  return g;
}

// 5. Render 7-Day Vertical Spine Forecast
function renderWeeklyForecast(data) {
  const daily = data.daily;
  if (!daily || !daily.time) return;

  el.weeklyForecastList.innerHTML = '';
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const allMins = daily.temperature_2m_min;
  const allMaxs = daily.temperature_2m_max;
  const weekMin = Math.min(...allMins);
  const weekMax = Math.max(...allMaxs);
  const totalRange = weekMax - weekMin || 1;

  for (let i = 0; i < Math.min(7, daily.time.length); i++) {
    const dateObj = new Date(daily.time[i] * 1000);
    const dayLabel = i === 0 ? 'Hôm nay' : daysOfWeek[dateObj.getDay()];
    const code = daily.weather_code[i];
    const wmo = WMO_WEATHER[code] || { label: 'Êm dịu', desc: 'Thời tiết ôn hòa.' };

    const minT = Math.round(daily.temperature_2m_min[i]);
    const maxT = Math.round(daily.temperature_2m_max[i]);

    const leftPercent = Math.max(0, Math.min(100, ((minT - weekMin) / totalRange) * 100));
    const widthPercent = Math.max(12, Math.min(100 - leftPercent, ((maxT - minT) / totalRange) * 100));

    const row = document.createElement('div');
    row.className = 'py-4 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-3 group hover:translate-x-1 transition-all duration-300';
    row.innerHTML = `
      <div class="flex items-center gap-3 w-40">
        ${i === 0 ? '<span class="w-2 h-2 rounded-full bg-[var(--accent)]"></span>' : '<span class="w-2"></span>'}
        <span class="font-serif-fraunces text-base md:text-lg ${i === 0 ? 'font-medium italic text-[var(--accent)]' : 'text-[var(--ink)]'}">
          ${dayLabel}
        </span>
      </div>

      <div class="flex items-center gap-3 flex-1 md:px-4">
        <span class="text-xs md:text-sm text-ink-muted group-hover:text-[var(--ink)] transition-colors">
          ${wmo.label} — ${wmo.desc}
        </span>
      </div>

      <div class="flex items-center gap-4 w-full md:w-64">
        <span class="text-xs font-serif-fraunces tabular-nums text-ink-muted w-8 text-right">${formatTemp(minT)}</span>
        <div class="flex-1 h-2.5 bg-[var(--ink-line)]/50 rounded-full relative overflow-hidden">
          <div 
            class="absolute top-0 h-full rounded-full transition-all duration-1000"
            style="left: ${leftPercent.toFixed(1)}%; width: ${widthPercent.toFixed(1)}%; background: linear-gradient(90deg, var(--slate-blue) 0%, var(--accent) 100%);"
          ></div>
        </div>
        <span class="text-xs font-serif-fraunces font-medium tabular-nums text-[var(--ink)] w-8">${formatTemp(maxT)}</span>
      </div>
    `;
    el.weeklyForecastList.appendChild(row);
  }
}

// 6. Render Telemetry Insights Widgets
function renderTelemetryWidgets(weatherData, aqiData) {
  const current = weatherData.current;
  const daily = weatherData.daily;

  // 1. Wind & Compass
  const windSpeed = Math.round(current.wind_speed_10m);
  const windGust = Math.round(current.wind_gusts_10m || windSpeed * 1.4);
  const windDeg = current.wind_direction_10m || 32;
  const windDirName = degToCompassVi(windDeg);

  el.windSpeedVal.textContent = windSpeed;
  el.windDirLabel.textContent = `km/h · ${windDirName} (${windDeg}°)`;
  el.windCompassNeedle.setAttribute('transform', `rotate(${windDeg}, 70, 70)`);
  el.windLevelPill.textContent = getWindLevelText(windSpeed);
  el.windGustDesc.innerHTML = `Gió biển êm ả thổi từ phía <strong>${windDirName}</strong>, thỉnh thoảng có cơn giật nhẹ <strong>${windGust} km/h</strong> làm xao động những rặng phi lao ven đường biển.`;

  // 2. UV Index
  const maxUv = daily && daily.uv_index_max ? daily.uv_index_max[0] : 7.8;
  const uvDetail = getUvLevel(maxUv);
  el.uvStatusLabel.textContent = `${maxUv.toFixed(1)} · ${uvDetail.label}`;
  el.uvStatusLabel.style.color = uvDetail.color;
  el.uvScoreText.textContent = maxUv.toFixed(1);
  el.uvScoreText.style.color = uvDetail.color;
  el.uvAdviceText.textContent = uvDetail.advice;

  // 3. Sun Astral Arc
  if (daily && daily.sunrise && daily.sunset) {
    const sunriseSec = daily.sunrise[0];
    const sunsetSec = daily.sunset[0];
    const nowSec = Math.floor(Date.now() / 1000);

    const sunriseDate = new Date(sunriseSec * 1000);
    const sunsetDate = new Date(sunsetSec * 1000);
    el.sunriseLabel.textContent = `Mọc ${sunriseDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    el.sunsetLabel.textContent = `Lặn ${sunsetDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;

    let sunProgress = 0;
    if (nowSec >= sunriseSec && nowSec <= sunsetSec) {
      sunProgress = (nowSec - sunriseSec) / (sunsetSec - sunriseSec);
      const remainingMinutes = Math.round((sunsetSec - nowSec) / 60);
      const remHours = Math.floor(remainingMinutes / 60);
      const remMins = remainingMinutes % 60;
      el.sunlightRemaining.textContent = `Còn ~${remHours} giờ ${remMins} phút nắng`;
    } else {
      sunProgress = 0;
      el.sunlightRemaining.textContent = 'Mặt trời đã lặn dưới đường chân trời';
    }

    const angle = Math.PI * (1 - sunProgress);
    const cx = 140 - 110 * Math.cos(angle);
    const cy = 95 - 75 * Math.sin(angle);
    el.solarOrbOnArc.setAttribute('transform', `translate(${cx.toFixed(1)}, ${cy.toFixed(1)})`);
  }

  // 4. Air Quality
  const aqiVal = (aqiData && aqiData.current && aqiData.current.us_aqi) ? aqiData.current.us_aqi : 42;
  const aqiInfo = getAqiLevel(aqiVal);
  el.aqiScoreVal.textContent = aqiVal;
  el.aqiStatusLabel.textContent = `${aqiInfo.badge} · ${aqiInfo.label}`;
  el.aqiStatusLabel.style.color = aqiInfo.color;
  el.aqiDescText.textContent = aqiInfo.desc;

  const pm25 = (aqiData && aqiData.current && aqiData.current.pm2_5) ? aqiData.current.pm2_5 : 12.0;
  const pm10 = (aqiData && aqiData.current && aqiData.current.pm10) ? aqiData.current.pm10 : 22.5;
  el.pm25Val.textContent = `${pm25.toFixed(1)} µg/m³`;
  el.pm10Val.textContent = `${pm10.toFixed(1)} µg/m³`;
  el.pm25Bar.style.width = `${Math.min(100, (pm25 / 50) * 100)}%`;
  el.pm10Bar.style.width = `${Math.min(100, (pm10 / 100) * 100)}%`;

  // 5. Humidity & Dew Point
  const rh = current.relative_humidity_2m;
  el.humidityVal.textContent = `${rh}%`;
  const dewPoint = Math.round(current.temperature_2m - ((100 - rh) / 5));
  el.dewPointVal.textContent = `Điểm sương ${formatTemp(dewPoint)}`;
  // Water droplet fill (height from bottom: 70 - (rh/100)*50)
  const dropY = Math.round(70 - (rh / 100) * 45);
  el.humidityWaterLevel.setAttribute('y', dropY);
  el.humidityWaterLevel.setAttribute('height', 70 - dropY);
  el.humidityPill.textContent = getHumidityLevelText(rh);

  // 6. Barometric Pressure & Visibility
  const pressVal = Math.round(current.surface_pressure);
  el.pressurePill.textContent = `${pressVal} hPa · ${pressVal > 1013 ? 'Khí áp cao' : pressVal < 1005 ? 'Khí áp thấp' : 'Ổn định'}`;
  const angle = Math.min(45, Math.max(-45, (pressVal - 1013) * 3));
  el.barometerNeedle.setAttribute('transform', `rotate(${angle}, 32, 32)`);
  el.visibilityDist.textContent = '10.0';
}

// 7. Leaflet Interactive Map
function initMap() {
  if (state.map) return;
  try {
    state.map = L.map('weatherMap', {
      center: [state.lat, state.lon],
      zoom: 12,
      scrollWheelZoom: false,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(state.map);
    setMapLayer('voyager');

    // Coral Drop Water Pin
    const customPin = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position: relative; display: flex; items-center; justify-content: center; width: 32px; height: 32px;">
          <div style="position: absolute; inset: 0; border-radius: 50%; background: var(--accent); opacity: 0.35; animation: ping 2s infinite cubic-bezier(0, 0, 0.2, 1);"></div>
          <div style="position: relative; width: 22px; height: 22px; border-radius: 50%; background: var(--accent); border: 2.5px solid #FFFFFF; box-shadow: 0 4px 12px rgba(232, 112, 74, 0.45); display: flex; align-items: center; justify-content: center; margin: 5px;">
            <div style="width: 6px; height: 6px; border-radius: 50%; background: #FFFFFF;"></div>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    state.marker = L.marker([state.lat, state.lon], { icon: customPin }).addTo(state.map);

    state.map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      await fetchReverseGeocoding(lat, lng);
    });

    [200, 600, 1200].forEach(delay => {
      setTimeout(() => {
        if (state.map) state.map.invalidateSize();
      }, delay);
    });
  } catch (err) {
    console.warn('Leaflet map error:', err);
  }
}

function setMapLayer(layerKey) {
  state.mapLayer = layerKey;
  if (!state.map || !TILE_LAYERS[layerKey]) return;

  if (state.tileLayer) {
    state.map.removeLayer(state.tileLayer);
  }

  const cfg = TILE_LAYERS[layerKey];
  state.tileLayer = L.tileLayer(cfg.url, cfg.options).addTo(state.map);

  // Update button classes
  const buttons = [
    { btn: el.btnLayerVoyager, key: 'voyager' },
    { btn: el.btnLayerSatellite, key: 'satellite' },
    { btn: el.btnLayerStreet, key: 'street' }
  ];

  buttons.forEach(({ btn, key }) => {
    if (!btn) return;
    if (key === layerKey) {
      btn.className = 'brush-underline text-[var(--ink)] font-medium transition-colors';
    } else {
      btn.className = 'text-ink-muted hover:text-[var(--ink)] transition-colors';
    }
  });

  setTimeout(() => {
    if (state.map) state.map.invalidateSize();
  }, 150);
}

function updateMapMarker(lat, lon, cityName) {
  if (!state.map || !state.marker) return;
  state.map.setView([lat, lon], 12, { animate: true });
  state.marker.setLatLng([lat, lon]);

  if (el.mapLocationFootnote) {
    el.mapLocationFootnote.textContent = `${cityName} · ${lat.toFixed(4)}°B, ${lon.toFixed(4)}°Đ`;
  }
}

// 8. Reverse Geocoding
async function fetchReverseGeocoding(lat, lon) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&accept-language=vi`);
    if (res.ok) {
      const json = await res.json();
      const addr = json.address || {};
      const name = addr.suburb || addr.quarter || addr.neighbourhood || addr.city || addr.town || addr.county || 'Địa điểm đã chọn';
      const full = `${name}, ${addr.city || addr.state || addr.country || 'Việt Nam'}`;
      fetchWeatherData(lat, lon, full);
      return;
    }
  } catch (e) {
    console.warn('Geocoding error:', e);
  }
  fetchWeatherData(lat, lon, `Tọa độ (${lat.toFixed(2)}, ${lon.toFixed(2)})`);
}

// 9. Location UI Header
function updateLocationHeader(name) {
  if (!el.locationTitle || !el.locationSubtitle) return;
  if (name.includes(',')) {
    const parts = name.split(',');
    el.locationTitle.innerHTML = `${parts[0].trim()}, <span class="italic font-light">${parts.slice(1).join(',').trim()}</span>`;
  } else {
    el.locationTitle.textContent = name;
  }
  el.locationSubtitle.textContent = `Vị trí dự báo · ${name}`;
}

// 10. Clock & Formatters
function updateClockDisplay() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  if (el.localTimeDisplay) {
    el.localTimeDisplay.textContent = `${h}:${m} ICT`;
  }
}

function degToCompassVi(deg) {
  const directions = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc'];
  return directions[Math.round(deg / 45) % 8];
}

function getWindLevelText(kmh) {
  if (kmh <= 5) return 'Gió lặng · Yên ả';
  if (kmh <= 15) return 'Thoang thoảng dễ chịu';
  if (kmh <= 28) return 'Gió vừa biển khơi';
  if (kmh <= 45) return 'Gió khá mạnh';
  return 'Cảnh báo gió giật mạnh';
}

function getUvLevel(uv) {
  if (uv < 3) return { label: 'Thấp', advice: 'Bảo vệ da an toàn, thỏa thích tận hưởng nắng ấm.', color: '#5D8756' };
  if (uv < 6) return { label: 'Trung bình', advice: 'Nên đội mũ và kính râm khi dạo phố vào ban trưa.', color: '#F5B942' };
  if (uv < 8) return { label: 'Cao', advice: 'Nên thoa kem chống nắng và hạn chế phơi nắng gắt.', color: '#E8704A' };
  if (uv < 11) return { label: 'Rất cao', advice: 'Tránh ở ngoài trời nắng gắt từ 11:00 đến 15:30; nhớ mang áo khoác mỏng.', color: '#E8704A' };
  return { label: 'Cực độ', advice: 'Nguy cơ bỏng da cao, hãy ở trong bóng râm hoặc trong nhà.', color: '#A855F7' };
}

function getAqiLevel(aqi) {
  if (aqi <= 50) return { badge: 'Tốt', label: 'Rất trong lành', color: '#5D8756', desc: 'Bầu không khí ven biển rất thoáng, an toàn tuyệt đối cho các hoạt động thể thao ngoài trời.' };
  if (aqi <= 100) return { badge: 'Khá', label: 'Chấp nhận được', color: '#F5B942', desc: 'Chất lượng không khí ở mức chấp nhận được, nhóm người nhạy cảm nên chú ý.' };
  if (aqi <= 150) return { badge: 'Kém', label: 'Nhạy cảm chú ý', color: '#E8704A', desc: 'Người có bệnh về hô hấp nên hạn chế vận động thể lực kéo dài ngoài trời.' };
  return { badge: 'Xấu', label: 'Nên đeo khẩu trang', color: '#EF4444', desc: 'Bụi mịn tăng cao, mọi người nên đeo khẩu trang khi ra đường.' };
}

function getHumidityLevelText(rh) {
  if (rh < 40) return 'Hơi khô ráo';
  if (rh <= 65) return 'Lý tưởng dễ chịu';
  if (rh <= 80) return 'Ẩm ướt nhiệt đới';
  return 'Rất ẩm nồm';
}

function animateNumber(elementId, targetVal) {
  const element = document.getElementById(elementId);
  if (!element) return;
  const current = parseInt(element.textContent) || 0;
  const startTime = performance.now();
  const duration = 700;

  function step(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(current + (targetVal - current) * easeOut);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// 11. Tooltip for Hourly Chart
function showChartTooltip(e, text) {
  if (!el.chartTooltip || !el.hourlyChartContainer) return;
  el.chartTooltip.textContent = text;
  el.chartTooltip.style.opacity = '1';
  const containerRect = el.hourlyChartContainer.getBoundingClientRect();
  el.chartTooltip.style.left = `${e.clientX - containerRect.left + 12}px`;
  el.chartTooltip.style.top = `${e.clientY - containerRect.top - 36}px`;
}

function hideChartTooltip() {
  if (el.chartTooltip) el.chartTooltip.style.opacity = '0';
}

// 12. Search & Modal
let searchTimer = null;
function setupSearch() {
  const openModal = () => {
    el.searchModal.classList.add('active');
    setTimeout(() => el.citySearchInput.focus(), 100);
  };

  const closeModal = () => {
    el.searchModal.classList.remove('active');
  };

  el.btnOpenSearch.addEventListener('click', openModal);
  el.btnCloseSearch.addEventListener('click', closeModal);

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openModal();
    }
    if (e.key === 'Escape') closeModal();
  });

  el.citySearchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length < 2) return;

    clearTimeout(searchTimer);
    el.searchSpinner.classList.remove('hidden');

    searchTimer = setTimeout(async () => {
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=vi&format=json`);
        const json = await res.json();
        el.searchSpinner.classList.add('hidden');

        el.searchResultsList.innerHTML = '';
        if (json.results && json.results.length > 0) {
          json.results.forEach(item => {
            const row = document.createElement('div');
            row.className = 'py-3 px-2 flex justify-between items-center hover:bg-black/5 cursor-pointer rounded transition-colors';
            row.innerHTML = `
              <div>
                <strong class="font-serif-fraunces text-base text-[var(--ink)]">${item.name}</strong>
                <p class="text-xs text-ink-muted">${[item.admin1, item.country].filter(Boolean).join(', ')}</p>
              </div>
              <span class="text-xs text-[var(--accent)] font-serif-fraunces italic">Xem thời tiết →</span>
            `;
            row.onclick = () => {
              const displayName = `${item.name}, ${item.admin1 || item.country}`;
              fetchWeatherData(item.latitude, item.longitude, displayName);
              closeModal();
            };
            el.searchResultsList.appendChild(row);
          });
        } else {
          el.searchResultsList.innerHTML = `<p class="text-xs text-ink-muted italic py-4">Không tìm thấy địa điểm "${query}". Hãy thử tên thành phố lớn.</p>`;
        }
      } catch (err) {
        el.searchSpinner.classList.add('hidden');
        el.searchResultsList.innerHTML = `<p class="text-xs text-red-500 py-4">Lỗi kết nối tìm kiếm. Vui lòng thử lại.</p>`;
      }
    }, 300);
  });

  // Quick suggestions buttons inside modal
  document.querySelectorAll('.quick-suggest').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.quick;
      const lat = parseFloat(btn.dataset.lat);
      const lon = parseFloat(btn.dataset.lon);
      fetchWeatherData(lat, lon, name);
      closeModal();
    });
  });
}

// 13. Event Listeners & Navigation
function setupEvents() {
  // City Nav Buttons
  if (el.cityNav) {
    el.cityNav.querySelectorAll('.city-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        el.cityNav.querySelectorAll('.city-btn').forEach(b => {
          b.classList.remove('brush-underline', 'font-medium', 'text-[var(--ink)]');
          b.classList.add('text-ink-muted');
        });
        btn.classList.add('brush-underline', 'font-medium', 'text-[var(--ink)]');
        btn.classList.remove('text-ink-muted');

        const lat = parseFloat(btn.dataset.lat);
        const lon = parseFloat(btn.dataset.lon);
        const city = btn.dataset.city;
        fetchWeatherData(lat, lon, city);
      });
    });
  }

  // Unit Switcher
  el.unitC.addEventListener('click', () => {
    if (state.unit === 'C') return;
    state.unit = 'C';
    el.unitC.className = 'font-serif-fraunces border-b-2 border-[var(--accent)] text-[var(--ink)]';
    el.unitF.className = 'font-serif-fraunces text-ink-muted hover:text-[var(--ink)]';
    if (state.weatherData) {
      renderCurrentWeather(state.weatherData);
      renderHourlySplineChart(state.weatherData);
      renderWeeklyForecast(state.weatherData);
    }
  });

  el.unitF.addEventListener('click', () => {
    if (state.unit === 'F') return;
    state.unit = 'F';
    el.unitF.className = 'font-serif-fraunces border-b-2 border-[var(--accent)] text-[var(--ink)]';
    el.unitC.className = 'font-serif-fraunces text-ink-muted hover:text-[var(--ink)]';
    if (state.weatherData) {
      renderCurrentWeather(state.weatherData);
      renderHourlySplineChart(state.weatherData);
      renderWeeklyForecast(state.weatherData);
    }
  });

  // GPS Geolocation
  el.btnGeoLocation.addEventListener('click', () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchReverseGeocoding(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          alert('Không thể xác định vị trí GPS. Bạn có thể sử dụng thanh tìm kiếm để chọn thành phố.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  });

  // Atmosphere Theme Toggle (Dawn -> Day -> Dusk -> Night -> Auto)
  if (el.btnToggleAtmosphere) {
    const atmospheres = ['day', 'dusk', 'night', 'dawn', null];
    let currentIndex = 0;
    el.btnToggleAtmosphere.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % atmospheres.length;
      state.forcedTime = atmospheres[currentIndex];
      const hour = new Date().getHours();
      const code = state.weatherData ? state.weatherData.current.weather_code : 1;
      const wmo = WMO_WEATHER[code] || { type: 'clear' };
      applyAtmosphereTheme(hour, wmo.type);
    });
  }

  // Layer switches
  el.btnLayerVoyager.addEventListener('click', () => setMapLayer('voyager'));
  el.btnLayerSatellite.addEventListener('click', () => setMapLayer('satellite'));
  el.btnLayerStreet.addEventListener('click', () => setMapLayer('street'));

  // Clock tick every minute
  setInterval(updateClockDisplay, 60000);
}

// 14. Initialization
function init() {
  initMap();
  setupEvents();
  setupSearch();
  fetchWeatherData(state.lat, state.lon, state.cityName);
}

document.addEventListener('DOMContentLoaded', init);
