/**
 * Meshcore Map Application
 * Main application logic for map initialization and geolocation
 */

// Constants
const DEFAULT_CENTER = [42.6977, 23.3219]; // Sofia, Bulgaria
const DEFAULT_ZOOM = 15;

// Tile provider configurations with light/dark variants
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

// Global variables
let currentTileProviderId = DEFAULT_TILE_PROVIDER;

// Global map instance
let map = null;
let currentTileLayer = null;

/**
 * Initialize theme based on user preference or system preference
 */
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  setTheme(theme);
  
  return theme;
}

/**
 * Set the theme
 * @param {string} theme - 'light' or 'dark'
 */
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  // Update map tiles to match theme
  updateMapTheme();
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  return newTheme;
}

/**
 * Initialize the map with user location or default center
 * @returns {L.Map} The Leaflet map instance
 */
function initMap() {
  // Initialize map centered on Sofia (default)
  map = L.map('map').setView(DEFAULT_CENTER, DEFAULT_ZOOM);

  // Add default tile layer
  setTileProvider(DEFAULT_TILE_PROVIDER);

  // Try to get user's location
  getUserLocation();

  return map;
}

/**
 * Set or change the tile provider
 * @param {string} providerId - The ID of the tile provider to use
 */
function setTileProvider(providerId) {
  const provider = TILE_PROVIDERS[providerId];
  
  if (!provider) {
    console.error('Invalid tile provider:', providerId);
    return;
  }

  // Store the current provider ID
  currentTileProviderId = providerId;

  // Get current theme
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const themeConfig = provider[currentTheme];

  // Remove existing tile layer if present
  if (currentTileLayer) {
    map.removeLayer(currentTileLayer);
  }

  // Add new tile layer with theme-specific configuration
  currentTileLayer = L.tileLayer(themeConfig.url, {
    attribution: themeConfig.attribution,
    maxZoom: themeConfig.maxZoom,
    minZoom: 3
  }).addTo(map);
}

/**
 * Update map tiles based on current theme
 */
function updateMapTheme() {
  if (map && currentTileProviderId) {
    setTileProvider(currentTileProviderId);
  }
}

/**
 * Request user's geolocation and update map center
 * Falls back to Sofia, Bulgaria if permission denied or unavailable
 */
function getUserLocation() {
  if (!navigator.geolocation) {
    console.warn('Geolocation is not supported by this browser');
    showLocationStatus('Geolocation not supported. Showing Sofia, Bulgaria.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    // Success callback
    (position) => {
      const { latitude, longitude } = position.coords;
      const userLocation = [latitude, longitude];
      
      // Update map center to user's location
      map.setView(userLocation, DEFAULT_ZOOM);
      
      console.log('User location:', userLocation);
      showLocationStatus('Location found!');
    },
    // Error callback
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
    // Options
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  );
}

/**
 * Show location status message to user
 * @param {string} message - The message to display
 */
function showLocationStatus(message) {
  const statusEl = document.getElementById('locationStatus');
  if (!statusEl) return;
  
  // Use Alpine.js reactive data if available
  const component = Alpine.$data(statusEl);
  if (component) {
    component.message = message;
    component.showStatus = true;
    
    // Hide after 4 seconds
    setTimeout(() => {
      component.showStatus = false;
    }, 4000);
  }
}

// Initialize theme and map when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMap();
});
