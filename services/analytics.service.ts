/**
 * Analytics Service
 * Tracks bot usage and provides metrics
 */

import type { BotContext } from "../types/index.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("AnalyticsService");

/**
 * Analytics event types
 */
export enum EventType {
  COMMAND_USED = "command_used",
  IDEA_GENERATED = "idea_generated",
  LEAD_CREATED = "lead_created",
  ERROR_OCCURRED = "error_occurred",
  USER_REGISTERED = "user_registered",
  RATE_LIMIT_HIT = "rate_limit_hit",
}

/**
 * Analytics event data
 */
export interface AnalyticsEvent {
  type: EventType;
  userId: number;
  username?: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

/**
 * User statistics
 */
export interface UserStats {
  userId: number;
  username?: string;
  totalCommands: number;
  ideasGenerated: number;
  leadsCreated: number;
  firstSeen: Date;
  lastSeen: Date;
}

/**
 * System statistics
 */
export interface SystemStats {
  totalUsers: number;
  totalCommands: number;
  totalIdeas: number;
  totalLeads: number;
  totalErrors: number;
  uptime: number;
  topCommands: Array<{ command: string; count: number }>;
  activeUsers24h: number;
  activeUsers7d: number;
}

/**
 * Analytics Service Class
 */
class AnalyticsServiceClass {
  private events: AnalyticsEvent[] = [];
  private userStats: Map<number, UserStats> = new Map();
  private commandCounts: Map<string, number> = new Map();
  private startTime: Date = new Date();
  private maxEventsInMemory = 1000;

  /**
   * Track analytics event
   */
  track(event: AnalyticsEvent): void {
    // Add to events array (keep limited in memory)
    this.events.push(event);
    if (this.events.length > this.maxEventsInMemory) {
      this.events.shift();
    }

    // Update user stats
    this.updateUserStats(event);

    // Update command counts
    if (event.type === EventType.COMMAND_USED && event.data?.command) {
      const command = event.data.command as string;
      this.commandCounts.set(
        command,
        (this.commandCounts.get(command) || 0) + 1
      );
    }

    logger.debug("Event tracked", {
      type: event.type,
      userId: event.userId,
    });
  }

  /**
   * Track command usage from context
   */
  trackCommand(ctx: BotContext, command: string): void {
    this.track({
      type: EventType.COMMAND_USED,
      userId: ctx.from!.id,
      username: ctx.from!.username,
      timestamp: new Date(),
      data: { command },
    });
  }

  /**
   * Track idea generation
   */
  trackIdeaGenerated(
    ctx: BotContext,
    topic?: string,
    generatedBy?: string
  ): void {
    this.track({
      type: EventType.IDEA_GENERATED,
      userId: ctx.from!.id,
      username: ctx.from!.username,
      timestamp: new Date(),
      data: { topic, generatedBy },
    });
  }

  /**
   * Track lead creation
   */
  trackLeadCreated(ctx: BotContext, leadId?: string): void {
    this.track({
      type: EventType.LEAD_CREATED,
      userId: ctx.from!.id,
      username: ctx.from!.username,
      timestamp: new Date(),
      data: { leadId },
    });
  }

  /**
   * Track error
   */
  trackError(userId: number, error: Error, context?: string): void {
    this.track({
      type: EventType.ERROR_OCCURRED,
      userId,
      timestamp: new Date(),
      data: {
        error: error.message,
        stack: error.stack,
        context,
      },
    });
  }

  /**
   * Track rate limit hit
   */
  trackRateLimitHit(userId: number): void {
    this.track({
      type: EventType.RATE_LIMIT_HIT,
      userId,
      timestamp: new Date(),
    });
  }

  /**
   * Update user statistics
   */
  private updateUserStats(event: AnalyticsEvent): void {
    const stats = this.userStats.get(event.userId) || {
      userId: event.userId,
      username: event.username,
      totalCommands: 0,
      ideasGenerated: 0,
      leadsCreated: 0,
      firstSeen: event.timestamp,
      lastSeen: event.timestamp,
    };

    stats.lastSeen = event.timestamp;

    switch (event.type) {
      case EventType.COMMAND_USED:
        stats.totalCommands++;
        break;
      case EventType.IDEA_GENERATED:
        stats.ideasGenerated++;
        break;
      case EventType.LEAD_CREATED:
        stats.leadsCreated++;
        break;
    }

    this.userStats.set(event.userId, stats);
  }

  /**
   * Get user statistics
   */
  getUserStats(userId: number): UserStats | undefined {
    return this.userStats.get(userId);
  }

  /**
   * Get all user statistics
   */
  getAllUserStats(): UserStats[] {
    return Array.from(this.userStats.values());
  }

  /**
   * Get system statistics
   */
  getSystemStats(): SystemStats {
    const now = new Date();
    const day24Ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const days7Ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const activeUsers24h = Array.from(this.userStats.values()).filter(
      (stats) => stats.lastSeen >= day24Ago
    ).length;

    const activeUsers7d = Array.from(this.userStats.values()).filter(
      (stats) => stats.lastSeen >= days7Ago
    ).length;

    const topCommands = Array.from(this.commandCounts.entries())
      .map(([command, count]) => ({ command, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const totalCommands = this.events.filter(
      (e) => e.type === EventType.COMMAND_USED
    ).length;

    const totalIdeas = this.events.filter(
      (e) => e.type === EventType.IDEA_GENERATED
    ).length;

    const totalLeads = this.events.filter(
      (e) => e.type === EventType.LEAD_CREATED
    ).length;

    const totalErrors = this.events.filter(
      (e) => e.type === EventType.ERROR_OCCURRED
    ).length;

    return {
      totalUsers: this.userStats.size,
      totalCommands,
      totalIdeas,
      totalLeads,
      totalErrors,
      uptime: Math.floor((now.getTime() - this.startTime.getTime()) / 1000),
      topCommands,
      activeUsers24h,
      activeUsers7d,
    };
  }

  /**
   * Get recent events
   */
  getRecentEvents(limit: number = 100): AnalyticsEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Get events by type
   */
  getEventsByType(type: EventType, limit: number = 100): AnalyticsEvent[] {
    return this.events.filter((e) => e.type === type).slice(-limit);
  }

  /**
   * Get events by user
   */
  getEventsByUser(userId: number, limit: number = 100): AnalyticsEvent[] {
    return this.events.filter((e) => e.userId === userId).slice(-limit);
  }

  /**
   * Clear old events (keep only recent)
   */
  clearOldEvents(): void {
    if (this.events.length > this.maxEventsInMemory) {
      this.events = this.events.slice(-this.maxEventsInMemory);
    }
    logger.info("Old events cleared", {
      remainingEvents: this.events.length,
    });
  }

  /**
   * Export statistics as JSON
   */
  exportStats(): string {
    return JSON.stringify(
      {
        systemStats: this.getSystemStats(),
        userStats: this.getAllUserStats(),
        recentEvents: this.getRecentEvents(50),
      },
      null,
      2
    );
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsServiceClass();
