
chrome.runtime.onInstalled.addListener(() => {



  fetch('https://velvety-piroshki-542402.netlify.app/.netlify/functions/recognize', { method: 'OPTIONS' }).catch(() => {});


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


const FREE_USAGE_LIMIT = 20;






async function incrementUsageCount() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['usageCount', 'isPro'], (result) => {
      const currentCount = result.usageCount || 0;
      const isPro = result.isPro || false;


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


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.action === "startSelectionFromPopup") {

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content-script.js']
        }).catch(error => {
          console.error('Script execution error:', error);
        });
      }
    });

    sendResponse({ status: "processing" });
    return true;
  }


  if (request.action === "recognizeText") {



    incrementUsageCount().then(usageInfo => {
      if (usageInfo.reachedLimit) {

        sendResponse({
          success: false,
          limitReached: true,
          usageCount: usageInfo.usageCount,
          error: "Free usage limit reached."
        });
        return;
      }


      async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
        for (let i = 0; i < retries; i++) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const res = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);
            if (!res.ok) throw new Error("Not OK");
            return await res.json();
          } catch (e) {
            if (i === retries - 1) throw e;
            await new Promise(r => setTimeout(r, delay));
          }
        }
      }


      fetchWithRetry('https://velvety-piroshki-542402.netlify.app/.netlify/functions/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: request.imageBase64 })
      }).then(data => {


        if (!data.text && data.error) {
          throw new Error(`API error: ${data.error}`);
        }

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
      }).catch(error => {
        console.error('Error recognizing text:', error);
        sendResponse({ success: false, error: error.message });
      });
    });


    return true;
  }





  if (request.action === "getUsageInfo") {
    chrome.storage.local.get(['usageCount'], (result) => {
      const usageCount = result.usageCount || 0;
      sendResponse({
        usageCount: usageCount,
        limit: FREE_USAGE_LIMIT,
        remaining: FREE_USAGE_LIMIT - usageCount,
        limitReached: usageCount >= FREE_USAGE_LIMIT
      });
    });

    return true;
  }
});
