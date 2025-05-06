// Прокси-сервер для обхода ограничений CORS
exports.handler = async function(event, context) {
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
    const { url, method, headers: requestHeaders, body } = requestBody;

    if (!url) {
      return {
        statusCode: 400,
        headers: headers,
        body: JSON.stringify({ error: 'Missing url parameter' })
      };
    }

    // Отправляем запрос на указанный URL
    const response = await fetch(url, {
      method: method || 'GET',
      headers: requestHeaders || {},
      body: body ? JSON.stringify(body) : undefined
    });

    // Получаем ответ
    const responseData = await response.json();

    // Возвращаем результат
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(responseData)
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
