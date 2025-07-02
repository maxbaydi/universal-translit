/**
 * Universal Translit Tool - Yandex & Google Rules
 * Advanced JavaScript functionality with modern features
 */

// Функция для транслитерации текста по правилам Яндекса
function yandexTranslit(text) {
    const converter = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
        'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
        'ч': 'ch', 'ш': 'sh', 'щ': 'shh', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
        'я': 'ya'
    };

    return text.toLowerCase().split('').map(char => {
        return converter[char] || char;
    }).join('').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// Функция для транслитерации текста по правилам Google
function googleTranslit(text) {
    const converter = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
        'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
        'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
        'я': 'ya'
    };

    return text.toLowerCase().split('').map(char => {
        return converter[char] || char;
    }).join('').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// Функция обработки перевода
async function handleTranslation(text) {
    if (!text) return { translatedText: '', success: false };
    
    try {
        // Используем TranslationService для перевода с поддержкой fallback
        const response = await window.TranslationService.translate({
            text: text,
            from: 'ru',
            to: 'en'
        });
        
        if (response && response.translatedText) {
            return { 
                translatedText: response.translatedText, 
                success: true 
            };
        } else {
            console.error('Ошибка перевода: неверный формат ответа');
            return { translatedText: '', success: false };
        }
    } catch (error) {
        console.error('Ошибка перевода:', error);
        return { translatedText: '', success: false };
    }
}

// Функция для обновления счетчика символов
function updateCharCount(text) {
    const charCount = document.getElementById('charCount');
    if (charCount) {
        charCount.textContent = `${text.length} символов`;
    }
}

// Обработчик кнопки транслитерации
async function performTransliteration() {
    const mainInput = document.getElementById('mainInputText');
    const yandexOutput = document.getElementById('yandexOutput');
    const googleOutput = document.getElementById('googleOutput');
    const text = mainInput.value.trim();
    
    if (!text) {
        return;
    }

    // Временно отключаем автотранслит, чтобы избежать рекурсии
    const wasAutoTranslitEnabled = document.getElementById('googleAutoTranslit').checked;
    if (wasAutoTranslitEnabled) {
        document.getElementById('googleAutoTranslit').checked = false;
    }

    // Обновляем счетчик символов
    updateCharCount(text);

    // Для Яндекс-транслита всегда используем оригинальный текст
    yandexOutput.value = yandexTranslit(text);

    // Проверяем, нужен ли перевод перед транслитерацией для Google
    const needTranslation = document.getElementById('translateToEnglish').checked;
    const translationContainer = document.getElementById('translationResultContainer');
    const translationResult = document.getElementById('translationResult');

    try {
        if (needTranslation) {
            // Показываем загрузку
            translationContainer.style.display = 'block';
            translationResult.textContent = 'Переводим текст...';

            // Выполняем перевод
            const { translatedText, success, isMock } = await handleTranslation(text);

            if (success) {
                // Обновляем результат перевода
                translationResult.textContent = translatedText;
                
                // Если перевод был выполнен через mock-сервис, показываем индикатор
                if (isMock) {
                    // Добавляем индикатор локального перевода, если его еще нет
                    if (!document.getElementById('localTranslationIndicator')) {
                        const indicator = document.createElement('div');
                        indicator.id = 'localTranslationIndicator';
                        indicator.className = 'mt-1 small text-warning';
                        indicator.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-1"></i>Используется локальный перевод (ограниченный словарь)';
                        translationResult.parentNode.appendChild(indicator);
                    }
                } else {
                    // Удаляем индикатор, если он был
                    const indicator = document.getElementById('localTranslationIndicator');
                    if (indicator) indicator.remove();
                }
                
                // Выполняем транслитерацию переведенного текста только для Google
                googleOutput.value = googleTranslit(translatedText);
            } else {
                // В случае ошибки перевода выполняем транслитерацию исходного текста
                translationResult.textContent = 'Ошибка перевода. Используется оригинальный текст.';
                googleOutput.value = googleTranslit(text);
            }
        } else {
            // Скрываем контейнер перевода
            translationContainer.style.display = 'none';
            
            // Если перевод не нужен, выполняем транслитерацию исходного текста для Google
            googleOutput.value = googleTranslit(text);
        }
    } catch (error) {
        console.error('Ошибка при транслитерации:', error);
        // В случае ошибки выполняем простую транслитерацию для Google
        translationContainer.style.display = 'none';
        googleOutput.value = googleTranslit(text);
    } finally {
        // Восстанавливаем состояние автотранслита
        if (wasAutoTranslitEnabled) {
            setTimeout(() => {
                document.getElementById('googleAutoTranslit').checked = true;
            }, 100);
        }
    }
}

