import { ApiProvider } from '../types/weather';
import { WIND_DIRECTIONS } from '../constants/constants';

export const getWeatherIcon = (iconCode: string, apiProvider: ApiProvider) => {
  if (iconCode.startsWith('http')) {
    return iconCode;
  }
  
  if (apiProvider === 'weatherapi') {
    if (iconCode.includes('d') || iconCode.includes('n')) {
      const time = iconCode.includes('d') ? 'day' : 'night';
      return `//cdn.weatherapi.com/weather/64x64/${time}/${iconCode.replace(/\D/g, '') || '113'}.png`;
    }
    return `//cdn.weatherapi.com/weather/64x64/day/113.png`;
  } else {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }
};

export const getWindDirection = (degrees: number) => {
  return WIND_DIRECTIONS[Math.round(degrees / 45) % 8];
};

export const formatTime = (timestamp: number) => {
  if (timestamp === 0) return 'н/д';
  return new Date(timestamp * 1000).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getApiDisplayName = (provider: ApiProvider) => {
  return provider === 'weatherapi' ? 'WeatherAPI' : 'OpenWeather';
};