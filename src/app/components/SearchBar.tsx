import { useState, useRef, useEffect } from 'react';
import { useAutocomplete } from '../hooks/useAutocomplete';

interface SearchBarProps {
  city: string;
  onCityChange: (city: string) => void;
  onSearch: () => void;
  loading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  city,
  onCityChange,
  onSearch,
  loading
}) => {
  const {
    suggestions,
    showSuggestions,
    selectedSuggestionIndex,
    isLoading: suggestionsLoading,
    fetchSuggestions,
    clearSuggestions,
    setSelectedSuggestionIndex,
    handleKeyDown
  } = useAutocomplete();

  const [inputValue, setInputValue] = useState(city);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Синхронизация с внешним состоянием
  useEffect(() => {
    setInputValue(city);
  }, [city]);

  // Закрытие подсказок при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        clearSuggestions();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [clearSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onCityChange(value);
    
    // Ищем предложения на русском
    if (value.length >= 2) {
      fetchSuggestions(value);
    } else {
      clearSuggestions();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onCityChange(suggestion);
    clearSuggestions();
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (selectedSuggestionIndex >= 0 && showSuggestions) {
        // Если есть выбранная подсказка, используем её
        handleSuggestionClick(suggestions[selectedSuggestionIndex]);
      } else {
        // Иначе выполняем поиск по введённому тексту
        onSearch();
        clearSuggestions();
      }
    } else {
      // Обработка стрелок и других клавиш для навигации по подсказкам
      handleKeyDown(e, inputValue, handleSuggestionClick);
    }
  };

  const handleSearchClick = () => {
    onSearch();
    clearSuggestions();
    inputRef.current?.blur();
  };

  // Подсветка совпадения в тексте подсказки
  const highlightMatch = (suggestion: string, query: string) => {
    if (!query.trim()) return suggestion;
    
    const normalizedSuggestion = suggestion.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    const matchIndex = normalizedSuggestion.indexOf(normalizedQuery);
    
    if (matchIndex === -1) return suggestion;
    
    const beforeMatch = suggestion.slice(0, matchIndex);
    const match = suggestion.slice(matchIndex, matchIndex + query.length);
    const afterMatch = suggestion.slice(matchIndex + query.length);
    
    return (
      <>
        {beforeMatch}
        <span className="bg-blue-500/30 text-white font-semibold px-1 rounded">
          {match}
        </span>
        {afterMatch}
      </>
    );
  };

  return (
    <div className="relative">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            onFocus={() => inputValue.length >= 2 && fetchSuggestions(inputValue)}
            placeholder="Введите название города..."
            className="w-full px-5 py-4 rounded-2xl border-0 bg-white/10 backdrop-blur-sm 
                     text-white placeholder-white/60 focus:outline-none focus:ring-2 
                     focus:ring-white/50 text-lg font-medium transition-all duration-300
                     shadow-lg shadow-blue-500/10"
            disabled={loading}
            autoComplete="off"
            spellCheck="false"
            aria-autocomplete="list"
            aria-controls="autocomplete-suggestions"
          />
          
          {/* Индикатор поиска/загрузки */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {suggestionsLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span className="text-white/40 text-lg">🔍</span>
            )}
          </div>
          
          {/* Автодополнение */}
          {showSuggestions && suggestions.length > 0 && (
            <div 
              ref={suggestionsRef}
              id="autocomplete-suggestions"
              className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm 
                        rounded-2xl border border-white/20 shadow-2xl z-50 overflow-hidden
                        animate-fade-in"
              role="listbox"
            >
              <div className="max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full px-4 py-3 text-left transition-all duration-200
                              ${index === selectedSuggestionIndex 
                                ? 'bg-blue-500/20 text-white' 
                                : 'text-gray-700 hover:bg-white/50'
                              } border-b border-white/10 last:border-b-0
                              flex items-center gap-3`}
                    role="option"
                    aria-selected={index === selectedSuggestionIndex}
                  >
                    <span className="text-lg flex-shrink-0">📍</span>
                    <span className="font-medium text-left">
                      {highlightMatch(suggestion, inputValue)}
                    </span>
                  </button>
                ))}
              </div>
              
              {/* Подсказка для пользователя */}
              <div className="px-3 py-2 bg-white/80 border-t border-white/20 text-xs text-gray-500 flex justify-between">
                <span>↑↓ для навигации</span>
                <span>Enter для выбора</span>
                <span>Esc для закрытия</span>
              </div>
            </div>
          )}

          {/* Сообщение когда нет результатов */}
          {showSuggestions && suggestions.length === 0 && inputValue.length >= 2 && !suggestionsLoading && (
            <div 
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm 
                        rounded-2xl border border-white/20 shadow-2xl z-50 p-4 text-center"
            >
              <div className="text-gray-500 flex items-center justify-center gap-2">
                <span>🔍</span>
                <span>Город не найден в списке</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Попробуйте ввести полное название города
              </p>
            </div>
          )}
        </div>
        
        <button
          onClick={handleSearchClick}
          disabled={loading || !inputValue.trim()}
          className="px-6 py-4 bg-white/20 hover:bg-white/30 disabled:bg-white/10 
                   backdrop-blur-sm text-white rounded-2xl font-semibold transition-all duration-300
                   focus:outline-none focus:ring-2 focus:ring-white/50 hover:scale-105 
                   active:scale-95 disabled:scale-100 disabled:cursor-not-allowed
                   shadow-lg shadow-blue-500/25 min-w-20 flex items-center justify-center
                   disabled:opacity-50"
          aria-label="Найти погоду"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            'Найти'
          )}
        </button>
      </div>
    </div>
  );
};