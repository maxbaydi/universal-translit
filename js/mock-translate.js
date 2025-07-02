/**
 * Mock Translation Service for Local Development
 * Provides basic translations for common Russian words
 */

window.MockTranslationService = {
  // Простой словарь для базового перевода русских слов
  dictionary: {
    "привет": "hello",
    "пока": "bye",
    "да": "yes",
    "нет": "no",
    "и": "and",
    "или": "or",
    "в": "in",
    "на": "on",
    "контент": "content",
    "текст": "text",
    "страница": "page",
    "сайт": "site",
    "главная": "main",
    "новости": "news",
    "события": "events",
    "компания": "company",
    "о": "about",
    "контакты": "contacts",
    "адреса": "addresses",
    "каталог": "catalog",
    "товаров": "products",
    "цена": "price",
    "скидка": "discount",
    "акция": "promotion"
  },
  
  /**
   * Transliterates Russian text to English-like text
   * @param {string} text - Russian text
   * @returns {string} - Transliterated text
   */
  transliterate: function(text) {
    const converter = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
      'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
      'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
      'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
      'я': 'ya'
    };
    
    return text.toLowerCase().split('').map(char => {
      return converter[char] || char;
    }).join('');
  },
  
  /**
   * Simple dictionary-based translation with fallback to transliteration
   * @param {string} text - Text to translate 
   * @returns {string} - Translated text
   */
  mockTranslate: function(text) {
    if (!text) return '';
    
    // Разбиваем текст на слова
    const words = text.toLowerCase().split(/\s+/);
    
    // Переводим каждое слово
    const translated = words.map(word => {
      // Очищаем слово от пунктуации для поиска в словаре
      const cleanWord = word.replace(/[^\wа-яё]/gi, '');
      
      // Ищем в словаре
      if (this.dictionary[cleanWord]) {
        // Если слово найдено в словаре, используем перевод
        return word.replace(cleanWord, this.dictionary[cleanWord]);
      } else {
        // Если не найдено, используем транслитерацию
        return this.transliterate(word);
      }
    });
    
    return translated.join(' ');
  }
};
