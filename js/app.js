/**
 * Meshcore Map Application
 * Main application logic for map initialization and geolocation
 */

// Constants
const DEFAULT_CENTER = [42.6977, 23.3219]; // Sofia, Bulgaria
const DEFAULT_ZOOM = 15;
const TILE_LAYER_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_LAYER_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Global map instance
let map = null;

/**
 * Initialize the map with user location or default center
 * @returns {L.Map} The Leaflet map instance
 */
function initMap() {
  // Initialize map centered on Sofia (default)
  map = L.map('map').setView(DEFAULT_CENTER, DEFAULT_ZOOM);

  // Add OpenStreetMap tile layer
  L.tileLayer(TILE_LAYER_URL, {
    attribution: TILE_LAYER_ATTRIBUTION,
    maxZoom: 19,
    minZoom: 3
  }).addTo(map);

  // Try to get user's location
  getUserLocation();

  return map;
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

// Initialize map when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initMap();
});
