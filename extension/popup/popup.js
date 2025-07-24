document.addEventListener('DOMContentLoaded', function() {

  const FREE_USAGE_LIMIT = 20;


  const startButton = document.getElementById('start');
  const usageInfoElement = document.getElementById('usage-info');
  // ...existing code...


  loadUsageInfo();


  startButton.addEventListener('click', () => {

    chrome.storage.local.get(['usageCount', 'isPro'], (result) => {
      const usageCount = result.usageCount || 0;
      const isPro = result.isPro || false;

      if (!isPro && usageCount >= FREE_USAGE_LIMIT) {

        showLimitReachedMessage();
        return;
      }


      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['content-script.js']
          }).catch(error => {
            console.error('Script execution error:', error);
            showErrorNotification(error.message);
            return;
          });
        }
      });


      window.close();
    });
  });


  // ...existing code...

  // Function to load usage information
  function loadUsageInfo() {
    // Show loading state
    usageInfoElement.innerHTML = `
      <div class="loading-spinner"></div>
      <p>Loading usage information...</p>
    `;

    // Get usage info from background script
    chrome.runtime.sendMessage({ action: 'getUsageInfo' }, (response) => {
      if (!response) {
        usageInfoElement.innerHTML = `<p>Error loading usage information</p>`;
        return;
      }

      const { usageCount, isPro, limit, remaining, limitReached } = response;

      // Only Free version UI
      const percentUsed = Math.min(100, (usageCount / limit) * 100);
      usageInfoElement.innerHTML = `
        <p>Free version: ${usageCount} of ${limit} recognitions used</p>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percentUsed}%"></div>
        </div>
        <p>${remaining} recognitions remaining</p>
      `;
      startButton.disabled = limitReached;
      if (limitReached) {
        startButton.textContent = 'Limit Reached';
        startButton.style.backgroundColor = '#757575';
      }
    });
  }

  // Function to show error notification
  function showErrorNotification(message) {
    const errorNotification = document.createElement('div');
    errorNotification.style.position = 'fixed';
    errorNotification.style.top = '20px';
    errorNotification.style.left = '50%';
    errorNotification.style.transform = 'translateX(-50%)';
    errorNotification.style.backgroundColor = 'rgba(211, 47, 47, 0.95)'; // Red color
    errorNotification.style.color = 'white';
    errorNotification.style.padding = '15px 20px';
    errorNotification.style.borderRadius = '8px';
    errorNotification.style.zIndex = '10001';
    errorNotification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    errorNotification.style.fontFamily = 'Arial, sans-serif';
    errorNotification.style.fontSize = '16px';
    errorNotification.style.textAlign = 'center';
    errorNotification.innerHTML = `
      <div style="display: flex; align-items: center;">
        <span style="font-size: 20px; margin-right: 10px;">❌</span>
        <strong>Error: ${message}</strong>
      </div>
    `;
    document.body.appendChild(errorNotification);

    // Remove notification after 5 seconds
    setTimeout(() => {
      if (errorNotification.parentNode) {
        document.body.removeChild(errorNotification);
      }
    }, 5000);
  }

  // Function to show limit reached message
  function showLimitReachedMessage() {
    showErrorNotification('Free usage limit reached. Please upgrade to Pro version.');
    // ...existing code...
  }

  // Function to update license status
  // ...existing code...
});
