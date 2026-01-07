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
 * AI Service Class
 */
export class AIService {
  private readonly aiToken?: string;
  private readonly aiEnabled: boolean;
  private readonly aiProvider: "groq" | "gemini" | "huggingface";

  constructor() {
    this.aiToken = config.aiToken;
    this.aiEnabled = config.aiEnabled;
    this.aiProvider = config.aiProvider;
  }

  /**
   * Generate idea based on options
   */
  async generateIdea(
    options: IdeaGenerationOptions = {}
  ): Promise<GeneratedIdea> {
    const { topic, useAI = this.aiEnabled } = options;

    // Try AI if enabled and requested
    if (useAI && this.aiToken) {
      try {
        return await this.generateWithAI(topic);
      } catch (error) {
        logger.warn(
          "AI generation failed, falling back to local",
          error as Error
        );
      }
    }

    // Fallback to local generation
    return this.generateLocal(topic);
  }

  /**
   * Generate idea using AI
   */
  private async generateWithAI(topic?: string): Promise<GeneratedIdea> {
    logger.debug(
      `Generating AI idea with ${this.aiProvider} for topic: ${topic || "random"}`
    );

    const prompt = this.buildPrompt(topic);

    const idea = await retry(
      () => {
        switch (this.aiProvider) {
          case "groq":
            return this.callGroqAPI(prompt);
          case "gemini":
            return this.callGeminiAPI(prompt);
          case "huggingface":
            return this.callHuggingFaceAPI(prompt);
          default:
            return this.callGroqAPI(prompt);
        }
      },
      {
        maxAttempts: 1, // Only 1 attempt for faster fallback
        initialDelay: 500,
      }
    );

    return {
      text: idea,
      topic,
      generatedBy: "ai",
      timestamp: new Date(),
    };
  }

  /**
   * Call Groq API (OpenAI-compatible)
   */
  private async callGroqAPI(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      Constants.REQUEST_TIMEOUT
    );

    try {
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

      if (!response.ok) {
        const errorText = await response.text();
        throw createError(
          `Groq API error: ${response.status} - ${errorText}`,
          ErrorType.AI_SERVICE
        );
      }

      const data = (await response.json()) as GroqResponse;

      if (!data.choices?.[0]?.message?.content) {
        throw createError("Invalid Groq response format", ErrorType.AI_SERVICE);
      }

      return data.choices[0].message.content.trim();
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
      "You are a business idea generator. IMPORTANT: Respond in Russian language.\n\n" +
      "Generate a creative business idea for a small team (2-5 people) where " +
      "Artificial Intelligence is THE CORE PRODUCT, not just a feature. " +
      "The AI should be the main value proposition and competitive advantage.";

    if (topic) {
      prompt += `\n\nFocus on: ${topic}`;
    }

    prompt += "\n\nBusiness idea (in Russian):";

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
