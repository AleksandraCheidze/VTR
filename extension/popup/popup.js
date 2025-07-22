document.addEventListener('DOMContentLoaded', function() {
  // Constants
  const GUMROAD_PRODUCT_ID = 'YOUR_GUMROAD_PRODUCT_ID'; // Замените на ваш ID продукта в Gumroad
  const FREE_USAGE_LIMIT = 20;

  // DOM elements
  const startButton = document.getElementById('start');
  const usageInfoElement = document.getElementById('usage-info');
  const proSectionElement = document.getElementById('pro-section');
  const licenseKeyInput = document.getElementById('license-key');
  const activateLicenseButton = document.getElementById('activate-license');
  const buyProButton = document.getElementById('buy-pro');
  const licenseStatusElement = document.getElementById('license-status');

  // Load usage information
  loadUsageInfo();

  // Handler for the "Select Text from Video" button click
  startButton.addEventListener('click', () => {
    // Check if user has reached the limit
    chrome.storage.local.get(['usageCount', 'isPro'], (result) => {
      const usageCount = result.usageCount || 0;
      const isPro = result.isPro || false;

      if (!isPro && usageCount >= FREE_USAGE_LIMIT) {
        // Show error message if limit reached
        showLimitReachedMessage();
        return;
      }

      // Execute the script directly in the active tab
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

      // Close the popup
      window.close();
    });
  });

  // Handler for the "Activate License" button click
  activateLicenseButton.addEventListener('click', () => {
    const licenseKey = licenseKeyInput.value.trim();

    if (!licenseKey) {
      updateLicenseStatus('Please enter a license key', 'error');
      return;
    }

    // Show loading state
    activateLicenseButton.disabled = true;
    activateLicenseButton.textContent = 'Verifying...';
    updateLicenseStatus('', '');

    // Verify license with background script
    chrome.runtime.sendMessage(
      { action: 'verifyLicense', licenseKey: licenseKey },
      (response) => {
        activateLicenseButton.disabled = false;
        activateLicenseButton.textContent = 'Activate';

        if (response && response.success) {
          updateLicenseStatus('License activated successfully!', 'success');
          loadUsageInfo(); // Reload usage info
        } else {
          updateLicenseStatus(response.error || 'Invalid license key', 'error');
        }
      }
    );
  });

  // Handler for the "Buy Pro Version" button click
  buyProButton.addEventListener('click', () => {
    // Open Gumroad product page
    chrome.tabs.create({ url: `https://gumroad.com/l/${GUMROAD_PRODUCT_ID}` });
  });

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

      // Update UI based on Pro status
      if (isPro) {
        // Pro version UI
        usageInfoElement.innerHTML = `
          <div class="pro-badge">PRO</div>
          <p>You have unlimited text recognition</p>
        `;
        proSectionElement.style.display = 'none';
        startButton.disabled = false;
      } else {
        // Free version UI
        const percentUsed = Math.min(100, (usageCount / limit) * 100);

        usageInfoElement.innerHTML = `
          <p>Free version: ${usageCount} of ${limit} recognitions used</p>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentUsed}%"></div>
          </div>
          <p>${remaining} recognitions remaining</p>
        `;

        // Show Pro section if close to limit or reached limit
        if (usageCount >= limit * 0.7) {
          proSectionElement.style.display = 'block';
        }

        // Disable start button if limit reached
        startButton.disabled = limitReached;

        if (limitReached) {
          startButton.textContent = 'Limit Reached';
          startButton.style.backgroundColor = '#757575';
        }
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
    proSectionElement.style.display = 'block';
  }

  // Function to update license status
  function updateLicenseStatus(message, type) {
    licenseStatusElement.textContent = message;
    licenseStatusElement.className = '';

    if (type === 'error') {
      licenseStatusElement.classList.add('status-error');
    } else if (type === 'success') {
      licenseStatusElement.classList.add('status-success');
    }
  }
});
