document.addEventListener('DOMContentLoaded', function() {
  // Обработчик нажатия на кнопку "Выделить текст в видео"
  document.getElementById('start').addEventListener('click', () => {
    // Напрямую выполняем скрипт в активной вкладке
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content-script.js']
        }).catch(error => {
          console.error('Ошибка выполнения скрипта:', error);
          alert('Произошла ошибка: ' + error.message);
        });
      }
    });

    // Закрываем popup
    window.close();
  });
});
