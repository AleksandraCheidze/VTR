// Фоновый скрипт для обработки событий расширения
chrome.runtime.onInstalled.addListener(() => {
  console.log('Video Text Extractor расширение установлено');

  // Инициализируем счетчик использований и статус лицензии при установке
  chrome.storage.local.get(['usageCount', 'licenseKey', 'isPro'], (result) => {
    if (result.usageCount === undefined) {
      chrome.storage.local.set({ usageCount: 0 });
    }
    if (result.isPro === undefined) {
      chrome.storage.local.set({ isPro: false });
    }
    if (result.licenseKey === undefined) {
      chrome.storage.local.set({ licenseKey: '' });
    }
  });
});

// Константы
const FREE_USAGE_LIMIT = 20;
const GUMROAD_PRODUCT_ID = 'YOUR_GUMROAD_PRODUCT_ID'; // Замените на ваш ID продукта в Gumroad

// Функция для проверки лицензии Gumroad
async function verifyLicense(licenseKey) {
  try {
    const response = await fetch(`https://api.gumroad.com/v2/licenses/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: GUMROAD_PRODUCT_ID,
        license_key: licenseKey
      })
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Ошибка при проверке лицензии:', error);
    return false;
  }
}

// Функция для увеличения счетчика использований
async function incrementUsageCount() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['usageCount', 'isPro'], (result) => {
      const currentCount = result.usageCount || 0;
      const isPro = result.isPro || false;

      // Увеличиваем счетчик только если это не Pro-версия
      if (!isPro) {
        chrome.storage.local.set({ usageCount: currentCount + 1 });
      }

      resolve({
        usageCount: isPro ? 'unlimited' : currentCount + 1,
        isPro: isPro,
        reachedLimit: !isPro && (currentCount + 1 > FREE_USAGE_LIMIT)
      });
    });
  });
}

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

    // Проверяем лимит использований перед отправкой запроса
    incrementUsageCount().then(usageInfo => {
      if (usageInfo.reachedLimit) {
        // Если достигнут лимит бесплатных использований
        sendResponse({
          success: false,
          limitReached: true,
          usageCount: usageInfo.usageCount,
          error: "Free usage limit reached. Please upgrade to Pro version."
        });
        return;
      }

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
        // Отправляем результат обратно в content-script.js вместе с информацией об использовании
        sendResponse({
          success: true,
          data: data,
          usageInfo: {
            count: usageInfo.usageCount,
            limit: FREE_USAGE_LIMIT,
            isPro: usageInfo.isPro,
            remaining: usageInfo.isPro ? 'unlimited' : (FREE_USAGE_LIMIT - usageInfo.usageCount)
          }
        });
      })
      .catch(error => {
        console.error('Ошибка при распознавании текста:', error);
        sendResponse({ success: false, error: error.message });
      });
    });

    // Указываем, что ответ будет отправлен асинхронно
    return true;
  }

  // Обработка запроса на проверку лицензии
  if (request.action === "verifyLicense") {
    const licenseKey = request.licenseKey;

    verifyLicense(licenseKey).then(isValid => {
      if (isValid) {
        // Если лицензия действительна, обновляем статус Pro
        chrome.storage.local.set({ isPro: true, licenseKey: licenseKey });
        sendResponse({ success: true, isPro: true });
      } else {
        sendResponse({ success: false, error: "Invalid license key" });
      }
    });

    return true;
  }

  // Обработка запроса на получение информации об использовании
  if (request.action === "getUsageInfo") {
    chrome.storage.local.get(['usageCount', 'isPro', 'licenseKey'], (result) => {
      const usageCount = result.usageCount || 0;
      const isPro = result.isPro || false;
      const licenseKey = result.licenseKey || '';

      sendResponse({
        usageCount: usageCount,
        isPro: isPro,
        licenseKey: licenseKey,
        limit: FREE_USAGE_LIMIT,
        remaining: isPro ? 'unlimited' : (FREE_USAGE_LIMIT - usageCount),
        limitReached: !isPro && (usageCount >= FREE_USAGE_LIMIT)
      });
    });

    return true;
  }
});
