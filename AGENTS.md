# Agent Guidelines for Meshcore Map Frontend

This document provides essential information for AI coding agents working on the Meshcore Map Frontend project.

## Project Overview

Meshcore Map Frontend is a lightweight web application for map visualization using Alpine.js and Leaflet.js. The project emphasizes simplicity, minimal dependencies, and vanilla web technologies.

## Technology Stack

- **JavaScript Framework**: Alpine.js (CDN-based, no build step)
- **Map Library**: Leaflet.js
- **Architecture**: Single-page application (SPA) with vanilla HTML/CSS/JS
- **No Build Tools**: Development uses direct HTML files (for now)

## Build, Lint, and Test Commands

### Current Setup (Static HTML)
```bash
# Serve locally (Python 3)
python3 -m http.server 8000

# Serve locally (Node.js)
npx serve .

# Open in browser
open http://localhost:8000
```

### Running Tests
Currently no test framework configured. When adding tests, consider:
- Vitest for unit tests
- Playwright for E2E tests

## Code Style Guidelines

### File Organization
```
/
├── index.html          # Main application page
├── css/
│   └── styles.css      # Global styles
├── js/
│   └── app.js          # Main application logic
├── assets/             # Images, icons, etc.
└── AGENTS.md           # This file
```

### HTML Guidelines

**Structure**:
- Use semantic HTML5 elements (`<nav>`, `<main>`, `<section>`, etc.)
- Include proper meta tags (viewport, charset, description)
- Keep markup clean and minimal

**Alpine.js Usage**:
- Use `x-data` for component state
- Use `x-init` for initialization logic
- Use `x-on:` (or `@`) for event handlers
- Keep Alpine directives readable and simple

**Example**:
```html
<div x-data="{ count: 0 }">
  <button @click="count++">Increment</button>
  <span x-text="count"></span>
</div>
```

### CSS Guidelines

**Naming Conventions**:
- Use kebab-case for class names: `.top-menu`, `.map-container`
- Use semantic class names that describe purpose, not appearance
- Avoid deeply nested selectors (max 3 levels)

**Organization**:
```css
/* 1. CSS Reset/Normalize */
/* 2. CSS Variables */
/* 3. Layout */
/* 4. Components */
/* 5. Utilities */
```

**Responsive Design**:
- Mobile-first approach
- Use CSS Grid and Flexbox for layouts
- Avoid fixed pixel widths where possible

### JavaScript Guidelines

**Naming Conventions**:
- Use camelCase for variables and functions: `getUserLocation`, `mapInstance`
- Use PascalCase for constructors/classes: `MapController`
- Use UPPER_SNAKE_CASE for constants: `DEFAULT_ZOOM_LEVEL`

**Code Style**:
- Use modern ES6+ syntax (const/let, arrow functions, async/await)
- Prefer `const` over `let` when variables won't be reassigned
- Use template literals for string interpolation
- Use destructuring where appropriate

**Example**:
```javascript
const DEFAULT_CENTER = [42.6977, 23.3219]; // Sofia, Bulgaria
const DEFAULT_ZOOM = 13;

async function initializeMap() {
  const map = L.map('map');
  // ... rest of implementation
}
```

### Alpine.js Patterns

**Component State**:
- Keep state close to where it's used
- Use Alpine stores for global state
- Initialize state with sensible defaults

**Example**:
```javascript
document.addEventListener('alpine:init', () => {
  Alpine.store('map', {
    center: null,
    zoom: 13,
    setCenter(lat, lng) {
      this.center = [lat, lng];
    }
  });
});
```

### Leaflet.js Patterns

**Map Initialization**:
```javascript
const map = L.map('map').setView([lat, lng], zoom);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);
```

**Error Handling**:
- Always handle geolocation errors gracefully
- Provide fallback coordinates (Sofia, Bulgaria)
- Show user-friendly error messages

## Error Handling

**Geolocation**:
```javascript
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => { /* success */ },
    (error) => { /* fallback to default */ }
  );
} else {
  // Browser doesn't support geolocation
}
```

**General Principles**:
- Always handle async errors with try/catch
- Log errors to console for debugging
- Show user-friendly messages in UI
- Provide sensible fallbacks

## Comments and Documentation

**When to Comment**:
- Never comment

**JSDoc for Functions**:
```javascript
/**
 * Initialize the map with user location or default center
 * @param {string} elementId - The ID of the map container element
 * @returns {L.Map} The Leaflet map instance
 */
function initMap(elementId) {
  // Implementation
}
```

## Git Commit Guidelines

**Format**: `type: brief description`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `style`: CSS/styling changes
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `chore`: Maintenance tasks

**Examples**:
- `feat: add geolocation support`
- `fix: handle geolocation permission denial`
- `style: improve top menu responsiveness`

## Important Conventions

1. **No Build Step**: Keep the project buildless for simplicity. Use CDN links for dependencies.
2. **Progressive Enhancement**: Ensure basic functionality works without JavaScript.
3. **Accessibility**: Use semantic HTML, proper ARIA labels, and keyboard navigation.
4. **Performance**: Minimize HTTP requests, lazy-load when appropriate.
5. **Browser Support**: Target modern browsers (last 2 versions of major browsers).

## Common Tasks

### Adding a New Feature
1. Plan the feature and update AGENTS.md if needed
2. Implement in the appropriate file (HTML/CSS/JS)
3. Test in multiple browsers
4. Commit with descriptive message

### Debugging Map Issues
- Check browser console for Leaflet errors
- Verify tile layer URL is correct
- Ensure map container has explicit height in CSS
- Check that coordinates are in correct format [lat, lng]

## Resources

- [Alpine.js Documentation](https://alpinejs.dev/)
- [Leaflet.js Documentation](https://leafletjs.com/)
- [OpenStreetMap Tile Servers](https://wiki.openstreetmap.org/wiki/Tile_servers)
