
const DEFAULT_CENTER = [42.6977, 23.3219]; // Sofia, Bulgaria
const DEFAULT_ZOOM = 18;

console.log('DEFAULT_ZOOM set to:', DEFAULT_ZOOM);

const TILE_PROVIDERS = {
  'osm-hot': {
    name: 'OpenStreetMap HOT',
    light: {
      url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles courtesy of <a href="http://hot.openstreetmap.org/">Humanitarian OpenStreetMap Team</a>',
      maxZoom: 19
    },
    dark: {
      url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles courtesy of <a href="http://hot.openstreetmap.org/">Humanitarian OpenStreetMap Team</a>',
      maxZoom: 19
    }
  },
  'osm-standard': {
    name: 'OpenStreetMap Standard',
    light: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    },
    dark: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }
  },
  'cartodb-voyager': {
    name: 'CartoDB Voyager',
    light: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20
    }
  },
  'cartodb-positron': {
    name: 'CartoDB Positron',
    light: {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20
    }
  },
  'opentopomap': {
    name: 'OpenTopoMap',
    light: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
      maxZoom: 17
    },
    dark: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
      maxZoom: 17
    }
  }
};

const DEFAULT_TILE_PROVIDER = 'cartodb-voyager';

let currentTileProviderId = DEFAULT_TILE_PROVIDER;

let map = null;
let currentTileLayer = null;
let geohashOverlayLayer = null;
const GEOHASH_PRECISION = 8;
const MIN_ZOOM_FOR_OVERLAY = 18;
const activeGeohashes = new Set(['sx8d9x3s']); // temporary

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  setTheme(theme);
  
  return theme;
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  updateMapTheme();
  
  updateGeohashOverlay();
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  return newTheme;
}

function initMap() {
  map = L.map('map').setView(DEFAULT_CENTER, DEFAULT_ZOOM);
  
  console.log(`Map initialized at zoom level: ${DEFAULT_ZOOM}`);

  setTileProvider(DEFAULT_TILE_PROVIDER);

  getUserLocation();

  return map;
}

function setTileProvider(providerId) {
  const provider = TILE_PROVIDERS[providerId];
  
  if (!provider) {
    console.error('Invalid tile provider:', providerId);
    return;
  }

  currentTileProviderId = providerId;

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const themeConfig = provider[currentTheme];

  if (currentTileLayer) {
    map.removeLayer(currentTileLayer);
  }

  currentTileLayer = L.tileLayer(themeConfig.url, {
    attribution: themeConfig.attribution,
    maxZoom: themeConfig.maxZoom,
    minZoom: 3
  }).addTo(map);
  
  updateGeohashOverlay();
}

function updateMapTheme() {
  if (map && currentTileProviderId) {
    setTileProvider(currentTileProviderId);
  }
}

function getUserLocation() {
  if (!navigator.geolocation) {
    console.warn('Geolocation is not supported by this browser');
    showLocationStatus('Geolocation not supported. Showing Sofia, Bulgaria.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const userLocation = [latitude, longitude];
      
      map.setView(userLocation, DEFAULT_ZOOM);
      
      console.log('User location:', userLocation);
      console.log(`Map centered at user location with zoom level: ${DEFAULT_ZOOM}`);
    },
    (error) => {
      console.warn('Geolocation error:', error.message);
      
      let errorMessage = 'Unable to get location. Showing Sofia, Bulgaria.';
      
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location permission denied. Showing Sofia, Bulgaria.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location unavailable. Showing Sofia, Bulgaria.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out. Showing Sofia, Bulgaria.';
          break;
      }
      
      showLocationStatus(errorMessage);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  );
}


function showLocationStatus(message) {
  const statusEl = document.getElementById('locationStatus');
  if (!statusEl) return;
  
  const component = Alpine.$data(statusEl);
  if (component) {
    component.message = message;
    component.showStatus = true;
    
    setTimeout(() => {
      component.showStatus = false;
    }, 4000);
  }
}

