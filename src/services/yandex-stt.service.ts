/**
 * Yandex SpeechKit Speech-to-Text Service
 * Распознавание русской речи из голосовых сообщений
 */

import { createLogger } from "../utils/logger.js";

const logger = createLogger("YandexSTT");

export interface YandexSTTRequest {
  apiKey: string;
  folderId: string;
  audioBuffer: Buffer;
  languageCode?: string;
  format?: "lpcm" | "oggopus";
  sampleRateHertz?: number;
}

export interface YandexSTTResponse {
  result?: {
    alternatives?: Array<{
      text?: string;
      confidence?: number;
    }>;
    channelTag?: string;
  };
  error?: {
    code?: number;
    message?: string;
  };
}

/**
 * Распознавание речи через Yandex SpeechKit API
 * Документация: https://cloud.yandex.ru/docs/speechkit/stt/api/streaming-api
 */
export async function recognizeSpeech(
  request: YandexSTTRequest
): Promise<string> {
  const {
    apiKey,
    folderId,
    audioBuffer,
    languageCode = "ru-RU",
    format = "oggopus",
    sampleRateHertz = 48000,
  } = request;

  logger.info(`Recognizing speech (size: ${audioBuffer.length} bytes)...`);

  try {
    // Используем синхронное распознавание (для коротких аудио до 30 сек)
    // Параметры передаются в URL, аудио в теле запроса
    // Убираем format - пусть API автоматически определяет
    const url = `https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?lang=${languageCode}&folderId=${folderId}`;

    logger.info(`Request URL: ${url.replace(folderId, "FOLDER_ID")}`);
    logger.info(`API Key starts with: ${apiKey.substring(0, 10)}...`);
    logger.info(`Audio size: ${audioBuffer.length} bytes`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${apiKey}`,
      },
      body: audioBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Yandex STT API error: ${response.status} - ${errorText}`);
      throw new Error(`Yandex STT API error: ${response.status}`);
    }

    const data = (await response.json()) as YandexSTTResponse;

    // Логируем полный ответ для отладки
    logger.info(`Full API response: ${JSON.stringify(data)}`);

    if (data.error) {
      logger.error(
        `Yandex STT error: ${data.error.code} - ${data.error.message}`
      );
      throw new Error(`Yandex STT error: ${data.error.message}`);
    }

    // API v1 возвращает просто строку в result: {"result": "текст"}
    // API v2 возвращает объект: {"result": {"alternatives": [{"text": "текст"}]}}
    let recognizedText = "";

    if (typeof data.result === "string") {
      // Формат v1 (используется сейчас)
      recognizedText = data.result;
      logger.info(`Speech recognized (v1 format): ${recognizedText}`);
    } else if (data.result?.alternatives?.[0]?.text) {
      // Формат v2 (на случай, если API изменится)
      recognizedText = data.result.alternatives[0].text;
      const confidence = data.result.alternatives[0].confidence || 0;
      logger.info(
        `Speech recognized (v2 format, confidence: ${confidence}): ${recognizedText}`
      );
    } else {
      logger.warn("API returned unexpected format or empty result");
      recognizedText = "Не удалось распознать речь";
    }

    return recognizedText;
  } catch (error) {
    logger.error("Failed to recognize speech", error as Error);
    throw error;
  }
}

/**
 * Альтернативный метод через streaming API (для длинных аудио)
 * Пока не используется, но может быть полезен в будущем
 */
export async function recognizeSpeechStreaming(
  request: YandexSTTRequest
): Promise<string> {
  const { apiKey, folderId, audioBuffer, languageCode = "ru-RU" } = request;

  logger.info(
    `Recognizing speech via streaming API (size: ${audioBuffer.length} bytes)...`
  );

  try {
    const response = await fetch(
      `https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?lang=${languageCode}&folderId=${folderId}&format=oggopus`,
      {
        method: "POST",
        headers: {
          Authorization: `Api-Key ${apiKey}`,
          "Transfer-Encoding": "chunked",
        },
        body: audioBuffer,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        `Yandex STT streaming API error: ${response.status} - ${errorText}`
      );
      throw new Error(`Yandex STT streaming API error: ${response.status}`);
    }

    const data = (await response.json()) as YandexSTTResponse;

    const recognizedText =
      data.result?.alternatives?.[0]?.text || "Не удалось распознать речь";

    logger.info(`Speech recognized (streaming): ${recognizedText}`);
    return recognizedText;
  } catch (error) {
    logger.error("Failed to recognize speech (streaming)", error as Error);
    throw error;
  }
}
