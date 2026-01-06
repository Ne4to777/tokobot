/**
 * /help command handler
 */

import { CommandHandler } from "../types/index.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("Handler:Help");

export const helpHandler: CommandHandler = async (ctx) => {
  logger.info("Help command received");

  const message =
    "📖 Доступные команды:\n\n" +
    "/start - Начать работу с ботом\n" +
    "/idea - Получить случайную AI-first бизнес идею\n" +
    "/idea <область> - Получить идею в конкретной области\n" +
    "/contact - Оставить заявку на консультацию\n" +
    "/help - Показать эту справку\n\n" +
    "💡 Области для генерации идей:\n" +
    "sales, marketing, hr, product, support, finance\n\n" +
    "🎯 Все идеи про бизнес, где AI - это КЛЮЧЕВОЙ ЭЛЕМЕНТ,\n" +
    "без которого продукт не может существовать.\n" +
    "Подходят для команд 2-5 человек.";

  await ctx.reply(message);
};
