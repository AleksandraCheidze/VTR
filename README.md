# Video Text Copier

Веб-приложение, которое использует Google Cloud Vision API для извлечения текста из изображений.

## Локальная разработка

1. Установите зависимости:
   ```
   npm install
   ```

2. Запустите сервер:
   ```
   npm start
   ```

3. Откройте http://localhost:3000 в браузере.

## Варианты деплоя

### Деплой на Netlify

1. Создайте аккаунт на [Netlify](https://netlify.com), если у вас его еще нет.

2. Нажмите "Add new site" и выберите "Import an existing project".

3. Подключите свой репозиторий GitHub или используйте опцию "Deploy manually".

4. Добавьте следующую переменную окружения:
   - Ключ: `GOOGLE_CREDENTIALS`
   - Значение: содержимое файла service-account-key.json в формате JSON-строки

5. Нажмите "Deploy site".

6. Ваше приложение будет развернуто и доступно по URL, предоставленному Netlify.

### Деплой на Render.com

1. Создайте аккаунт на [Render.com](https://render.com), если у вас его еще нет.

2. Нажмите "New +" и выберите "Web Service".

3. Подключите свой репозиторий GitHub или используйте опцию "Public Git repository".

4. Заполните следующие данные:
   - Имя: video-text-copier
   - Окружение: Node
   - Команда сборки: `npm install`
   - Команда запуска: `node server.js`

5. Добавьте следующую переменную окружения:
   - Ключ: `PORT`
   - Значение: `10000`

6. Нажмите "Create Web Service".

7. Ваше приложение будет развернуто и доступно по URL, предоставленному Render.

### Деплой на Google Cloud Run

Для деплоя на Google Cloud Run необходимо включить биллинг в вашем проекте Google Cloud.

1. Соберите и отправьте образ контейнера:
   ```
   gcloud builds submit --tag gcr.io/YOUR-PROJECT-ID/video-text-copier
   ```

2. Разверните на Cloud Run:
   ```
   gcloud run deploy --image gcr.io/YOUR-PROJECT-ID/video-text-copier --platform managed --region us-central1 --allow-unauthenticated
   ```

Замените `YOUR-PROJECT-ID` на ID вашего проекта Google Cloud.
