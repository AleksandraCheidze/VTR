(function() {
  let selectionBox = null;
  let startX, startY, endX, endY;
  let isSelecting = false;
  let isCtrlPressed = false;


  function setupGlobalListeners() {

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Control' || e.key === 'Meta') {
        isCtrlPressed = true;
        updateCursor();
      }
    });

    document.addEventListener('keyup', function(e) {
      if (e.key === 'Control' || e.key === 'Meta') {
        isCtrlPressed = false;
        updateCursor();
      }
    });


    window.addEventListener('blur', function() {
      isCtrlPressed = false;
      updateCursor();
    });
  }


  function updateCursor() {
    if (isCtrlPressed) {
      document.body.style.cursor = 'crosshair';
    } else {
      document.body.style.cursor = '';
    }
  }

  function initSelection() {

    if (selectionBox) {
      document.body.removeChild(selectionBox);
    }

    selectionBox = document.createElement('div');
    selectionBox.style.position = 'absolute';
    selectionBox.style.border = '2px dashed red';
    selectionBox.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
    selectionBox.style.pointerEvents = 'none';
    selectionBox.style.zIndex = '10000';
    document.body.appendChild(selectionBox);


    const instructions = document.createElement('div');
    instructions.style.position = 'fixed';
    instructions.style.top = '20px';
    instructions.style.left = '50%';
    instructions.style.transform = 'translateX(-50%)';
    instructions.style.backgroundColor = 'rgba(25, 118, 210, 0.95)';
    instructions.style.color = 'white';
    instructions.style.padding = '15px 20px';
    instructions.style.borderRadius = '8px';
    instructions.style.zIndex = '10001';
    instructions.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    instructions.style.fontFamily = 'Arial, sans-serif';
    instructions.style.fontSize = '16px';
    instructions.style.fontWeight = 'bold';
    instructions.style.maxWidth = '90%';
    instructions.style.textAlign = 'center';
    instructions.style.transition = 'opacity 0.3s ease-in-out';
    instructions.innerHTML = '<span style="font-size: 18px;">📝</span> <b>Hold Ctrl key</b> and select the area with text. Press <b>ESC</b> to cancel.';
    instructions.id = 'selection-instructions';


    const keyAnimation = document.createElement('style');
    keyAnimation.textContent = `
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
      }
      #selection-instructions b {
        animation: pulse 1.5s infinite;
        color: #ffeb3b;
      }
    `;
    document.head.appendChild(keyAnimation);

    document.body.appendChild(instructions);


    document.addEventListener('mousedown', handleMouseDown, { capture: true, passive: false });
    document.addEventListener('mousemove', handleMouseMove, { capture: true, passive: false });
    document.addEventListener('mouseup', handleMouseUp, { capture: true, passive: false });
    document.addEventListener('keydown', handleKeyDown);


    const videoElements = document.querySelectorAll('video');
    videoElements.forEach(video => {
      video.addEventListener('click', function(e) {
        if (isSelecting) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }, { capture: true, passive: false });


      if (video.paused) {
        video.dataset.wasPaused = 'true';
      } else {
        video.dataset.wasPaused = 'false';

        video.pause();
      }
    });
  }

  function handleMouseDown(e) {

    if (!isCtrlPressed) {
      return true;
    }


    e.preventDefault();
    e.stopPropagation();


    isSelecting = true;
    startX = e.clientX + window.scrollX;
    startY = e.clientY + window.scrollY;
    endX = startX;
    endY = startY;
    updateSelectionBox();

    return false;
  }

  function handleMouseMove(e) {
    if (!isSelecting) return;


    e.preventDefault();
    e.stopPropagation();


    endX = e.clientX + window.scrollX;
    endY = e.clientY + window.scrollY;
    updateSelectionBox();

    return false;
  }

  function handleMouseUp(e) {
    if (!isSelecting) return;


    e.preventDefault();
    e.stopPropagation();


    isSelecting = false;
    endX = e.clientX + window.scrollX;
    endY = e.clientY + window.scrollY;
    updateSelectionBox();


    document.removeEventListener('mousedown', handleMouseDown, { capture: true, passive: false });
    document.removeEventListener('mousemove', handleMouseMove, { capture: true, passive: false });
    document.removeEventListener('mouseup', handleMouseUp, { capture: true, passive: false });
    document.removeEventListener('keydown', handleKeyDown);


    const videoElements = document.querySelectorAll('video');
    videoElements.forEach(video => {
      if (video.dataset.wasPaused === 'false') {

        video.play().catch(err => console.error('Error resuming video:', err));
      }

      delete video.dataset.wasPaused;
    });


    const instructions = document.getElementById('selection-instructions');
    if (instructions) {
      document.body.removeChild(instructions);
    }


    captureSelection();

    return false;
  }

  function handleKeyDown(e) {

    if (e.key === 'Control' || e.key === 'Meta') {
      isCtrlPressed = true;
      updateCursor();
    }


    if (e.key === 'Escape') {
      isSelecting = false;
      isCtrlPressed = false;
      updateCursor();


      if (selectionBox) {
        document.body.removeChild(selectionBox);
        selectionBox = null;
      }

      const instructions = document.getElementById('selection-instructions');
      if (instructions) {
        document.body.removeChild(instructions);
      }

      document.removeEventListener('mousedown', handleMouseDown, { capture: true, passive: false });
      document.removeEventListener('mousemove', handleMouseMove, { capture: true, passive: false });
      document.removeEventListener('mouseup', handleMouseUp, { capture: true, passive: false });
      document.removeEventListener('keydown', handleKeyDown);
    }
  }

  function updateSelectionBox() {

    const left = Math.min(startX, endX);
    const top = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);


    selectionBox.style.left = left + 'px';
    selectionBox.style.top = top + 'px';
    selectionBox.style.width = width + 'px';
    selectionBox.style.height = height + 'px';
  }

  async function captureSelection() {

    const canvas = document.createElement('canvas');
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    if (width < 10 || height < 10) {
      alert('Selected area is too small. Please select a larger area.');
      if (selectionBox) {
        document.body.removeChild(selectionBox);
        selectionBox = null;
      }
      return null;
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    try {

      const left = Math.min(startX, endX);
      const top = Math.min(startY, endY);


      try {

        const videoElements = document.querySelectorAll('video');
        let captureSuccess = false;


        for (const videoElement of videoElements) {
          const videoRect = videoElement.getBoundingClientRect();


          if (
            left < videoRect.right &&
            left + width > videoRect.left &&
            top < videoRect.bottom &&
            top + height > videoRect.top
          ) {



            const videoLeft = Math.max(0, left - videoRect.left);
            const videoTop = Math.max(0, top - videoRect.top);
            const videoRight = Math.min(videoRect.width, videoLeft + width);
            const videoBottom = Math.min(videoRect.height, videoTop + height);
            const videoWidth = videoRight - videoLeft;
            const videoHeight = videoBottom - videoTop;


            if (videoElement.readyState >= 2) {

              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = videoElement.videoWidth;
              tempCanvas.height = videoElement.videoHeight;
              const tempCtx = tempCanvas.getContext('2d');


              tempCtx.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);


              const scaleX = videoElement.videoWidth / videoRect.width;
              const scaleY = videoElement.videoHeight / videoRect.height;


              const srcX = videoLeft * scaleX;
              const srcY = videoTop * scaleY;
              const srcWidth = videoWidth * scaleX;
              const srcHeight = videoHeight * scaleY;


              ctx.drawImage(
                tempCanvas,
                srcX, srcY, srcWidth, srcHeight,
                0, 0, width, height
              );


              captureSuccess = true;
              break;
            }
          }
        }

        if (!captureSuccess) {


          try {

            const html2canvas = document.createElement('script');
            html2canvas.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
            document.head.appendChild(html2canvas);


            await new Promise((resolve, reject) => {
              html2canvas.onload = resolve;
              html2canvas.onerror = reject;

              setTimeout(reject, 5000);
            });


            const element = document.elementFromPoint(left + width/2, top + height/2);
            if (element) {



              const screenshot = await window.html2canvas(element, {
                x: left - element.getBoundingClientRect().left,
                y: top - element.getBoundingClientRect().top,
                width: width,
                height: height,
                useCORS: true,
                allowTaint: true,
                logging: false
              });


              ctx.drawImage(screenshot, 0, 0, width, height);
              captureSuccess = true;
            }
          } catch (html2canvasError) {
            console.error('Error using html2canvas:', html2canvasError);
          }
        }


        if (!captureSuccess) {



          const img = new Image();
          img.crossOrigin = 'anonymous';


          const dataURL = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml">
                ${document.documentElement.outerHTML}
              </div>
            </foreignObject>
          </svg>`;

          img.src = dataURL;


          await new Promise((resolve) => {
            img.onload = resolve;

            setTimeout(resolve, 1000);
          });


          ctx.drawImage(img, left, top, width, height, 0, 0, width, height);
        }
      } catch (captureError) {
        console.error('Error capturing image:', captureError);


        const captureErrorNotification = document.createElement('div');
        captureErrorNotification.style.position = 'fixed';
        captureErrorNotification.style.top = '20px';
        captureErrorNotification.style.left = '50%';
        captureErrorNotification.style.transform = 'translateX(-50%)';
        captureErrorNotification.style.backgroundColor = 'rgba(211, 47, 47, 0.95)';
        captureErrorNotification.style.color = 'white';
        captureErrorNotification.style.padding = '15px 20px';
        captureErrorNotification.style.borderRadius = '8px';
        captureErrorNotification.style.zIndex = '10001';
        captureErrorNotification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        captureErrorNotification.style.fontFamily = 'Arial, sans-serif';
        captureErrorNotification.style.fontSize = '16px';
        captureErrorNotification.style.textAlign = 'center';
        captureErrorNotification.style.opacity = '0';
        captureErrorNotification.style.transition = 'opacity 0.3s ease-in-out';
        captureErrorNotification.innerHTML = `
          <div style="display: flex; align-items: center;">
            <span style="font-size: 20px; margin-right: 10px;">⚠️</span>
            <strong>Failed to capture image. Please try selecting a different area.</strong>
          </div>
        `;
        document.body.appendChild(captureErrorNotification);


        setTimeout(() => {
          captureErrorNotification.style.opacity = '1';
        }, 10);


        setTimeout(() => {
          captureErrorNotification.style.opacity = '0';
          setTimeout(() => {
            if (captureErrorNotification.parentNode) {
              document.body.removeChild(captureErrorNotification);
            }
          }, 300);
        }, 4000);


        if (selectionBox) {
          document.body.removeChild(selectionBox);
          selectionBox = null;
        }
        return null;
      }


      const imageData = ctx.getImageData(0, 0, width, height).data;
      const isEmpty = !imageData.some(channel => channel !== 0);

      if (isEmpty) {
        console.error('Canvas is empty, failed to capture image');


        const emptyCanvasNotification = document.createElement('div');
        emptyCanvasNotification.style.position = 'fixed';
        emptyCanvasNotification.style.top = '20px';
        emptyCanvasNotification.style.left = '50%';
        emptyCanvasNotification.style.transform = 'translateX(-50%)';
        emptyCanvasNotification.style.backgroundColor = 'rgba(211, 47, 47, 0.95)';
        emptyCanvasNotification.style.color = 'white';
        emptyCanvasNotification.style.padding = '15px 20px';
        emptyCanvasNotification.style.borderRadius = '8px';
        emptyCanvasNotification.style.zIndex = '10001';
        emptyCanvasNotification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        emptyCanvasNotification.style.fontFamily = 'Arial, sans-serif';
        emptyCanvasNotification.style.fontSize = '16px';
        emptyCanvasNotification.style.textAlign = 'center';
        emptyCanvasNotification.style.opacity = '0';
        emptyCanvasNotification.style.transition = 'opacity 0.3s ease-in-out';
        emptyCanvasNotification.innerHTML = `
          <div style="display: flex; align-items: center;">
            <span style="font-size: 20px; margin-right: 10px;">⚠️</span>
            <strong>Failed to capture image. Please try selecting a different area.</strong>
          </div>
        `;
        document.body.appendChild(emptyCanvasNotification);


        setTimeout(() => {
          emptyCanvasNotification.style.opacity = '1';
        }, 10);


        setTimeout(() => {
          emptyCanvasNotification.style.opacity = '0';
          setTimeout(() => {
            if (emptyCanvasNotification.parentNode) {
              document.body.removeChild(emptyCanvasNotification);
            }
          }, 300);
        }, 4000);

        if (selectionBox) {
          document.body.removeChild(selectionBox);
          selectionBox = null;
        }
        return null;
      }
      
      const maxWidth = 800;  
      const maxHeight = 600; 
      const quality = 0.8;   



      let base64Data;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        const newWidth = Math.floor(width * ratio);
        const newHeight = Math.floor(height * ratio);

        const resizeCanvas = document.createElement('canvas');
        resizeCanvas.width = newWidth;
        resizeCanvas.height = newHeight;

        const resizeCtx = resizeCanvas.getContext('2d');
        resizeCtx.drawImage(canvas, 0, 0, width, height, 0, 0, newWidth, newHeight);

        base64Data = resizeCanvas.toDataURL('image/jpeg', quality).split(',')[1];

        const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
        const sizeInMB = sizeInBytes / (1024 * 1024);


      } else {
 
        base64Data = canvas.toDataURL('image/jpeg', quality).split(',')[1];

        const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
        const sizeInMB = sizeInBytes / (1024 * 1024);


      }

      if (selectionBox) {
        document.body.removeChild(selectionBox);
        selectionBox = null;
      }

      const loadingIndicator = document.createElement('div');
      loadingIndicator.style.position = 'fixed';
      loadingIndicator.style.top = '50%';
      loadingIndicator.style.left = '50%';
      loadingIndicator.style.transform = 'translate(-50%, -50%)';
      loadingIndicator.style.backgroundColor = 'rgba(25, 118, 210, 0.95)';
      loadingIndicator.style.color = 'white';
      loadingIndicator.style.padding = '20px 30px';
      loadingIndicator.style.borderRadius = '10px';
      loadingIndicator.style.zIndex = '10001';
      loadingIndicator.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
      loadingIndicator.style.fontFamily = 'Arial, sans-serif';
      loadingIndicator.style.fontSize = '16px';
      loadingIndicator.style.textAlign = 'center';
      loadingIndicator.style.minWidth = '200px';
      loadingIndicator.id = 'loading-indicator';

      loadingIndicator.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="margin-bottom: 15px;">
            <div class="spinner" style="border: 4px solid rgba(255, 255, 255, 0.3); border-radius: 50%; border-top: 4px solid white; width: 30px; height: 30px; animation: spin 1s linear infinite;"></div>
          </div>
          <div>Recognizing text...</div>
        </div>
      `;

      const spinnerAnimation = document.createElement('style');
      spinnerAnimation.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(spinnerAnimation);

      document.body.appendChild(loadingIndicator);

      setTimeout(() => {
        const indicator = document.getElementById('loading-indicator');
        if (indicator && indicator.parentNode) {

          indicator.style.opacity = '0';
          setTimeout(() => {
            if (indicator.parentNode) {
              document.body.removeChild(indicator);
            }

            const timeoutNotification = document.createElement('div');
            timeoutNotification.style.position = 'fixed';
            timeoutNotification.style.top = '20px';
            timeoutNotification.style.left = '50%';
            timeoutNotification.style.transform = 'translateX(-50%)';
            timeoutNotification.style.backgroundColor = 'rgba(211, 47, 47, 0.95)'; 
            timeoutNotification.style.color = 'white';
            timeoutNotification.style.padding = '15px 20px';
            timeoutNotification.style.borderRadius = '8px';
            timeoutNotification.style.zIndex = '10001';
            timeoutNotification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
            timeoutNotification.style.fontFamily = 'Arial, sans-serif';
            timeoutNotification.style.fontSize = '16px';
            timeoutNotification.style.textAlign = 'center';
            timeoutNotification.style.opacity = '0';
            timeoutNotification.style.transition = 'opacity 0.3s ease-in-out';
            timeoutNotification.innerHTML = `
              <div style="display: flex; align-items: center;">
                <span style="font-size: 20px; margin-right: 10px;">⏱️</span>
                <strong>Recognition is taking too long. Please try again or select a smaller area.</strong>
              </div>
            `;
            document.body.appendChild(timeoutNotification);

            setTimeout(() => {
              timeoutNotification.style.opacity = '1';
            }, 10);

            setTimeout(() => {
              timeoutNotification.style.opacity = '0';
              setTimeout(() => {
                if (timeoutNotification.parentNode) {
                  document.body.removeChild(timeoutNotification);
                }
              }, 300);
            }, 5000);
          }, 300);
        }
      }, 30000);

      try {
        let data;


        try {

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); 

          try {
            const response = await fetch('https://velvety-piroshki-542402.netlify.app/.netlify/functions/recognize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageBase64: base64Data,
                timestamp: new Date().toISOString() 
              }),
              signal: controller.signal
            });

            clearTimeout(timeoutId); 

            if (!response.ok) {
              const errorText = await response.text();
              console.error(`HTTP error! status: ${response.status}, response:`, errorText);

              try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.billingRequired) {
                  alert('Google Cloud Vision API requires billing to be enabled. Please contact the extension developer.');
                  throw new Error('Google Cloud Vision API requires billing to be enabled');
                }

                throw new Error(`HTTP error! status: ${response.status}, message: ${errorJson.error || 'Unknown error'}`);
              } catch (e) {
                throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
              }
            }

            data = await response.json();


            if (!data.text && data.error) {
              throw new Error(`API error: ${data.error}`);
            }
          } catch (fetchError) {
            clearTimeout(timeoutId);
            console.error('Error requesting server:', fetchError);
            throw fetchError;
          }
        } catch (serverError) {
          console.error('Error requesting server:', serverError);
          data = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
              {
                action: "recognizeText",
                imageBase64: base64Data
              },
              (response) => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                } else if (response && response.success) {
                  resolve(response.data);
                } else if (response && !response.success) {
                  if (response.limitReached) {
                    reject(new Error('FREE_LIMIT_REACHED'));
                  } else {
                    reject(new Error(response.error || 'Unknown error'));
                  }
                } else {
                  reject(new Error('No response from background.js'));
                }
              }
            );
          });
        }
      const indicator = document.getElementById('loading-indicator');
      if (indicator) {
        indicator.style.opacity = '0';
        setTimeout(() => {
          if (indicator.parentNode) {
            document.body.removeChild(indicator);
          }
        }, 300);
      }
      if (data.text) {
        await navigator.clipboard.writeText(data.text);
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = 'rgba(46, 125, 50, 0.95)';
        notification.style.color = 'white';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '8px';
        notification.style.zIndex = '10001';
        notification.style.maxWidth = '350px';
        notification.style.wordWrap = 'break-word';
        notification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        notification.style.fontFamily = 'Arial, sans-serif';
        notification.style.fontSize = '14px';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease-in-out';
        const maxDisplayLength = 150;
        const displayText = data.text.length > maxDisplayLength
          ? data.text.substring(0, maxDisplayLength) + '...'
          : data.text;
        notification.innerHTML = `
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 20px; margin-right: 8px;">✅</span>
            <strong style="font-size: 16px;">Text copied to clipboard!</strong>
          </div>
          <div style="background-color: rgba(255, 255, 255, 0.1); padding: 8px; border-radius: 4px; max-height: 100px; overflow-y: auto;">
            ${displayText}
          </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
          notification.style.opacity = '1';
        }, 10);
        setTimeout(() => {
          notification.style.opacity = '0';
          setTimeout(() => {
            if (notification.parentNode) {
              document.body.removeChild(notification);
            }
          }, 300);
        }, 5000);
      } else {
        const errorNotification = document.createElement('div');
        errorNotification.style.position = 'fixed';
        errorNotification.style.top = '20px';
        errorNotification.style.left = '50%';
        errorNotification.style.transform = 'translateX(-50%)';
        errorNotification.style.backgroundColor = 'rgba(211, 47, 47, 0.95)';
        errorNotification.style.color = 'white';
        errorNotification.style.padding = '15px 20px';
        errorNotification.style.borderRadius = '8px';
        errorNotification.style.zIndex = '10001';
        errorNotification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        errorNotification.style.fontFamily = 'Arial, sans-serif';
        errorNotification.style.fontSize = '16px';
        errorNotification.style.textAlign = 'center';
        errorNotification.style.opacity = '0';
        errorNotification.style.transition = 'opacity 0.3s ease-in-out';
        errorNotification.innerHTML = `
          <div style="display: flex; align-items: center;">
            <span style="font-size: 20px; margin-right: 10px;">⚠️</span>
            <strong>No text detected. Please try selecting a different area.</strong>
          </div>
        `;
        document.body.appendChild(errorNotification);
        setTimeout(() => {
          errorNotification.style.opacity = '1';
        }, 10);
        setTimeout(() => {
          errorNotification.style.opacity = '0';
          setTimeout(() => {
            if (errorNotification.parentNode) {
              document.body.removeChild(errorNotification);
            }
          }, 300);
        }, 4000);
      }
      } catch (error) {
      
        const indicator = document.getElementById('loading-indicator');
        if (indicator) {
          document.body.removeChild(indicator);
        }

        console.error('Error recognizing text:', error);

        const errorNotification = document.createElement('div');
        errorNotification.style.position = 'fixed';
        errorNotification.style.top = '20px';
        errorNotification.style.left = '50%';
        errorNotification.style.transform = 'translateX(-50%)';
        errorNotification.style.backgroundColor = 'rgba(211, 47, 47, 0.95)'; // Красный цвет
        errorNotification.style.color = 'white';
        errorNotification.style.padding = '15px 20px';
        errorNotification.style.borderRadius = '8px';
        errorNotification.style.zIndex = '10001';
        errorNotification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        errorNotification.style.fontFamily = 'Arial, sans-serif';
        errorNotification.style.fontSize = '16px';
        errorNotification.style.textAlign = 'center';
        errorNotification.style.maxWidth = '80%';
        errorNotification.style.opacity = '0';
        errorNotification.style.transition = 'opacity 0.3s ease-in-out';

        let userFriendlyMessage = 'Error recognizing text. Please try again.';
        let showUpgradeButton = false;

        if (error.message === 'FREE_LIMIT_REACHED') {
          userFriendlyMessage = 'You have reached the free usage limit (20 recognitions). Please upgrade to Pro version to continue using the extension.';
          showUpgradeButton = true;
        } else if (error.message.includes('billing')) {
          userFriendlyMessage = 'API billing error. Please contact the extension developer.';
        } else if (error.message.includes('timeout') || error.message.includes('network')) {
          userFriendlyMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('permission')) {
          userFriendlyMessage = 'Permission error. Please contact the extension developer.';
        }

        let notificationContent = `
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 20px; margin-right: 10px;">❌</span>
            <strong>Error</strong>
          </div>
          <div>${userFriendlyMessage}</div>
        `;

        if (showUpgradeButton) {
          notificationContent += `
            <div style="margin-top: 15px;">
              <button id="upgrade-to-pro-btn" style="background-color: #FFD700; color: #000; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer; transition: background-color 0.3s;">
                Upgrade to Pro
              </button>
            </div>
          `;
        } else {
          notificationContent += `
            <div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">See console for details (F12)</div>
          `;
        }

        errorNotification.innerHTML = notificationContent;
        document.body.appendChild(errorNotification);

        setTimeout(() => {
          errorNotification.style.opacity = '1';

          if (showUpgradeButton) {
            const upgradeButton = document.getElementById('upgrade-to-pro-btn');
            if (upgradeButton) {
              upgradeButton.addEventListener('click', () => {
        
                window.open('https://gumroad.com/l/YOUR_PRODUCT_ID', '_blank');
              });

              upgradeButton.addEventListener('mouseover', () => {
                upgradeButton.style.backgroundColor = '#FFE44D';
              });

              upgradeButton.addEventListener('mouseout', () => {
                upgradeButton.style.backgroundColor = '#FFD700';
              });
            }
          }
        }, 10);

    
        setTimeout(() => {
          errorNotification.style.opacity = '0';
          setTimeout(() => {
            if (errorNotification.parentNode) {
              document.body.removeChild(errorNotification);
            }
          }, 300);
        }, 6000);
      }

      return canvas;
    } catch (error) {
      console.error('Error capturing area:', error);

      
      const captureErrorNotification = document.createElement('div');
      captureErrorNotification.style.position = 'fixed';
      captureErrorNotification.style.top = '20px';
      captureErrorNotification.style.left = '50%';
      captureErrorNotification.style.transform = 'translateX(-50%)';
      captureErrorNotification.style.backgroundColor = 'rgba(211, 47, 47, 0.95)'; 
      captureErrorNotification.style.color = 'white';
      captureErrorNotification.style.padding = '15px 20px';
      captureErrorNotification.style.borderRadius = '8px';
      captureErrorNotification.style.zIndex = '10001';
      captureErrorNotification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
      captureErrorNotification.style.fontFamily = 'Arial, sans-serif';
      captureErrorNotification.style.fontSize = '16px';
      captureErrorNotification.style.textAlign = 'center';
      captureErrorNotification.style.opacity = '0';
      captureErrorNotification.style.transition = 'opacity 0.3s ease-in-out';
      captureErrorNotification.innerHTML = `
        <div style="display: flex; align-items: center;">
          <span style="font-size: 20px; margin-right: 10px;">❌</span>
          <strong>Error capturing area. Please try again.</strong>
        </div>
      `;
      document.body.appendChild(captureErrorNotification);

      setTimeout(() => {
        captureErrorNotification.style.opacity = '1';
      }, 10);

      setTimeout(() => {
        captureErrorNotification.style.opacity = '0';
        setTimeout(() => {
          if (captureErrorNotification.parentNode) {
            document.body.removeChild(captureErrorNotification);
          }
        }, 300);
      }, 4000);

      return null;
    }
  }

  setupGlobalListeners();

  initSelection();
})();
