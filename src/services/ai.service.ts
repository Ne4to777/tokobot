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
import { retry } from "../utils/helpers.js";
import { createLogger } from "../utils/logger.js";
import { callYandexGPT } from "./yandex-gpt.service.js";

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
    const { topic } = options;

    // AI is required
    if (!this.aiToken) {
      throw createError(
        "AI service is not configured. Please set YANDEX_API_KEY or other AI provider credentials.",
        ErrorType.AI_SERVICE
      );
    }

    // Generate with AI (no fallback)
    return await this.generateWithAI(topic);
  }

  /**
   * Generate idea using AI
   */
  private async generateWithAI(topic?: string): Promise<GeneratedIdea> {
    const prompt = this.buildPrompt(topic);

    try {
      const idea = await retry(
        () => {
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

      // Format the idea for better readability
      const formattedIdea = this.formatIdea(idea);

      return {
        text: formattedIdea,
        topic,
        generatedBy: "ai",
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error(`AI generation failed:`, error as Error);
      throw error;
    }
  }

  /**
   * Call YandexGPT API
   */
  private async callYandexGPTAPI(prompt: string): Promise<string> {
    if (!this.yandexFolderId || !this.aiToken) {
      throw createError(
        "YandexGPT is not configured (missing API key or folder ID)",
        ErrorType.AI_SERVICE
      );
    }

    try {
      // Use the proven working implementation from yandex-gpt.service
      return await callYandexGPT({
        folderId: this.yandexFolderId,
        apiKey: this.aiToken,
        prompt,
        maxTokens: Constants.YANDEX_MAX_TOKENS,
        temperature: Constants.YANDEX_TEMPERATURE,
        timeout: Constants.REQUEST_TIMEOUT,
      });
    } catch (error) {
      throw createError(
        error instanceof Error ? error.message : "YandexGPT request failed",
        ErrorType.AI_SERVICE,
        error instanceof Error ? error : undefined
      );
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
   * Format idea for better readability
   */
  private formatIdea(idea: string): string {
    // If idea already has emojis and proper formatting, return as is
    if (idea.includes("🎯") && idea.includes("💡")) {
      return idea;
    }

    // Otherwise, try to add formatting by detecting keywords
    let formatted = idea;

    // Add line breaks before key sections if they don't exist
    formatted = formatted.replace(/ПРОБЛЕМА:/g, "\n🎯 ПРОБЛЕМА:");
    formatted = formatted.replace(/РЕШЕНИЕ:/g, "\n\n💡 РЕШЕНИЕ:");
    formatted = formatted.replace(/МОНЕТИЗАЦИЯ:/g, "\n\n💰 МОНЕТИЗАЦИЯ:");
    formatted = formatted.replace(/ROI:/g, "\n\n📈 ROI:");

    // Remove leading newlines
    formatted = formatted.replace(/^\n+/, "");

    return formatted;
  }

  /**
   * Build prompt for AI
   */
  private buildPrompt(topic?: string): string {
    let prompt =
      "Ты - генератор AI-first бизнес-идей. Создай КОНКРЕТНУЮ бизнес-идею для команды 2-5 человек, " +
      "где AI - это ЯДРО продукта.\n\n" +
      "СТРУКТУРА ОТВЕТА:\n" +
      "🎯 ПРОБЛЕМА: Конкретная боль + цифры\n" +
      "💡 РЕШЕНИЕ: Как именно AI решает (технология/подход)\n" +
      "💰 МОНЕТИЗАЦИЯ: Бизнес-модель + примерный чек\n" +
      "📈 ROI: Измеримая выгода (экономия времени/денег)\n\n" +
      "ТРЕБОВАНИЯ:\n" +
      "- Только конкретика и цифры\n" +
      "- Без общих фраз типа 'повышение эффективности', 'инновационный подход'\n" +
      "- ROI должен быть измеримым\n" +
      "- Технология AI должна быть реализуема небольшой командой\n" +
      "- ОБЯЗАТЕЛЬНО используй переносы строк между разделами\n" +
      "- ОБЯЗАТЕЛЬНО используй эмодзи 🎯💡💰📈 перед каждым разделом";

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
      prompt += `\n\nОБЛАСТЬ: ${translatedTopic}`;
    }

    prompt += "\n\nБизнес-идея:";

    return prompt;
  }

  /**
   * Get available topics
   */
  getAvailableTopics(): string[] {
    return ["sales", "marketing", "hr", "product", "support", "finance"];
  }
}

/**
 * Singleton instance
 */
export const aiService = new AIService();
