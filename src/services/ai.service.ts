/**
 * AI Service - Refactored for modularity
 */

import { config, Constants } from "../config/index.js";
import {
  ErrorType,
  GeneratedIdea,
  IdeaGenerationOptions,
} from "../types/index.js";
import { createError } from "../utils/errors.js";
import { randomElement, retry } from "../utils/helpers.js";
import { createLogger } from "../utils/logger.js";
import { IDEAS_DATABASE } from "./data/ideas.js";

const logger = createLogger("AIService");

/**
 * HuggingFace API response type
 */
interface HuggingFaceResponse {
  generated_text: string;
}

/**
 * Google Gemini API response type
 */
interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * Groq API response type (OpenAI-compatible)
 */
interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * YandexGPT API response type
 */
interface YandexGPTResponse {
  result: {
    alternatives: Array<{
      message: {
        role: string;
        text: string;
      };
      status: string;
    }>;
    usage: {
      inputTextTokens: string;
      completionTokens: string;
      totalTokens: string;
    };
    modelVersion: string;
  };
}

/**
 * AI Service Class
 */
export class AIService {
  private readonly aiToken?: string;
  private readonly aiEnabled: boolean;
  private readonly aiProvider: "yandexgpt" | "groq" | "gemini" | "huggingface";
  private readonly yandexFolderId?: string;

  constructor() {
    this.aiToken = config.aiToken;
    this.aiEnabled = config.aiEnabled;
    this.aiProvider = config.aiProvider;
    this.yandexFolderId = config.yandexFolderId;
  }

  /**
   * Generate idea based on options
   */
  async generateIdea(
    options: IdeaGenerationOptions = {}
  ): Promise<GeneratedIdea> {
    const { topic, useAI = this.aiEnabled } = options;

    logger.info(
      `generateIdea called: topic=${topic}, useAI=${useAI}, aiEnabled=${this.aiEnabled}, aiToken=${this.aiToken ? "SET" : "NOT SET"}, aiProvider=${this.aiProvider}`
    );

    // Try AI if enabled and requested
    if (useAI && this.aiToken) {
      logger.info(`Attempting AI generation with provider: ${this.aiProvider}`);
      try {
        const result = await this.generateWithAI(topic);
        logger.info(`AI generation SUCCESS`);
        return result;
      } catch (error) {
        logger.warn(
          "AI generation failed, falling back to local",
          error as Error
        );
      }
    } else {
      logger.info(
        `Skipping AI generation: useAI=${useAI}, aiToken=${this.aiToken ? "SET" : "NOT SET"}`
      );
    }

    // Fallback to local generation
    logger.info(`Using local generation`);
    return this.generateLocal(topic);
  }

