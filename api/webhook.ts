import { Telegraf } from "telegraf";
import { generateIdea } from "../lib/ai.js";
import { createLead, addLeadComment } from "../lib/bitrix24.js";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const ENVIRONMENT = process.env.NODE_ENV || "development";

if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN must be provided!");
}

const bot = new Telegraf(BOT_TOKEN);

// Start command
bot.command("start", (ctx) => {
  ctx.reply(
    "👋 Привет! Я генератор AI-first бизнес идей.\n\n" +
    "🚀 Я предлагаю идеи, где искусственный интеллект - это ЯДРО продукта,\n" +
    "а не просто вспомогательный инструмент.\n\n" +
    "💡 Все идеи для небольших команд (2-5 человек) и невозможны без AI/ML.\n\n" +
    "Используйте /idea для случайной идеи или /idea <область> для специфичной:\n\n" +
    "📋 Доступные области:\n" +
    "• /idea sales - AI для продаж и лидогенерации\n" +
    "• /idea marketing - AI для маркетинга и контента\n" +
    "• /idea hr - AI для рекрутинга и HR\n" +
    "• /idea product - AI для продуктовой разработки\n" +
    "• /idea support - AI для клиентской поддержки\n" +
    "• /idea finance - AI для финансов и аналитики"
  );
});

// Help command
bot.command("help", (ctx) => {
  ctx.reply(
    "📖 Доступные команды:\n\n" +
    "/start - Начать работу с ботом\n" +
    "/idea - Получить случайную AI-first бизнес идею\n" +
    "/idea <область> - Получить идею в конкретной области\n" +
    "/help - Показать эту справку\n\n" +
    "💡 Области для генерации идей:\n" +
    "sales, marketing, hr, product, support, finance\n\n" +
    "🎯 Все идеи про бизнес, где AI - это КЛЮЧЕВОЙ ЭЛЕМЕНТ,\n" +
    "без которого продукт не может существовать.\n" +
    "Подходят для команд 2-5 человек."
  );
});

// Idea command
bot.command("idea", async (ctx) => {
  const message = ctx.message.text;
  const topic = message.split(" ").slice(1).join(" ");
  
  console.log(`📨 Received /idea command from user ${ctx.from?.id} (${ctx.from?.username || 'no username'})`);
  console.log(`   Topic: ${topic || 'random'}`);

  // Send "typing" action
  await ctx.sendChatAction("typing");

  try {
    const idea = await generateIdea(topic || undefined);
    await ctx.reply(`💡 ${idea}`);
    console.log(`✅ Sent idea successfully`);
    
    // Опционально: создаем активность в Битрикс24 для трекинга интереса
    // Раскомментируйте если хотите трекать каждый запрос идеи как лид
    /*
    await createLead({
      title: `Интерес к AI-бизнесу: ${topic || "общий"}`,
      name: ctx.from?.first_name || "Telegram User",
      comments: `Запросил идею по теме: ${topic || "случайная"}\nСгенерированная идея: ${idea}`,
      source: "TELEGRAM_BOT",
      userId: ctx.from?.id,
      username: ctx.from?.username,
    });
    */
  } catch (error) {
    console.error("❌ Error generating idea:", error);
    await ctx.reply(
      "😔 Извините, произошла ошибка при генерации идеи. Попробуйте еще раз."
    );
  }
});

// Contact command - сбор контактов для лидогенерации
bot.command("contact", async (ctx) => {
  await ctx.reply(
    "📝 Хотите получить консультацию по внедрению AI в ваш бизнес?\n\n" +
    "Отправьте ваши контакты в формате:\n" +
    "Имя: Иван Петров\n" +
    "Телефон: +79001234567\n" +
    "Email: ivan@company.com\n" +
    "Комментарий: Интересует автоматизация поддержки"
  );
});

// Handle all other messages - проверяем на контактную информацию
bot.on("message", async (ctx) => {
  const text = ctx.message && "text" in ctx.message ? ctx.message.text : "";
  
  // Проверяем, похоже ли сообщение на контактную информацию
  if (text.includes("Имя:") || text.includes("Телефон:") || text.includes("Email:")) {
    try {
      // Парсим контактную информацию
      const nameMatch = text.match(/Имя:\s*(.+)/i);
      const phoneMatch = text.match(/Телефон:\s*(.+)/i);
      const emailMatch = text.match(/Email:\s*(.+)/i);
      const commentMatch = text.match(/Комментарий:\s*(.+)/i);

      const name = nameMatch ? nameMatch[1].trim() : undefined;
      const phone = phoneMatch ? phoneMatch[1].trim() : undefined;
      const email = emailMatch ? emailMatch[1].trim() : undefined;
      const comment = commentMatch ? commentMatch[1].trim() : undefined;

      // Создаем лид в Битрикс24
      const leadId = await createLead({
        title: `Лид из Telegram бота: ${name || ctx.from?.first_name || "Без имени"}`,
        name: name || ctx.from?.first_name,
        phone: phone,
        email: email,
        comments: comment ? `${comment}\n\nTelegram: @${ctx.from?.username || ctx.from?.id}` : `Telegram: @${ctx.from?.username || ctx.from?.id}`,
        source: "TELEGRAM_BOT",
        userId: ctx.from?.id,
        username: ctx.from?.username,
      });

      if (leadId) {
        await ctx.reply(
          "✅ Спасибо! Ваша заявка принята.\n" +
          "Наш менеджер свяжется с вами в ближайшее время."
        );
        console.log(`📊 New lead created in Bitrix24: ${leadId}`);
      } else {
        await ctx.reply(
          "✅ Спасибо за интерес! Мы получили ваши данные."
        );
      }
    } catch (error) {
      console.error("Error processing contact info:", error);
      await ctx.reply(
        "✅ Спасибо! Мы получили ваше сообщение."
      );
    }
  } else {
    ctx.reply(
      "Я понимаю только команды. Используйте /help чтобы увидеть список доступных команд.\n\n" +
      "Или /contact чтобы оставить заявку на консультацию."
    );
  }
});

// Export for Vercel serverless
export default async (req: any, res: any) => {
  try {
    if (req.method === "POST") {
      await bot.handleUpdate(req.body, res);
      res.status(200).json({ ok: true });
    } else if (req.method === "GET") {
      // Health check endpoint
      res.status(200).json({ 
        status: "ok", 
        message: "Tokobot is running!",
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// For local development
if (ENVIRONMENT === "development") {
  console.log("🚀 Starting bot in development mode...");
  bot.launch()
    .then(() => {
      console.log("✅ Bot is running in development mode (polling)");
      console.log("📱 You can now send messages to your bot in Telegram!");
    })
    .catch((error) => {
      console.error("❌ Failed to start bot:", error);
      process.exit(1);
    });

  // Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}

