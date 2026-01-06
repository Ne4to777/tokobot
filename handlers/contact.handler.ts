/**
 * /contact command handler
 */

import { crmService } from "../services/crm.service.js";
import { CommandHandler } from "../types/index.js";
import { handleError } from "../utils/errors.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("Handler:Contact");

// Simple state management for contact flow
const contactStates = new Map<number, { step: "awaiting_name" | "awaiting_phone" | "awaiting_email"; name?: string; phone?: string }>();

export const contactHandler: CommandHandler = async (ctx) => {
  const userId = ctx.from?.id;

  if (!userId) {
    await ctx.reply("Ошибка: не удалось идентифицировать пользователя.");
    return;
  }

  logger.info(`Contact command from user ${userId}`);

  if (!crmService.isEnabled()) {
    await ctx.reply(
      "💼 К сожалению, функция сбора заявок временно недоступна.\n\n" +
        "Вы можете связаться с нами напрямую или попробовать позже."
    );
    return;
  }

  // Start contact flow
  contactStates.set(userId, { step: "awaiting_name" });

  await ctx.reply(
    "📝 Давайте оставим заявку на консультацию!\n\n" +
      "Как вас зовут?"
  );
};

/**
 * Handle text messages for contact flow
 */
export const handleContactFlow: CommandHandler = async (ctx) => {
  const userId = ctx.from?.id;
  const text = ctx.message && "text" in ctx.message ? ctx.message.text : "";

  if (!userId || !text || !contactStates.has(userId)) {
    return;
  }

  const state = contactStates.get(userId)!;

  try {
    switch (state.step) {
      case "awaiting_name":
        state.name = text;
        state.step = "awaiting_phone";
        contactStates.set(userId, state);

        await ctx.reply(
          `Приятно познакомиться, ${state.name}!\n\n` +
            "Теперь укажите ваш телефон (или напишите 'пропустить'):"
        );
        break;

      case "awaiting_phone":
        if (text.toLowerCase() !== "пропустить") {
          state.phone = text;
        }
        state.step = "awaiting_email";
        contactStates.set(userId, state);

        await ctx.reply(
          "Отлично! Последний шаг - укажите email (или напишите 'пропустить'):"
        );
        break;

      case "awaiting_email":
        const email = text.toLowerCase() !== "пропустить" ? text : undefined;

        // Create lead in CRM
        await ctx.sendChatAction("typing");

        const leadId = await crmService.createLead({
          name: state.name!,
          phone: state.phone,
          email,
          source: "TELEGRAM_BOT",
          comment: `Telegram ID: ${userId}`,
        });

        // Clear state
        contactStates.delete(userId);

        await ctx.reply(
          "✅ Спасибо! Ваша заявка принята.\n\n" +
            "Мы свяжемся с вами в ближайшее время!\n\n" +
            "💡 А пока можете попробовать /idea для новых AI-бизнес идей."
        );

        logger.info(`Lead ${leadId} created for user ${userId}`);
        break;
    }
  } catch (error) {
    contactStates.delete(userId);
    await handleError(ctx, error as Error, "ContactFlow");
  }
};

