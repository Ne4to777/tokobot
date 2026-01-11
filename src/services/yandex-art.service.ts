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
 * Создает промпт для изображения на основе бизнес-идеи
 * Лимит YandexART: 500 символов
 * Использует абстрактный стиль чтобы избежать контент-фильтров
 */
export function buildImagePrompt(idea: string): string {
  // Список безопасных абстрактных промптов для бизнеса
  const prompts = [
    "Современная минималистичная бизнес-иллюстрация с AI элементами, технологичный стиль, голубые и белые тона, профессиональный дизайн",
    "Футуристическая концепция стартапа, абстрактные геометрические формы, AI тематика, светлые цвета, корпоративный стиль",
    "Концептуальная иллюстрация технологического решения, современный минимализм, искусственный интеллект, деловой стиль",
    "Абстрактная визуализация digital-бизнеса, AI технологии, минималистичный дизайн, профессиональная графика",
    "Современная инфографика для стартапа, AI концепция, чистый дизайн, корпоративные цвета, технологичный вид"
  ];
  
  // Выбираем случайный промпт для разнообразия
  const randomIndex = Math.floor(Math.random() * prompts.length);
  const prompt = prompts[randomIndex];
  
  logger.info(`Using safe abstract prompt #${randomIndex + 1}, length: ${prompt.length} chars`);
  return prompt;
}
