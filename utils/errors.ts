/**
 * Error handling utilities
 */

import { BotContext, BotError, ErrorType } from "../types/index.js";
import { createLogger } from "./logger.js";

const logger = createLogger("ErrorHandler");

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.VALIDATION]:
    "❌ Неверный формат данных. Пожалуйста, проверьте и попробуйте снова.",
  [ErrorType.AI_SERVICE]:
    "🤖 Извините, AI сервис временно недоступен. Попробуйте позже или используйте /idea без параметров.",
  [ErrorType.CRM_SERVICE]:
    "💼 Не удалось создать заявку в CRM. Пожалуйста, свяжитесь с нами напрямую.",
  [ErrorType.TELEGRAM_API]:
    "📱 Ошибка Telegram API. Пожалуйста, попробуйте еще раз.",
  [ErrorType.UNKNOWN]:
    "😕 Произошла непредвиденная ошибка. Пожалуйста, попробуйте позже.",
};

/**
 * Handle error and send user-friendly message
 */
export async function handleError(
  ctx: BotContext,
  error: Error | BotError,
  context?: string
): Promise<void> {
  logger.error(`Error in ${context || "unknown context"}`, error);

  let message = ERROR_MESSAGES[ErrorType.UNKNOWN];

  if (error instanceof BotError) {
    message = ERROR_MESSAGES[error.type] || message;
  }

  try {
    await ctx.reply(message);
  } catch (replyError) {
    logger.error("Failed to send error message to user", replyError as Error);
  }
}

/**
 * Create typed error
 */
export function createError(
  message: string,
  type: ErrorType,
  originalError?: Error
): BotError {
  return new BotError(message, type, originalError);
}

/**
 * Validate required fields
 */
export function validateRequired<T>(data: T, fields: (keyof T)[]): void {
  for (const field of fields) {
    if (!data[field]) {
      throw createError(
        `Missing required field: ${String(field)}`,
        ErrorType.VALIDATION
      );
    }
  }
}
