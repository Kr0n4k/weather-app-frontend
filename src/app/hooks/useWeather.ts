import { useState, useCallback } from 'react';
import { WeatherData, ApiProvider } from '../types/weather';
import { API_CONFIG } from '../constants/constants';
import { translateCityName } from '../utils/translator';

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = useCallback(async (city: string, country: string, apiProvider: ApiProvider) => {
    if (!city.trim()) {
      setError('Введите название города');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

      // Переводим название города на английский только для API запроса
      let cityForApi = city;
      try {
        cityForApi = await translateCityName(city);
        console.log(`Translated "${city}" to "${cityForApi}" for API request`);
      } catch (translationError) {
        console.warn('Translation failed, using original city name:', translationError);
        // В случае ошибки перевода используем оригинальное название
      }

      const url = `${API_CONFIG.baseUrl}?city=${encodeURIComponent(cityForApi)}&country=${country}&provider=${apiProvider}`;

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
  }, []);

  const clearWeather = useCallback(() => {
    setWeather(null);
    setError('');
  }, []);

  return {
    weather,
    loading,
    error,
    fetchWeather,
    clearWeather,
    setError
  };
};