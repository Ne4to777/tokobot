/**
 * Refactored webhook handler with modular architecture
 */

import { Telegraf } from "telegraf";
import { config } from "../src/config/index.js";
import { BotContext } from "../src/types/index.js";
import { createLogger } from "../src/utils/logger.js";

// Middleware
import {
  analyticsMiddleware,
  errorHandlerMiddleware,
  loggingMiddleware,
  rateLimitMiddleware,
} from "../src/middleware/index.js";

// Handlers
import {
  contactHandler,
  handleContactFlow,
  helpHandler,
  ideaHandler,
  startHandler,
  voiceHandler,
} from "../src/handlers/index.js";

const logger = createLogger("Webhook");

// Initialize bot
const bot = new Telegraf<BotContext>(config.token);

// Apply middleware (order matters!)
bot.use(errorHandlerMiddleware);
bot.use(loggingMiddleware);
bot.use(analyticsMiddleware);
bot.use(rateLimitMiddleware);

// Register command handlers
bot.command("start", startHandler);
bot.command("help", helpHandler);
bot.command("idea", ideaHandler);
bot.command("contact", contactHandler);

// Handle voice messages
bot.on("voice", voiceHandler);

// Handle text messages (for contact flow)
bot.on("text", handleContactFlow);

// Handle unknown commands
bot.on("message", async (ctx) => {
  // Игнорируем голосовые сообщения - они обрабатываются отдельно
  if (ctx.message && "voice" in ctx.message) {
    return;
  }

  await ctx.reply(
    "❓ Команда не распознана.\n\n" +
      "Используйте /help чтобы увидеть список доступных команд."
  );
});

// Catch all unhandled errors in bot
bot.catch((error, ctx) => {
  logger.error("Unhandled bot error", error as Error);
  // Try to notify user
  ctx
    .reply("😕 Произошла ошибка. Пожалуйста, попробуйте позже.")
    .catch((replyError) => {
      logger.error("Failed to send error notification", replyError as Error);
    });
});

/**
 * Vercel serverless function handler
 */
export default async (req: any, res: any) => {
  try {
    if (req.method === "POST") {
      // Handle Telegram webhook (removed timeout - let error handlers catch issues)
      await bot.handleUpdate(req.body, res);

      // Ensure response is sent (if not already sent by Telegraf)
      if (!res.headersSent) {
        res.status(200).json({ ok: true });
      }
    } else if (req.method === "GET") {
      // Health check endpoint
      res.status(200).json({
        status: "ok",
        message: "Tokobot is running! (Refactored)",
        version: "2.0.0",
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    logger.error("Webhook error", error as Error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

/**
 * Local development mode
 */
if (config.environment === "development") {
  logger.info("🚀 Starting bot in development mode (polling)...");

  bot
    .launch()
    .then(() => {
      logger.info("✅ Bot is running in development mode");
      logger.info("📱 Send messages to your bot in Telegram!");
    })
    .catch((error) => {
      logger.error("❌ Failed to start bot", error);
      process.exit(1);
    });

  // Graceful shutdown
  process.once("SIGINT", () => {
    logger.info("Received SIGINT, stopping bot...");
    bot.stop("SIGINT");
  });

  process.once("SIGTERM", () => {
    logger.info("Received SIGTERM, stopping bot...");
    bot.stop("SIGTERM");
  });
}
