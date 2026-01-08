<div align="center">

# 🤖 Tokobot

**AI-First Business Idea Generator Bot**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg)](https://nodejs.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com/)
[![CI](https://github.com/nybble777/tokobot/workflows/CI/badge.svg)](https://github.com/nybble777/tokobot/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Телеграм-бот для генерации **AI-first** бизнес идей, где искусственный
интеллект - это ядро продукта. Для небольших команд (2-5 человек). Бесплатный
хостинг на Vercel с использованием YandexGPT (работает из РФ!).

[Features](#-возможности) • [Quick Start](docs/QUICKSTART.md) •
[Documentation](docs/) • [Contributing](CONTRIBUTING.md) •
[Development](docs/DEVELOPMENT.md)

</div>

---

## ✨ Возможности

- 💡 Генерация AI-first бизнес идей по команде `/idea`
- 🎯 Идеи в конкретных областях: `/idea sales`, `/idea marketing`, `/idea hr` и
  др.
- 🤖 Интеграция с бесплатным AI (YandexGPT, Groq, Gemini) или локальная база из 50+ идей
- 🕐 **Автоматическая отправка идей по расписанию** (ежедневно, еженедельно, и т.д.) - [настройка](docs/SCHEDULED_IDEAS.md)
- 🚀 Бесплатный хостинг на Vercel
- 📝 TypeScript для безопасности типов
- 🎯 **Все идеи про бизнес, где AI - ключевой элемент, без которого продукт
  невозможен**
- 🔗 **Интеграция с Битрикс24 CRM** - автоматическое создание лидов из бота

## 🚀 Быстрый старт

### 1. Создайте Telegram бота

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям и получите токен бота
4. Сохраните токен - он понадобится для деплоя

### 2. (Опционально) Получите YandexGPT API ключ

Для улучшенной AI генерации (рекомендуется):

1. Перейдите на [Yandex Cloud Console](https://console.cloud.yandex.ru/)
2. Создайте аккаунт или войдите
3. Создайте новый каталог (Folder) или используйте существующий
4. Скопируйте **Folder ID** (в настройках каталога)
5. Перейдите в "Сервисные аккаунты" → "Создать сервисный аккаунт"
6. Назначьте роль `ai.languageModels.user`
7. Создайте **API-ключ** для сервисного аккаунта
8. Сохраните `YANDEX_API_KEY` и `YANDEX_FOLDER_ID`

> **Примечание:**
>
> - ✅ **Работает из России без VPN!**
> - 🆓 **Бесплатно 1000 запросов/месяц** (YandexGPT Lite)
> - 🇷🇺 Российский сервис, стабильная работа
> - 📚 [Подробная инструкция](https://cloud.yandex.ru/docs/yandexgpt/quickstart)
> - Бот работает и без API ключа, используя локальную генерацию идей
> - Также поддерживается Groq (установите `AI_PROVIDER=groq`, 14400 запросов/день)
> - Также поддерживается Gemini (установите `AI_PROVIDER=gemini`, не работает в РФ)
> - Также поддерживается Hugging Face (установите `AI_PROVIDER=huggingface`)

### 3. Деплой на Vercel

#### Вариант A: Через GitHub (рекомендуется)

1. Создайте репозиторий на GitHub и запушьте код:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

2. Перейдите на [Vercel](https://vercel.com/)
3. Нажмите "Import Project"
4. Выберите ваш репозиторий
5. Добавьте переменные окружения:
   - `BOT_TOKEN` - ваш токен от BotFather (обязательно)
   - `YANDEX_API_KEY` - (опционально) API ключ от YandexGPT
   - `YANDEX_FOLDER_ID` - (опционально) Folder ID от Yandex Cloud
   - `AI_PROVIDER` - (опционально) `yandexgpt`, `groq`, `gemini` или `huggingface`, по
     умолчанию `yandexgpt`
6. Нажмите "Deploy"

#### Вариант B: Через Vercel CLI

1. Установите Vercel CLI:

```bash
npm install -g vercel
```

2. Залогиньтесь:

```bash
vercel login
```

3. Деплойте проект:

```bash
vercel
```

4. Добавьте переменные окружения:

```bash
vercel env add BOT_TOKEN
vercel env add YANDEX_API_KEY
vercel env add YANDEX_FOLDER_ID
```

5. Передеплойте с новыми переменными:

```bash
vercel --prod
```

### 4. Настройте webhook

После деплоя на Vercel вы получите URL вида `https://your-project.vercel.app`

Установите webhook для вашего бота:

```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-project.vercel.app/api/webhook
```

Замените:

- `<YOUR_BOT_TOKEN>` - на токен вашего бота
- `your-project.vercel.app` - на ваш Vercel URL

## 🛠️ Локальная разработка

### Установка зависимостей

```bash
npm install
```

### Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
BOT_TOKEN=your_telegram_bot_token_here
HUGGINGFACE_TOKEN=your_huggingface_token_here
```

### Запуск в режиме разработки

```bash
npm run dev
```

В режиме разработки бот использует polling вместо webhooks.

### Сборка проекта

```bash
npm run build
```

## 📝 Доступные команды бота

- `/start` - Начать работу с ботом
- `/idea` - Получить случайную AI-бизнес идею
- `/idea <область>` - Получить идею в конкретной области
- `/contact` - Оставить заявку на консультацию (создает лид в Битрикс24)
- `/help` - Показать справку

### Доступные области

- `sales` - Продажи и CRM
- `marketing` - Маркетинг и реклама
- `hr` - HR и управление людьми
- `product` - Разработка продукта
- `support` - Клиентская поддержка
- `finance` - Финансы и аналитика

### Примеры использования

```
/idea
🤖 AI-юрист для стартапов: модель обучена на тысячах договоров,
автоматически составляет NDA, контракты с подрядчиками и
инвестиционные документы

/idea sales
🎯 AI-SDR (Sales Development Rep): автономно ведет переписку с
входящими лидами, квалифицирует их и бронирует встречи в
календаре менеджера

/idea marketing
📱 AI-креатор рекламных кампаний: генерирует креативы, тексты,
таргетинги и автоматически запускает A/B тесты во всех каналах
```

**Особенность:** Все идеи про бизнес, где **AI - это не фича, а сам продукт**.
Без AI/ML такой бизнес не может существовать.

## 🏗️ Структура проекта

```
tokobot/
├── api/
│   └── webhook.ts              # Vercel serverless функция и webhook handler
├── lib/
│   ├── ai.ts                   # AI сервис для генерации идей
│   └── bitrix24.ts             # Интеграция с Битрикс24 CRM
├── scripts/
│   ├── set-webhook.sh          # Скрипт для установки webhook
│   └── check-webhook.sh        # Проверка статуса webhook
├── package.json                # Зависимости проекта
├── tsconfig.json               # Конфигурация TypeScript
├── vercel.json                 # Конфигурация Vercel
├── README.md                   # Основная документация
└── BITRIX24_INTEGRATION.md     # Инструкция по интеграции с Битрикс24
```

## 🔧 Технологии

- **Node.js** - Runtime окружение
- **TypeScript** - Язык программирования
- **Telegraf** - Фреймворк для Telegram ботов
- **Groq (Llama 3.3 70B)** - Бесплатный AI API (рекомендуется, работает в РФ)
- **Google Gemini 2.0** - Альтернативный AI API (не работает в РФ)
- **Hugging Face** - Альтернативный AI API
- **Vercel** - Бесплатный хостинг

## 💡 Кастомизация

### Изменение AI модели

В файле `lib/ai.ts` вы можете изменить модель:

```typescript
const response = await fetch(
  "https://api-inference.huggingface.co/models/YOUR_MODEL_HERE"
  // ...
);
```

Популярные бесплатные модели:

- `mistralai/Mistral-7B-Instruct-v0.2` (текущая)
- `google/flan-t5-xxl`
- `bigscience/bloom`

### Добавление новых команд

В файле `api/webhook.ts` добавьте новый handler:

```typescript
bot.command("yourcommand", async (ctx) => {
  // Ваша логика
  await ctx.reply("Ответ бота");
});
```

### Локальные идеи

В файле `src/services/data/ideas.ts` находится база из 50+
AI-first бизнес идей, которые используются как fallback, если AI API
недоступен.

Все идеи следуют принципу: **AI - это ядро продукта**, а не вспомогательная
функция. Примеры:

- AI-юрист, который сам составляет договоры
- AI-рекрутер, который проводит интервью
- AI-бухгалтер, который полностью автоматизирует учет

## 🔗 Интеграция с Битрикс24

Бот может автоматически создавать лиды в Битрикс24 CRM!

### Быстрая настройка:

1. **Получите webhook URL из Битрикс24:**

   - Приложения → Разработчикам → Входящий вебхук
   - Скопируйте URL

2. **Добавьте в переменные окружения:**

   ```env
   BITRIX24_WEBHOOK=https://your-domain.bitrix24.ru/rest/1/xxxxx/
   ```

3. **Используйте команду `/contact`** в боте для сбора лидов!

**Подробная инструкция:** См.
[BITRIX24_INTEGRATION.md](docs/BITRIX24_INTEGRATION.md)

### Возможности:

- ✅ Автоматическое создание лидов из Telegram
- ✅ Квалификация лидов с помощью AI
- ✅ Уведомления менеджерам
- ✅ Аналитика и отчеты
- ✅ Автоматическое распределение лидов

---

## 🐛 Troubleshooting

### Бот не отвечает

1. Проверьте, что webhook установлен правильно:

```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

2. Проверьте логи в Vercel Dashboard

### AI не генерирует идеи

1. Проверьте, что `GROQ_API_KEY` установлен в Vercel
2. Проверьте лимиты API (14,400 запросов/день для Groq)
3. Убедитесь, что API ключ активен на https://console.groq.com/
4. Бот автоматически переключится на локальную генерацию при ошибках

### Битрикс24 не создает лиды

1. Проверьте, что `BITRIX24_WEBHOOK` установлен
2. Проверьте права webhook в Битрикс24 (должен быть доступ к CRM)
3. Проверьте логи бота для деталей ошибки

### Vercel деплой не работает

1. Убедитесь, что `vercel.json` правильно настроен
2. Проверьте, что все переменные окружения установлены
3. Проверьте логи билда в Vercel Dashboard

## 🏛️ Архитектура

### Serverless Architecture

```
Telegram → Webhook → Vercel Function → AI/CRM APIs
                          ↓
                    Response to User
```

### Key Components

- **api/webhook.ts** - Entry point, handles Telegram webhooks
- **lib/ai.ts** - AI idea generation with fallback logic
- **lib/bitrix24.ts** - CRM integration layer

### Development vs Production

| Environment | Bot Mode     | Hosting | Config                |
| ----------- | ------------ | ------- | --------------------- |
| Development | Long Polling | Local   | `.env` file           |
| Production  | Webhooks     | Vercel  | Environment Variables |

### Data Flow

1. User sends command in Telegram
2. Telegram sends webhook to Vercel
3. Vercel executes serverless function
4. Bot processes command (AI/CRM/Local)
5. Response sent back to Telegram
6. User receives message

## 🔒 Security Best Practices

- ✅ Never commit `.env` files
- ✅ Use environment variables for all secrets
- ✅ Rotate tokens periodically
- ✅ Limit Bitrix24 webhook permissions to minimum required
- ✅ Validate user input before processing
- ✅ Monitor logs for suspicious activity
- ✅ Keep dependencies updated

**For more details**, see [SECURITY.md](.github/SECURITY.md)

## 📚 Документация

> **📖 Вся документация находится в папке [`docs/`](docs/)** - см.
> [полное оглавление](docs/README.md)

### Getting Started

- **[Quick Start Guide](docs/QUICKSTART.md)** ⚡ - Запуск за 5 минут
- **[Development Guide](docs/DEVELOPMENT.md)** 💻 - Полное руководство
  разработчика
- **[Navigation Guide](docs/NAVIGATION_GUIDE.md)** 🧭 - Как найти нужный файл

### Integration & Architecture

- **[Bitrix24 Integration](docs/BITRIX24_INTEGRATION.md)** 🔗 - Интеграция с
  Битрикс24 CRM
- **[Deployment Explained](docs/DEPLOYMENT_EXPLAINED.md)** 🚀 - Как работает на
  сервере
- **[Architecture](docs/ARCHITECTURE.md)** 🏛️ - Архитектура системы
- **[Project Structure](docs/PROJECT_STRUCTURE.md)** 📁 - Структура файлов

### Contributing

- **[Contributing Guidelines](CONTRIBUTING.md)** 🤝 - Как внести вклад в проект
- **[Code of Conduct](.github/CODE_OF_CONDUCT.md)** 📜 - Правила сообщества

### Reference

- **[Changelog](CHANGELOG.md)** 📝 - История изменений
- **[Security Policy](.github/SECURITY.md)** 🔒 - Политика безопасности
- **[AI Development Guide](.github/AI_DEVELOPMENT_GUIDE.md)** 🤖 - Для
  AI-агентов
- **[Repository Setup](docs/REPOSITORY_SETUP.md)** 🛠️ - Настройка репозитория

## 🤝 Contributing

Мы приветствуем вклад от сообщества!

- 📖 Прочитайте [Contributing Guide](CONTRIBUTING.md)
- 🐛
  [Report bugs](https://github.com/nybble777/tokobot/issues/new?template=bug_report.md)
- 💡
  [Request features](https://github.com/nybble777/tokobot/issues/new?template=feature_request.md)
- 💬 [Start a discussion](https://github.com/nybble777/tokobot/discussions)

### For AI Agents & Code Assistants

This repository is optimized for AI-assisted development:

- ✅ Comprehensive TypeScript types
- ✅ Clear code structure and naming conventions
- ✅ Well-documented functions with JSDoc
- ✅ Conventional commits
- ✅ Automated CI/CD workflows
- ✅ Issue and PR templates

## 📊 Project Status

- ✅ Core bot functionality
- ✅ AI idea generation
- ✅ Bitrix24 CRM integration
- ✅ Vercel deployment
- ⏳ Unit tests (coming soon)
- ⏳ E2E tests (coming soon)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## 👥 Contributors

Thanks to all contributors who help improve Tokobot!

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- Add contributors here -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

## 🙏 Acknowledgments

- [Telegraf](https://github.com/telegraf/telegraf) - Telegram bot framework
- [Groq](https://groq.com/) - Free AI API (recommended, works in Russia)
- [Google Gemini](https://ai.google.dev/) - Alternative AI API
- [Hugging Face](https://huggingface.co/) - Alternative AI models
- [Vercel](https://vercel.com/) - Serverless deployment
- [Bitrix24](https://www.bitrix24.ru/) - CRM integration

## 📧 Support & Contact

- 🐛 **Bug reports**:
  [Open an issue](https://github.com/nybble777/tokobot/issues)
- 💡 **Feature requests**:
  [Open an issue](https://github.com/nybble777/tokobot/issues)
- 💬 **Questions**:
  [Discussions](https://github.com/nybble777/tokobot/discussions)
- 📧 **Email**: [Create issue for private matters]

---

<div align="center">

**Сделано с ❤️ и TypeScript**

⭐ Star us on GitHub — it motivates us a lot!

[Report Bug](https://github.com/nybble777/tokobot/issues) •
[Request Feature](https://github.com/nybble777/tokobot/issues) •
[Read Docs](CONTRIBUTING.md)

</div>
