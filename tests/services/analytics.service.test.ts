/**
 * Tests for services/analytics.service.ts
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
    analyticsService,
    EventType,
} from "../../services/analytics.service.js";

describe("AnalyticsService", () => {
  beforeEach(() => {
    // Clear events before each test
    (analyticsService as any).events = [];
    (analyticsService as any).userStats = new Map();
    (analyticsService as any).commandCounts = new Map();
  });

  describe("track", () => {
    it("should track events", () => {
      analyticsService.track({
        type: EventType.COMMAND_USED,
        userId: 123,
        username: "testuser",
        timestamp: new Date(),
        data: { command: "start" },
      });

      const events = analyticsService.getRecentEvents();
      expect(events).toHaveLength(1);
      expect(events[0].userId).toBe(123);
      expect(events[0].type).toBe(EventType.COMMAND_USED);
    });

    it("should update user stats", () => {
      analyticsService.track({
        type: EventType.COMMAND_USED,
        userId: 123,
        username: "testuser",
        timestamp: new Date(),
        data: { command: "start" },
      });

      const userStats = analyticsService.getUserStats(123);
      expect(userStats).toBeDefined();
      expect(userStats!.userId).toBe(123);
      expect(userStats!.totalCommands).toBe(1);
    });

    it("should update command counts", () => {
      analyticsService.track({
        type: EventType.COMMAND_USED,
        userId: 123,
        timestamp: new Date(),
        data: { command: "start" },
      });

      analyticsService.track({
        type: EventType.COMMAND_USED,
        userId: 124,
        timestamp: new Date(),
        data: { command: "start" },
      });

      const stats = analyticsService.getSystemStats();
      expect(stats.topCommands).toHaveLength(1);
      expect(stats.topCommands[0].command).toBe("start");
      expect(stats.topCommands[0].count).toBe(2);
    });
  });

  describe("getSystemStats", () => {
    it("should return correct statistics", () => {
      // Add some events
      analyticsService.track({
        type: EventType.COMMAND_USED,
        userId: 123,
        timestamp: new Date(),
        data: { command: "start" },
      });

      analyticsService.track({
        type: EventType.IDEA_GENERATED,
        userId: 123,
        timestamp: new Date(),
      });

      analyticsService.track({
        type: EventType.COMMAND_USED,
        userId: 124,
        timestamp: new Date(),
        data: { command: "help" },
      });

      const stats = analyticsService.getSystemStats();

      expect(stats.totalUsers).toBe(2);
      expect(stats.totalCommands).toBe(2);
      expect(stats.totalIdeas).toBe(1);
      expect(stats.topCommands).toHaveLength(2);
    });
  });

  describe("getUserStats", () => {
    it("should return user statistics", () => {
      analyticsService.track({
        type: EventType.COMMAND_USED,
        userId: 123,
        username: "testuser",
        timestamp: new Date(),
        data: { command: "start" },
      });

      analyticsService.track({
        type: EventType.IDEA_GENERATED,
        userId: 123,
        timestamp: new Date(),
      });

      analyticsService.track({
        type: EventType.LEAD_CREATED,
        userId: 123,
        timestamp: new Date(),
      });

      const stats = analyticsService.getUserStats(123);

      expect(stats).toBeDefined();
      expect(stats!.username).toBe("testuser");
      expect(stats!.totalCommands).toBe(1);
      expect(stats!.ideasGenerated).toBe(1);
      expect(stats!.leadsCreated).toBe(1);
    });

    it("should return undefined for unknown user", () => {
      const stats = analyticsService.getUserStats(999);
      expect(stats).toBeUndefined();
    });
  });

  describe("getEventsByType", () => {
    it("should filter events by type", () => {
      analyticsService.track({
        type: EventType.COMMAND_USED,
        userId: 123,
        timestamp: new Date(),
      });

      analyticsService.track({
        type: EventType.IDEA_GENERATED,
        userId: 123,
        timestamp: new Date(),
      });

      analyticsService.track({
        type: EventType.COMMAND_USED,
        userId: 124,
        timestamp: new Date(),
      });

      const commandEvents = analyticsService.getEventsByType(
        EventType.COMMAND_USED
      );
      const ideaEvents = analyticsService.getEventsByType(
        EventType.IDEA_GENERATED
      );

      expect(commandEvents).toHaveLength(2);
      expect(ideaEvents).toHaveLength(1);
    });
  });

  describe("getEventsByUser", () => {
    it("should filter events by user", () => {
      analyticsService.track({
        type: EventType.COMMAND_USED,
        userId: 123,
        timestamp: new Date(),
      });

      analyticsService.track({
        type: EventType.IDEA_GENERATED,
        userId: 123,
        timestamp: new Date(),
      });

      analyticsService.track({
        type: EventType.COMMAND_USED,
        userId: 124,
        timestamp: new Date(),
      });

      const user123Events = analyticsService.getEventsByUser(123);
      const user124Events = analyticsService.getEventsByUser(124);

      expect(user123Events).toHaveLength(2);
      expect(user124Events).toHaveLength(1);
    });
  });
});

