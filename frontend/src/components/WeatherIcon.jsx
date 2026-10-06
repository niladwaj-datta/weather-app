import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Snowflake,
  Moon,
  CloudMoon,
} from 'lucide-react';

export default function WeatherIcon({ icon, isDay = true, size = 28, className = '' }) {
  // If it's night and icon is clear sun, show Moon
  if (!isDay && (icon === 'sun' || icon === 'clear')) {
    return <Moon size={size} className={`text-indigo-300 ${className}`} style={{ color: '#c7d2fe' }} />;
  }
  if (!isDay && icon === 'cloud-sun') {
    return <CloudMoon size={size} className={`text-indigo-200 ${className}`} style={{ color: '#cbd5e1' }} />;
  }

  switch (icon) {
    case 'sun':
      return <Sun size={size} style={{ color: '#fbbf24' }} className={className} />;
    case 'cloud-sun':
      return <CloudSun size={size} style={{ color: '#fde047' }} className={className} />;
    case 'cloud':
      return <Cloud size={size} style={{ color: '#94a3b8' }} className={className} />;
    case 'cloud-rain':
      return <CloudRain size={size} style={{ color: '#38bdf8' }} className={className} />;
    case 'cloud-drizzle':
      return <CloudDrizzle size={size} style={{ color: '#7dd3fc' }} className={className} />;
    case 'cloud-snow':
    case 'snowflake':
      return <Snowflake size={size} style={{ color: '#bae6fd' }} className={className} />;
    case 'cloud-lightning':
      return <CloudLightning size={size} style={{ color: '#c084fc' }} className={className} />;
    case 'cloud-fog':
      return <CloudFog size={size} style={{ color: '#cbd5e1' }} className={className} />;
    default:
      return <Cloud size={size} style={{ color: '#94a3b8' }} className={className} />;
  }
}

