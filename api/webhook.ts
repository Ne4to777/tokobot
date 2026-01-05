import { Telegraf } from "telegraf";
import { generateIdea } from "../lib/ai";

const BOT_TOKEN = process.env.BOT_TOKEN;
const ENVIRONMENT = process.env.NODE_ENV || "development";

if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN must be provided!");
}

const bot = new Telegraf(BOT_TOKEN);

// Start command
bot.command("start", (ctx) => {
  ctx.reply(
    "👋 Привет! Я бот для генерации идей.\n\n" +
    "Используйте команду /idea чтобы получить случайную идею.\n" +
    "Или /idea <тема> чтобы получить идею на конкретную тему.\n\n" +
    "Примеры:\n" +
    "• /idea\n" +
    "• /idea tech\n" +
    "• /idea business\n" +
    "• /idea social"
  );
});

// Help command
bot.command("help", (ctx) => {
  ctx.reply(
    "📖 Доступные команды:\n\n" +
    "/start - Начать работу с ботом\n" +
    "/idea - Получить случайную идею\n" +
    "/idea <тема> - Получить идею на тему\n" +
    "/help - Показать эту справку"
  );
});

// Idea command
bot.command("idea", async (ctx) => {
  const message = ctx.message.text;
  const topic = message.split(" ").slice(1).join(" ");

  // Send "typing" action
  await ctx.sendChatAction("typing");

  try {
    const idea = await generateIdea(topic || undefined);
    await ctx.reply(`💡 ${idea}`);
  } catch (error) {
    console.error("Error generating idea:", error);
    await ctx.reply(
      "😔 Извините, произошла ошибка при генерации идеи. Попробуйте еще раз."
    );
  }
});

// Handle all other messages
bot.on("message", (ctx) => {
  ctx.reply(
    "Я понимаю только команды. Используйте /help чтобы увидеть список доступных команд."
  );
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
  bot.launch().then(() => {
    console.log("🤖 Bot is running in development mode (polling)");
  });

  // Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}

