import React from 'react';
import { Calendar, Droplets } from 'lucide-react';
import WeatherIcon from './WeatherIcon';

function formatDayName(dateStr, index) {
  if (index === 0) return 'Today';
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function DailyForecast({ dailyData, unit }) {
  if (!dailyData || dailyData.length === 0) return null;

  const isCelsius = unit === 'C';

  return (
    <div className="glass-card">
      <h2 className="section-title">
        <Calendar size={18} style={{ color: '#38bdf8' }} />
        <span>7-Day Weather Outlook</span>
      </h2>
      <div className="daily-forecast-list">
        {dailyData.map((day, idx) => {
          const max = isCelsius ? Math.round(day.temp_max_c) : Math.round(day.temp_max_f);
          const min = isCelsius ? Math.round(day.temp_min_c) : Math.round(day.temp_min_f);

          return (
            <div key={day.date} className="daily-row">
              <span className="daily-day">{formatDayName(day.date, idx)}</span>

              <div className="daily-cond-icon">
                <WeatherIcon icon={day.icon} size={22} />
              </div>

              <div className="daily-desc">
                <span>{day.condition}</span>
                {day.precipitation_prob_max > 20 && (
                  <span style={{ color: '#38bdf8', marginLeft: '8px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Droplets size={12} />
                    {day.precipitation_prob_max}%
                  </span>
                )}
              </div>

              <div className="daily-temp-range">
                <span className="daily-temp-max">{max}°</span>
                <span className="daily-temp-min">{min}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

