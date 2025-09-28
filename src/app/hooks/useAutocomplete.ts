import { useState, useCallback, useRef } from 'react';
import { russianCities } from '../constants/constants';

export const useAutocomplete = () => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const lastQueryRef = useRef<string>('');

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      lastQueryRef.current = '';
      return;
    }

    // Если запрос не изменился, не делаем повторный поиск
    if (query === lastQueryRef.current) {
      return;
    }

    lastQueryRef.current = query;
    
    setIsLoading(true);

    setTimeout(() => {
      try {
        const normalizedQuery = query.toLowerCase().trim();
        
        // Сначала ищем точные совпадения в начале
        const exactMatches = russianCities.filter(city =>
          city.toLowerCase().startsWith(normalizedQuery)
        );

        // Затем ищем частичные совпадения
        const partialMatches = russianCities.filter(city =>
          city.toLowerCase().includes(normalizedQuery) &&
          !exactMatches.includes(city)
        );

        // Объединяем и ограничиваем количество
        const filteredCities = [
          ...exactMatches,
          ...partialMatches
        ].slice(0, 8);

        setSuggestions(filteredCities);
        setShowSuggestions(filteredCities.length > 0);
        setSelectedSuggestionIndex(-1);
      } catch (error) {
        console.error('Error in autocomplete:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    }, 150);
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    setIsLoading(false);
    lastQueryRef.current = '';
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, inputValue: string, onSuggestionSelect: (suggestion: string) => void) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          onSuggestionSelect(suggestions[selectedSuggestionIndex]);
        }
        break;
      
      case 'Escape':
        clearSuggestions();
        break;
      
      default:
        break;
    }
  }, [showSuggestions, suggestions, selectedSuggestionIndex, clearSuggestions]);

  return {
    suggestions,
    showSuggestions,
    selectedSuggestionIndex,
    isLoading,
    fetchSuggestions,
    clearSuggestions,
    setSelectedSuggestionIndex,
    setShowSuggestions,
    handleKeyDown
  };
};