function getGeohashBorderColor() {
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  const provider = currentTileProviderId;
  
  if (theme === 'dark' || provider === 'cartodb-voyager' || provider === 'cartodb-positron') {
    return '#a0a0a0';
  }
  
  return '#404040';
}

// function toggleGeohash(hash) {
//   if (activeGeohashes.has(hash)) {
//     activeGeohashes.delete(hash);
//   } else {
//     activeGeohashes.add(hash);
//   }
//   updateGeohashOverlay();
// }

function getVisibleGeohashes(bounds, precision) {
  const geohashSet = new Set();
  
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  
  const centerLat = (sw.lat + ne.lat) / 2;
  const centerLng = (sw.lng + ne.lng) / 2;
  const centerHash = geohash.encode(centerLat, centerLng, precision);
  const centerBounds = geohash.decode_bbox(centerHash);
  
  const geohashLatHeight = centerBounds[2] - centerBounds[0];
  const geohashLngWidth = centerBounds[3] - centerBounds[1];
  
  const latStep = geohashLatHeight * 0.5;
  const lngStep = geohashLngWidth * 0.5;
  
  for (let lat = sw.lat; lat <= ne.lat; lat += latStep) {
    for (let lng = sw.lng; lng <= ne.lng; lng += lngStep) {
      const hash = geohash.encode(lat, lng, precision);
      geohashSet.add(hash);
    }
  }
  
  return Array.from(geohashSet);
}

function drawGeohashOverlay() {
  if (geohashOverlayLayer) {
    map.removeLayer(geohashOverlayLayer);
  }
  
  const currentZoom = map.getZoom();
  if (currentZoom < MIN_ZOOM_FOR_OVERLAY) {
    return;
  }
  
  geohashOverlayLayer = L.layerGroup();
  
  const bounds = map.getBounds();
  
  const visibleGeohashes = getVisibleGeohashes(bounds, GEOHASH_PRECISION);
  
  const MAX_SQUARES = 3000;
  if (visibleGeohashes.length > MAX_SQUARES) {
    console.warn(`Too many geohashes (${visibleGeohashes.length}). Zoom in more to see the overlay.`);
    return;
  }
  
  console.log(`Rendering ${visibleGeohashes.length} geohash squares`);
  console.log(`Active geohashes:`, Array.from(activeGeohashes));
  console.log(`Is sx83p2bb in visible geohashes?`, visibleGeohashes.includes('sx83p2bb'));
  
  const borderColor = getGeohashBorderColor();
  
  visibleGeohashes.forEach(hash => {
    const isActive = activeGeohashes.has(hash);
    
    if (!isActive) {
      return;
    }
    
    const hashBounds = geohash.decode_bbox(hash);
    
    const sw = [hashBounds[0], hashBounds[1]];
    const ne = [hashBounds[2], hashBounds[3]];
    
    if (hash === 'sx83p2bb') {
      console.log(`Found sx83p2bb! isActive: ${isActive}`);
      console.log(`Bounds:`, hashBounds);
    }
    
    const rectangle = L.rectangle([sw, ne], {
      color: borderColor,
      weight: 1,
      fillColor: '#3388ff',
      fillOpacity: 0.5,
      interactive: true
    });
    
    // rectangle.on('click', () => {
    //   toggleGeohash(hash);
    // });
    
    rectangle.bindTooltip(hash, {
      permanent: false,
      direction: 'center',
      className: 'geohash-tooltip'
    });
    
    geohashOverlayLayer.addLayer(rectangle);
  });
  
  geohashOverlayLayer.addTo(map);
}

function updateGeohashOverlay() {
  if (map) {
    drawGeohashOverlay();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMap();
  
  map.on('moveend', updateGeohashOverlay);
  map.on('zoomend', () => {
    const currentZoom = map.getZoom();
    console.log(`Zoom changed to level: ${currentZoom}`);
    updateGeohashOverlay();
  });
  
  console.log(`Current zoom level: ${map.getZoom()}`);
  
  updateGeohashOverlay();
});
