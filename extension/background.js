// Фоновый скрипт для обработки событий расширения
chrome.runtime.onInstalled.addListener(() => {
  console.log('Video Text Copier расширение установлено');
});

// Обработка сообщений от popup.js и content-script.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Обработка запроса на запуск выделения текста
  if (request.action === "startSelectionFromPopup") {
    // Используем chrome.scripting.executeScript вместо отправки сообщения
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content-script.js']
        }).catch(error => {
          console.error('Ошибка выполнения скрипта:', error);
        });
      }
    });
    // Отправляем ответ, чтобы избежать ошибки "The message port closed before a response was received"
    sendResponse({ status: "processing" });
    return true; // Указываем, что ответ будет отправлен асинхронно
  }

  // Обработка запроса на распознавание текста
  if (request.action === "recognizeText") {
    console.log('Получен запрос на распознавание текста');

    // Отправляем запрос на сервер
    fetch('https://velvety-piroshki-542402.netlify.app/.netlify/functions/recognize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: request.imageBase64 })
    })
    .then(async response => {
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, response:`, errorText);
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorJson.error || 'Unknown error'}`);
        } catch (e) {
          throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        }
      }
      return response.json();
    })
    .then(data => {
      console.log('Получен ответ от сервера:', data);
      // Проверяем, что в ответе есть текст
      if (!data.text && data.error) {
        throw new Error(`API error: ${data.error}`);
      }
      // Отправляем результат обратно в content-script.js
      sendResponse({ success: true, data: data });
    })
    .catch(error => {
      console.error('Ошибка при распознавании текста:', error);
      sendResponse({ success: false, error: error.message });
    });

    // Указываем, что ответ будет отправлен асинхронно
    return true;
  }
});
