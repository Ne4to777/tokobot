/**
 * Core TypeScript types for Tokobot
 */

import { Context } from "telegraf";

/**
 * Bot context with custom properties
 */
export interface BotContext extends Context {
  session?: UserSession;
}

/**
 * User session data
 */
export interface UserSession {
  userId: number;
  username?: string;
  lastCommand?: string;
  createdAt: Date;
}

/**
 * Command handler function type
 */
export type CommandHandler = (ctx: BotContext) => Promise<void>;

/**
 * Middleware function type
 */
export type MiddlewareFunction = (
  ctx: BotContext,
  next: () => Promise<void>
) => Promise<void>;

/**
 * AI idea generation options
 */
export interface IdeaGenerationOptions {
  topic?: string;
  useAI?: boolean;
  language?: "ru" | "en";
}

/**
 * Generated idea result
 */
export interface GeneratedIdea {
  text: string;
  topic?: string;
  generatedBy: "ai" | "local";
  timestamp: Date;
}

/**
 * Lead data for CRM
 */
export interface LeadData {
  name: string;
  phone?: string;
  email?: string;
  comment?: string;
  source?: string;
}

/**
 * Bot configuration
 */
export interface BotConfig {
  token: string;
  environment: "development" | "production";
  aiEnabled: boolean;
  aiToken?: string;
  aiProvider: "groq" | "gemini" | "huggingface";
  bitrix24Webhook?: string;
}

/**
 * Error types for better error handling
 */
export enum ErrorType {
  VALIDATION = "VALIDATION",
  AI_SERVICE = "AI_SERVICE",
  CRM_SERVICE = "CRM_SERVICE",
  TELEGRAM_API = "TELEGRAM_API",
  UNKNOWN = "UNKNOWN",
}

/**
 * Custom error class
 */
export class BotError extends Error {
  constructor(
    message: string,
    public type: ErrorType,
    public originalError?: Error
  ) {
    super(message);
    this.name = "BotError";
  }
}
