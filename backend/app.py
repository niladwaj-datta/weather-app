"""
Flask Weather Application Backend
Provides REST API endpoints for city search and current/forecast weather metrics.
Powered by Open-Meteo API (free, reliable, no API key required).
"""

import os
import time
import requests
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

# Determine frontend static dist directory if built
DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

app = Flask(__name__, static_folder=DIST_DIR if os.path.exists(DIST_DIR) else None)
# Enable CORS for React frontend (Vite default port 5173 and standard localhost)
CORS(app, resources={r"/api/*": {"origins": "*"}})


# Cache storage with TTL (time to live in seconds)
CACHE = {}
CACHE_TTL_SECONDS = 600  # 10 minutes cache

# WMO Weather interpretation codes (WW)
WMO_CODE_MAP = {
    0: {"condition": "Clear sky", "category": "clear", "icon": "sun"},
    1: {"condition": "Mainly clear", "category": "clear", "icon": "sun"},
    2: {"condition": "Partly cloudy", "category": "clouds", "icon": "cloud-sun"},
    3: {"condition": "Overcast", "category": "clouds", "icon": "cloud"},
    45: {"condition": "Foggy", "category": "fog", "icon": "cloud-fog"},
    48: {"condition": "Depositing rime fog", "category": "fog", "icon": "cloud-fog"},
    51: {"condition": "Light drizzle", "category": "rain", "icon": "cloud-drizzle"},
    53: {"condition": "Moderate drizzle", "category": "rain", "icon": "cloud-drizzle"},
    55: {"condition": "Dense drizzle", "category": "rain", "icon": "cloud-drizzle"},
    56: {"condition": "Light freezing drizzle", "category": "rain", "icon": "cloud-snow"},
    57: {"condition": "Dense freezing drizzle", "category": "rain", "icon": "cloud-snow"},
    61: {"condition": "Slight rain", "category": "rain", "icon": "cloud-rain"},
    63: {"condition": "Moderate rain", "category": "rain", "icon": "cloud-rain"},
    65: {"condition": "Heavy rain", "category": "rain", "icon": "cloud-rain"},
    66: {"condition": "Light freezing rain", "category": "rain", "icon": "cloud-snow"},
    67: {"condition": "Heavy freezing rain", "category": "rain", "icon": "cloud-snow"},
    71: {"condition": "Slight snow fall", "category": "snow", "icon": "snowflake"},
    73: {"condition": "Moderate snow fall", "category": "snow", "icon": "snowflake"},
    75: {"condition": "Heavy snow fall", "category": "snow", "icon": "snowflake"},
    77: {"condition": "Snow grains", "category": "snow", "icon": "snowflake"},
    80: {"condition": "Slight rain showers", "category": "rain", "icon": "cloud-rain"},
    81: {"condition": "Moderate rain showers", "category": "rain", "icon": "cloud-rain"},
    82: {"condition": "Violent rain showers", "category": "rain", "icon": "cloud-rain"},
    85: {"condition": "Slight snow showers", "category": "snow", "icon": "snowflake"},
    86: {"condition": "Heavy snow showers", "category": "snow", "icon": "snowflake"},
    95: {"condition": "Thunderstorm", "category": "storm", "icon": "cloud-lightning"},
    96: {"condition": "Thunderstorm with slight hail", "category": "storm", "icon": "cloud-lightning"},
    99: {"condition": "Thunderstorm with heavy hail", "category": "storm", "icon": "cloud-lightning"},
}


def get_wmo_info(code: int):
    """Retrieve condition description, visual category, and icon for WMO code."""
    return WMO_CODE_MAP.get(
        code,
        {"condition": "Variable conditions", "category": "clouds", "icon": "cloud"}
    )


def c_to_f(celsius: float) -> float:
    """Convert Celsius to Fahrenheit."""
    if celsius is None:
        return None
    return round((celsius * 9 / 5) + 32, 1)


def kmh_to_mph(kmh: float) -> float:
    """Convert km/h to mph."""
    if kmh is None:
        return None
    return round(kmh * 0.621371, 1)


def get_cached_item(key: str):
    """Retrieve item from in-memory cache if not expired."""
    entry = CACHE.get(key)
    if not entry:
        return None
    if time.time() - entry["timestamp"] > CACHE_TTL_SECONDS:
        del CACHE[key]
        return None
    return entry["data"]


def set_cached_item(key: str, data):
    """Save item in cache with current timestamp."""
    CACHE[key] = {
        "timestamp": time.time(),
        "data": data
    }


