const { ImageAnnotatorClient } = require('@google-cloud/vision');

// Создаем клиент Google Cloud Vision API
const client = new ImageAnnotatorClient({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS)
});

exports.handler = async function(event, context) {
  console.log('Received request:', {
    httpMethod: event.httpMethod,
    path: event.path,
    headers: event.headers,
    bodyLength: event.body ? event.body.length : 0
  });
  // Добавляем заголовки CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Обрабатываем preflight запросы
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: headers,
      body: ''
    };
  }

  // Проверяем метод запроса
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Парсим тело запроса
    const requestBody = JSON.parse(event.body);
    const imageBase64 = requestBody.imageBase64;

    if (!imageBase64) {
      return {
        statusCode: 400,
        headers: headers,
        body: JSON.stringify({ error: 'Missing imageBase64 parameter' })
      };
    }

    // Проверяем, что imageBase64 - это действительно base64-строка
    if (!imageBase64 || typeof imageBase64 !== 'string' || imageBase64.trim() === '') {
      console.error('Invalid imageBase64:', typeof imageBase64);
      return {
        statusCode: 400,
        headers: headers,
        body: JSON.stringify({ error: 'Invalid imageBase64 parameter' })
      };
    }

    // Проверяем, что строка base64 имеет правильный формат
    try {
      const buffer = Buffer.from(imageBase64, 'base64');
      if (buffer.length === 0) {
        console.error('Empty buffer after base64 decoding');
        return {
          statusCode: 400,
          headers: headers,
          body: JSON.stringify({ error: 'Invalid base64 string (decodes to empty buffer)' })
        };
      }
      console.log(`Successfully decoded base64 string to buffer of size: ${buffer.length} bytes`);
    } catch (decodeError) {
      console.error('Error decoding base64 string:', decodeError);
      return {
        statusCode: 400,
        headers: headers,
        body: JSON.stringify({ error: 'Invalid base64 string: ' + decodeError.message })
      };
    }

    // Проверяем размер изображения
    const sizeInBytes = Math.ceil((imageBase64.length * 3) / 4);
    const sizeInMB = sizeInBytes / (1024 * 1024);
    console.log(`Image size: ${sizeInMB.toFixed(2)} MB`);

    if (sizeInMB > 10) {
      console.error('Image too large:', sizeInMB.toFixed(2), 'MB');
      return {
        statusCode: 400,
        headers: headers,
        body: JSON.stringify({ error: 'Image too large. Maximum size is 10 MB.' })
      };
    }

    let result;
    try {
      // Отправляем запрос в Google Cloud Vision API
      console.log('Sending request to Google Cloud Vision API...');
      console.log('Google Cloud credentials project ID:', JSON.parse(process.env.GOOGLE_CREDENTIALS).project_id);

      // Проверяем, что клиент инициализирован правильно
      if (!client) {
        console.error('Google Cloud Vision client is not initialized');
        return {
          statusCode: 500,
          headers: headers,
          body: JSON.stringify({
            error: 'Google Cloud Vision client is not initialized',
            details: 'Please check your Google Cloud credentials'
          })
        };
      }

      // Отправляем запрос
      const response = await client.textDetection({
        image: { content: imageBase64 },
      });

      // Проверяем ответ
      if (!response || !response[0]) {
        console.error('Empty response from Google Cloud Vision API');
        return {
          statusCode: 500,
          headers: headers,
          body: JSON.stringify({
            error: 'Empty response from Google Cloud Vision API',
            details: 'The API returned an empty response'
          })
        };
      }

      result = response[0];
      console.log('Received response from Google Cloud Vision API');
      console.log('Response type:', typeof result);
      console.log('Response has fullTextAnnotation:', !!result.fullTextAnnotation);
    } catch (visionError) {
      console.error('Error from Google Cloud Vision API:', visionError);

      // Проверяем, связана ли ошибка с биллингом
      if (visionError.message && visionError.message.includes('PERMISSION_DENIED') && visionError.message.includes('billing')) {
        console.error('Billing error detected. Please enable billing in Google Cloud Console.');
        return {
          statusCode: 402, // Payment Required
          headers: headers,
          body: JSON.stringify({
            error: 'Google Cloud Vision API requires billing to be enabled. Please contact the extension developer.',
            details: 'This API requires billing to be enabled in Google Cloud Console.',
            billingRequired: true
          })
        };
      }

      return {
        statusCode: 500,
        headers: headers,
        body: JSON.stringify({
          error: 'Error from Google Cloud Vision API: ' + visionError.message,
          details: visionError.toString()
        })
      };
    }

    // Проверяем результат
    if (!result || !result.fullTextAnnotation) {
      console.log('No text detected in the image');
      console.log('Result object keys:', result ? Object.keys(result) : 'null');

      // Проверяем, есть ли текстовые аннотации
      if (result && result.textAnnotations && result.textAnnotations.length > 0) {
        console.log('Found text annotations:', result.textAnnotations.length);
        const text = result.textAnnotations[0].description;
        console.log('Text from textAnnotations:', text);

        return {
          statusCode: 200,
          headers: headers,
          body: JSON.stringify({
            text: text,
            source: 'textAnnotations'
          })
        };
      }

      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({
          text: '',
          message: 'No text detected in the image'
        })
      };
    }

    // Получаем текст из fullTextAnnotation
    const text = result.fullTextAnnotation?.text || '';
    console.log('Text detected:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));

    // Возвращаем результат
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        text: text,
        source: 'fullTextAnnotation'
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
