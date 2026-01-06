/**
 * CRM Service - Refactored Bitrix24 integration
 */

import { config } from "../config/index.js";
import { ErrorType, LeadData } from "../types/index.js";
import { createError, validateRequired } from "../utils/errors.js";
import { retry } from "../utils/helpers.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("CRMService");

interface Bitrix24Response<T = any> {
  result?: T;
  error?: string;
  error_description?: string;
}

/**
 * CRM Service Class
 */
export class CRMService {
  private readonly webhookUrl?: string;
  private readonly enabled: boolean;

  constructor() {
    this.webhookUrl = config.bitrix24Webhook;
    this.enabled = !!this.webhookUrl;
  }

  /**
   * Check if CRM is configured
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Create lead in CRM
   */
  async createLead(data: LeadData): Promise<number> {
    if (!this.enabled) {
      logger.warn("CRM not configured, skipping lead creation");
      throw createError("CRM is not configured", ErrorType.CRM_SERVICE);
    }

    validateRequired(data, ["name"]);

    logger.info(`Creating lead for: ${data.name}`);

    const leadId = await retry(
      () => this.callBitrix24API("crm.lead.add", { fields: this.formatLeadData(data) }),
      { maxAttempts: 2 }
    );

    logger.info(`Lead created successfully: ${leadId}`);
    return leadId;
  }

  /**
   * Add comment to lead
   */
  async addLeadComment(leadId: number, comment: string): Promise<void> {
    if (!this.enabled) return;

    await this.callBitrix24API("crm.timeline.comment.add", {
      fields: {
        ENTITY_ID: leadId,
        ENTITY_TYPE: "lead",
        COMMENT: comment,
      },
    });

    logger.debug(`Comment added to lead ${leadId}`);
  }

  /**
   * Format lead data for Bitrix24
   */
  private formatLeadData(data: LeadData): Record<string, any> {
    const fields: Record<string, any> = {
      TITLE: `Заявка от ${data.name}`,
      NAME: data.name,
      SOURCE_ID: data.source || "TELEGRAM",
      OPENED: "Y",
      ASSIGNED_BY_ID: 1,
    };

    if (data.phone) {
      fields.PHONE = [{ VALUE: data.phone, VALUE_TYPE: "WORK" }];
    }

    if (data.email) {
      fields.EMAIL = [{ VALUE: data.email, VALUE_TYPE: "WORK" }];
    }

    if (data.comment) {
      fields.COMMENTS = data.comment;
    }

    return fields;
  }

  /**
   * Call Bitrix24 REST API
   */
  private async callBitrix24API(method: string, params: any = {}): Promise<any> {
    const url = `${this.webhookUrl}${method}.json`;

    logger.debug(`Calling Bitrix24 API: ${method}`);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw createError(
          `Bitrix24 API HTTP error: ${response.status}`,
          ErrorType.CRM_SERVICE
        );
      }

      const result = (await response.json()) as Bitrix24Response;

      if (result.error) {
        throw createError(
          `Bitrix24 API error: ${result.error} - ${result.error_description}`,
          ErrorType.CRM_SERVICE
        );
      }

      return result.result;
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Bitrix24 API call failed", error);
      }
      throw error;
    }
  }
}

/**
 * Singleton instance
 */
export const crmService = new CRMService();

