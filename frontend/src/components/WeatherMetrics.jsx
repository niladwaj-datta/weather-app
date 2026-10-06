import React from 'react';
import {
  Wind,
  Droplets,
  Sun,
  Gauge,
  Sunrise,
  Sunset,
  CloudRain,
  Compass,
} from 'lucide-react';

function getUvRating(uv) {
  if (uv === null || uv === undefined) return { label: 'N/A', color: '#94a3b8' };
  if (uv <= 2) return { label: 'Low', color: '#4ade80' };
  if (uv <= 5) return { label: 'Moderate', color: '#facc15' };
  if (uv <= 7) return { label: 'High', color: '#fb923c' };
  if (uv <= 10) return { label: 'Very High', color: '#f87171' };
  return { label: 'Extreme', color: '#c084fc' };
}

function formatTime(isoString) {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoString.split('T')[1]?.slice(0, 5) || '--:--';
  }
}

export default function WeatherMetrics({ weatherData, unit }) {
  if (!weatherData) return null;

  const { current, metrics } = weatherData;
  const isMetric = unit === 'C';

  const windSpeed = isMetric
    ? `${current.wind_speed_kmh} km/h`
    : `${current.wind_speed_mph} mph`;

  const uvInfo = getUvRating(metrics?.uv_index);

  return (
    <div className="metrics-grid">
      {/* Wind */}
      <div className="metric-card">
        <div className="metric-top">
          <span className="metric-label">Wind</span>
          <div className="metric-icon-wrap">
            <Wind size={20} />
          </div>
        </div>
        <div>
          <div className="metric-val">{windSpeed}</div>
          <div className="metric-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Compass size={14} />
            <span>Direction: {current.wind_direction_deg}°</span>
          </div>
        </div>
      </div>

      {/* Humidity */}
      <div className="metric-card">
        <div className="metric-top">
          <span className="metric-label">Humidity</span>
          <div className="metric-icon-wrap">
            <Droplets size={20} />
          </div>
        </div>
        <div>
          <div className="metric-val">{current.humidity}%</div>
          <div className="metric-sub">
            {current.humidity > 70 ? 'High moisture' : current.humidity < 30 ? 'Dry air' : 'Comfortable'}
          </div>
        </div>
      </div>

      {/* UV Index */}
      <div className="metric-card">
        <div className="metric-top">
          <span className="metric-label">UV Index</span>
          <div className="metric-icon-wrap">
            <Sun size={20} />
          </div>
        </div>
        <div>
          <div className="metric-val">
            {metrics?.uv_index !== null ? metrics.uv_index : '--'}
          </div>
          <div className="metric-sub" style={{ color: uvInfo.color, fontWeight: 600 }}>
            {uvInfo.label}
          </div>
        </div>
      </div>

      {/* Pressure */}
      <div className="metric-card">
        <div className="metric-top">
          <span className="metric-label">Pressure</span>
          <div className="metric-icon-wrap">
            <Gauge size={20} />
          </div>
        </div>
        <div>
          <div className="metric-val">{Math.round(current.pressure_hpa)} hPa</div>
          <div className="metric-sub">Barometric</div>
        </div>
      </div>

      {/* Sunrise & Sunset */}
      <div className="metric-card">
        <div className="metric-top">
          <span className="metric-label">Sun Cycle</span>
          <div className="metric-icon-wrap">
            <Sunrise size={20} />
          </div>
        </div>
        <div>
          <div className="metric-val" style={{ fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Sunrise size={16} style={{ color: '#fbbf24' }} /> {formatTime(metrics?.sunrise)}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Sunset size={16} style={{ color: '#f97316' }} /> {formatTime(metrics?.sunset)}
            </span>
          </div>
        </div>
      </div>

      {/* Precipitation */}
      <div className="metric-card">
        <div className="metric-top">
          <span className="metric-label">Precipitation</span>
          <div className="metric-icon-wrap">
            <CloudRain size={20} />
          </div>
        </div>
        <div>
          <div className="metric-val">{current.precipitation_mm} mm</div>
          <div className="metric-sub">Current volume</div>
        </div>
      </div>
    </div>
  );
}

