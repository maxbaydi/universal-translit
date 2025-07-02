// LibreTranslate simple wrapper for browser
// Usage: await LibreTranslate.translate({text, from, to})

window.LibreTranslate = {
  /**
   * Translate text using LibreTranslate public API
   * @param {Object} params
   * @param {string} params.text - Text to translate
   * @param {string} [params.from] - Source language (default 'auto')
   * @param {string} params.to - Target language (e.g. 'en')
   * @returns {Promise<{translatedText: string, detectedSourceLanguage?: string}>}
   */
  async translate({ text, from = 'auto', to = 'en' }) {
    if (!text) return { translatedText: '' };
    try {
      const response = await fetch('https://translate.argosopentech.com/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: from,
          target: to,
          format: 'text'
        })
      });
      const data = await response.json();
      if (data && data.translatedText) {
        return {
          translatedText: data.translatedText,
          detectedSourceLanguage: data.detectedSourceLanguage || from
        };
      } else {
        throw new Error('No translatedText in response');
      }
    } catch (error) {
      console.error('LibreTranslate error:', error);
      return { translatedText: text };
    }
  }
};
