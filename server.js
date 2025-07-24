const express = require('express');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const path = require('path');
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

const client = new ImageAnnotatorClient({
  keyFilename: 'service-account-key.json'
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/recognize', async (req, res) => {
  try {
    const [result] = await client.textDetection({
      image: { content: req.body.imageBase64 },
    });
    res.json({ text: result.fullTextAnnotation?.text || '' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {});
