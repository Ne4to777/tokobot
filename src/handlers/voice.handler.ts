/**
 * Voice message handler
 * Обработка голосовых сообщений с распознаванием речи
 */

import { config, Constants } from "../config/index.js";
import { recognizeSpeech } from "../services/yandex-stt.service.js";
import { BotContext } from "../types/index.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("VoiceHandler");

/**
 * Генерация идеи на основе голосового запроса пользователя
 * Использует свободный промпт, понимающий естественный язык
 */
async function generateIdeaFromVoice(userRequest: string): Promise<string> {
  // Формируем промпт специально для голосовых запросов
  const prompt = buildVoicePrompt(userRequest);

  logger.info(`Generating idea from voice request: "${userRequest}"`);

  try {
    // Используем Groq API напрямую для голосовых запросов
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.aiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: Constants.GROQ_MODEL,
          messages: [
            {
              role: "system",
              content:
                "Ты - эксперт по AI-стартапам. Генерируешь конкретные, реалистичные идеи для небольших команд в России. Всегда отвечаешь в формате: ПРОБЛЕМА, РЕШЕНИЕ, МОНЕТИЗАЦИЯ, ROI с конкретными цифрами.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: Constants.GROQ_TEMPERATURE,
          max_tokens: Constants.GROQ_MAX_TOKENS,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Groq API error: ${response.status} - ${errorText}`);
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const idea = data.choices?.[0]?.message?.content?.trim();

    if (!idea) {
      throw new Error("Empty response from AI");
    }

    logger.info(`Idea generated successfully: ${idea.substring(0, 50)}...`);
    return idea;
  } catch (error) {
    logger.error("Failed to generate idea from voice", error as Error);
    // Возвращаем дружелюбное сообщение вместо ошибки
    return "Извините, не удалось сгенерировать идею. Попробуйте сформулировать запрос по-другому или используйте команду /idea.";
  }
}

/**
 * Проверяет, адресовано ли голосовое сообщение боту
 * Бот реагирует ТОЛЬКО на фразу "придумай идею" в начале
 */
function isAddressedToBot(text: string): boolean {
  const lowerText = text.toLowerCase().trim();

  // СТРОГАЯ проверка: только фраза "придумай идею"
  if (lowerText.startsWith("придумай идею")) {
    logger.info('Trigger phrase "придумай идею" found at start');
    return true;
  }

  logger.info(`Message does not start with "придумай идею", ignoring`);
  return false;
}

/**
 * Построение промпта для голосового запроса
 */
function buildVoicePrompt(userRequest: string): string {
  return `Пользователь попросил голосом: "${userRequest}"

Сгенерируй AI-first бизнес-идею, учитывая его запрос.

ТРЕБОВАНИЯ:
- Команда 2-5 человек
- Стартовый бюджет до 500к₽
- MVP за 1-3 месяца
- Рынок России
- AI - это ЯДРО продукта, не просто функция

ФОРМАТ ОТВЕТА (СТРОГО):
🎯 ПРОБЛЕМА: [1-2 предложения] конкретная боль + цифры
💡 РЕШЕНИЕ: [1-2 предложения] конкретная AI-технология (GPT-4, YOLOv8, Whisper и т.д.)
💰 МОНЕТИЗАЦИЯ: [1 предложение] модель + чек в рублях
📈 ROI: [1 предложение] экономия клиента в рублях или часах

ЗАПРЕЩЕНО:
❌ Общие фразы без конкретики
❌ "Машинное обучение", "алгоритмы AI" без указания технологии
❌ Доллары ($) - только рубли (₽)

ПРИМЕР:
🎯 ПРОБЛЕМА: Рестораны тратят 20 часов/нед на составление меню и прогноз закупок, потери от порчи продуктов 15% выручки.
💡 РЕШЕНИЕ: GPT-4 анализирует продажи за год, погоду, события в городе и генерирует меню + список закупок на неделю за 5 минут.
💰 МОНЕТИЗАЦИЯ: SaaS 12к₽/мес за ресторан или 5к₽/мес для кафе.
📈 ROI: Экономия 20 часов/нед (100к₽ при ЗП шефа 200к₽) + снижение порчи на 10% (50к₽/мес) = 135к₽/мес экономии.

Твой ответ:`;
}

/**
 * Обработчик голосовых сообщений
 * 1. Скачивает голосовое сообщение
 * 2. Отправляет в Yandex SpeechKit для распознавания
 * 3. Генерирует бизнес-идею на основе распознанного текста
 */
export async function voiceHandler(ctx: BotContext): Promise<void> {
  const startTime = Date.now();
  try {
    // Check if message has voice
    if (!ctx.message || !("voice" in ctx.message)) {
      return;
    }

    const voice = ctx.message.voice;

    logger.info(
      `Received voice message (duration: ${voice.duration}s, size: ${voice.file_size} bytes)`
    );

    // Проверяем наличие необходимых API ключей
    if (!config.yandexApiKey || !config.yandexFolderId) {
      await ctx.reply(
        "❌ Голосовые сообщения недоступны: не настроены Yandex API ключи.\n\n" +
          "Для работы с голосовыми сообщениями требуются:\n" +
          "• YANDEX_API_KEY\n" +
          "• YANDEX_FOLDER_ID\n\n" +
          "Текущие команды работают: /idea, /help"
      );
      return;
    }

    // Ограничение по длительности (макс 30 секунд для синхронного API)
    if (voice.duration > 30) {
      await ctx.reply(
        "⏱ Голосовое сообщение слишком длинное.\n\n" +
          "Пожалуйста, отправьте сообщение не длиннее 30 секунд."
      );
      return;
    }

    // Отправляем статус "печатает..." чтобы показать, что бот работает
    await ctx.sendChatAction("typing");

    // Шаг 1: Скачиваем голосовое сообщение
    logger.info("Step 1: Downloading audio...");
    const downloadStart = Date.now();
    const fileLink = await ctx.telegram.getFileLink(voice.file_id);
    
    const audioResponse = await Promise.race([
      fetch(fileLink.href),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Audio download timeout")), 10000)
      ),
    ]);

    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio: ${audioResponse.status}`);
    }

    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
    logger.info(`Audio downloaded in ${Date.now() - downloadStart}ms: ${audioBuffer.length} bytes`);

    // Шаг 2: Распознаем речь
    logger.info("Step 2: Recognizing speech...");
    const sttStart = Date.now();
    const recognizedText = await Promise.race([
      recognizeSpeech({
        apiKey: config.yandexApiKey!,
        folderId: config.yandexFolderId!,
        audioBuffer,
        languageCode: "ru-RU",
        format: "oggopus",
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("STT timeout")), 15000)
      ),
    ]);

    logger.info(`Speech recognized in ${Date.now() - sttStart}ms: "${recognizedText}"`);

    // Проверяем, адресовано ли сообщение боту
    // Бот реагирует ТОЛЬКО на фразу "придумай идею"
    if (!isAddressedToBot(recognizedText)) {
      logger.info("Voice message not addressed to bot, ignoring silently");
      return;
    }

    // Шаг 3: Генерируем бизнес-идею на основе голосового запроса
    logger.info("Step 3: Generating idea...");
    const ideaStart = Date.now();
    const idea = await Promise.race([
      generateIdeaFromVoice(recognizedText),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Idea generation timeout")), 20000)
      ),
    ]);
    logger.info(`Idea generated in ${Date.now() - ideaStart}ms`);

    // Отправляем только финальный ответ с идеей
    await ctx.reply(`💡 ${idea}`);

    logger.info(`Voice message processed successfully in ${Date.now() - startTime}ms`);
  } catch (error) {
    logger.error("Error processing voice message", error as Error);

    // Обработка специфичных ошибок
    const errorMessage = (error as Error).message;

    if (errorMessage.includes("Yandex STT")) {
      await ctx.reply(
        "❌ Не удалось распознать речь.\n\n" +
          "Возможные причины:\n" +
          "• Плохое качество звука\n" +
          "• Слишком тихая запись\n" +
          "• Проблемы с Yandex SpeechKit API\n\n" +
          "Попробуйте записать сообщение еще раз."
      );
    } else if (errorMessage.includes("download audio")) {
      await ctx.reply(
        "❌ Не удалось загрузить голосовое сообщение.\n\n" +
          "Попробуйте отправить его еще раз."
      );
    } else {
      await ctx.reply(
        "❌ Произошла ошибка при обработке голосового сообщения.\n\n" +
          "Попробуйте еще раз или используйте текстовые команды."
      );
    }
  }
}
