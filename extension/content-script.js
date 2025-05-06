(function() {
  let selectionBox = null;
  let startX, startY, endX, endY;
  let isSelecting = false;

  function initSelection() {
    // Создаем элемент для выделения области
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

    // Добавляем инструкции
    const instructions = document.createElement('div');
    instructions.style.position = 'fixed';
    instructions.style.top = '10px';
    instructions.style.left = '50%';
    instructions.style.transform = 'translateX(-50%)';
    instructions.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    instructions.style.color = 'white';
    instructions.style.padding = '10px';
    instructions.style.borderRadius = '5px';
    instructions.style.zIndex = '10001';
    instructions.textContent = 'Нажмите и перетащите для выделения области с текстом. Нажмите ESC для отмены.';
    instructions.id = 'selection-instructions';
    document.body.appendChild(instructions);

    // Добавляем обработчики событий с опцией capture и passive: false
    document.addEventListener('mousedown', handleMouseDown, { capture: true, passive: false });
    document.addEventListener('mousemove', handleMouseMove, { capture: true, passive: false });
    document.addEventListener('mouseup', handleMouseUp, { capture: true, passive: false });
    document.addEventListener('keydown', handleKeyDown);

    // Добавляем обработчик для предотвращения стандартного поведения на видео
    const videoElements = document.querySelectorAll('video');
    videoElements.forEach(video => {
      video.addEventListener('click', function(e) {
        if (isSelecting) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }, { capture: true, passive: false });

      // Сохраняем текущее состояние видео
      if (video.paused) {
        video.dataset.wasPaused = 'true';
      } else {
        video.dataset.wasPaused = 'false';
        // Приостанавливаем видео на время выделения
        video.pause();
      }
    });
  }

  function handleMouseDown(e) {
    // Предотвращаем стандартное поведение браузера
    e.preventDefault();
    e.stopPropagation();

    // Начинаем выделение
    isSelecting = true;
    startX = e.clientX + window.scrollX;
    startY = e.clientY + window.scrollY;
    endX = startX;
    endY = startY;
    updateSelectionBox();

    return false; // Предотвращаем дальнейшую обработку события
  }

  function handleMouseMove(e) {
    if (!isSelecting) return;

    // Предотвращаем стандартное поведение браузера
    e.preventDefault();
    e.stopPropagation();

    // Обновляем конечные координаты
    endX = e.clientX + window.scrollX;
    endY = e.clientY + window.scrollY;
    updateSelectionBox();

    return false; // Предотвращаем дальнейшую обработку события
  }

  function handleMouseUp(e) {
    if (!isSelecting) return;

    // Предотвращаем стандартное поведение браузера
    e.preventDefault();
    e.stopPropagation();

    // Завершаем выделение
    isSelecting = false;
    endX = e.clientX + window.scrollX;
    endY = e.clientY + window.scrollY;
    updateSelectionBox();

    // Удаляем обработчики событий
    document.removeEventListener('mousedown', handleMouseDown, { capture: true, passive: false });
    document.removeEventListener('mousemove', handleMouseMove, { capture: true, passive: false });
    document.removeEventListener('mouseup', handleMouseUp, { capture: true, passive: false });
    document.removeEventListener('keydown', handleKeyDown);

    // Восстанавливаем состояние видео
    const videoElements = document.querySelectorAll('video');
    videoElements.forEach(video => {
      if (video.dataset.wasPaused === 'false') {
        // Если видео было воспроизведено до выделения, возобновляем воспроизведение
        video.play().catch(err => console.error('Ошибка при возобновлении видео:', err));
      }
      // Удаляем временные данные
      delete video.dataset.wasPaused;
    });

    // Удаляем инструкции
    const instructions = document.getElementById('selection-instructions');
    if (instructions) {
      document.body.removeChild(instructions);
    }

    // Захватываем выделенную область
    captureSelection();

    return false; // Предотвращаем дальнейшую обработку события
  }

  function handleKeyDown(e) {
    // Отмена выделения при нажатии ESC
    if (e.key === 'Escape') {
      isSelecting = false;

      // Удаляем элементы и обработчики
      if (selectionBox) {
        document.body.removeChild(selectionBox);
        selectionBox = null;
      }

      const instructions = document.getElementById('selection-instructions');
      if (instructions) {
        document.body.removeChild(instructions);
      }

      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
    }
  }

  function updateSelectionBox() {
    // Вычисляем координаты и размеры прямоугольника выделения
    const left = Math.min(startX, endX);
    const top = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    // Обновляем стили
    selectionBox.style.left = left + 'px';
    selectionBox.style.top = top + 'px';
    selectionBox.style.width = width + 'px';
    selectionBox.style.height = height + 'px';
  }

  async function captureSelection() {
    // Создаем canvas для захвата области
    const canvas = document.createElement('canvas');
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    if (width < 10 || height < 10) {
      alert('Выделенная область слишком мала. Пожалуйста, выделите большую область.');
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
      // Захватываем область с помощью html2canvas
      const left = Math.min(startX, endX);
      const top = Math.min(startY, endY);

      // Захватываем изображение с экрана
      try {
        // Пытаемся получить изображение с видео
        const videoElements = document.querySelectorAll('video');
        let captureSuccess = false;

        // Проверяем, находится ли выделенная область внутри видео
        for (const videoElement of videoElements) {
          const videoRect = videoElement.getBoundingClientRect();

          // Проверяем, пересекается ли выделенная область с видео
          if (
            left < videoRect.right &&
            left + width > videoRect.left &&
            top < videoRect.bottom &&
            top + height > videoRect.top
          ) {
            console.log('Найден элемент video, пересекающийся с выделенной областью');

            // Вычисляем координаты внутри видео
            const videoLeft = Math.max(0, left - videoRect.left);
            const videoTop = Math.max(0, top - videoRect.top);
            const videoRight = Math.min(videoRect.width, videoLeft + width);
            const videoBottom = Math.min(videoRect.height, videoTop + height);
            const videoWidth = videoRight - videoLeft;
            const videoHeight = videoBottom - videoTop;

            // Проверяем, что видео готово для захвата
            if (videoElement.readyState >= 2) {
              // Создаем временный canvas для захвата видео
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = videoElement.videoWidth;
              tempCanvas.height = videoElement.videoHeight;
              const tempCtx = tempCanvas.getContext('2d');

              // Рисуем все видео на временный canvas
              tempCtx.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);

              // Вычисляем масштаб между размером видео и его отображением
              const scaleX = videoElement.videoWidth / videoRect.width;
              const scaleY = videoElement.videoHeight / videoRect.height;

              // Вычисляем координаты в исходном видео
              const srcX = videoLeft * scaleX;
              const srcY = videoTop * scaleY;
              const srcWidth = videoWidth * scaleX;
              const srcHeight = videoHeight * scaleY;

              // Рисуем нужную часть видео на наш canvas
              ctx.drawImage(
                tempCanvas,
                srcX, srcY, srcWidth, srcHeight,
                0, 0, width, height
              );

              console.log('Изображение успешно захвачено с видео');
              captureSuccess = true;
              break;
            }
          }
        }

        if (!captureSuccess) {
          console.log('Не удалось захватить изображение с видео, пробуем другие методы');

          try {
            // Пробуем использовать html2canvas
            const html2canvas = document.createElement('script');
            html2canvas.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
            document.head.appendChild(html2canvas);

            // Ждем загрузки html2canvas
            await new Promise((resolve, reject) => {
              html2canvas.onload = resolve;
              html2canvas.onerror = reject;
              // Таймаут на случай, если скрипт не загрузится
              setTimeout(reject, 5000);
            });

            // Получаем элемент, который содержит выделенную область
            const element = document.elementFromPoint(left + width/2, top + height/2);
            if (element) {
              console.log('Захват изображения с элемента:', element.tagName);

              // Захватываем изображение с помощью html2canvas
              const screenshot = await window.html2canvas(element, {
                x: left - element.getBoundingClientRect().left,
                y: top - element.getBoundingClientRect().top,
                width: width,
                height: height,
                useCORS: true,
                allowTaint: true,
                logging: false
              });

              // Рисуем скриншот на наш canvas
              ctx.drawImage(screenshot, 0, 0, width, height);
              captureSuccess = true;
            }
          } catch (html2canvasError) {
            console.error('Ошибка при использовании html2canvas:', html2canvasError);
          }
        }

        // Если все методы не сработали, используем стандартный метод
        if (!captureSuccess) {
          console.log('Используем стандартный метод захвата');

          // Создаем изображение из выделенной области
          const img = new Image();
          img.crossOrigin = 'anonymous';

          // Создаем Data URL из выделенной области
          const dataURL = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml">
                ${document.documentElement.outerHTML}
              </div>
            </foreignObject>
          </svg>`;

          img.src = dataURL;

          // Ждем загрузки изображения
          await new Promise((resolve) => {
            img.onload = resolve;
            // Таймаут на случай, если изображение не загрузится
            setTimeout(resolve, 1000);
          });

          // Рисуем изображение на canvas
          ctx.drawImage(img, left, top, width, height, 0, 0, width, height);
        }
      } catch (captureError) {
        console.error('Ошибка при захвате изображения:', captureError);
        // Если не удалось захватить изображение, показываем сообщение
        alert('Не удалось захватить изображение. Попробуйте выделить другую область.');

        // Удаляем индикатор загрузки и рамку выделения
        if (selectionBox) {
          document.body.removeChild(selectionBox);
          selectionBox = null;
        }
        return null;
      }

      // Проверяем, что canvas не пустой
      const imageData = ctx.getImageData(0, 0, width, height).data;
      const isEmpty = !imageData.some(channel => channel !== 0);

      if (isEmpty) {
        console.error('Canvas пустой, не удалось захватить изображение');
        alert('Не удалось захватить изображение. Попробуйте выделить другую область.');

        // Удаляем индикатор загрузки и рамку выделения
        if (selectionBox) {
          document.body.removeChild(selectionBox);
          selectionBox = null;
        }
        return null;
      }

      // Уменьшаем размер изображения перед отправкой
      const maxWidth = 800;  // Уменьшаем максимальную ширину
      const maxHeight = 600; // Уменьшаем максимальную высоту
      const quality = 0.8;   // Увеличиваем качество для лучшего распознавания

      console.log(`Оригинальный размер изображения: ${width}x${height}`);

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

        // Используем сжатое изображение
        base64Data = resizeCanvas.toDataURL('image/jpeg', quality).split(',')[1];

        // Вычисляем размер в МБ
        const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
        const sizeInMB = sizeInBytes / (1024 * 1024);

        console.log(`Изображение уменьшено с ${width}x${height} до ${newWidth}x${newHeight}`);
        console.log(`Размер изображения: ${sizeInMB.toFixed(2)} МБ`);
      } else {
        // Используем оригинальное изображение с небольшим сжатием
        base64Data = canvas.toDataURL('image/jpeg', quality).split(',')[1];

        // Вычисляем размер в МБ
        const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
        const sizeInMB = sizeInBytes / (1024 * 1024);

        console.log(`Оригинальное изображение: ${width}x${height}`);
        console.log(`Размер изображения: ${sizeInMB.toFixed(2)} МБ`);
      }

      // Удаляем рамку выделения
      if (selectionBox) {
        document.body.removeChild(selectionBox);
        selectionBox = null;
      }

      // Показываем индикатор загрузки
      const loadingIndicator = document.createElement('div');
      loadingIndicator.style.position = 'fixed';
      loadingIndicator.style.top = '50%';
      loadingIndicator.style.left = '50%';
      loadingIndicator.style.transform = 'translate(-50%, -50%)';
      loadingIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      loadingIndicator.style.color = 'white';
      loadingIndicator.style.padding = '20px';
      loadingIndicator.style.borderRadius = '10px';
      loadingIndicator.style.zIndex = '10001';
      loadingIndicator.textContent = 'Распознавание текста...';
      loadingIndicator.id = 'loading-indicator';
      document.body.appendChild(loadingIndicator);

      // Отправляем изображение на сервер для распознавания
      try {
        let data;

        console.log('Отправка запроса на сервер...');
        try {
          // Пробуем отправить запрос на сервер
          // Добавляем таймаут для запроса
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 секунд таймаут

          try {
            const response = await fetch('https://velvety-piroshki-542402.netlify.app/.netlify/functions/recognize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageBase64: base64Data,
                timestamp: new Date().toISOString() // Добавляем временную метку для предотвращения кэширования
              }),
              signal: controller.signal
            });

            clearTimeout(timeoutId); // Очищаем таймаут, если запрос успешно выполнен

            if (!response.ok) {
              const errorText = await response.text();
              console.error(`HTTP error! status: ${response.status}, response:`, errorText);

              try {
                const errorJson = JSON.parse(errorText);

                // Проверяем, связана ли ошибка с биллингом
                if (errorJson.billingRequired) {
                  alert('Для работы расширения необходимо включить биллинг в Google Cloud Console. Пожалуйста, свяжитесь с разработчиком расширения.');
                  throw new Error('Google Cloud Vision API requires billing to be enabled');
                }

                throw new Error(`HTTP error! status: ${response.status}, message: ${errorJson.error || 'Unknown error'}`);
              } catch (e) {
                throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
              }
            }

            data = await response.json();
            console.log('Получен ответ от сервера:', data);

            // Проверяем, что в ответе есть текст
            if (!data.text && data.error) {
              throw new Error(`API error: ${data.error}`);
            }
          } catch (fetchError) {
            clearTimeout(timeoutId); // Очищаем таймаут в случае ошибки
            console.error('Ошибка при запросе на сервер:', fetchError);
            throw fetchError; // Передаем ошибку дальше
          }
        } catch (serverError) {
          console.error('Ошибка при запросе на сервер:', serverError);

          // Если запрос на сервер не удался, пробуем через background.js
          console.log('Отправка запроса через background.js...');
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
                  reject(new Error(response.error || 'Неизвестная ошибка'));
                } else {
                  reject(new Error('Не получен ответ от background.js'));
                }
              }
            );
          });
          console.log('Получен ответ от сервера (через background.js):', data);
        }
      // Удаляем индикатор загрузки
      const indicator = document.getElementById('loading-indicator');
      if (indicator) {
        document.body.removeChild(indicator);
      }

      if (data.text) {
        // Копируем текст в буфер обмена
        await navigator.clipboard.writeText(data.text);

        // Показываем уведомление
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.top = '10px';
        notification.style.right = '10px';
        notification.style.backgroundColor = 'rgba(0, 128, 0, 0.8)';
        notification.style.color = 'white';
        notification.style.padding = '10px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '10001';
        notification.style.maxWidth = '300px';
        notification.style.wordWrap = 'break-word';
        notification.innerHTML = `<strong>Текст скопирован:</strong><br>${data.text}`;
        document.body.appendChild(notification);

        // Удаляем уведомление через 5 секунд
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 5000);
      } else {
        alert('Текст не распознан. Попробуйте выделить другую область.');
      }
      } catch (error) {
        // Удаляем индикатор загрузки
        const indicator = document.getElementById('loading-indicator');
        if (indicator) {
          document.body.removeChild(indicator);
        }

        console.error('Ошибка при распознавании текста:', error);
        alert('Ошибка при распознавании текста: ' + error.message + '\nПроверьте консоль для получения дополнительной информации.');
      }

      return canvas;
    } catch (error) {
      alert('Ошибка при захвате области: ' + error.message);
      return null;
    }
  }

  // Запускаем выделение сразу при загрузке скрипта
  initSelection();
})();
