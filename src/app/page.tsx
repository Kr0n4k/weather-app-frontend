'use client';

import { useState, useEffect } from 'react';
import { ApiProvider } from './types/weather';
import { useWeather } from './hooks/useWeather';
import { getApiDisplayName } from './utils/weather';
import { SearchBar } from './components/SearchBar';
import { ApiSwitch } from './components/ApiSwitch';
import { WeatherDisplay } from './components/WeatherDisplay';
import { initializeTranslator } from './utils/translator';

export default function Home() {
  const [city, setCity] = useState('');
  const [apiProvider, setApiProvider] = useState<ApiProvider>('openweather');
  const [country] = useState('RU');
  
  const { weather, loading, error, fetchWeather } = useWeather();

  // Инициализация переводчика при загрузке компонента
  useEffect(() => {
    initializeTranslator({
      sourceLang: 'ru',
      targetLang: 'en',
      timeout: 5000
    });
  }, []);

  const handleSearch = () => {
    fetchWeather(city, country, apiProvider);
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
              <h1 className="text-2xl font-bold text-white">Погода</h1>
              <p className="text-white/70 text-sm">Выберите источник данных</p>
            </div>
          </div>

          <ApiSwitch 
            apiProvider={apiProvider} 
            onProviderChange={setApiProvider} 
          />
        </div>

        {/* Поисковая строка */}
        <div className="space-y-4 mb-8">
          <SearchBar
            city={city}
            onCityChange={setCity}
            onSearch={handleSearch}
            loading={loading}
          />
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
          <WeatherDisplay weather={weather} apiProvider={apiProvider} />
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
            <p className="mt-4 text-white/70 text-lg">Поиск погоды...</p>
            <p className="text-white/50 text-sm mt-2">
              через {getApiDisplayName(apiProvider)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}