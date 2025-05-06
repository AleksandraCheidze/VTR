// Минимальная версия Tesseract.js для распознавания текста
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Tesseract = factory();
  }
}(this, function() {
  const Tesseract = {
    recognize: async function(image, options = {}) {
      // Загружаем Tesseract.js с CDN
      if (!window.tesseractWorker) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js';
        document.head.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
        
        // Создаем воркер
        window.tesseractWorker = await Tesseract.createWorker({
          logger: options.logger || (() => {})
        });
        
        // Загружаем языковые данные
        await window.tesseractWorker.loadLanguage('eng+rus');
        await window.tesseractWorker.initialize('eng+rus');
      }
      
      // Распознаем текст
      const result = await window.tesseractWorker.recognize(image);
      return result;
    },
    
    createWorker: async function(options = {}) {
      // Проверяем, загружен ли Tesseract.js
      if (!window.Tesseract) {
        throw new Error('Tesseract.js не загружен');
      }
      
      // Создаем воркер
      return window.Tesseract.createWorker(options);
    }
  };
  
  return Tesseract;
}));
