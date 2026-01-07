/**
 * Error handling middleware
 */

import { MiddlewareFunction } from "../types/index.js";
import { handleError } from "../utils/errors.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("ErrorMiddleware");

/**
 * Global error handler middleware
 */
export const errorHandlerMiddleware: MiddlewareFunction = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    logger.error("Caught error in middleware", error as Error);
    try {
      await handleError(ctx, error as Error, "GlobalMiddleware");
    } catch (handleErrorFailure) {
      logger.error("handleError itself failed", handleErrorFailure as Error);
      // Last resort - try to send a simple message
      try {
        await ctx.reply("😕 Произошла ошибка. Попробуйте позже.");
      } catch (finalError) {
        logger.error("Final reply attempt failed", finalError as Error);
      }
    }
  }
};
