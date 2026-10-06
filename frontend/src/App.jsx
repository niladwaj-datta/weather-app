import React, { useState, useEffect, useCallback } from 'react';
import { CloudSun, RotateCw, MapPin, AlertCircle } from 'lucide-react';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import WeatherMetrics from './components/WeatherMetrics';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import SkeletonLoader from './components/SkeletonLoader';

const DEFAULT_CITY = 'New York';

export default function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState(() => localStorage.getItem('weather_unit') || 'C');
  const [currentCity, setCurrentCity] = useState(
    () => localStorage.getItem('last_searched_city') || DEFAULT_CITY
  );

  // Toggle metric / imperial units
  const handleUnitToggle = (newUnit) => {
    setUnit(newUnit);
    localStorage.setItem('weather_unit', newUnit);
  };

  // Fetch weather by city name
  const fetchWeather = useCallback(async (cityName) => {
    if (!cityName) return;
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/weather?city=${encodeURIComponent(cityName)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch weather data.');
      }

      setWeatherData(data);
      setCurrentCity(data.location.name);
      localStorage.setItem('last_searched_city', data.location.name);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch weather by geolocation coordinates
  const fetchWeatherByCoords = useCallback(async (lat, lon) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch weather for your location.');
      }

      setWeatherData(data);
      setCurrentCity(data.location.name);
    } catch (err) {
      console.error('Location fetch error:', err);
      setError(err.message || 'Could not fetch weather for coordinates.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Geolocation trigger
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setLoading(false);
        setError('Location access denied. Please type a city name instead.');
      },
      { timeout: 10000 }
    );
  };

  // Initial load
  useEffect(() => {
    fetchWeather(currentCity);
  }, []);

  // Dynamic theme based on current weather category
  const themeClass = weatherData?.current?.category
    ? `theme-${weatherData.current.category}`
    : 'theme-clear';

  return (
    <div className={`app-container ${themeClass}`}>
      <div className="content-wrapper">
        {/* Navigation / Header */}
        <header className="app-header">
          <div className="brand">
            <div className="brand-icon">
              <CloudSun size={24} />
            </div>
            <div>
              <div className="brand-title">SkyCast</div>
              <div className="brand-subtitle">One-Pager Weather</div>
            </div>
          </div>

          <div className="header-controls">
            {/* Locate Me */}
            <button
              type="button"
              className="icon-action-btn"
              onClick={handleUseMyLocation}
              title="Use my current location"
              disabled={loading}
            >
              <MapPin size={18} />
            </button>

            {/* Refresh */}
            <button
              type="button"
              className="icon-action-btn"
              onClick={() => fetchWeather(currentCity)}
              title="Refresh weather"
              disabled={loading}
            >
              <RotateCw size={18} className={loading ? 'animate-spin' : ''} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>

            {/* °C / °F Unit Switcher */}
            <div className="unit-toggle">
              <button
                type="button"
                className={`unit-btn ${unit === 'C' ? 'active' : ''}`}
                onClick={() => handleUnitToggle('C')}
              >
                °C
              </button>
              <button
                type="button"
                className={`unit-btn ${unit === 'F' ? 'active' : ''}`}
                onClick={() => handleUnitToggle('F')}
              >
                °F
              </button>
            </div>
          </div>
        </header>

        {/* Search Bar */}
        <SearchBar onSearch={fetchWeather} isLoading={loading} />

        {/* Error Notification */}
        {error && (
          <div className="error-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} />
              <span className="error-text">{error}</span>
            </div>
            <button
              type="button"
              className="retry-btn"
              onClick={() => fetchWeather(currentCity || DEFAULT_CITY)}
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Content Area */}
        {loading && !weatherData ? (
          <SkeletonLoader />
        ) : weatherData ? (
          <main>
            <div className="dashboard-grid">
              <CurrentWeather weatherData={weatherData} unit={unit} />
              <WeatherMetrics weatherData={weatherData} unit={unit} />
            </div>

            <HourlyForecast hourlyData={weatherData.hourly} unit={unit} />

            <DailyForecast dailyData={weatherData.daily} unit={unit} />
          </main>
        ) : null}

        {/* Footer */}
        <footer className="app-footer">
          <div>Built with Flask, React, and Open-Meteo API</div>
          <div>Responsive • Zero API Key Required • Real-Time Caching</div>
        </footer>
      </div>
    </div>
  );
}
