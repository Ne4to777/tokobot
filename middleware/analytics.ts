/**
 * Analytics middleware
 * Tracks all bot interactions
 */

import { analyticsService, EventType } from "../services/analytics.service.js";
import type { BotContext } from "../types/index.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("Middleware:Analytics");

/**
 * Analytics middleware
 * Tracks commands and interactions
 */
export const analyticsMiddleware = async (
  ctx: BotContext,
  next: () => Promise<void>
) => {
  const userId = ctx.from?.id;
  const username = ctx.from?.username;

  if (!userId) {
    return next();
  }

  // Track command if it's a command message
  if (ctx.message && "text" in ctx.message) {
    const text = ctx.message.text;

    if (text.startsWith("/")) {
      const command = text.split(" ")[0].substring(1);

      analyticsService.track({
        type: EventType.COMMAND_USED,
        userId,
        username,
        timestamp: new Date(),
        data: { command, fullText: text },
      });

      logger.debug("Command tracked", { userId, command });
    }
  }

  // Track user registration (first interaction)
  if (!analyticsService.getUserStats(userId)) {
    analyticsService.track({
      type: EventType.USER_REGISTERED,
      userId,
      username,
      timestamp: new Date(),
    });

    logger.info("New user registered", { userId, username });
  }

  return next();
};

