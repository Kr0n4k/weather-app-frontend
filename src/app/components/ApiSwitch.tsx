import { ApiProvider } from '../types/weather';
import { getApiDisplayName } from '../utils/weather';

interface ApiSwitchProps {
  apiProvider: ApiProvider;
  onProviderChange: (provider: ApiProvider) => void;
}

export const ApiSwitch: React.FC<ApiSwitchProps> = ({
  apiProvider,
  onProviderChange
}) => {
  return (
    <div className="flex flex-col gap-2 w-full sm:w-auto">
      <label className="text-white/70 text-sm font-medium">Источник данных:</label>
      <div className="flex bg-white/10 backdrop-blur-sm rounded-2xl p-1 border border-white/10">
        <button
          onClick={() => onProviderChange('openweather')}
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
            apiProvider === 'openweather' 
              ? 'bg-white/20 text-white shadow-lg' 
              : 'text-white/70 hover:text-white'
          }`}
        >
          {getApiDisplayName('openweather')}
        </button>
        <button
          onClick={() => onProviderChange('weatherapi')}
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
            apiProvider === 'weatherapi' 
              ? 'bg-white/20 text-white shadow-lg' 
              : 'text-white/70 hover:text-white'
          }`}
        >
          {getApiDisplayName('weatherapi')}
        </button>
      </div>
    </div>
  );
};