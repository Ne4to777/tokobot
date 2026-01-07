/**
 * Vitest setup file
 * Runs before all tests
 */

// Set test environment variables
process.env.BOT_TOKEN = "test-bot-token";
process.env.NODE_ENV = "test";

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  // Keep console.error and console.warn for debugging
  log: () => {},
  debug: () => {},
  info: () => {},
};