// Функция для активации авто-транслита
function activateAutoTranslit() {
    const mainInput = document.getElementById('mainInputText');
    
    // Удаляем существующий обработчик, чтобы избежать дублирования
    mainInput.removeEventListener('input', handleAutoTranslit);
    
    // Добавляем обработчик
    mainInput.addEventListener('input', handleAutoTranslit);
}

// Обработчик для автоматической транслитерации
function handleAutoTranslit() {
    // Если авто-транслит включен и поле перевода скрыто (нет активного перевода)
    if (document.getElementById('googleAutoTranslit').checked && 
        document.getElementById('translationResultContainer').style.display === 'none') {
        
        // Отключаем перевод на английский при автотранслите
        document.getElementById('translateToEnglish').checked = false;
        
        // Простая транслитерация без перевода
        const text = document.getElementById('mainInputText').value.trim();
        if (text) {
            // Для Яндекс всегда используем оригинальный русский текст
            document.getElementById('yandexOutput').value = yandexTranslit(text);
            // Для Google тоже используем оригинальный текст в режиме автотранслита
            document.getElementById('googleOutput').value = googleTranslit(text);
            updateCharCount(text);
        }
    }
}

// Функция для копирования текста
function copyToClipboard(text, buttonElement) {
    navigator.clipboard.writeText(text).then(() => {
        const originalContent = buttonElement.innerHTML;
        buttonElement.innerHTML = '<i class="bi bi-check-lg"></i> Скопировано';
        
        setTimeout(() => {
            buttonElement.innerHTML = originalContent;
        }, 1500);
    }).catch(err => {
        console.error('Ошибка при копировании: ', err);
    });
}

// Функция для очистки всех полей
function clearAllFields() {
    document.getElementById('mainInputText').value = '';
    document.getElementById('yandexOutput').value = '';
    document.getElementById('googleOutput').value = '';
    document.getElementById('translationResultContainer').style.display = 'none';
    document.getElementById('translationResult').textContent = '';
    updateCharCount('');
}

