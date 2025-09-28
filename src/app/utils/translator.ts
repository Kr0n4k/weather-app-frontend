import { translate } from '@vitalets/google-translate-api';

export interface TranslationResult {
  success: boolean;
  translatedText: string;
  originalText: string;
  error?: string;
}

export interface TranslatorConfig {
  sourceLang?: string;
  targetLang?: string;
  timeout?: number;
}

class Translator {
  private config: Required<TranslatorConfig>;
  
  constructor(config: TranslatorConfig = {}) {
    this.config = {
      sourceLang: config.sourceLang || 'ru',
      targetLang: config.targetLang || 'en',
      timeout: config.timeout || 5000
    };
  }

  /**
   * Переводит текст с русского на английский
   */
  async translate(text: string): Promise<TranslationResult> {
    if (!text.trim()) {
      return {
        success: false,
        translatedText: '',
        originalText: text,
        error: 'Текст для перевода не может быть пустым'
      };
    }

    // Если текст уже на английском (проверка по регулярному выражению)
    if (this.isEnglishText(text)) {
      return {
        success: true,
        translatedText: text,
        originalText: text
      };
    }

    try {
      const result = await translate(text, {
        from: this.config.sourceLang,
        to: this.config.targetLang,
      });

      return {
        success: true,
        translatedText: result.text,
        originalText: text
      };

    } catch (error: any) {
      console.error('Translation error:', error);
      
      return {
        success: false,
        translatedText: '',
        originalText: text,
        error: this.getErrorMessage(error)
      };
    }
  }

  /**
   * Пакетный перевод нескольких текстов
   */
  async translateBatch(texts: string[]): Promise<TranslationResult[]> {
    const results: TranslationResult[] = [];
    
    for (const text of texts) {
      // Добавляем небольшую задержку между запросами чтобы не превысить лимиты
      await new Promise(resolve => setTimeout(resolve, 100));
      const result = await this.translate(text);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Проверяет, является ли текст английским
   */
  private isEnglishText(text: string): boolean {
    // Регулярное выражение для проверки английского текста
    const englishRegex = /^[a-zA-Z\s\-,.'"]+$/;
    return englishRegex.test(text.trim());
  }

  /**
   * Преобразует ошибку в читаемое сообщение
   */
  private getErrorMessage(error: any): string {
    if (error.name === 'AbortError') {
      return 'Превышено время ожидания перевода';
    }
    
    if (error.message.includes('quota') || error.message.includes('rate limit')) {
      return 'Превышена квота переводчика';
    }
    
    if (error.message.includes('API') || error.message.includes('key')) {
      return 'Ошибка доступа к сервису перевода';
    }
    
    return error.message || 'Ошибка при переводе текста';
  }
}

// Создаем экземпляр переводчика с настройками по умолчанию
let translatorInstance: Translator | null = null;

/**
 * Инициализация переводчика
 */
export const initializeTranslator = (config?: Partial<TranslatorConfig>): void => {
  translatorInstance = new Translator(config);
};

/**
 * Получить экземпляр переводчика
 */
export const getTranslator = (): Translator => {
  if (!translatorInstance) {
    throw new Error('Translator not initialized. Call initializeTranslator first.');
  }
  return translatorInstance;
};

/**
 * Упрощенная функция для быстрого перевода (без инициализации)
 */
export const translateText = async (text: string, config?: Partial<TranslatorConfig>): Promise<TranslationResult> => {
  const tempTranslator = new Translator(config);
  return await tempTranslator.translate(text);
};

/**
 * Вспомогательная функция для перевода названий городов
 */
export const translateCityName = async (cityName: string): Promise<string> => {
  if (!translatorInstance) {
    console.warn('Translator not initialized, using default translator for city name');
    const tempTranslator = new Translator();
    const result = await tempTranslator.translate(cityName);
    
    if (result.success) {
      return result.translatedText;
    } else {
      console.warn('Translation failed:', result.error);
      return transliterateCityName(cityName);
    }
  }

  const result = await translatorInstance.translate(cityName);
  
  if (result.success) {
    return result.translatedText;
  } else {
    console.warn('Translation failed:', result.error);
    // Возвращаем транслитерированную версию как fallback
    return transliterateCityName(cityName);
  }
};

/**
 * Транслитерация кириллицы в латиницу (fallback)
 */
export const transliterateCityName = (cityName: string): string => {
  const transliterationMap: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
    'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
    'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts',
    'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu',
    'Я': 'Ya'
  };

  return cityName
    .split('')
    .map(char => transliterationMap[char] || char)
    .join('')
    .replace(/\s+/g, ' ') // Убираем лишние пробелы
    .trim();
};

export default Translator;