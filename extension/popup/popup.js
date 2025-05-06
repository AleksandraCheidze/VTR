document.addEventListener('DOMContentLoaded', function() {
  // Handler for the "Select Text from Video" button click
  document.getElementById('start').addEventListener('click', () => {
    // Execute the script directly in the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content-script.js']
        }).catch(error => {
          console.error('Script execution error:', error);

          // Create a styled error notification instead of alert
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
              <strong>Error: ${error.message}</strong>
            </div>
          `;
          document.body.appendChild(errorNotification);

          // Don't close popup if there's an error
          return;
        });
      }
    });

    // Close the popup
    window.close();
  });
});
