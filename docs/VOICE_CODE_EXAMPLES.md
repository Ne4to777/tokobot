# 🎤 Примеры кода: Голосовые сообщения

## Основные компоненты

### 1. Распознавание речи (STT)

```typescript
// src/services/yandex-stt.service.ts

import { createLogger } from "../utils/logger.js";

const logger = createLogger("YandexSTT");

export interface YandexSTTRequest {
  apiKey: string;
  folderId: string;
  audioBuffer: Buffer;
  languageCode?: string;
}

/**
 * Распознавание речи через Yandex SpeechKit
 */
export async function recognizeSpeech(
  request: YandexSTTRequest
): Promise<string> {
  const { apiKey, folderId, audioBuffer, languageCode = "ru-RU" } = request;

  logger.info(`Recognizing speech (size: ${audioBuffer.length} bytes)...`);

  const response = await fetch(
    "https://stt.api.cloud.yandex.net/speech/v1/stt:recognize",
    {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${apiKey}`,
        "x-folder-id": folderId,
      },
      body: audioBuffer,
    }
  );

  if (!response.ok) {
    throw new Error(`Yandex STT API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.result?.alternatives?.[0]?.text || "";

  logger.info(`Speech recognized: ${text}`);
  return text;
}
```

### 2. Обработчик голосовых сообщений

```typescript
// src/handlers/voice.handler.ts

import { BotContext } from "../types/index.js";
import { recognizeSpeech } from "../services/yandex-stt.service.js";
import { generateIdea } from "../lib/ai.js";

/**
 * Обработчик голосовых сообщений
 */
export async function voiceHandler(ctx: BotContext): Promise<void> {
  // Проверка наличия голосового сообщения
  if (!ctx.message || !("voice" in ctx.message)) {
    return;
  }

  const voice = ctx.message.voice;

  // Ограничение длительности (30 сек для синхронного API)
  if (voice.duration > 30) {
    await ctx.reply("⏱ Голосовое сообщение слишком длинное (макс. 30 сек).");
    return;
  }

  try {
    // Шаг 1: Скачиваем аудио
    await ctx.reply("🎤 Слушаю ваше сообщение...");

    const fileLink = await ctx.telegram.getFileLink(voice.file_id);
    const audioResponse = await fetch(fileLink.href);
    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());

    // Шаг 2: Распознаём речь
    await ctx.reply("🔍 Распознаю вашу речь...");

    const recognizedText = await recognizeSpeech({
      apiKey: config.aiToken!,
      folderId: config.yandexFolderId!,
      audioBuffer,
      languageCode: "ru-RU",
    });

    await ctx.reply(`📝 Распознано: "${recognizedText}"`);

    // Шаг 3: Извлекаем тему
    const topic = extractTopicFromText(recognizedText);

    // Шаг 4: Генерируем идею
    await ctx.reply("💡 Генерирую бизнес-идею...");
    const idea = await generateIdea(topic);

    await ctx.reply(
      `🎯 Бизнес-идея по теме "${topic}":\n\n${idea}\n\n` +
        `🎤 Отправьте голосовое сообщение для новой идеи!`
    );
  } catch (error) {
    logger.error("Error processing voice", error);
    await ctx.reply("❌ Не удалось обработать голосовое сообщение.");
  }
}
```

### 3. Извлечение темы из текста

```typescript
/**
 * Извлекает тему из распознанного текста
 */
function extractTopicFromText(text: string): string {
  const lowerText = text.toLowerCase();

  // Словарь ключевых слов
  const topicKeywords: Record<string, string[]> = {
    sales: ["продажи", "продаж", "сейлз", "клиент"],
    marketing: ["маркетинг", "реклам", "smm", "контент"],
    hr: ["hr", "персонал", "сотрудник", "найм"],
    product: ["продукт", "разработк", "фича"],
    support: ["поддержк", "support", "помощь"],
    finance: ["финанс", "бухгалтер", "учет"],
  };

  // Ищем совпадения
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return topic;
      }
    }
  }

  // Дефолтная тема
  return "sales";
}
```

### 4. Регистрация обработчика

```typescript
// api/webhook.ts

import { voiceHandler } from "../src/handlers/index.js";

// ...

// Регистрируем обработчик голосовых сообщений
bot.on("voice", voiceHandler);
```

## Расширенные примеры

### Text-to-Speech (голосовые ответы)

```typescript
// src/services/yandex-tts.service.ts

export interface YandexTTSRequest {
  apiKey: string;
  folderId: string;
  text: string;
  voice?: string;
  languageCode?: string;
}

/**
 * Синтез речи через Yandex SpeechKit
 */
export async function synthesizeSpeech(
  request: YandexTTSRequest
): Promise<Buffer> {
  const {
    apiKey,
    folderId,
    text,
    voice = "alena", // или "filipp", "ermil", "jane", etc.
    languageCode = "ru-RU",
  } = request;

  const response = await fetch(
    "https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize",
    {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${apiKey}`,
        "x-folder-id": folderId,
      },
      body: new URLSearchParams({
        text,
        lang: languageCode,
        voice,
        format: "oggopus", // Формат для Telegram
        speed: "1.0",
        emotion: "neutral",
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Yandex TTS API error: ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

// Использование в handler
export async function voiceHandlerWithTTS(ctx: BotContext): Promise<void> {
  // ... распознавание и генерация идеи ...

  // Отправляем текстовый ответ
  await ctx.reply(`📝 ${idea}`);

  // Синтезируем голосовой ответ
  const audioBuffer = await synthesizeSpeech({
    apiKey: config.aiToken!,
    folderId: config.yandexFolderId!,
    text: idea,
    voice: "alena",
  });

  // Отправляем голосовое сообщение
  await ctx.replyWithVoice({ source: audioBuffer });
}
```

### Многоязычное распознавание

```typescript
/**
 * Автоматическое определение языка
 */
async function recognizeSpeechWithLangDetection(
  audioBuffer: Buffer,
  apiKey: string,
  folderId: string
): Promise<{ text: string; language: string }> {
  // Пробуем несколько языков
  const languages = ["ru-RU", "en-US", "de-DE"];

  let bestResult = { text: "", confidence: 0, language: "ru-RU" };

  for (const lang of languages) {
    try {
      const response = await fetch(
        `https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?lang=${lang}`,
        {
          method: "POST",
          headers: {
            Authorization: `Api-Key ${apiKey}`,
            "x-folder-id": folderId,
          },
          body: audioBuffer,
        }
      );

      const data = await response.json();
      const text = data.result?.alternatives?.[0]?.text || "";
      const confidence = data.result?.alternatives?.[0]?.confidence || 0;

      if (confidence > bestResult.confidence) {
        bestResult = { text, confidence, language: lang };
      }
    } catch (error) {
      continue;
    }
  }

  return { text: bestResult.text, language: bestResult.language };
}
```

### Streaming API для длинных аудио

```typescript
/**
 * Распознавание через Streaming API (для аудио > 30 сек)
 */
export async function recognizeSpeechStreaming(
  request: YandexSTTRequest
): Promise<string> {
  const { apiKey, folderId, audioBuffer } = request;

  // Разбиваем аудио на чанки
  const chunkSize = 8000; // 8KB chunks
  const chunks: Buffer[] = [];

  for (let i = 0; i < audioBuffer.length; i += chunkSize) {
    chunks.push(audioBuffer.slice(i, i + chunkSize));
  }

  // Отправляем чанки последовательно
  let fullText = "";

  for (const chunk of chunks) {
    const response = await fetch(
      `https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?folderId=${folderId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Api-Key ${apiKey}`,
          "Transfer-Encoding": "chunked",
        },
        body: chunk,
      }
    );

    const data = await response.json();
    const text = data.result?.alternatives?.[0]?.text || "";
    fullText += " " + text;
  }

  return fullText.trim();
}
```

### Диалоговый режим

```typescript
/**
 * Диалоговый handler с контекстом
 */
interface VoiceContext {
  userId: number;
  step: "topic" | "industry" | "budget";
  data: {
    topic?: string;
    industry?: string;
    budget?: string;
  };
}

const conversations = new Map<number, VoiceContext>();

export async function voiceDialogHandler(ctx: BotContext): Promise<void> {
  if (!ctx.message || !("voice" in ctx.message)) return;

  const userId = ctx.from?.id;
  if (!userId) return;

  // Получаем или создаём контекст
  let context = conversations.get(userId);
  if (!context) {
    context = {
      userId,
      step: "topic",
      data: {},
    };
    conversations.set(userId, context);
  }

  // Распознаём речь
  const voice = ctx.message.voice;
  const fileLink = await ctx.telegram.getFileLink(voice.file_id);
  const audioResponse = await fetch(fileLink.href);
  const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());

  const recognizedText = await recognizeSpeech({
    apiKey: config.aiToken!,
    folderId: config.yandexFolderId!,
    audioBuffer,
  });

  // Обрабатываем в зависимости от шага
  switch (context.step) {
    case "topic":
      context.data.topic = recognizedText;
      context.step = "industry";
      await ctx.reply(
        `📝 Тема: "${recognizedText}"\n\n` +
          `Теперь скажите, для какой индустрии? 🎤`
      );
      break;

    case "industry":
      context.data.industry = recognizedText;
      context.step = "budget";
      await ctx.reply(
        `🏢 Индустрия: "${recognizedText}"\n\n` + `Какой бюджет? 🎤`
      );
      break;

    case "budget":
      context.data.budget = recognizedText;

      // Генерируем идею с полным контекстом
      const prompt =
        `Тема: ${context.data.topic}\n` +
        `Индустрия: ${context.data.industry}\n` +
        `Бюджет: ${context.data.budget}`;

      const idea = await generateIdea(prompt);

      await ctx.reply(
        `💰 Бюджет: "${recognizedText}"\n\n` +
          `🎯 Вот ваша персонализированная идея:\n\n${idea}`
      );

      // Очищаем контекст
      conversations.delete(userId);
      break;
  }
}
```

### Анализ эмоций (концепт)

```typescript
/**
 * Анализ тона голоса (концепт)
 */
