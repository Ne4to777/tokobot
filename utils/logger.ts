/**
 * Simple logger utility
 */

import { config } from "../config/index.js";

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

/**
 * Format log message with timestamp and level
 */
function formatMessage(level: LogLevel, message: string, meta?: any): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
}

/**
 * Logger class
 */
export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  debug(message: string, meta?: any): void {
    if (config.environment === "development") {
      console.log(formatMessage(LogLevel.DEBUG, `[${this.context}] ${message}`, meta));
    }
  }

  info(message: string, meta?: any): void {
    console.log(formatMessage(LogLevel.INFO, `[${this.context}] ${message}`, meta));
  }

  warn(message: string, meta?: any): void {
    console.warn(formatMessage(LogLevel.WARN, `[${this.context}] ${message}`, meta));
  }

  error(message: string, error?: Error, meta?: any): void {
    console.error(
      formatMessage(LogLevel.ERROR, `[${this.context}] ${message}`, {
        ...meta,
        error: error?.message,
        stack: error?.stack,
      })
    );
  }
}

/**
 * Create logger instance for a specific context
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

