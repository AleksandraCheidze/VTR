---
applyTo: '**'
---
Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.
applyTo: '**'

applyTo: '**'

💡 GENERAL PRINCIPLES:

Используй чистый, читабельный, масштабируемый код.

Придерживайся best practices, Clean Code, DRY, KISS, YAGNI, SOLID.

Не хардкодь, не дублируй, не усложняй.

Всегда оптимизируй код, архитектуру и производительность. Даже если тебя не просили.

Перед началом — проанализируй весь код проекта. Если что-то уже реализовано — не дублируй, а переиспользуй.

Если есть ошибки, повторения, антипаттерны, неэффективности — исправляй сразу. Не спрашивай.

Используй только современные решения и технологии. Устаревшее — в утиль.

Стандарты на высоком уровне: читаемость важнее краткости, но избегай лирики.

Комментарии — строго по делу, только когда без них не понять. Код — не роман.

Код на английском. Общение — на русском. UI-строки — только на английском.

Удаляй ненужное через CLI. Не оставляй мусор (временные файлы, неиспользуемый код, дубликаты и пр.)

Удаляй все отладочные и тестовые файлы, console.log, debugger, временные скрипты и отчёты после завершения тестов.

Не пиши README, markdown-доки, комментарии-инструкции или тестовые файлы, если об этом явно не попросили.

Сервер запускает только владелец проекта вручную. Не добавляй автостарт или лишние скрипты.

🚀 NODE / BACKEND:

Используй Express.js как базовый фреймворк.

Разделяй слои: routes, controllers, services, utils, middleware, config.

Настраивай CORS, безопасный доступ к API, rate limiting, env-переменные.

Поддерживай чистую архитектуру и единый стиль кодирования.

Названия переменных, функций, файлов — понятные, консистентные (camelCase, PascalCase, kebab-case — по назначению).

Не хардкодь конфиги, ключи, пути — всё должно быть в .env.

Все зависимости — актуальные. Удаляй неиспользуемые.

Используй ES6+ синтаксис, async/await, стрелочные функции.

Всегда валидируй входные данные. Используй Joi, zod, express-validator.

Не смешивай бизнес-логику с маршрутизаторами.
applyTo: 'frontend/**'

🔍 Фронтенд (Next.js, структура, код, API):
Используй Next.js как основной фреймворк фронта в общем проекте с backend.

Пиши код на JSX (React) с использованием Tailwind CSS — избегай дублирования стилей.
Интегрируй shadcn/ui как библиотеку UI-компонентов для быстрой и качественной разработки. 
Не хардкодь строки — используй константы и конфиги.

Структура проекта: components, pages, hooks, utils, styles.

Для API-запросов — SWR или React Query.

Перед добавлением функционала проверяй весь код, избегай дублирования.

Пиши так, чтобы фронт и бек держались в одном репозитории и проекте.

Обеспечивай адаптивность и кроссбраузерность.

Учитывай backend: отдавай корректные HTTP-коды, быстро обрабатывай запросы, настраивай CORS.

Не тормози UI: кешируй, сжимай, пиши асинхронно.

Возвращай понятные ошибки с полями: message, code, status.

Поддерживай интерфейсную совместимость JSON-структур и логов ошибок.

⚡ Оптимизация производительности и SEO (Next.js):
Для статичных страниц — используй SSG (Static Site Generation) для быстрой загрузки и лучшего SEO.

Для периодического обновления статичных страниц — ISR (Incremental Static Regeneration).

Для динамического контента — SSR (Server-Side Rendering), но минимизируй время ответа сервера.

Кешируй API-запросы и данные на клиенте с помощью React Query, SWR или кастомных решений.

Минимизируй размер бандла: используй code splitting и динамический импорт (React.lazy, next/dynamic).

Оптимизируй изображения с помощью next/image с ленивой загрузкой и адаптивными размерами.

При использовании Supabase отключай proxy через unoptimized={true} в <Image>.

Делаем уникальные и понятные SEO-мета-теги (title, description, Open Graph, Twitter Cards) для каждой страницы.

Используй правильные семантические HTML-теги (header, main, article, section, footer) для лучшей доступности и SEO.

Следи за низким Time to First Byte (TTFB) — оптимизируй backend API и кеширование.

Регулярно проверяй производительность и SEO с помощью Lighthouse или аналогичных инструментов, исправляй найденные проблемы.

Минимизируй количество сторонних скриптов — оставляй только необходимые, загружай асинхронно, чтобы не блокировали загрузку страницы.




🗃️ БД:

Используй Supabase как основной вариант.

Обращайся к Supabase через REST API или Supabase Client SDK, через асинхронные запросы (fetch, @supabase/supabase-js и пр.).

Работай с БД через отдельный data access layer — никакой логики в контроллерах.

Не хардкодь запросы — используй абстракции.

Структурируй модели/схемы отдельно. Не мешай с логикой.

📦 DEPLOY:

Поддерживай готовность к деплою: Netlify, Render, Google Cloud, Heroku.

Все конфиги (Dockerfile, YAML-файлы и т.п.) должны быть актуальны и рабочи.

Следи за package.json: зависимости, скрипты, версия.

Структурируй проект так, чтобы можно было в будущем добавить frontend (лендинг или SPA) в этот же репозиторий — с отдельной структурой и билдом.



📎 ДОПОЛНИТЕЛЬНО:

Не оставляй лишние console.log, debugger, TODO без дела.

Если нужна структура — предложи её. Не импровизируй без оснований.

Если можешь сделать лучше — делай. Даже если тебя об этом не просили.
Исправляй или ищи решения сразу, не спрашивай меня надо или нет