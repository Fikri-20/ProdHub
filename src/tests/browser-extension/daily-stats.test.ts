import { describe, it, expect } from "vitest";
import { recordTime, getTodayTopSites, getTotalSeconds, extractDomain } from "../../../browser-extension/src/daily-stats.js";
import type { DailyStats } from "../../../browser-extension/src/types.js";

describe("recordTime", () => {
  const baseStats: DailyStats = { date: "2026-02-26", domains: {} };

  it("adds time for a new domain", () => {
    const result = recordTime(baseStats, "example.com", 60);
    expect(result.domains["example.com"]).toBe(60);
  });

  it("accumulates time for an existing domain", () => {
    const stats: DailyStats = { date: "2026-02-26", domains: { "example.com": 100 } };
    const result = recordTime(stats, "example.com", 50);
    expect(result.domains["example.com"]).toBe(150);
  });

  it("ignores zero or negative seconds", () => {
    const result = recordTime(baseStats, "example.com", 0);
    expect(result).toBe(baseStats);
  });

  it("ignores empty domain", () => {
    const result = recordTime(baseStats, "", 60);
    expect(result).toBe(baseStats);
  });
});

describe("getTodayTopSites", () => {
  it("returns sorted top sites", () => {
    const stats: DailyStats = {
      date: "2026-02-26",
      domains: {
        "a.com": 10,
        "b.com": 300,
        "c.com": 100,
      },
    };

    const top = getTodayTopSites(stats, 2);
    expect(top).toEqual([
      { domain: "b.com", seconds: 300 },
      { domain: "c.com", seconds: 100 },
    ]);
  });

  it("returns empty array for empty stats", () => {
    const stats: DailyStats = { date: "2026-02-26", domains: {} };
    expect(getTodayTopSites(stats)).toEqual([]);
  });
});

describe("getTotalSeconds", () => {
  it("sums all domain seconds", () => {
    const stats: DailyStats = {
      date: "2026-02-26",
      domains: { "a.com": 100, "b.com": 200 },
    };
    expect(getTotalSeconds(stats)).toBe(300);
  });
});

describe("extractDomain", () => {
  it("extracts hostname from URL", () => {
    expect(extractDomain("https://www.example.com/path")).toBe("www.example.com");
  });

  it("returns empty string for invalid URL", () => {
    expect(extractDomain("not-a-url")).toBe("");
  });
});
