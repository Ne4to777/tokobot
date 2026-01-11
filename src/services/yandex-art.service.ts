/**
 * YandexART image generation service
 * Документация: https://cloud.yandex.ru/docs/foundation-models/image-generation/api-ref/
 */

import { createLogger } from "../utils/logger.js";

const logger = createLogger("YandexART");

interface GenerateImageRequest {
  apiKey: string;
  folderId: string;
  prompt: string;
  model?: string;
}

interface YandexARTResponse {
  id: string;
  description?: string;
  createdAt: string;
  createdBy: string;
  modifiedAt: string;
  done: boolean;
  metadata?: any;
  response?: {
    image: string; // base64
    modelVersion: string;
  };
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Генерация изображения через YandexART
 * API работает асинхронно: сначала создаем задачу, потом проверяем статус
 */
export async function generateImage(
  request: GenerateImageRequest
): Promise<Buffer> {
  const {
    apiKey,
    folderId,
    prompt,
    model = "yandex-art/latest", // Модель по умолчанию
  } = request;

  logger.info(`Generating image for prompt: "${prompt.substring(0, 50)}..."`);

  try {
    // Шаг 1: Создаем задачу генерации
    const createUrl =
      "https://llm.api.cloud.yandex.net/foundationModels/v1/imageGenerationAsync";

    logger.info("Creating image generation task...");
    const createResponse = await fetch(createUrl, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        modelUri: `art://${folderId}/${model}`,
        generationOptions: {
          seed: Math.floor(Math.random() * 1000000),
          aspectRatio: {
            widthRatio: 16,
            heightRatio: 9,
          },
        },
        messages: [
          {
            weight: 1,
            text: prompt,
          },
        ],
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      logger.error(
        `Failed to create task: ${createResponse.status} - ${errorText}`
      );
      throw new Error(`YandexART API error: ${createResponse.status}`);
    }

    const taskData = (await createResponse.json()) as { id: string };
    const operationId = taskData.id;
    logger.info(`Task created: ${operationId}`);

    // Шаг 2: Ждем завершения генерации (polling)
    const checkUrl = `https://llm.api.cloud.yandex.net:443/operations/${operationId}`;
    const maxAttempts = 30; // Максимум 30 попыток
    const pollInterval = 2000; // 2 секунды между попытками

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      logger.info(`Checking status, attempt ${attempt}/${maxAttempts}...`);

      const checkResponse = await fetch(checkUrl, {
        method: "GET",
        headers: {
          Authorization: `Api-Key ${apiKey}`,
        },
      });

      if (!checkResponse.ok) {
        const errorText = await checkResponse.text();
        logger.error(
          `Failed to check status: ${checkResponse.status} - ${errorText}`
        );
        throw new Error(`Status check failed: ${checkResponse.status}`);
      }

      const statusData = (await checkResponse.json()) as YandexARTResponse;

      if (statusData.error) {
        logger.error(`Generation error: ${statusData.error.message}`);
        throw new Error(`Generation failed: ${statusData.error.message}`);
      }

      if (statusData.done && statusData.response?.image) {
        logger.info("Image generated successfully");
        // Декодируем base64 в Buffer
        const imageBuffer = Buffer.from(statusData.response.image, "base64");
        logger.info(`Image size: ${imageBuffer.length} bytes`);
        return imageBuffer;
      }

      // Если еще не готово - ждем перед следующей попыткой
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      }
    }

    throw new Error("Image generation timeout - took too long");
  } catch (error) {
    logger.error("Failed to generate image", error as Error);
    throw error;
  }
}

/**
 * Извлекает и обобщает ключевые слова из идеи до безопасных категорий
 */
function extractSafeKeywords(idea: string): string {
  const ideLower = idea.toLowerCase();

  // Технологии AI (безопасные термины)
  const aiTech: string[] = [];
  if (
    ideLower.includes("зрени") ||
    ideLower.includes("распознав") ||
    ideLower.includes("детекц")
  ) {
    aiTech.push("компьютерное зрение");
  }
  if (
    ideLower.includes("языков") ||
    ideLower.includes("текст") ||
    ideLower.includes("gpt")
  ) {
    aiTech.push("обработка языка");
  }
  if (
    ideLower.includes("голос") ||
    ideLower.includes("речь") ||
    ideLower.includes("аудио")
  ) {
    aiTech.push("голосовые технологии");
  }
  if (
    ideLower.includes("данны") ||
    ideLower.includes("аналитик") ||
    ideLower.includes("прогноз")
  ) {
    aiTech.push("анализ данных");
  }

  // Сферы (обобщенные, безопасные)
  const sphere: string[] = [];
  if (
    ideLower.includes("образован") ||
    ideLower.includes("обучен") ||
    ideLower.includes("школ") ||
    ideLower.includes("студент")
  ) {
    sphere.push("образование");
  }
  if (
    ideLower.includes("торгов") ||
    ideLower.includes("магазин") ||
    ideLower.includes("продаж")
  ) {
    sphere.push("розничная сфера");
  }
  if (
    ideLower.includes("производств") ||
    ideLower.includes("завод") ||
    ideLower.includes("фабрик")
  ) {
    sphere.push("производство");
  }
  if (
    ideLower.includes("логистик") ||
    ideLower.includes("доставк") ||
    ideLower.includes("склад")
  ) {
    sphere.push("логистика");
  }
  if (
    ideLower.includes("здоровь") ||
    ideLower.includes("медицин") ||
    ideLower.includes("клиник")
  ) {
    sphere.push("здравоохранение");
  }

  // Формируем описание
  let description = "";
  if (aiTech.length > 0) {
    description += aiTech[0];
  }
  if (sphere.length > 0) {
    description += (description ? " для сферы " : "") + sphere[0];
  }

  return description;
}

/**
 * Создает промпт для изображения на основе бизнес-идеи
 * Лимит YandexART: 500 символов
 * Извлекает ключевые слова но обобщает их до безопасных категорий
 */
export function buildImagePrompt(idea: string): string {
  // Извлекаем безопасные ключевые слова
  const keywords = extractSafeKeywords(idea);

  // Базовые стили
  const styles = [
    "Современная минималистичная бизнес-иллюстрация",
    "Футуристическая концепция стартапа",
    "Концептуальная технологическая иллюстрация",
    "Абстрактная digital-визуализация",
  ];

  const endings = [
    "профессиональный дизайн, светлые тона",
    "корпоративный стиль, чистые формы",
    "минимализм, технологичный вид",
    "деловая графика, современный стиль",
  ];

  // Выбираем случайный стиль
  const styleIndex = Math.floor(Math.random() * styles.length);
  const endingIndex = Math.floor(Math.random() * endings.length);

  let prompt = styles[styleIndex];

  // Добавляем ключевые слова если есть
  if (keywords) {
    prompt += ` с элементами ${keywords},`;
  } else {
    prompt += " с AI элементами,";
  }

  prompt += ` ${endings[endingIndex]}`;

  logger.info(
    `Image prompt with keywords: "${keywords || "none"}", length: ${prompt.length} chars`
  );
  return prompt;
}