  /**
   * Generate idea using AI
   */
  private async generateWithAI(topic?: string): Promise<GeneratedIdea> {
    logger.info(
      `generateWithAI START: provider=${this.aiProvider}, topic=${topic || "random"}`
    );

    const prompt = this.buildPrompt(topic);
    logger.info(`Prompt built, calling API with retry...`);

    try {
      const idea = await retry(
        () => {
          logger.info(`Retry attempt for ${this.aiProvider} API...`);
          switch (this.aiProvider) {
            case "yandexgpt":
              return this.callYandexGPTAPI(prompt);
            case "groq":
              return this.callGroqAPI(prompt);
            case "gemini":
              return this.callGeminiAPI(prompt);
            case "huggingface":
              return this.callHuggingFaceAPI(prompt);
            default:
              return this.callYandexGPTAPI(prompt);
          }
        },
        {
          maxAttempts: 1, // Only 1 attempt for faster fallback
          initialDelay: 500,
        }
      );

      logger.info(`generateWithAI SUCCESS: got idea of length ${idea.length}`);

      return {
        text: idea,
        topic,
        generatedBy: "ai",
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error(`generateWithAI FAILED:`, error as Error);
      throw error;
    }
  }

  /**
   * Call YandexGPT API
   */
  private async callYandexGPTAPI(prompt: string): Promise<string> {
    logger.info(
      `callYandexGPTAPI START: timeout=${Constants.REQUEST_TIMEOUT}ms`
    );

    if (!this.yandexFolderId) {
      logger.error("YANDEX_FOLDER_ID not configured");
      throw createError(
        "YANDEX_FOLDER_ID not configured in environment",
        ErrorType.AI_SERVICE
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      logger.warn(
        `YandexGPT API timeout after ${Constants.REQUEST_TIMEOUT}ms, aborting...`
      );
      controller.abort();
    }, Constants.REQUEST_TIMEOUT);

    try {
      logger.info(`Sending request to YandexGPT API...`);
      const response = await fetch(
        "https://llm.api.cloud.yandex.net/foundationModels/v1/completion",
        {
          method: "POST",
          headers: {
            Authorization: `Api-Key ${this.aiToken}`,
            "Content-Type": "application/json",
            "x-folder-id": this.yandexFolderId,
          },
          body: JSON.stringify({
            modelUri: `gpt://${this.yandexFolderId}/${Constants.YANDEX_MODEL}`,
            completionOptions: {
              stream: false,
              temperature: Constants.YANDEX_TEMPERATURE,
              maxTokens: String(Constants.YANDEX_MAX_TOKENS),
            },
            messages: [
              {
                role: "user",
                text: prompt,
              },
            ],
          }),
          signal: controller.signal,
        }
      );

      logger.info(`YandexGPT API response received: status=${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`YandexGPT API error: ${response.status} - ${errorText}`);
        throw createError(
          `YandexGPT API error: ${response.status} - ${errorText}`,
          ErrorType.AI_SERVICE
        );
      }

      const data = (await response.json()) as YandexGPTResponse;

      if (!data.result?.alternatives?.[0]?.message?.text) {
        logger.error(`Invalid YandexGPT response format`);
        throw createError(
          "Invalid YandexGPT response format",
          ErrorType.AI_SERVICE
        );
      }

      const generatedText = data.result.alternatives[0].message.text.trim();
      logger.info(
        `YandexGPT API SUCCESS: content length=${generatedText.length}`
      );
      return generatedText;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        logger.error(`YandexGPT API request aborted (timeout)`);
        throw createError("AI request timeout", ErrorType.AI_SERVICE, error);
      }
      logger.error(`YandexGPT API error:`, error as Error);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Call Groq API (OpenAI-compatible)
   */
  private async callGroqAPI(prompt: string): Promise<string> {
    logger.info(`callGroqAPI START: timeout=${Constants.REQUEST_TIMEOUT}ms`);

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      logger.warn(
        `Groq API timeout after ${Constants.REQUEST_TIMEOUT}ms, aborting...`
      );
      controller.abort();
    }, Constants.REQUEST_TIMEOUT);

    try {
      logger.info(`Sending request to Groq API...`);
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.aiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: Constants.GROQ_MODEL,
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: Constants.GROQ_TEMPERATURE,
            max_tokens: Constants.GROQ_MAX_TOKENS,
          }),
          signal: controller.signal,
        }
      );

      logger.info(`Groq API response received: status=${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Groq API error: ${response.status} - ${errorText}`);
        throw createError(
          `Groq API error: ${response.status} - ${errorText}`,
          ErrorType.AI_SERVICE
        );
      }

      const data = (await response.json()) as GroqResponse;

      if (!data.choices?.[0]?.message?.content) {
        logger.error(`Invalid Groq response format`);
        throw createError("Invalid Groq response format", ErrorType.AI_SERVICE);
      }

      logger.info(
        `Groq API SUCCESS: content length=${data.choices[0].message.content.length}`
      );
      return data.choices[0].message.content.trim();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        logger.error(`Groq API request aborted (timeout)`);
        throw createError("AI request timeout", ErrorType.AI_SERVICE, error);
      }
      logger.error(`Groq API error:`, error as Error);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Call Google Gemini API
   */
  private async callGeminiAPI(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      Constants.REQUEST_TIMEOUT
    );

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${Constants.GEMINI_MODEL}:generateContent?key=${this.aiToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: Constants.GEMINI_TEMPERATURE,
              maxOutputTokens: Constants.GEMINI_MAX_TOKENS,
            },
          }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw createError(
          `Gemini API error: ${response.status} - ${errorText}`,
          ErrorType.AI_SERVICE
        );
      }

      const data = (await response.json()) as GeminiResponse;

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw createError(
          "Invalid Gemini response format",
          ErrorType.AI_SERVICE
        );
      }

      return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw createError("AI request timeout", ErrorType.AI_SERVICE, error);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Call Hugging Face Inference API
   */
  private async callHuggingFaceAPI(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      Constants.REQUEST_TIMEOUT
    );

    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${Constants.AI_MODEL}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.aiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: Constants.AI_MAX_TOKENS,
              temperature: Constants.AI_TEMPERATURE,
              return_full_text: false,
            },
          }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw createError(
          `HuggingFace API error: ${response.status}`,
          ErrorType.AI_SERVICE
        );
      }

      const data = (await response.json()) as HuggingFaceResponse[];

      if (!data[0]?.generated_text) {
        throw createError("Invalid AI response format", ErrorType.AI_SERVICE);
      }

      return data[0].generated_text.trim();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw createError("AI request timeout", ErrorType.AI_SERVICE, error);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Generate idea from local database
   */
  private generateLocal(topic?: string): GeneratedIdea {
    logger.debug(`Generating local idea for topic: ${topic || "random"}`);

    let ideas: readonly string[];

    if (topic && topic in IDEAS_DATABASE.topics) {
      ideas =
        IDEAS_DATABASE.topics[topic as keyof typeof IDEAS_DATABASE.topics];
    } else {
      ideas = IDEAS_DATABASE.general;
    }

    const text = randomElement(ideas);

    return {
      text,
      topic,
      generatedBy: "local",
      timestamp: new Date(),
    };
  }

  /**
   * Build prompt for AI
   */
  private buildPrompt(topic?: string): string {
    let prompt =
      "Ты - генератор бизнес-идей. Придумай креативную бизнес-идею для небольшой команды (2-5 человек), " +
      "где искусственный интеллект - это ОСНОВНОЙ ПРОДУКТ, а не просто вспомогательная функция. " +
      "AI должен быть главным ценностным предложением и конкурентным преимуществом.";

    if (topic) {
      const topicTranslations: Record<string, string> = {
        sales: "продажи",
        marketing: "маркетинг",
        hr: "HR и рекрутинг",
        product: "разработка продуктов",
        support: "поддержка клиентов",
        finance: "финансы",
      };
      const translatedTopic = topicTranslations[topic] || topic;
      prompt += `\n\nФокус на области: ${translatedTopic}`;
    }

    prompt +=
      "\n\nОпиши идею кратко (2-3 предложения) на русском языке. Бизнес-идея:";

    return prompt;
  }

  /**
   * Get available topics
   */
  getAvailableTopics(): string[] {
    return Object.keys(IDEAS_DATABASE.topics);
  }
}

/**
 * Singleton instance
 */
export const aiService = new AIService();
