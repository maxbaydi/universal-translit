/**
 * js-google-translate-free wrapper for the Universal Translit Tool
 * Uses the public Google Translate API through CDN
 */

// Import from CDN using dynamic import and make it available globally
(async function() {
    try {
        // Using specific version for stability
        const translatorModule = await import('https://cdn.jsdelivr.net/npm/@kreisler/js-google-translate-free@1.0.0/+esm');
        
        // Add debug wrapper around the translate function to catch and log errors
        const originalTranslate = translatorModule.default.translate;
        translatorModule.default.translate = async function(params) {
            console.log('Translation request:', params);
            try {
                const result = await originalTranslate.call(this, params);
                console.log('Translation response:', result);
                return result;
            } catch (error) {
                console.error('Error in translation:', error);
                // Return a safe fallback object
                return { text: params.text || '', from: params.from || 'auto', to: params.to || 'en' };
            }
        };
        
        window.JsGoogleTranslateFree = translatorModule.default;
        console.log("js-google-translate-free library loaded successfully with debug wrapper");
    } catch (error) {
        console.error("Failed to load js-google-translate-free:", error);
        
        // Fallback implementation in case the CDN fails
        window.JsGoogleTranslateFree = {
            translate: async function({ text, from = 'auto', to = 'en' }) {
                if (!text) return { text: '', from: from, to: to };
                
                // Simple fallback that returns the original text
                console.warn("Using fallback translation (CDN failed)");
                return { text: text, from: from, to: to };
            }
        };
    }
})();
