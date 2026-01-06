/**
 * Logging middleware
 */

import { MiddlewareFunction } from "../types/index.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("Middleware:Logging");

/**
 * Log incoming messages and commands
 */
export const loggingMiddleware: MiddlewareFunction = async (ctx, next) => {
  const userId = ctx.from?.id;
  const username = ctx.from?.username || "unknown";
  const messageText =
    ctx.message && "text" in ctx.message ? ctx.message.text : "non-text";

  logger.info(
    `Incoming message from user ${userId} (@${username}): ${messageText}`
  );

  const startTime = Date.now();

  try {
    await next();
    const duration = Date.now() - startTime;
    logger.debug(`Request processed in ${duration}ms`);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`Request failed after ${duration}ms`, error as Error);
    throw error;
  }
};
