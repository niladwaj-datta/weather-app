import React from 'react';
import { MapPin, ArrowUp, ArrowDown } from 'lucide-react';
import WeatherIcon from './WeatherIcon';

export default function CurrentWeather({ weatherData, unit }) {
  if (!weatherData) return null;

  const { location, current, daily } = weatherData;
  const isCelsius = unit === 'C';

  const temp = isCelsius ? Math.round(current.temperature_c) : Math.round(current.temperature_f);
  const feelsLike = isCelsius ? Math.round(current.feels_like_c) : Math.round(current.feels_like_f);

  // Today's high/low
  const todayForecast = daily && daily.length > 0 ? daily[0] : null;
  const tempMax = todayForecast
    ? isCelsius
      ? Math.round(todayForecast.temp_max_c)
      : Math.round(todayForecast.temp_max_f)
    : null;
  const tempMin = todayForecast
    ? isCelsius
      ? Math.round(todayForecast.temp_min_c)
      : Math.round(todayForecast.temp_min_f)
    : null;

  return (
    <div className="glass-card hero-card">
      <div className="hero-header">
        <div>
          <h1 className="city-title">{location.name}</h1>
          <div className="city-location">
            <MapPin size={16} style={{ color: '#38bdf8' }} />
            <span>
              {location.region ? `${location.region}, ` : ''}
              {location.country}
            </span>
          </div>
        </div>
        <div className="weather-badge">
          <WeatherIcon icon={current.icon} isDay={current.is_day} size={18} />
          <span>{current.condition}</span>
        </div>
      </div>

      <div className="hero-body">
        <div>
          <div className="temp-large">
            {temp}
            <span className="temp-unit">°{unit}</span>
          </div>
          <div className="temp-range">
            <span>Feels like {feelsLike}°{unit}</span>
            {tempMax !== null && tempMin !== null && (
              <>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <ArrowUp size={14} style={{ color: '#f87171' }} /> {tempMax}°
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <ArrowDown size={14} style={{ color: '#60a5fa' }} /> {tempMin}°
                </span>
              </>
            )}
          </div>
        </div>

        <div className="weather-hero-icon">
          <WeatherIcon icon={current.icon} isDay={current.is_day} size={84} />
        </div>
      </div>
    </div>
  );
}

