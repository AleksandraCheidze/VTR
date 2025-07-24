# Video Text Extractor

Extract and copy text from any video or web page area in one click. Hold Ctrl, select the area, and get the recognized text instantly in your clipboard.

## Features
- Select any area on a video or web page to extract text
- Works with video frames, images, and static content
- Fast OCR powered by Google Cloud Vision API
- Modern, clean UI (Chrome Extension popup)
- No registration or payment required

## Tech Stack
- **Frontend/Extension:**
  - JavaScript (ES6+), Chrome Extension Manifest V3
  - HTML, CSS (popup UI)
  - html2canvas for DOM screenshots
- **Backend/API:**
  - Node.js, Express.js
  - Google Cloud Vision API (OCR)
  - Serverless functions (Netlify Functions)
- **Other:**
  - Docker, Netlify, Render, Heroku ready

## Installation & Usage

### 1. Chrome Extension (Local Install)
1. Go to `chrome://extensions/` in your browser.
2. Enable "Developer mode" (top right).
3. Click "Load unpacked" and select the `extension/` folder from this repo.
4. The "Video Text Extractor" icon will appear in your browser.
5. Click the icon, follow the popup instructions: Hold Ctrl, select area, get text.

### 2. Backend/API (Optional, for self-hosting)
1. Clone this repository.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Add your Google Cloud Vision service account key as `service-account-key.json` (not included, see `service-account-key.example.json`).
4. Start the server:
   ```sh
   node server.js
   ```
5. Update the extension's API endpoint if self-hosting (see `content-script.js`).

### 3. Deploy
- Ready for Netlify, Render, Google Cloud, or Heroku.
- All configs (Dockerfile, YAML, etc.) included and up to date.

## License
MIT