interface EmotionAnalysis {
  emotion: "positive" | "neutral" | "negative";
  confidence: number;
  energy: number;
}

async function analyzeVoiceEmotion(
  audioBuffer: Buffer
): Promise<EmotionAnalysis> {
  // Здесь можно использовать специализированные API:
  // - Yandex SpeechKit Emotion API
  // - Azure Speech Emotion Recognition
  // - Custom ML model

  // Пример (псевдокод):
  const response = await fetch("https://emotion-api.example.com/analyze", {
    method: "POST",
    body: audioBuffer,
  });

  const data = await response.json();

  return {
    emotion: data.emotion,
    confidence: data.confidence,
    energy: data.energy,
  };
}

// Использование
export async function voiceHandlerWithEmotion(ctx: BotContext): Promise<void> {
  // ... получаем audioBuffer ...

  const emotion = await analyzeVoiceEmotion(audioBuffer);
  const text = await recognizeSpeech({ audioBuffer, ... });

  // Адаптируем ответ под эмоцию
  let ideaPrompt = text;
  if (emotion.emotion === "positive" && emotion.energy > 0.7) {
    ideaPrompt += " (make it exciting and ambitious)";
  } else if (emotion.emotion === "negative") {
    ideaPrompt += " (make it practical and reassuring)";
  }

  const idea = await generateIdea(ideaPrompt);
  await ctx.reply(idea);
}
```

## Утилиты

### Валидация аудио

```typescript
/**
 * Проверка аудиофайла
 */
