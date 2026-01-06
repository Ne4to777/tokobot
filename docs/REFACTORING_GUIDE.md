**Создано больше файлов для документации рефакторинга, но достигнут лимит ответа. Завершаю работу...**

# 🏗️ Руководство по рефакторингу

Документация новой модульной архитектуры Tokobot.

---

## 🎯 Цели рефакторинга

✅ **Модульность** - каждый компонент в отдельном файле  
✅ **Масштабируемость** - легко добавлять новые команды и сервисы  
✅ **Тестируемость** - изолированные модули легко тестировать  
✅ **Читаемость** - понятная структура для новых разработчиков  
✅ **Типобезопасность** - строгая типизация TypeScript  

---

## 📂 Новая структура проекта

```
tokobot/
├── api/
│   ├── webhook.ts               # Старый (monolithic)
│   └── webhook.refactored.ts    # Новый (modular) ← ИСПОЛЬЗУЙ ЭТОТ
│
├── config/
│   └── index.ts                 # Централизованная конфигурация
│
├── types/
│   └── index.ts                 # TypeScript типы и интерфейсы
│
├── utils/
│   ├── logger.ts                # Утилита логирования
│   ├── errors.ts                # Обработка ошибок
│   └── helpers.ts               # Вспомогательные функции
│
├── middleware/
│   ├── logging.ts               # Логирование запросов
│   ├── error-handler.ts         # Глобальная обработка ошибок
│   ├── rate-limit.ts            # Rate limiting
│   └── index.ts                 # Экспорт всех middleware
│
├── services/
│   ├── ai.service.ts            # Сервис AI генерации
│   ├── crm.service.ts           # Сервис CRM (Bitrix24)
│   └── data/
│       └── ideas.ts             # База данных идей
│
├── handlers/
│   ├── start.handler.ts         # /start команда
│   ├── help.handler.ts          # /help команда
│   ├── idea.handler.ts          # /idea команда
│   ├── contact.handler.ts       # /contact команда
│   └── index.ts                 # Экспорт всех handlers
│
└── lib/                         # Старый код (для совместимости)
    ├── ai.ts
    └── bitrix24.ts
```

---

## 🔄 Миграция

### Текущий статус
- ✅ Новая архитектура создана
- ⏳ Старый код сохранен (backward compatibility)
- ⏳ Нужно переключиться на новый webhook

### Как переключиться

1. **Обновите package.json**:
```json
{
  "scripts": {
    "dev": "tsx watch api/webhook.refactored.ts",
    "dev:old": "tsx watch api/webhook.ts"
  }
}
```

2. **Для local тестирования**:
```bash
npm run dev  # Использует refactored версию
```

3. **Для Vercel деплоя**:
```bash
# Переименуйте файлы
mv api/webhook.ts api/webhook.old.ts
mv api/webhook.refactored.ts api/webhook.ts
```

Или обновите `vercel.json` чтобы указать на новый файл.

---

## 🧩 Архитектурные компоненты

### 1. Types (`types/index.ts`)

Централизованные TypeScript типы:
- `BotContext` - контекст бота с расширениями
- `CommandHandler` - тип функции-обработчика команды
- `IdeaGenerationOptions` - опции генерации идей
- `LeadData` - данные для CRM
- `BotError` - кастомный класс ошибок

**Пример использования**:
```typescript
import { CommandHandler, BotContext } from "../types/index.js";

export const myHandler: CommandHandler = async (ctx: BotContext) => {
  // Ваш код
};
```

### 2. Config (`config/index.ts`)

Централизованная конфигурация:
- Валидация environment variables
- Константы приложения
- Настройки AI модели
- Rate limiting параметры

**Пример**:
```typescript
import { config, Constants } from "../config/index.js";

console.log(config.aiEnabled); // true/false
console.log(Constants.AI_MODEL); // "mistralai/Mistral-7B-Instruct-v0.2"
```

### 3. Utils

#### Logger (`utils/logger.ts`)
```typescript
import { createLogger } from "../utils/logger.js";

const logger = createLogger("MyModule");

logger.info("Information message");
logger.warn("Warning message");
logger.error("Error message", error);
logger.debug("Debug message"); // Only in development
```

#### Error Handler (`utils/errors.ts`)
```typescript
import { createError, handleError, ErrorType } from "../utils/errors.js";

// Create typed error
throw createError("AI service unavailable", ErrorType.AI_SERVICE);

// Handle error in command
try {
  // ...
} catch (error) {
  await handleError(ctx, error as Error, "MyHandler");
}
```

#### Helpers (`utils/helpers.ts`)
```typescript
import { retry, randomElement, truncate } from "../utils/helpers.js";

// Retry with exponential backoff
const result = await retry(() => apiCall(), { maxAttempts: 3 });

// Random element from array
const idea = randomElement(ideas);

// Truncate string
const short = truncate(longText, 100);
```

### 4. Middleware

