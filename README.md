# 🌤️ SkyCast — One-Pager Global Weather Application

A sleek, responsive, single-page weather dashboard built with **Flask** (Python) and **React** (Vite). Search for any city worldwide to get instant real-time weather metrics, a 24-hour hourly progression, and a 7-day extended forecast — **with zero API keys required**.

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.x-lightgrey.svg)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646cff.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## ✨ Features

- 🔍 **Instant City Search & Autocomplete**: Real-time debounced search suggestions as you type, with quick-select pills for popular world cities (Tokyo, London, New York, Paris, Sydney, Dubai, Mumbai).
- 📍 **One-Click Geolocation**: Instantly fetch weather for your current physical location using the browser's Geolocation API.
- 🌡️ **Metric & Imperial Toggle**: Effortlessly switch between Celsius (°C) and Fahrenheit (°F) with instantaneous recalculation.
- 🎨 **Dynamic Ambient Backdrops**: Background gradient adapts dynamically based on active weather conditions (Clear/Sunny, Overcast/Cloudy, Rainy, Snow, Thunderstorm, Fog).
- 📊 **6 Comprehensive Weather Metrics**:
  - 💨 Wind speed (km/h & mph) & compass heading
  - 💧 Relative humidity moisture index
  - ☀️ UV Index with color-coded risk assessment (Low to Extreme)
  - ⏲️ Barometric atmospheric pressure (hPa)
  - 🌅 Sunrise & Sunset local cycles
  - 🌧️ Precipitation volume & chance
- ⏱️ **24-Hour Hourly Progression**: Horizontally scrollable temperature and precipitation probability timeline.
- 📅 **7-Day Extended Outlook**: Visual temperature high/low bars and daily weather condition indicators.
- ⚡ **In-Memory TTL Caching**: Backend shields upstream services, ensures sub-10ms response times for repeated city searches, and auto-expires entries after 10 minutes.
- 🔑 **Zero Mandatory API Keys**: Runs completely out of the box using Open-Meteo's open meteorological data.

---

## 🏗️ Architecture

For an in-depth technical analysis including **Mermaid system diagrams**, **request sequence diagrams**, **caching mechanisms**, and **data contracts**, view [ARCHITECTURE.md](ARCHITECTURE.md).

```
AntiGravity/
├── backend/
│   ├── app.py              # Flask server, weather endpoints, caching, SPA serving
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment variable sample
│   ├── test_app.py         # Backend automated test suite
│   └── venv/               # Python virtual environment (created during setup)
├── frontend/
│   ├── index.html          # HTML entry point with fonts & meta
│   ├── package.json        # Frontend dependencies & scripts
│   ├── vite.config.js      # Vite build & development proxy configuration
│   └── src/
│       ├── main.jsx        # React root mount
│       ├── App.jsx         # Main dashboard state & orchestration
│       ├── index.css       # Glassmorphism design system & animations
│       └── components/     # Modular UI components
│           ├── SearchBar.jsx
│           ├── CurrentWeather.jsx
│           ├── WeatherMetrics.jsx
│           ├── HourlyForecast.jsx
│           ├── DailyForecast.jsx
│           ├── WeatherIcon.jsx
│           └── SkeletonLoader.jsx
├── ARCHITECTURE.md         # Comprehensive system architecture documentation
└── README.md               # Quickstart guide and documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: 3.10 or newer (`python --version`)
- **Node.js & npm**: Node 18+ and npm 9+ (`node -v`, `npm -v`)

---

### Option 1: Development Mode (Recommended for Development)

Run the backend and frontend separately with Vite Hot Module Replacement (HMR).

#### Step 1: Start the Flask Backend
```bash
# Navigate to the backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# On Windows (PowerShell / CMD):
venv\Scripts\activate
# On Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Flask backend (starts on http://127.0.0.1:5000)
python app.py
```

#### Step 2: Start the React Frontend
In a **new terminal**:
```bash
# Navigate to the frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite dev server (starts on http://localhost:5173)
npm run dev
```

Open your browser at **[http://localhost:5173](http://localhost:5173)**. Requests to `/api/*` are automatically proxied to Flask on port 5000.

---

### Option 2: Unified Production Mode (Single Port)

Build the React frontend and let Flask serve both the REST API and the frontend single-page application from port 5000:

```bash
# 1. Build the React frontend
cd frontend
npm install
npm run build

# 2. Run the Flask backend
cd ../backend
python app.py
```

Open **[http://127.0.0.1:5000](http://127.0.0.1:5000)** in your browser!

---

## 📡 REST API Reference

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| `GET` | `/api/health` | Service health status & cache metrics | None |
| `GET` | `/api/search` | City name search for autocomplete | `q=<city_name>` |
| `GET` | `/api/weather` | Complete weather telemetry & forecast | `city=<name>` OR `lat=<lat>&lon=<lon>` |
| `POST` | `/api/cache/clear` | Flushes the in-memory cache | None |

### Example API Request
```bash
curl "http://127.0.0.1:5000/api/weather?city=London"
```

---

## 🧪 Running Automated Tests

Run the backend unit and integration test suite:

```bash
cd backend
python -m unittest test_app.py
```

Expected output:
```text
......
----------------------------------------------------------------------
Ran 6 tests in ~2.5s

OK
```

To test the frontend build:
```bash
cd frontend
npm run build
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

