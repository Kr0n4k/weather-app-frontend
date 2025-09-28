import { WeatherData, ApiProvider } from '../types/weather';
import { getWeatherIcon, getWindDirection, formatTime, getApiDisplayName } from '../utils/weather';

interface WeatherDisplayProps {
  weather: WeatherData;
  apiProvider: ApiProvider;
}

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weather, apiProvider }) => {
  return (
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
              src={getWeatherIcon(weather.weather[0].icon, apiProvider)} 
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
      <WeatherDetails weather={weather} />
      
      {/* Восход и закат */}
      <SunriseSunset weather={weather} />
      
      {/* Температурный диапазон */}
      <TemperatureRange weather={weather} />
    </div>
  );
};

const WeatherDetails: React.FC<{ weather: WeatherData }> = ({ weather }) => (
  <div className="grid grid-cols-2 gap-4">
    <WeatherDetailCard
      icon="💧"
      label="Влажность"
      value={`${weather.main.humidity}%`}
    />
    <WeatherDetailCard
      icon="🎐"
      label="Ветер"
      value={`${weather.wind.speed.toFixed(1)} м/с`}
      subtitle={getWindDirection(weather.wind.deg)}
    />
    <WeatherDetailCard
      icon="📊"
      label="Давление"
      value={`${weather.main.pressure} hPa`}
    />
    <WeatherDetailCard
      icon="👁️"
      label="Видимость"
      value={`${(weather.visibility / 1000).toFixed(1)} км`}
    />
  </div>
);

const SunriseSunset: React.FC<{ weather: WeatherData }> = ({ weather }) => (
  <div className="grid grid-cols-2 gap-4">
    <GradientCard
      gradient="from-orange-500/20 to-amber-500/20"
      border="border-orange-400/20"
      icon="🌅"
      label="Восход"
      value={formatTime(weather.sys.sunrise)}
      labelColor="text-amber-100"
    />
    <GradientCard
      gradient="from-purple-500/20 to-pink-500/20"
      border="border-purple-400/20"
      icon="🌇"
      label="Закат"
      value={formatTime(weather.sys.sunset)}
      labelColor="text-purple-100"
    />
  </div>
);

const TemperatureRange: React.FC<{ weather: WeatherData }> = ({ weather }) => (
  <div className="grid grid-cols-2 gap-4">
    <GradientCard
      gradient="from-cyan-500/20 to-blue-500/20"
      border="border-cyan-400/20"
      icon="❄️"
      label="Мин. темп."
      value={`${Math.round(weather.main.temp_min)}°`}
      labelColor="text-cyan-100"
    />
    <GradientCard
      gradient="from-red-500/20 to-orange-500/20"
      border="border-red-400/20"
      icon="🔥"
      label="Макс. темп."
      value={`${Math.round(weather.main.temp_max)}°`}
      labelColor="text-red-100"
    />
  </div>
);

const WeatherDetailCard: React.FC<{
  icon: string;
  label: string;
  value: string;
  subtitle?: string;
}> = ({ icon, label, value, subtitle }) => (
  <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/5 
                hover:bg-white/10 transition-all duration-300 group">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-lg">{icon}</span>
      <div className="text-sm font-semibold text-white/70">{label}</div>
    </div>
    <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform">
      {value}
    </div>
    {subtitle && (
      <div className="text-sm text-white/60 mt-1">{subtitle}</div>
    )}
  </div>
);

const GradientCard: React.FC<{
  gradient: string;
  border: string;
  icon: string;
  label: string;
  value: string;
  labelColor: string;
}> = ({ gradient, border, icon, label, value, labelColor }) => (
  <div className={`bg-gradient-to-br ${gradient} backdrop-blur-sm 
                p-4 rounded-2xl ${border} group hover:scale-[1.02] transition-transform`}>
    <div className="flex items-center gap-2 mb-2">
      <span className="text-lg">{icon}</span>
      <div className={`text-sm font-semibold ${labelColor}`}>{label}</div>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
  </div>
);