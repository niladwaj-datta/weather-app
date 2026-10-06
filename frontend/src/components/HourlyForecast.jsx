import React from 'react';
import { Clock, Droplets } from 'lucide-react';
import WeatherIcon from './WeatherIcon';

function formatHour(timeStr, index) {
  if (index === 0) return 'Now';
  try {
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: 'numeric' });
  } catch {
    return timeStr.slice(11, 16);
  }
}

export default function HourlyForecast({ hourlyData, unit }) {
  if (!hourlyData || hourlyData.length === 0) return null;

  const isCelsius = unit === 'C';

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      <h2 className="section-title">
        <Clock size={18} style={{ color: '#38bdf8' }} />
        <span>Hourly Forecast (Next 24 Hours)</span>
      </h2>
      <div className="hourly-scroll-container">
        {hourlyData.map((hour, index) => {
          const temp = isCelsius ? Math.round(hour.temp_c) : Math.round(hour.temp_f);
          const isNow = index === 0;

          return (
            <div
              key={hour.time}
              className={`hourly-item ${isNow ? 'is-current' : ''}`}
            >
              <span className="hourly-time">{formatHour(hour.time, index)}</span>
              <WeatherIcon icon={hour.icon} size={24} />
              <span className="hourly-temp">{temp}°</span>
              {hour.pop_percent > 0 ? (
                <span className="hourly-rain">
                  <Droplets size={10} />
                  {hour.pop_percent}%
                </span>
              ) : (
                <span className="hourly-rain" style={{ visibility: 'hidden' }}>
                  0%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

