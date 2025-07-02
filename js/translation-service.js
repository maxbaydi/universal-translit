/**
 * Translation Service
 * Provides multiple translation APIs with fallback strategy
 */

window.TranslationService = {
  // CORS прокси для локальной разработки
  CORS_PROXY: 'https://cors-anywhere.herokuapp.com/',
  
  // Список доступных API сервисов для перевода
  services: [
    {
      name: 'LibreTranslate',
      url: 'https://translate.argosopentech.com/translate',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      buildBody: (text, from, to) => JSON.stringify({
        q: text,
        source: from,
        target: to,
        format: 'text'
      }),
      parseResponse: (data, from) => ({
        translatedText: data.translatedText,
        detectedSourceLanguage: data.detectedLanguage?.language || from
      }),
      available: true, // Флаг доступности сервиса
      useCorsProxy: true // Использовать CORS прокси
    },
    {
      name: 'Lingva',
      url: 'https://lingva.ml/api/v1/{from}/{to}/{text}',
      method: 'GET',
      headers: {},
      buildUrl: (text, from, to) => {
        return `https://lingva.ml/api/v1/${from || 'auto'}/${to}/${encodeURIComponent(text)}`;
      },
      parseResponse: (data, from) => ({
        translatedText: data.translation,
        detectedSourceLanguage: data.info?.detectedSource || from
      }),
      available: true // Флаг доступности сервиса
    },
    {
      name: 'MymemoryTranslate',
      url: 'https://api.mymemory.translated.net/get',
      method: 'GET',
      headers: {},
      buildUrl: (text, from, to) => {
        return `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from || 'ru'}|${to}`;
      },
      parseResponse: (data, from) => ({
        translatedText: data.responseData.translatedText,
        detectedSourceLanguage: from
      }),
      available: true // Флаг доступности сервиса
    }
  ],
  
  /**
   * Проверка доступности всех сервисов перевода
   * @returns {Promise<boolean>} - True если хотя бы один сервис доступен
   */
  async checkServicesAvailability() {
    try {
      // Простой тестовый текст
      const testText = "Тест";
      
      // Проверяем все сервисы параллельно
      const results = await Promise.allSettled(
        this.services.map(async (service, index) => {
          try {
            // Устанавливаем короткий тайм-аут для проверки
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            // Пробуем выполнить тестовый перевод
            let response;
            const from = 'ru';
            const to = 'en';
            
            // Определяем URL с учетом прокси если нужно
            const apiUrl = service.useCorsProxy ? 
                          this.CORS_PROXY + service.url : 
                          service.url;
            
            if (service.method === 'POST') {
              response = await fetch(apiUrl, {
                method: 'POST',
                headers: service.headers,
                body: service.buildBody(testText, from, to),
                signal: controller.signal
              });
            } else {
              const url = service.useCorsProxy ? 
                        this.CORS_PROXY + service.buildUrl(testText, from, to) : 
                        service.buildUrl(testText, from, to);
                        
              response = await fetch(url, {
                method: 'GET',
                headers: service.headers,
                signal: controller.signal
              });
            }
            
            clearTimeout(timeoutId);
            
            // Обновляем статус доступности сервиса
            this.services[index].available = response.ok;
            return { index, available: response.ok };
          } catch (error) {
            console.error(`Ошибка проверки сервиса ${service.name}:`, error);
            this.services[index].available = false;
            return { index, available: false };
          }
        })
      );
      
      // Считаем количество доступных сервисов
      const availableServices = results.filter(
        result => result.status === 'fulfilled' && result.value.available
      ).length;
      
      console.log(`Доступно ${availableServices} из ${this.services.length} сервисов перевода`);
      
      return availableServices > 0;
    } catch (error) {
      console.error('Ошибка при проверке доступности сервисов:', error);
      return false;
    }
  },
  
  /**
   * Translate text using available translation services with fallback
   * @param {Object} params
   * @param {string} params.text - Text to translate
   * @param {string} [params.from] - Source language (default 'auto' or 'ru')
   * @param {string} params.to - Target language (e.g. 'en')
   * @returns {Promise<{translatedText: string, detectedSourceLanguage?: string, success: boolean}>}
   */
  async translate({ text, from = 'ru', to = 'en' }) {
    if (!text) return { translatedText: '', success: false };
    
    // Проверяем все сервисы по очереди, начиная с первого доступного
    for (const service of this.services) {
      if (!service.available) continue;
      
      try {
        console.log(`Попытка перевода через ${service.name}...`);
        
        let response;
        let data;
        
        // Определяем URL с учетом прокси если нужно
        const apiUrl = service.useCorsProxy ? 
                      this.CORS_PROXY + service.url : 
                      service.url;
        
        if (service.method === 'POST') {
          // POST запрос
          response = await fetch(apiUrl, {
            method: 'POST',
            headers: service.headers,
            body: service.buildBody(text, from, to)
          });
          data = await response.json();
        } else {
          // GET запрос
          const url = service.useCorsProxy ? 
                    this.CORS_PROXY + service.buildUrl(text, from, to) : 
                    service.buildUrl(text, from, to);
                    
          response = await fetch(url, {
            method: 'GET',
            headers: service.headers
          });
          data = await response.json();
        }
        
        if (response.ok && data) {
          // Передаем from как параметр в parseResponse
          const result = service.parseResponse(data, from);
          
          if (result.translatedText) {
            console.log(`Успешный перевод через ${service.name}`);
            return {
              translatedText: result.translatedText,
              detectedSourceLanguage: result.detectedSourceLanguage,
              success: true
            };
          }
        }
      } catch (error) {
        console.error(`Ошибка при использовании ${service.name}:`, error);
        // Помечаем сервис как недоступный
        service.available = false;
        // Продолжаем со следующим сервисом
      }
    }
    
    // Если все сервисы недоступны, используем mock-перевод
    console.log('Все онлайн-сервисы перевода недоступны, используем локальный перевод');
    
    if (window.MockTranslationService) {
      const mockTranslation = window.MockTranslationService.mockTranslate(text);
      return { 
        translatedText: mockTranslation, 
        detectedSourceLanguage: from,
        success: true,
        isMock: true
      };
    }
    
    // Если даже mock-перевод недоступен, возвращаем исходный текст
    return { 
      translatedText: text, 
      success: false,
      error: 'Все сервисы перевода недоступны'
    };
  }
};

// Сохраняем совместимость с старым кодом
window.LibreTranslate = {
  translate: window.TranslationService.translate.bind(window.TranslationService)
};

// При загрузке скрипта проверяем доступность сервисов
window.TranslationService.checkServicesAvailability()
  .then(available => {
    console.log(`Статус сервисов перевода: ${available ? 'доступны' : 'недоступны'}`);
    // Обновляем UI в соответствии с доступностью перевода
    document.dispatchEvent(new CustomEvent('translationServicesChecked', { 
      detail: { available } 
    }));
  });
