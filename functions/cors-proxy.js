
exports.handler = async function(event, context) {

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: headers,
      body: ''
    };
  }
  

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {

    const requestBody = JSON.parse(event.body);
    const { url, method, headers: requestHeaders, body } = requestBody;

    if (!url) {
      return {
        statusCode: 400,
        headers: headers,
        body: JSON.stringify({ error: 'Missing url parameter' })
      };
    }


    const response = await fetch(url, {
      method: method || 'GET',
      headers: requestHeaders || {},
      body: body ? JSON.stringify(body) : undefined
    });


    const responseData = await response.json();


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
