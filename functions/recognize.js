const { ImageAnnotatorClient } = require('@google-cloud/vision');

// Создаем клиент Google Cloud Vision API
const client = new ImageAnnotatorClient({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS)
});

exports.handler = async function(event, context) {
  // Проверяем метод запроса
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
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
        body: JSON.stringify({ error: 'Missing imageBase64 parameter' })
      };
    }

    // Отправляем запрос в Google Cloud Vision API
    const [result] = await client.textDetection({
      image: { content: imageBase64 },
    });

    // Возвращаем результат
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        text: result.fullTextAnnotation?.text || '' 
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
