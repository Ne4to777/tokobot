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

  return {
    token: process.env.BOT_TOKEN!,
    environment:
      (process.env.NODE_ENV as "development" | "production") || "development",
    aiEnabled: !!process.env.HUGGINGFACE_TOKEN,
    aiToken: process.env.HUGGINGFACE_TOKEN,
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
  TOPICS: ["sales", "marketing", "hr", "product", "support", "finance"] as const,

  // AI settings
  AI_MODEL: "mistralai/Mistral-7B-Instruct-v0.2",
  AI_MAX_TOKENS: 200,
  AI_TEMPERATURE: 0.8,

  // Timeouts
  REQUEST_TIMEOUT: 8000, // 8 seconds (Vercel free tier is 10s)

  // Rate limiting
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 10,
} as const;

/**
 * Export config instance
 */
export const config = getConfig();

