/**
 * Dashboard API Endpoint
 * Provides analytics and statistics
 */

import { config } from "../config/index.js";
import { analyticsService } from "../services/analytics.service.js";
import { monitoringService } from "../services/monitoring.service.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("Dashboard");

/**
 * Vercel serverless function handler for dashboard
 */
export default async (req: any, res: any) => {
  try {
    // Only allow GET requests
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    // Simple authentication (optional)
    const authToken = req.headers.authorization?.replace("Bearer ", "");
    const expectedToken = process.env.DASHBOARD_TOKEN;

    if (expectedToken && authToken !== expectedToken) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Get query parameters
    const { action, userId, type, limit } = req.query;

    // Handle different actions
    switch (action) {
      case "system-stats":
        const systemStats = analyticsService.getSystemStats();
        res.status(200).json({
          success: true,
          data: systemStats,
        });
        break;

      case "user-stats":
        if (userId) {
          const userStats = analyticsService.getUserStats(parseInt(userId));
          res.status(200).json({
            success: true,
            data: userStats || null,
          });
        } else {
          const allUserStats = analyticsService.getAllUserStats();
          res.status(200).json({
            success: true,
            data: allUserStats,
          });
        }
        break;

      case "recent-events":
        const recentLimit = limit ? parseInt(limit) : 100;
        const recentEvents = analyticsService.getRecentEvents(recentLimit);
        res.status(200).json({
          success: true,
          data: recentEvents,
        });
        break;

      case "events-by-type":
        if (!type) {
          res.status(400).json({
            error: "Missing 'type' parameter",
          });
          return;
        }
        const typeLimit = limit ? parseInt(limit) : 100;
        const eventsByType = analyticsService.getEventsByType(
          type as any,
          typeLimit
        );
        res.status(200).json({
          success: true,
          data: eventsByType,
        });
        break;

      case "events-by-user":
        if (!userId) {
          res.status(400).json({
            error: "Missing 'userId' parameter",
          });
          return;
        }
        const userLimit = limit ? parseInt(limit) : 100;
        const eventsByUser = analyticsService.getEventsByUser(
          parseInt(userId),
          userLimit
        );
        res.status(200).json({
          success: true,
          data: eventsByUser,
        });
        break;

      case "export":
        const exportData = analyticsService.exportStats();
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="tokobot-stats-${Date.now()}.json"`
        );
        res.status(200).send(exportData);
        break;

      case "health":
        const healthCheck = monitoringService.healthCheck();
        res.status(200).json({
          success: true,
          data: {
            ...healthCheck,
            version: "2.0.0",
            environment: config.environment,
          },
        });
        break;

      case "errors":
        const errorLimit = limit ? parseInt(limit) : 100;
        const recentErrorsData = monitoringService.getRecentErrors(errorLimit);
        res.status(200).json({
          success: true,
          data: recentErrorsData,
        });
        break;

      case "error-stats":
        const errorStats = monitoringService.getErrorStats();
        res.status(200).json({
          success: true,
          data: errorStats,
        });
        break;

      case "monitoring-export":
        const monitoringData = monitoringService.exportData();
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="tokobot-monitoring-${Date.now()}.json"`
        );
        res.status(200).send(JSON.stringify(monitoringData, null, 2));
        break;

      default:
        // Default: show available endpoints
        res.status(200).json({
          success: true,
          message: "Tokobot Dashboard API",
          version: "2.0.0",
          endpoints: {
            analytics: {
              "?action=system-stats": "Get system statistics",
              "?action=user-stats": "Get all user statistics",
              "?action=user-stats&userId=123": "Get specific user statistics",
              "?action=recent-events&limit=50": "Get recent events",
              "?action=events-by-type&type=command_used": "Get events by type",
              "?action=events-by-user&userId=123": "Get events by user",
              "?action=export": "Export all analytics data",
            },
            monitoring: {
              "?action=health": "Health check with detailed status",
              "?action=errors&limit=50": "Get recent errors",
              "?action=error-stats": "Get error statistics",
              "?action=monitoring-export": "Export monitoring data",
            },
          },
          authentication: expectedToken
            ? "Required (Bearer token in Authorization header)"
            : "Not configured (open access)",
        });
    }
  } catch (error) {
    logger.error("Dashboard error", error as Error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
