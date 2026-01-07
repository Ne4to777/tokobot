/**
 * Monitoring Service
 * Enhanced error tracking and system monitoring
 */

import { createLogger } from "../utils/logger.js";
import { analyticsService } from "./analytics.service.js";

const logger = createLogger("MonitoringService");

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Error entry
 */
export interface ErrorEntry {
  id: string;
  timestamp: Date;
  severity: ErrorSeverity;
  error: Error;
  context?: string;
  userId?: number;
  command?: string;
  metadata?: Record<string, unknown>;
  stack?: string;
}

/**
 * Health check result
 */
export interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: Date;
  checks: {
    memory: { status: string; usage: number; limit: number };
    uptime: { status: string; seconds: number };
    errors: { status: string; count: number; recentCount: number };
  };
}

/**
 * Monitoring Service Class
 */
class MonitoringServiceClass {
  private errors: ErrorEntry[] = [];
  private maxErrors = 1000;
  private errorCounts: Map<string, number> = new Map();
  private startTime = Date.now();

  /**
   * Track error
   */
  trackError(
    error: Error,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: string,
    userId?: number,
    metadata?: Record<string, unknown>
  ): void {
    const errorEntry: ErrorEntry = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      severity,
      error,
      context,
      userId,
      metadata,
      stack: error.stack,
    };

    // Add to errors array
    this.errors.push(errorEntry);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Update error counts
    const errorKey = `${error.name}:${error.message}`;
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

    // Log error
    logger.error(`[${severity.toUpperCase()}] ${context || "Error"}`, error, {
      userId,
      metadata,
    });

    // Track in analytics if userId is available
    if (userId) {
      analyticsService.trackError(userId, error, context);
    }

    // Alert on critical errors
    if (severity === ErrorSeverity.CRITICAL) {
      this.alertCriticalError(errorEntry);
    }
  }

  /**
   * Alert on critical error
   */
  private alertCriticalError(errorEntry: ErrorEntry): void {
    logger.error("🚨 CRITICAL ERROR DETECTED 🚨", errorEntry.error, {
      id: errorEntry.id,
      context: errorEntry.context,
      userId: errorEntry.userId,
      timestamp: errorEntry.timestamp,
    });

    // Here you could integrate with external services:
    // - Sentry
    // - Slack/Telegram notifications
    // - Email alerts
    // - PagerDuty
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 100): ErrorEntry[] {
    return this.errors.slice(-limit);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): ErrorEntry[] {
    return this.errors.filter((e) => e.severity === severity);
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const recentHourErrors = this.errors.filter(
      (e) => e.timestamp.getTime() > oneHourAgo
    );
    const recentDayErrors = this.errors.filter(
      (e) => e.timestamp.getTime() > oneDayAgo
    );

    const errorsByType = Array.from(this.errorCounts.entries())
      .map(([key, count]) => ({ error: key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalErrors: this.errors.length,
      errorsLastHour: recentHourErrors.length,
      errorsLast24Hours: recentDayErrors.length,
      topErrors: errorsByType,
      errorsBySeverity: {
        low: this.errors.filter((e) => e.severity === ErrorSeverity.LOW).length,
        medium: this.errors.filter((e) => e.severity === ErrorSeverity.MEDIUM)
          .length,
        high: this.errors.filter((e) => e.severity === ErrorSeverity.HIGH)
          .length,
        critical: this.errors.filter(
          (e) => e.severity === ErrorSeverity.CRITICAL
        ).length,
      },
    };
  }

  /**
   * Perform health check
   */
  healthCheck(): HealthCheck {
    const memoryUsage = process.memoryUsage();
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const recentErrors = this.errors.filter(
      (e) => e.timestamp.getTime() > Date.now() - 5 * 60 * 1000 // Last 5 minutes
    );

    // Memory check
    const memoryLimit = 512 * 1024 * 1024; // 512 MB
    const memoryUsageMB = memoryUsage.heapUsed / (1024 * 1024);
    const memoryStatus =
      memoryUsage.heapUsed > memoryLimit * 0.9
        ? "unhealthy"
        : memoryUsage.heapUsed > memoryLimit * 0.7
          ? "degraded"
          : "healthy";

    // Uptime check
    const uptimeStatus = uptimeSeconds > 60 ? "healthy" : "degraded";

    // Errors check
    const criticalErrors = recentErrors.filter(
      (e) => e.severity === ErrorSeverity.CRITICAL
    );
    const errorStatus =
      criticalErrors.length > 0
        ? "unhealthy"
        : recentErrors.length > 10
          ? "degraded"
          : "healthy";

    // Overall status
    const statuses = [memoryStatus, uptimeStatus, errorStatus];
    const overallStatus = statuses.includes("unhealthy")
      ? "unhealthy"
      : statuses.includes("degraded")
        ? "degraded"
        : "healthy";

    return {
      status: overallStatus as "healthy" | "degraded" | "unhealthy",
      timestamp: new Date(),
      checks: {
        memory: {
          status: memoryStatus,
          usage: Math.round(memoryUsageMB),
          limit: Math.round(memoryLimit / (1024 * 1024)),
        },
        uptime: {
          status: uptimeStatus,
          seconds: uptimeSeconds,
        },
        errors: {
          status: errorStatus,
          count: this.errors.length,
          recentCount: recentErrors.length,
        },
      },
    };
  }

  /**
   * Clear old errors
   */
  clearOldErrors(): void {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.errors = this.errors.filter((e) => e.timestamp.getTime() > oneDayAgo);
    logger.info("Old errors cleared", {
      remainingErrors: this.errors.length,
    });
  }

  /**
   * Export monitoring data
   */
  exportData() {
    return {
      errors: this.getRecentErrors(100),
      stats: this.getErrorStats(),
      health: this.healthCheck(),
    };
  }
}

// Export singleton instance
export const monitoringService = new MonitoringServiceClass();

// Schedule periodic cleanup (every hour)
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      monitoringService.clearOldErrors();
      analyticsService.clearOldEvents();
    },
    60 * 60 * 1000
  );
}