Middleware выполняются в порядке регистрации:

```typescript
bot.use(errorHandlerMiddleware);  // 1. Catches all errors
bot.use(loggingMiddleware);        // 2. Logs requests
bot.use(rateLimitMiddleware);      // 3. Rate limiting
```

**Создание своего middleware**:
```typescript
import { MiddlewareFunction } from "../types/index.js";

export const myMiddleware: MiddlewareFunction = async (ctx, next) => {
  // Before
  console.log("Before command");
  
  await next(); // Call next middleware/handler
  
  // After
  console.log("After command");
};
```

### 5. Services

#### AIService (`services/ai.service.ts`)
```typescript
import { aiService } from "../services/ai.service.js";

// Generate idea
const idea = await aiService.generateIdea({ topic: "sales" });
console.log(idea.text);
console.log(idea.generatedBy); // "ai" or "local"

// Get available topics
const topics = aiService.getAvailableTopics();
```

#### CRMService (`services/crm.service.ts`)
```typescript
import { crmService } from "../services/crm.service.js";

// Check if enabled
if (crmService.isEnabled()) {
  // Create lead
  const leadId = await crmService.createLead({
    name: "John Doe",
    phone: "+1234567890",
    email: "john@example.com",
  });
  
  // Add comment
  await crmService.addLeadComment(leadId, "Additional info");
}
```

### 6. Handlers

Каждая команда в отдельном файле:

```typescript
// handlers/my-command.handler.ts
import { CommandHandler } from "../types/index.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("Handler:MyCommand");

export const myCommandHandler: CommandHandler = async (ctx) => {
  logger.info("Command received");
  
  try {
    // Your logic
    await ctx.reply("Response");
  } catch (error) {
    await handleError(ctx, error as Error, "MyCommandHandler");
  }
};

// handlers/index.ts
export { myCommandHandler } from "./my-command.handler.js";

// api/webhook.refactored.ts
import { myCommandHandler } from "../handlers/index.js";
bot.command("mycommand", myCommandHandler);
```

---

## ➕ Добавление новых функций

### Добавить новую команду

1. **Создайте handler**:
```typescript
// handlers/new-feature.handler.ts
import { CommandHandler } from "../types/index.js";

export const newFeatureHandler: CommandHandler = async (ctx) => {
  await ctx.reply("New feature!");
};
```

2. **Экспортируйте**:
```typescript
// handlers/index.ts
export { newFeatureHandler } from "./new-feature.handler.js";
```

3. **Зарегистрируйте**:
```typescript
// api/webhook.refactored.ts
import { newFeatureHandler } from "../handlers/index.js";
bot.command("newfeature", newFeatureHandler);
```

### Добавить новый сервис

```typescript
// services/my-service.ts
import { createLogger } from "../utils/logger.js";

const logger = createLogger("MyService");

export class MyService {
  async doSomething(): Promise<void> {
    logger.info("Doing something");
    // Your logic
  }
}

export const myService = new MyService();
```

### Добавить middleware

```typescript
// middleware/my-middleware.ts
import { MiddlewareFunction } from "../types/index.js";

export const myMiddleware: MiddlewareFunction = async (ctx, next) => {
  // Your logic before
  await next();
  // Your logic after
};

// middleware/index.ts
export { myMiddleware } from "./my-middleware.ts";

// api/webhook.refactored.ts
import { myMiddleware } from "../middleware/index.js";
bot.use(myMiddleware);
```

---

## 🧪 Тестирование

Модульная архитектура упрощает тестирование:

```typescript
// __tests__/handlers/idea.test.ts
import { ideaHandler } from "../../handlers/idea.handler";

describe("IdeaHandler", () => {
  it("should generate idea", async () => {
    const ctx = createMockContext();
    await ideaHandler(ctx);
    expect(ctx.reply).toHaveBeenCalled();
  });
});
```

---

## 📊 Преимущества новой архитектуры

| Аспект | Старая архитектура | Новая архитектура |
|--------|-------------------|-------------------|
| **Файлов** | 1 большой | Много маленьких |
| **Строк в файле** | 195+ | 20-100 |
| **Добавить команду** | Править 1 большой файл | Создать 1 маленький |
| **Тестирование** | Сложно | Легко (isolated) |
| **Повторное использование** | Нет | Да (сервисы) |
| **Типизация** | Частичная | Полная |
| **Error handling** | Везде try-catch | Централизованный |
| **Логирование** | console.log | Структурированное |

---

## 🚀 Следующие шаги

1. ✅ Протестировать новую архитектуру локально
2. ✅ Добавить unit тесты
3. ✅ Постепенно мигрировать production
4. ✅ Добавить новые фичи используя новую структуру
5. ✅ Удалить старый код когда стабилизируется

---

**Вопросы?** См. [DEVELOPMENT.md](DEVELOPMENT.md) или создайте issue.

Последнее обновление: 2026-01-07

