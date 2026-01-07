/**
 * Tests for utils/helpers.ts
 */

import { describe, expect, it, vi } from "vitest";
import { randomElement, retry } from "../../src/utils/helpers.js";

describe("helpers", () => {
  describe("randomElement", () => {
    it("should return an element from array", () => {
      const arr = [1, 2, 3, 4, 5];
      const result = randomElement(arr);
      expect(arr).toContain(result);
    });

    it("should work with strings", () => {
      const arr = ["a", "b", "c"];
      const result = randomElement(arr);
      expect(arr).toContain(result);
    });

    it("should work with readonly arrays", () => {
      const arr = ["a", "b", "c"] as const;
      const result = randomElement(arr);
      expect(arr).toContain(result);
    });
  });

  describe("retry", () => {
    it("should return result on first success", async () => {
      const fn = vi.fn().mockResolvedValue("success");
      const result = await retry(fn, { maxAttempts: 3, initialDelay: 100 });
      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should retry on failure", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("fail 1"))
        .mockRejectedValueOnce(new Error("fail 2"))
        .mockResolvedValue("success");

      const result = await retry(fn, { maxAttempts: 3, initialDelay: 10 });
      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should throw after max retries", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("always fails"));

      await expect(
        retry(fn, { maxAttempts: 3, initialDelay: 10 })
      ).rejects.toThrow("always fails");
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should respect exponential backoff", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("fail 1"))
        .mockResolvedValue("success");

      const start = Date.now();
      await retry(fn, { maxAttempts: 3, initialDelay: 100 });
      const duration = Date.now() - start;

      // Should wait at least 100ms before second attempt
      expect(duration).toBeGreaterThanOrEqual(100);
    });
  });
});
