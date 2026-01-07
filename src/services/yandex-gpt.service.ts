/**
 * YandexGPT API Service
 * Extracted from test-yandex endpoint - WORKING implementation
 */

import { Constants } from "../config/index.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("YandexGPT");

export interface YandexGPTRequest {
  folderId: string;
  apiKey: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export interface YandexGPTResponse {
  result?: {
    alternatives?: Array<{
      message?: {
        role?: string;
        text?: string;
      };
      status?: string;
    }>;
    usage?: {
      inputTextTokens?: string;
      completionTokens?: string;
      totalTokens?: string;
    };
    modelVersion?: string;
  };
}

/**
 * Call YandexGPT API directly (proven working implementation from test-yandex)
 */
export async function callYandexGPT(
  request: YandexGPTRequest
): Promise<string> {
  const {
    folderId,
    apiKey,
    prompt,
    maxTokens = Constants.YANDEX_MAX_TOKENS,
    temperature = Constants.YANDEX_TEMPERATURE,
    timeout = Constants.REQUEST_TIMEOUT,
  } = request;

  logger.info(`Calling YandexGPT API (timeout: ${timeout}ms)...`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    logger.warn(`YandexGPT timeout after ${timeout}ms`);
    controller.abort();
  }, timeout);

  try {
    const requestBody = {
      modelUri: `gpt://${folderId}/${Constants.YANDEX_MODEL}`,
      completionOptions: {
        stream: false,
        temperature,
        maxTokens: String(maxTokens),
      },
      messages: [
        {
          role: "user",
          text: prompt,
        },
      ],
    };

    const response = await fetch(
      "https://llm.api.cloud.yandex.net/foundationModels/v1/completion",
      {
        method: "POST",
        headers: {
          Authorization: `Api-Key ${apiKey}`,
          "Content-Type": "application/json",
          "x-folder-id": folderId,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson.message || errorText;
      } catch {
        // Error body is not JSON
      }

      logger.error(`YandexGPT API error: ${response.status} - ${errorDetails}`);
      throw new Error(
        `YandexGPT API error: ${response.status} - ${errorDetails}`
      );
    }

    const data = (await response.json()) as YandexGPTResponse;

    if (!data.result?.alternatives?.[0]?.message?.text) {
      logger.error("Invalid YandexGPT response format");
      throw new Error("Invalid YandexGPT response format");
    }

    const generatedText = data.result.alternatives[0].message.text.trim();
    logger.info(`YandexGPT response received: ${generatedText.substring(0, 50)}...`);
    return generatedText;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      logger.error("YandexGPT request aborted (timeout)");
      throw new Error("YandexGPT request timeout");
    }

    throw error;
  }
}

