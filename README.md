# Meshcore Map Frontend

A lightweight, single-page map visualization application built with Alpine.js and Leaflet.js.

## Features

- Interactive map powered by Leaflet.js
- Geolocation support with fallback to Sofia, Bulgaria
- Responsive top navigation menu
- Clean, modern UI design
- No build step required - runs directly in the browser

## Quick Start

### Prerequisites

No dependencies to install! This project uses CDN links for all libraries.

### Running Locally

#### Option 1: Python 3
```bash
python3 -m http.server 8000
```

#### Option 2: Node.js
```bash
npx serve .
```

Then open your browser to `http://localhost:8000`

## Project Structure

```
meshcore-map-fe/
├── index.html          # Main HTML page
├── css/
│   └── styles.css      # Application styles
├── js/
│   └── app.js          # Application logic
├── assets/             # Images and other assets
├── AGENTS.md           # AI coding agent guidelines
└── README.md           # This file
```

## Technology Stack

- **Alpine.js 3.x** - Lightweight JavaScript framework
- **Leaflet.js 1.9.4** - Interactive maps library
- **OpenStreetMap** - Map tiles provider

## How It Works

1. On page load, the application initializes a Leaflet map
2. The app requests the user's geolocation permission
3. If granted, the map centers on the user's location with a marker
4. If denied or unavailable, the map defaults to Sofia, Bulgaria
5. Users can interact with the map (zoom, pan, etc.)

## Browser Support

Modern browsers (last 2 versions):
- Chrome/Edge
- Firefox
- Safari

## Contributing

1. Follow the code style guidelines in `AGENTS.md`
2. Test in multiple browsers before committing
3. Use conventional commit messages (see `AGENTS.md`)

## License

MIT
