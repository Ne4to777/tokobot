/**
 * Bitrix24 CRM integration
 */

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const BITRIX24_WEBHOOK = process.env.BITRIX24_WEBHOOK;

interface LeadData {
  title: string;
  name?: string;
  phone?: string;
  email?: string;
  comments?: string;
  source?: string;
  userId?: number;
  username?: string;
}

interface Bitrix24Response<T = any> {
  result?: T;
  error?: string;
  error_description?: string;
}

/**
 * Создать лид в Битрикс24
 */
export async function createLead(data: LeadData): Promise<any> {
  if (!BITRIX24_WEBHOOK) {
    console.warn("BITRIX24_WEBHOOK not configured, skipping lead creation");
    return null;
  }

  try {
    const response = await fetch(`${BITRIX24_WEBHOOK}/crm.lead.add.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          TITLE: data.title,
          NAME: data.name || "Telegram User",
          PHONE: data.phone
            ? [{ VALUE: data.phone, VALUE_TYPE: "WORK" }]
            : undefined,
          EMAIL: data.email
            ? [{ VALUE: data.email, VALUE_TYPE: "WORK" }]
            : undefined,
          COMMENTS: data.comments || "",
          SOURCE_ID: data.source || "TELEGRAM",
          // Дополнительные поля
          UF_CRM_1234567890: data.userId, // ID пользователя Telegram (настройте поле в Битрикс24)
          UF_CRM_1234567891: data.username, // Username Telegram
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Bitrix24 API error: ${response.status}`);
    }

    const result = (await response.json()) as Bitrix24Response<number>;

    if (result.error) {
      throw new Error(`Bitrix24 error: ${result.error_description}`);
    }

    console.log(`✅ Lead created in Bitrix24: ID ${result.result}`);
    return result.result;
  } catch (error) {
    console.error("Error creating lead in Bitrix24:", error);
    throw error;
  }
}

/**
 * Добавить комментарий к лиду
 */
export async function addLeadComment(
  leadId: number,
  comment: string
): Promise<void> {
  if (!BITRIX24_WEBHOOK) return;

  try {
    await fetch(`${BITRIX24_WEBHOOK}/crm.timeline.comment.add.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          ENTITY_ID: leadId,
          ENTITY_TYPE: "lead",
          COMMENT: comment,
        },
      }),
    });
  } catch (error) {
    console.error("Error adding comment:", error);
  }
}

/**
 * Обновить лид
 */
export async function updateLead(leadId: number, fields: any): Promise<void> {
  if (!BITRIX24_WEBHOOK) return;

  try {
    const response = await fetch(`${BITRIX24_WEBHOOK}/crm.lead.update.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: leadId,
        fields: fields,
      }),
    });

    const result = (await response.json()) as Bitrix24Response;

    if (result.error) {
      throw new Error(`Bitrix24 error: ${result.error_description}`);
    }

    console.log(`✅ Lead ${leadId} updated in Bitrix24`);
  } catch (error) {
    console.error("Error updating lead:", error);
    throw error;
  }
}

/**
 * Получить информацию о лиде
 */
export async function getLead(leadId: number): Promise<any> {
  if (!BITRIX24_WEBHOOK) return null;

  try {
    const response = await fetch(
      `${BITRIX24_WEBHOOK}/crm.lead.get.json?id=${leadId}`
    );
    const result = (await response.json()) as Bitrix24Response;

    if (result.error) {
      throw new Error(`Bitrix24 error: ${result.error_description}`);
    }

    return result.result;
  } catch (error) {
    console.error("Error getting lead:", error);
    return null;
  }
}

/**
 * Создать задачу
 */
export async function createTask(data: {
  title: string;
  description: string;
  responsibleId: number;
  deadline?: string;
}): Promise<any> {
  if (!BITRIX24_WEBHOOK) return null;

  try {
    const response = await fetch(`${BITRIX24_WEBHOOK}/tasks.task.add.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          TITLE: data.title,
          DESCRIPTION: data.description,
          RESPONSIBLE_ID: data.responsibleId,
          DEADLINE: data.deadline,
        },
      }),
    });

    const result = (await response.json()) as Bitrix24Response<{
      task: { id: number };
    }>;

    if (result.error) {
      throw new Error(`Bitrix24 error: ${result.error_description}`);
    }

    console.log(`✅ Task created in Bitrix24: ID ${result.result?.task.id}`);
    return result.result?.task.id;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}
