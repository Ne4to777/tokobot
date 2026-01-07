/**
 * Error handling middleware
 */

import { MiddlewareFunction } from "../types/index.js";
import { handleError } from "../utils/errors.js";

/**
 * Global error handler middleware
 */
export const errorHandlerMiddleware: MiddlewareFunction = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    await handleError(ctx, error as Error, "GlobalMiddleware");
  }
};