function validateVoiceMessage(voice: { duration: number; file_size: number }) {
  const errors: string[] = [];

  if (voice.duration > 30) {
    errors.push("Длительность превышает 30 секунд");
  }

  if (voice.duration < 1) {
    errors.push("Сообщение слишком короткое (минимум 1 секунда)");
  }

  if (voice.file_size > 20 * 1024 * 1024) {
    errors.push("Размер файла превышает 20 МБ");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

### Retry логика

```typescript
/**
 * Распознавание с повторными попытками
 */
async function recognizeSpeechWithRetry(
  request: YandexSTTRequest,
  maxRetries = 3
): Promise<string> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await recognizeSpeech(request);
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        // Экспоненциальная задержка
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
```

## Тестирование

### Unit тесты

```typescript
// tests/services/yandex-stt.service.test.ts

import { describe, it, expect, vi } from "vitest";
import { recognizeSpeech } from "../../src/services/yandex-stt.service";

describe("YandexSTT Service", () => {
  it("should recognize speech successfully", async () => {
    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: {
          alternatives: [{ text: "тестовый текст", confidence: 0.95 }],
        },
      }),
    });

    const result = await recognizeSpeech({
      apiKey: "test-key",
      folderId: "test-folder",
      audioBuffer: Buffer.from("test"),
    });

    expect(result).toBe("тестовый текст");
  });

  it("should handle API errors", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });

    await expect(
      recognizeSpeech({
        apiKey: "invalid-key",
        folderId: "test-folder",
        audioBuffer: Buffer.from("test"),
      })
    ).rejects.toThrow("Yandex STT API error: 401");
  });
});
```

---

**Эти примеры показывают полную реализацию голосовой функции с возможностью расширения!**
