import { formatDate, toDateObject, formatCurrency, getRelativeTimeString } from "./dateUtils";

describe("dateUtils", () => {
  describe("formatCurrency", () => {
    it("should format number as currency with ₹ symbol", () => {
      expect(formatCurrency(1000)).toBe("₹1,000");
      expect(formatCurrency(100000)).toBe("₹1,00,000");
      expect(formatCurrency(10000000)).toBe("₹1,00,00,000");
    });

    it("should format string number as currency", () => {
      expect(formatCurrency("5000")).toBe("₹5,000");
      expect(formatCurrency("150000")).toBe("₹1,50,000");
    });

    it("should handle decimal values", () => {
      expect(formatCurrency(1234.56)).toBe("₹1,234.56");
      expect(formatCurrency("999.99")).toBe("₹999.99");
    });

    it("should handle zero", () => {
      expect(formatCurrency(0)).toBe("₹0");
      expect(formatCurrency("0")).toBe("₹0");
    });

    it("should handle invalid input", () => {
      expect(formatCurrency("invalid")).toBe("₹0");
      expect(formatCurrency("")).toBe("₹0");
    });
  });

  describe("getRelativeTimeString", () => {
    beforeEach(() => {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date("2024-01-15T12:00:00Z"));
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it("should return 'just now' for very recent dates", () => {
      const date = new Date("2024-01-15T11:59:55Z");
      expect(getRelativeTimeString(date)).toBe("just now");
    });

    it("should return 'a few seconds ago' for dates within a minute", () => {
      const date = new Date("2024-01-15T11:59:30Z");
      expect(getRelativeTimeString(date)).toBe("a few seconds ago");
    });

    it("should return minutes ago", () => {
      const date = new Date("2024-01-15T11:55:00Z");
      expect(getRelativeTimeString(date)).toBe("5 minutes ago");
    });

    it("should return hours ago", () => {
      const date = new Date("2024-01-15T09:00:00Z");
      expect(getRelativeTimeString(date)).toBe("3 hours ago");
    });

    it("should return 'yesterday' for 1 day ago", () => {
      const date = new Date("2024-01-14T12:00:00Z");
      expect(getRelativeTimeString(date)).toBe("yesterday");
    });

    it("should return days ago", () => {
      const date = new Date("2024-01-10T12:00:00Z");
      expect(getRelativeTimeString(date)).toBe("5 days ago");
    });

    it("should return weeks ago", () => {
      const date = new Date("2024-01-01T12:00:00Z");
      expect(getRelativeTimeString(date)).toBe("2 weeks ago");
    });

    it("should return months ago", () => {
      const date = new Date("2023-11-15T12:00:00Z");
      expect(getRelativeTimeString(date)).toBe("2 months ago");
    });

    it("should return years ago", () => {
      const date = new Date("2022-01-15T12:00:00Z");
      expect(getRelativeTimeString(date)).toBe("2 years ago");
    });

    it("should handle future dates", () => {
      const futureDate = new Date("2024-01-16T12:00:00Z");
      expect(getRelativeTimeString(futureDate)).toBe("tomorrow");
      
      const farFuture = new Date("2024-01-22T12:00:00Z");
      expect(getRelativeTimeString(farFuture)).toBe("in 1 week");
    });

    it("should handle string dates", () => {
      const date = "2024-01-15T11:55:00Z";
      expect(getRelativeTimeString(date)).toBe("5 minutes ago");
    });

    it("should handle invalid dates", () => {
      expect(getRelativeTimeString("invalid")).toBe("Invalid date");
    });
  });
});