document.addEventListener('DOMContentLoaded', function() {
    // Переключение темы
    const themeIcon = document.getElementById('themeToggle');
    
    // Функция для применения темы
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-bs-theme', 'dark');
            themeIcon.querySelector('i').classList.replace('bi-sun-fill', 'bi-moon-fill');
        } else {
            document.documentElement.setAttribute('data-bs-theme', 'light');
            themeIcon.querySelector('i').classList.replace('bi-moon-fill', 'bi-sun-fill');
        }
    }
    
    // Проверяем сохраненную тему или системные настройки
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        // Применяем сохраненную тему
        applyTheme(savedTheme);
    } else if (prefersDark) {
        // Применяем тёмную тему, если она предпочтительна в системе
        applyTheme('dark');
    }
    
    if (themeIcon) {
        themeIcon.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-bs-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Применяем новую тему
            applyTheme(newTheme);
            
            // Сохраняем выбор пользователя
            localStorage.setItem('theme', newTheme);
        });
    }
    
    // Инициализация тултипов Bootstrap
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(tooltip => {
        new bootstrap.Tooltip(tooltip);
    });

    // Обработчики событий для кнопок
    const translitButton = document.getElementById('translitButton');
    if (translitButton) {
        translitButton.addEventListener('click', performTransliteration);
    }
    
    const clearAllButton = document.getElementById('clearAllButton');
    if (clearAllButton) {
        clearAllButton.addEventListener('click', clearAllFields);
    }

    // Копирование результатов
    const copyYandexButton = document.getElementById('copyYandexButton');
    if (copyYandexButton) {
        copyYandexButton.addEventListener('click', function() {
            const text = document.getElementById('yandexOutput').value;
            copyToClipboard(text, copyYandexButton);
        });
    }

    const copyGoogleButton = document.getElementById('copyGoogleButton');
    if (copyGoogleButton) {
        copyGoogleButton.addEventListener('click', function() {
            const text = document.getElementById('googleOutput').value;
            copyToClipboard(text, copyGoogleButton);
        });
    }

    const copyTranslationButton = document.getElementById('copyTranslationButton');
    if (copyTranslationButton) {
        copyTranslationButton.addEventListener('click', function() {
            const text = document.getElementById('translationResult').textContent;
            copyToClipboard(text, copyTranslationButton);
        });
    }

    // Обработчик для чекбокса перевода
    const translateCheckbox = document.getElementById('translateToEnglish');
    if (translateCheckbox) {
        translateCheckbox.addEventListener('change', function() {
            if (this.checked) {
                // При включении перевода, отключаем автотранслит
                document.getElementById('googleAutoTranslit').checked = false;
            }
        });
    }

    // Обработчик для чекбокса автотранслита
    const autoTranslitCheckbox = document.getElementById('googleAutoTranslit');
    if (autoTranslitCheckbox) {
        autoTranslitCheckbox.addEventListener('change', function() {
            if (this.checked) {
                // При включении автотранслита, отключаем перевод
                document.getElementById('translateToEnglish').checked = false;
                document.getElementById('translationResultContainer').style.display = 'none';
            }
        });
    }

    // Примеры текстов
    document.querySelectorAll('.quick-text').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const text = this.getAttribute('data-text');
            document.getElementById('mainInputText').value = text;
            performTransliteration();
        });
    });

    // Обновляем счетчик символов при вводе
    const mainInput = document.getElementById('mainInputText');
    if (mainInput) {
        mainInput.addEventListener('input', function() {
            updateCharCount(this.value);
        });
    }

    // Инициализируем авто-транслит
    activateAutoTranslit();
    
    // Обработчик события проверки доступности сервисов перевода
    document.addEventListener('translationServicesChecked', function(e) {
        const translateCheckbox = document.getElementById('translateToEnglish');
        
        if (!e.detail.available) {
            console.warn("Сервисы перевода недоступны");
            
            // Если сервисы недоступны, отключаем опцию перевода
            if (translateCheckbox) {
                translateCheckbox.disabled = true;
                translateCheckbox.checked = false;
                translateCheckbox.parentElement.title = "Сервис перевода временно недоступен";
                
                // Показываем уведомление пользователю
                const translationNotice = document.getElementById('translationNotice');
                if (translationNotice) {
                    translationNotice.style.display = 'block';
                }
            }
        } else {
            console.log("Сервисы перевода доступны");
            
            // Если сервисы доступны, включаем опцию перевода
            if (translateCheckbox) {
                translateCheckbox.disabled = false;
                translateCheckbox.parentElement.title = "Перевести текст на английский перед транслитерацией";
                
                // Скрываем уведомление
                const translationNotice = document.getElementById('translationNotice');
                if (translationNotice) {
                    translationNotice.style.display = 'none';
                }
            }
        }
    });
    
    // Если TranslationService еще не загружен, временно отключаем опцию перевода
    if (!window.TranslationService) {
        console.warn("TranslationService is not available");
        
        const translateCheckbox = document.getElementById('translateToEnglish');
        if (translateCheckbox) {
            translateCheckbox.disabled = true;
            translateCheckbox.checked = false;
            translateCheckbox.parentElement.title = "Сервис перевода загружается...";
        }
    }

    // Scroll to Top Button logic
    (function() {
      const btn = document.getElementById('scrollToTopBtn');
      if (!btn) return;
      window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
          btn.classList.add('show');
        } else {
          btn.classList.remove('show');
        }
      });
      btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    })();
});
