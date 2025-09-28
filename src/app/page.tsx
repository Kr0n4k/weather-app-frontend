// page.tsx
'use client';

import { useState } from 'react';

interface WeatherData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  rain?: {
    "1h": number;
  };
  snow?: {
    "1h": number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

type ApiProvider = 'weatherapi' | 'openweather';

export default function Home() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiProvider, setApiProvider] = useState<ApiProvider>('openweather');
  const [country, setCountry] = useState('RU');

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError('Введите название города');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // Формируем URL в зависимости от выбранного провайдера
      let url = `http://localhost:4000/weather/city?city=${encodeURIComponent(city)}&country=${country}`;
      
      // Добавляем параметр провайдера для универсального эндпоинта
      url += `&provider=${apiProvider}`;

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Ошибка сервера' }));
        throw new Error(errorData.message || `Ошибка HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      setWeather(data);
      
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Превышено время ожидания ответа от сервера');
      } else {
        setError(err.message || 'Ошибка при получении данных погоды. Проверьте подключение к интернету.');
      }
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (iconCode: string) => {
    if (iconCode.startsWith('http')) {
      return iconCode;
    }
    
    // Разные иконки для разных API
    if (apiProvider === 'weatherapi') {
      if (iconCode.includes('d') || iconCode.includes('n')) {
        const time = iconCode.includes('d') ? 'day' : 'night';
        return `//cdn.weatherapi.com/weather/64x64/${time}/${iconCode.replace(/\D/g, '') || '113'}.png`;
      }
      return `//cdn.weatherapi.com/weather/64x64/day/113.png`;
    } else {
      // OpenWeather иконки
      return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    }
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
    return directions[Math.round(degrees / 45) % 8];
  };

  const formatTime = (timestamp: number) => {
    if (timestamp === 0) return 'н/д';
    return new Date(timestamp * 1000).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchWeather();
    }
  };

  const getApiDisplayName = (provider: ApiProvider) => {
    return provider === 'weatherapi' ? 'WeatherAPI' : 'OpenWeather';
  };

  return (
    <div className="font-sans min-h-screen p-4 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="max-w-lg mx-auto bg-white/10 dark:bg-gray-900/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
        
        {/* Заголовок и переключатель API */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🌤️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Погода
              </h1>
              <p className="text-white/70 text-sm">Выберите источник данных</p>
            </div>
          </div>

          {/* Переключатель API */}
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <label className="text-white/70 text-sm font-medium">Источник данных:</label>
            <div className="flex bg-white/10 backdrop-blur-sm rounded-2xl p-1 border border-white/10">
              <button
                onClick={() => setApiProvider('openweather')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  apiProvider === 'openweather' 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                OpenWeather
              </button>
              <button
                onClick={() => setApiProvider('weatherapi')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  apiProvider === 'weatherapi' 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                WeatherAPI
              </button>
            </div>
          </div>
        </div>

        {/* Страна и поиск */}
        <div className="space-y-4 mb-8">
          {/* Выбор страны */}
          <div className="flex flex-col gap-2">
            <label className="text-white/70 text-sm font-medium">Страна:</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="px-4 py-3 rounded-2xl border-0 bg-white/10 backdrop-blur-sm 
                       text-white focus:outline-none focus:ring-2 focus:ring-white/50 
                       transition-all duration-300"
            >
              <option value="RU">Россия</option>
              <option value="US">США</option>
              <option value="DE">Германия</option>
              <option value="FR">Франция</option>
              <option value="IT">Италия</option>
              <option value="ES">Испания</option>
              <option value="JP">Япония</option>
              <option value="CN">Китай</option>
              <option value="BR">Бразилия</option>
              <option value="IN">Индия</option>
            </select>
          </div>

          {/* Поисковая строка */}
          <div className="relative">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Введите город..."
                  className="w-full px-5 py-4 rounded-2xl border-0 bg-white/10 backdrop-blur-sm 
                           text-white placeholder-white/60 focus:outline-none focus:ring-2 
                           focus:ring-white/50 text-lg font-medium transition-all duration-300"
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40">
                  🔍
                </div>
              </div>
              <button
                onClick={fetchWeather}
                disabled={loading}
                className="px-6 py-4 bg-white/20 hover:bg-white/30 disabled:bg-white/10 
                         backdrop-blur-sm text-white rounded-2xl font-semibold transition-all duration-300
                         focus:outline-none focus:ring-2 focus:ring-white/50 hover:scale-105 
                         active:scale-95 disabled:scale-100 disabled:cursor-not-allowed
                         shadow-lg shadow-blue-500/25"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Найти'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Индикатор активного API */}
        <div className="mb-6 p-4 bg-white/5 backdrop-blur-sm border border-white/10 
                      rounded-2xl text-center">
          <div className="flex items-center justify-center gap-2">
            <span className={`text-lg ${apiProvider === 'openweather' ? 'text-blue-300' : 'text-green-300'}`}>
              {apiProvider === 'openweather' ? '🌍' : '⚡'}
            </span>
            <span className="text-white font-medium">
              Используется {getApiDisplayName(apiProvider)}
            </span>
          </div>
          <p className="text-white/60 text-sm mt-1">
            {apiProvider === 'openweather' 
              ? 'Глобальная база данных погоды' 
              : 'Специализированный сервис погоды'}
          </p>
        </div>

        {/* Сообщения об ошибках */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 
                        text-red-100 rounded-2xl text-center animate-shake">
            <div className="flex items-center justify-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Отображение погоды */}
        {weather && (
          <div className="space-y-6 animate-slide-up">
            {/* Заголовок с информацией об API */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full 
                            border border-white/10 mb-2">
                <span className="text-xs text-white/70">Данные от</span>
                <span className="text-sm font-semibold text-white">
                  {getApiDisplayName(apiProvider)}
                </span>
              </div>
            </div>

            {/* Основная информация */}
            <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/10 
                          shadow-2xl shadow-blue-500/10">
              <h2 className="text-3xl font-bold mb-3 text-white">
                {weather.name}, {weather.sys.country}
              </h2>
              
              <div className="flex items-center justify-center mb-4 gap-4">
                <div className="relative">
                  <img 
                    src={getWeatherIcon(weather.weather[0].icon)} 
                    alt={weather.weather[0].description}
                    className="w-20 h-20 drop-shadow-2xl"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMjAiIGZpbGw9IiNGRkZGRkYiIGZpbGwtb3BhY2l0eT0iMC4yIi8+Cjwvc3ZnPg==';
                    }}
                  />
                </div>
                <div className="text-5xl font-bold text-white drop-shadow-lg">
                  {Math.round(weather.main.temp)}°
                </div>
              </div>

              <p className="text-xl capitalize text-white/90 mb-3 font-medium">
                {weather.weather[0].description}
              </p>
              <p className="text-white/70">
                Ощущается как {Math.round(weather.main.feels_like)}°
              </p>
            </div>

            {/* Детали погоды */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/5 
                            hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💧</span>
                  <div className="text-sm font-semibold text-white/70">Влажность</div>
                </div>
                <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform">
                  {weather.main.humidity}%
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/5 
                            hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🎐</span>
                  <div className="text-sm font-semibold text-white/70">Ветер</div>
                </div>
                <div className="text-xl font-bold text-white group-hover:scale-110 transition-transform">
                  {weather.wind.speed.toFixed(1)} м/с
                </div>
                <div className="text-sm text-white/60 mt-1">
                  {getWindDirection(weather.wind.deg)}
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/5 
                            hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📊</span>
                  <div className="text-sm font-semibold text-white/70">Давление</div>
                </div>
                <div className="text-xl font-bold text-white group-hover:scale-110 transition-transform">
                  {weather.main.pressure} hPa
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/5 
                            hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">👁️</span>
                  <div className="text-sm font-semibold text-white/70">Видимость</div>
                </div>
                <div className="text-xl font-bold text-white group-hover:scale-110 transition-transform">
                  {(weather.visibility / 1000).toFixed(1)} км
                </div>
              </div>
            </div>

            {/* Восход и закат */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 backdrop-blur-sm 
                            p-4 rounded-2xl border border-orange-400/20 group hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🌅</span>
                  <div className="text-sm font-semibold text-amber-100">Восход</div>
                </div>
                <div className="text-xl font-bold text-white">{formatTime(weather.sys.sunrise)}</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm 
                            p-4 rounded-2xl border border-purple-400/20 group hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🌇</span>
                  <div className="text-sm font-semibold text-purple-100">Закат</div>
                </div>
                <div className="text-xl font-bold text-white">{formatTime(weather.sys.sunset)}</div>
              </div>
            </div>

            {/* Температурный диапазон */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm 
                            p-4 rounded-2xl border border-cyan-400/20 group hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">❄️</span>
                  <div className="text-sm font-semibold text-cyan-100">Мин. темп.</div>
                </div>
                <div className="text-2xl font-bold text-white">{Math.round(weather.main.temp_min)}°</div>
              </div>
              
              <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-sm 
                            p-4 rounded-2xl border border-red-400/20 group hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🔥</span>
                  <div className="text-sm font-semibold text-red-100">Макс. темп.</div>
                </div>
                <div className="text-2xl font-bold text-white">{Math.round(weather.main.temp_max)}°</div>
              </div>
            </div>
          </div>
        )}

        {/* Состояние по умолчанию */}
        {!weather && !error && !loading && (
          <div className="text-center py-16 text-white/60">
            <div className="text-8xl mb-6 opacity-50">🌎</div>
            <p className="text-xl mb-2">Начните поиск погоды</p>
            <p className="text-white/40">Выберите источник данных и введите город</p>
            <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm text-blue-300">
                📊 Активный источник: <strong>{getApiDisplayName(apiProvider)}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Индикатор загрузки */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin 
                           shadow-lg shadow-blue-500/25"></div>
            </div>
            <p className="mt-4 text-white/70 text-lg">Ищем погоду...</p>
            <p className="text-white/50 text-sm mt-2">
              через {getApiDisplayName(apiProvider)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}