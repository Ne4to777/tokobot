/**
 * Centralized configuration for Tokobot
 */

import dotenv from "dotenv";
import { BotConfig } from "../types/index.js";

// Load environment variables
dotenv.config();

/**
 * Validate required environment variables
 */
function validateEnv(): void {
  if (!process.env.BOT_TOKEN) {
    throw new Error("BOT_TOKEN must be provided in environment variables!");
  }
}

/**
 * Get bot configuration from environment
 */
export function getConfig(): BotConfig {
  validateEnv();

  // 🔍 ДИАГНОСТИКА: Логируем все переменные окружения
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔍 ДИАГНОСТИКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(
    "BOT_TOKEN:",
    process.env.BOT_TOKEN ? "✅ SET" : "❌ NOT SET"
  );
  console.log(
    "YANDEX_API_KEY:",
    process.env.YANDEX_API_KEY
      ? `✅ SET (${process.env.YANDEX_API_KEY.substring(0, 10)}...)`
      : "❌ NOT SET"
  );
  console.log(
    "YANDEX_FOLDER_ID:",
    process.env.YANDEX_FOLDER_ID
      ? `✅ SET (${process.env.YANDEX_FOLDER_ID})`
      : "❌ NOT SET"
  );
  console.log(
    "AI_PROVIDER:",
    process.env.AI_PROVIDER || "yandexgpt (default)"
  );
  console.log(
    "NODE_ENV:",
    process.env.NODE_ENV || "development (default)"
  );
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Определяем AI провайдера (YandexGPT по умолчанию для РФ)
  const aiProvider = (process.env.AI_PROVIDER || "yandexgpt") as
    | "yandexgpt"
    | "groq"
    | "gemini"
    | "huggingface";

  // Получаем токен в зависимости от провайдера
  let aiToken: string | undefined;
  switch (aiProvider) {
    case "yandexgpt":
      aiToken = process.env.YANDEX_API_KEY;
      break;
    case "groq":
      aiToken = process.env.GROQ_API_KEY;
      break;
    case "gemini":
      aiToken = process.env.GEMINI_API_KEY;
      break;
    case "huggingface":
      aiToken = process.env.HUGGINGFACE_TOKEN;
      break;
    default:
      aiToken = process.env.YANDEX_API_KEY;
  }

  console.log(
    `🤖 AI Provider: ${aiProvider}, Token: ${aiToken ? "✅ SET" : "❌ NOT SET"}`
  );

  return {
    token: process.env.BOT_TOKEN!,
    environment:
      (process.env.NODE_ENV as "development" | "production") || "development",
    aiEnabled: !!aiToken,
    aiToken,
    aiProvider,
    yandexFolderId: process.env.YANDEX_FOLDER_ID,
    bitrix24Webhook: process.env.BITRIX24_WEBHOOK,
  };
}

/**
 * Application constants
 */
export const Constants = {
  // Bot messages
  WELCOME_MESSAGE:
    "👋 Привет! Я генератор AI-first бизнес идей.\n\n" +
    "🚀 Я предлагаю идеи, где искусственный интеллект - это ЯДРО продукта,\n" +
    "а не просто вспомогательный инструмент.\n\n" +
    "💡 Все идеи для небольших команд (2-5 человек) и невозможны без AI/ML.",

  // Available topics
  TOPICS: [
    "sales",
    "marketing",
    "hr",
    "product",
    "support",
    "finance",
  ] as const,

  // AI settings - HuggingFace
  AI_MODEL: "mistralai/Mistral-7B-Instruct-v0.2",
  AI_MAX_TOKENS: 200,
  AI_TEMPERATURE: 0.8,

  // AI settings - Gemini
  GEMINI_MODEL: "gemini-2.0-flash-exp",
  GEMINI_MAX_TOKENS: 500,
  GEMINI_TEMPERATURE: 0.9,

  // AI settings - Groq
  GROQ_MODEL: "llama-3.3-70b-versatile",
  GROQ_MAX_TOKENS: 500,
  GROQ_TEMPERATURE: 0.9,

  // AI settings - YandexGPT (рекомендуется для РФ - бесплатно!)
  YANDEX_MODEL: "yandexgpt-lite", // Бесплатная модель: 1000 запросов/месяц
  YANDEX_MAX_TOKENS: 500,
  YANDEX_TEMPERATURE: 0.8,

  // Timeouts
  REQUEST_TIMEOUT: 10000, // 10 seconds (YandexGPT может быть медленнее)

  // Rate limiting
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 10,
} as const;

/**
 * Export config instance
 */
export const config = getConfig();
