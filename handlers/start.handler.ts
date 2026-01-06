/**
 * /start command handler
 */

import { Constants } from "../config/index.js";
import { CommandHandler } from "../types/index.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("Handler:Start");

export const startHandler: CommandHandler = async (ctx) => {
  logger.info("Start command received");

  const message =
    Constants.WELCOME_MESSAGE +
    "\n\n" +
    "Используйте /idea для случайной идеи или /idea <область> для специфичной:\n\n" +
    "📋 Доступные области:\n" +
    "• /idea sales - AI для продаж и лидогенерации\n" +
    "• /idea marketing - AI для маркетинга и контента\n" +
    "• /idea hr - AI для рекрутинга и HR\n" +
    "• /idea product - AI для продуктовой разработки\n" +
    "• /idea support - AI для клиентской поддержки\n" +
    "• /idea finance - AI для финансов и аналитики\n\n" +
    "💼 Или /contact чтобы оставить заявку на консультацию.";

  await ctx.reply(message);
};

