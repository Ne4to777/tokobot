/**
 * Rate limiting middleware
 */

import { Constants } from "../config/index.js";
import { MiddlewareFunction } from "../types/index.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("Middleware:RateLimit");

// Simple in-memory rate limit store
// In production, use Redis or similar
const rateLimitStore = new Map<number, { count: number; resetAt: number }>();

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [userId, data] of rateLimitStore.entries()) {
    if (data.resetAt < now) {
      rateLimitStore.delete(userId);
    }
  }
}, Constants.RATE_LIMIT_WINDOW);

/**
 * Rate limiting middleware
 */
export const rateLimitMiddleware: MiddlewareFunction = async (ctx, next) => {
  const userId = ctx.from?.id;

  if (!userId) {
    await next();
    return;
  }

  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || userLimit.resetAt < now) {
    // Reset limit
    rateLimitStore.set(userId, {
      count: 1,
      resetAt: now + Constants.RATE_LIMIT_WINDOW,
    });
    await next();
    return;
  }

  if (userLimit.count >= Constants.RATE_LIMIT_MAX_REQUESTS) {
    logger.warn(`Rate limit exceeded for user ${userId}`);
    await ctx.reply(
      "⏱️ Слишком много запросов. Пожалуйста, подождите минуту и попробуйте снова."
    );
    return;
  }

  userLimit.count++;
  await next();
};