def geocode_city(city_name: str):
    """Find latitude and longitude coordinates for a city name."""
    cache_key = f"geo:{city_name.strip().lower()}"
    cached = get_cached_item(cache_key)
    if cached:
        return cached

    url = "https://geocoding-api.open-meteo.com/v1/search"
    params = {
        "name": city_name.strip(),
        "count": 5,
        "language": "en",
        "format": "json"
    }

    try:
        response = requests.get(url, params=params, timeout=8)
        response.raise_for_status()
        data = response.json()
        results = data.get("results")
        if not results:
            return None

        # Return primary result and save to cache
        primary = results[0]
        geo_payload = {
            "name": primary.get("name"),
            "country": primary.get("country", ""),
            "country_code": primary.get("country_code", ""),
            "region": primary.get("admin1", ""),
            "latitude": primary.get("latitude"),
            "longitude": primary.get("longitude"),
            "timezone": primary.get("timezone", "UTC")
        }
        set_cached_item(cache_key, geo_payload)
        return geo_payload
    except requests.RequestException as e:
        app.logger.error(f"Geocoding request failed: {e}")
        return None


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint to verify backend status."""
    return jsonify({
        "status": "healthy",
        "service": "weather-flask-backend",
        "timestamp": int(time.time()),
        "cached_queries_count": len(CACHE)
    }), 200


@app.route("/api/search", methods=["GET"])
def search_cities():
    """
    Search for cities matching a query for autocomplete suggestions.
    Query param: q (e.g. /api/search?q=tokyo)
    """
    query = request.args.get("q", "").strip()
    if not query or len(query) < 2:
        return jsonify({"results": []}), 200

    cache_key = f"search:{query.lower()}"
    cached = get_cached_item(cache_key)
    if cached:
        return jsonify({"results": cached}), 200

    url = "https://geocoding-api.open-meteo.com/v1/search"
    params = {
        "name": query,
        "count": 6,
        "language": "en",
        "format": "json"
    }

    try:
        response = requests.get(url, params=params, timeout=8)
        response.raise_for_status()
        data = response.json()
        raw_results = data.get("results", [])

        results = [
            {
                "name": item.get("name"),
                "country": item.get("country", ""),
                "country_code": item.get("country_code", ""),
                "region": item.get("admin1", ""),
                "latitude": item.get("latitude"),
                "longitude": item.get("longitude"),
                "timezone": item.get("timezone", "UTC")
            }
            for item in raw_results
        ]
        set_cached_item(cache_key, results)
        return jsonify({"results": results}), 200
    except requests.RequestException as err:
        return jsonify({"error": f"Failed to search cities: {str(err)}"}), 502


@app.route("/api/weather", methods=["GET"])
def get_weather():
    """
    Fetch comprehensive weather data for a city or coordinates.
    Query params:
      - city: name of the city (e.g., Paris, New York, Tokyo)
      - OR lat & lon: direct coordinates
    """
    city_name = request.args.get("city", "").strip()
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)

    geo_data = None

    if city_name:
        geo_data = geocode_city(city_name)
        if not geo_data:
            return jsonify({
                "error": f"City '{city_name}' could not be found. Please check spelling."
            }), 404
        lat = geo_data["latitude"]
        lon = geo_data["longitude"]
    elif lat is not None and lon is not None:
        geo_data = {
            "name": f"{lat:.2f}, {lon:.2f}",
            "country": "",
            "country_code": "",
            "region": "",
            "latitude": lat,
            "longitude": lon,
            "timezone": "auto"
        }
    else:
        return jsonify({
            "error": "Please provide a 'city' query parameter or 'lat' and 'lon'."
        }), 400

    cache_key = f"weather:{lat:.3f}:{lon:.3f}"
    cached_weather = get_cached_item(cache_key)
    if cached_weather:
        # Merge updated geo data if available
        cached_weather["location"] = geo_data
        return jsonify(cached_weather), 200

    # Call Open-Meteo Weather API
    forecast_url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "is_day",
            "precipitation",
            "weather_code",
            "wind_speed_10m",
            "wind_direction_10m",
            "surface_pressure"
        ],
        "hourly": [
            "temperature_2m",
            "weather_code",
            "precipitation_probability"
        ],
        "daily": [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "precipitation_probability_max",
            "wind_speed_10m_max",
            "uv_index_max",
            "sunrise",
            "sunset"
        ],
        "timezone": geo_data.get("timezone") or "auto"
    }

    try:
        resp = requests.get(forecast_url, params=params, timeout=10)
        resp.raise_for_status()
        raw = resp.json()
    except requests.RequestException as err:
        app.logger.error(f"Upstream weather API request error: {err}")
        return jsonify({
            "error": "Failed to fetch weather data from upstream weather service."
        }), 502

    current_raw = raw.get("current", {})
    daily_raw = raw.get("daily", {})
    hourly_raw = raw.get("hourly", {})

    wmo_code = current_raw.get("weather_code", 0)
    wmo_info = get_wmo_info(wmo_code)

    temp_c = current_raw.get("temperature_2m")
    feels_c = current_raw.get("apparent_temperature")
    wind_kmh = current_raw.get("wind_speed_10m")

    # Format Current Conditions
    current_formatted = {
        "temperature_c": temp_c,
        "temperature_f": c_to_f(temp_c),
        "feels_like_c": feels_c,
        "feels_like_f": c_to_f(feels_c),
        "humidity": current_raw.get("relative_humidity_2m"),
        "wind_speed_kmh": wind_kmh,
        "wind_speed_mph": kmh_to_mph(wind_kmh),
        "wind_direction_deg": current_raw.get("wind_direction_10m"),
        "pressure_hpa": current_raw.get("surface_pressure"),
        "precipitation_mm": current_raw.get("precipitation", 0.0),
        "is_day": bool(current_raw.get("is_day", 1)),
        "weather_code": wmo_code,
        "condition": wmo_info["condition"],
        "category": wmo_info["category"],
        "icon": wmo_info["icon"],
        "time": current_raw.get("time")
    }

    # Format 24-hour forecast
    hourly_formatted = []
    hourly_times = hourly_raw.get("time", [])
    hourly_temps = hourly_raw.get("temperature_2m", [])
    hourly_codes = hourly_raw.get("weather_code", [])
    hourly_pops = hourly_raw.get("precipitation_probability", [])

    # Find the current hour index or start from index 0 up to 24 hours
    current_time_str = current_raw.get("time", "")
    start_idx = 0
    if current_time_str and current_time_str in hourly_times:
        start_idx = hourly_times.index(current_time_str)

    end_idx = min(start_idx + 24, len(hourly_times))
    for i in range(start_idx, end_idx):
        h_code = hourly_codes[i] if i < len(hourly_codes) else 0
        h_info = get_wmo_info(h_code)
        h_temp = hourly_temps[i] if i < len(hourly_temps) else None
        hourly_formatted.append({
            "time": hourly_times[i],
            "temp_c": h_temp,
            "temp_f": c_to_f(h_temp),
            "pop_percent": hourly_pops[i] if i < len(hourly_pops) else 0,
            "weather_code": h_code,
            "condition": h_info["condition"],
            "icon": h_info["icon"]
        })

    # Format 7-Day Forecast
    daily_formatted = []
    daily_dates = daily_raw.get("time", [])
    daily_max_c = daily_raw.get("temperature_2m_max", [])
    daily_min_c = daily_raw.get("temperature_2m_min", [])
    daily_codes = daily_raw.get("weather_code", [])
    daily_rain_prob = daily_raw.get("precipitation_probability_max", [])
    daily_sunrises = daily_raw.get("sunrise", [])
    daily_sunsets = daily_raw.get("sunset", [])
    daily_uv = daily_raw.get("uv_index_max", [])

    for i in range(len(daily_dates)):
        d_code = daily_codes[i] if i < len(daily_codes) else 0
        d_info = get_wmo_info(d_code)
        max_c = daily_max_c[i] if i < len(daily_max_c) else None
        min_c = daily_min_c[i] if i < len(daily_min_c) else None
        daily_formatted.append({
            "date": daily_dates[i],
            "temp_max_c": max_c,
            "temp_max_f": c_to_f(max_c),
            "temp_min_c": min_c,
            "temp_min_f": c_to_f(min_c),
            "precipitation_prob_max": daily_rain_prob[i] if i < len(daily_rain_prob) else 0,
            "uv_index_max": daily_uv[i] if i < len(daily_uv) else None,
            "sunrise": daily_sunrises[i] if i < len(daily_sunrises) else "",
            "sunset": daily_sunsets[i] if i < len(daily_sunsets) else "",
            "weather_code": d_code,
            "condition": d_info["condition"],
            "icon": d_info["icon"]
        })

    # Today's UV and Sunrise/Sunset for quick metrics
    today_uv = daily_uv[0] if daily_uv else None
    today_sunrise = daily_sunrises[0] if daily_sunrises else None
    today_sunset = daily_sunsets[0] if daily_sunsets else None

    response_payload = {
        "location": geo_data,
        "current": current_formatted,
        "metrics": {
            "uv_index": today_uv,
            "sunrise": today_sunrise,
            "sunset": today_sunset,
            "precipitation_mm": current_formatted["precipitation_mm"],
            "pressure_hpa": current_formatted["pressure_hpa"]
        },
        "hourly": hourly_formatted,
        "daily": daily_formatted,
        "cached": False,
        "fetched_at": int(time.time())
    }

    set_cached_item(cache_key, response_payload)
    return jsonify(response_payload), 200


@app.route("/api/cache/clear", methods=["POST"])
def clear_cache():
    """Clear in-memory cache."""
    count = len(CACHE)
    CACHE.clear()
    return jsonify({"message": f"Cleared {count} items from cache."}), 200


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    """Serve built React single-page application if dist exists."""
    if os.path.exists(DIST_DIR):
        if path != "" and os.path.exists(os.path.join(DIST_DIR, path)):
            return send_from_directory(DIST_DIR, path)
        return send_from_directory(DIST_DIR, "index.html")
    return jsonify({
        "message": "Flask Weather API is running. Start the React Vite frontend at http://localhost:5173 for development or run 'npm run build' inside frontend/ to serve here.",
        "endpoints": {
            "health": "/api/health",
            "weather": "/api/weather?city=London",
            "search": "/api/search?q=Tokyo"
        }
    }), 200



if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "True").lower() in ("true", "1", "t")
    print(f"Starting Flask Weather Server on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
