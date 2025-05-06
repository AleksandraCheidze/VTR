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

    // Добавляем обработчики событий
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
  }

  function handleMouseDown(e) {
    // Начинаем выделение
    isSelecting = true;
    startX = e.clientX + window.scrollX;
    startY = e.clientY + window.scrollY;
    endX = startX;
    endY = startY;
    updateSelectionBox();
  }

  function handleMouseMove(e) {
    if (!isSelecting) return;

    // Обновляем конечные координаты
    endX = e.clientX + window.scrollX;
    endY = e.clientY + window.scrollY;
    updateSelectionBox();
  }

  function handleMouseUp(e) {
    if (!isSelecting) return;

    // Завершаем выделение
    isSelecting = false;
    endX = e.clientX + window.scrollX;
    endY = e.clientY + window.scrollY;
    updateSelectionBox();

    // Удаляем обработчики событий
    document.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('keydown', handleKeyDown);

    // Удаляем инструкции
    const instructions = document.getElementById('selection-instructions');
    if (instructions) {
      document.body.removeChild(instructions);
    }

    // Захватываем выделенную область
    captureSelection();
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

      // Используем API захвата экрана, если доступно
      const imageData = canvas.toDataURL('image/jpeg').split(',')[1];

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

      // Пробуем оба способа отправки запроса: напрямую и через background.js
      try {
        let data;

        try {
          // Сначала пробуем отправить запрос напрямую
          console.log('Отправка запроса напрямую...');

          // Пробуем три разных способа отправки запроса
          let response;

          try {
            // Способ 1: Прямой запрос к функции recognize
            response = await fetch('https://velvety-piroshki-542402.netlify.app/.netlify/functions/recognize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageBase64: imageData })
            });
          } catch (error1) {
            console.error('Ошибка при прямом запросе к функции recognize:', error1);

            try {
              // Способ 2: Запрос через прокси-сервер
              response = await fetch('https://velvety-piroshki-542402.netlify.app/.netlify/functions/cors-proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  url: 'https://velvety-piroshki-542402.netlify.app/.netlify/functions/recognize',
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: { imageBase64: imageData }
                })
              });
            } catch (error2) {
              console.error('Ошибка при запросе через прокси-сервер:', error2);

              // Способ 3: Запрос через API
              response = await fetch('https://velvety-piroshki-542402.netlify.app/api/recognize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: imageData })
              });
            }
          }

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          data = await response.json();
          console.log('Получен ответ от сервера (прямой запрос):', data);
        } catch (directError) {
          console.error('Ошибка при прямом запросе:', directError);

          // Если прямой запрос не удался, пробуем через background.js
          console.log('Отправка запроса через background.js...');
          data = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
              {
                action: "recognizeText",
                imageBase64: imageData
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
