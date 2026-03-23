import { describe, it, expect } from "vitest";
import {
  computeLevel,
  buildHeatmapGrid,
  formatHeatmapDate,
} from "@/lib/heatmap-utils";
import type { HeatmapDay } from "@/types/heatmap";

describe("computeLevel", () => {
  it("returns 0 when duration is 0", () => {
    expect(computeLevel(0, 3600)).toBe(0);
  });

  it("returns 0 when max is 0", () => {
    expect(computeLevel(3600, 0)).toBe(0);
  });

  it("returns 1 for ratio <= 0.25", () => {
    expect(computeLevel(250, 1000)).toBe(1); // ratio = 0.25
    expect(computeLevel(100, 1000)).toBe(1); // ratio = 0.10
  });

  it("returns 2 for ratio <= 0.50", () => {
    expect(computeLevel(500, 1000)).toBe(2); // ratio = 0.50
    expect(computeLevel(400, 1000)).toBe(2); // ratio = 0.40
  });

  it("returns 3 for ratio <= 0.75", () => {
    expect(computeLevel(750, 1000)).toBe(3); // ratio = 0.75
    expect(computeLevel(600, 1000)).toBe(3); // ratio = 0.60
  });

  it("returns 4 for ratio > 0.75", () => {
    expect(computeLevel(1000, 1000)).toBe(4); // ratio = 1.0
    expect(computeLevel(800, 1000)).toBe(4); // ratio = 0.80
  });
});

describe("formatHeatmapDate", () => {
  it("formats a date string to a human-readable label", () => {
    const result = formatHeatmapDate("2026-03-22");
    // Should contain the month name and year
    expect(result).toContain("2026");
    expect(result).toContain("22");
    // "Mar" or "March" depending on locale
    expect(result.toLowerCase()).toMatch(/mar/);
  });

  it("formats January correctly", () => {
    const result = formatHeatmapDate("2026-01-01");
    expect(result).toContain("2026");
    expect(result).toContain("1");
    expect(result.toLowerCase()).toMatch(/jan/);
  });
});

describe("buildHeatmapGrid", () => {
  it("returns cells, monthLabels, and totalWeeks", () => {
    const grid = buildHeatmapGrid([]);
    expect(grid).toHaveProperty("cells");
    expect(grid).toHaveProperty("monthLabels");
    expect(grid).toHaveProperty("totalWeeks");
  });

  it("produces ~365 cells for empty input", () => {
    const grid = buildHeatmapGrid([]);
    // Grid spans ~52 weeks = ~364+ days
    expect(grid.cells.length).toBeGreaterThanOrEqual(364);
    expect(grid.cells.length).toBeLessThanOrEqual(371);
  });

  it("fills in zero duration for days with no data", () => {
    const grid = buildHeatmapGrid([]);
    const allZero = grid.cells.every((c) => c.totalDuration === 0 && c.level === 0);
    expect(allZero).toBe(true);
  });

  it("maps API data to the correct cell", () => {
    // Use a date from the grid itself to avoid timezone edge cases
    const emptyGrid = buildHeatmapGrid([]);
    const lastDate = emptyGrid.cells[emptyGrid.cells.length - 1]!.date;

    const data: HeatmapDay[] = [{ date: lastDate, totalDuration: 3600 }];
    const grid = buildHeatmapGrid(data);

    const matchedCell = grid.cells.find((c) => c.date === lastDate);
    expect(matchedCell).toBeDefined();
    expect(matchedCell!.totalDuration).toBe(3600);
    expect(matchedCell!.level).toBeGreaterThan(0);
  });

  it("assigns level 4 to the max duration day", () => {
    // Use dates from the grid itself for consistency
    const emptyGrid = buildHeatmapGrid([]);
    const lastIdx = emptyGrid.cells.length - 1;
    const maxDate = emptyGrid.cells[lastIdx]!.date;
    const minDate = emptyGrid.cells[lastIdx - 1]!.date;

    const data: HeatmapDay[] = [
      { date: maxDate, totalDuration: 7200 },    // max
      { date: minDate, totalDuration: 1800 },    // 25% of max
    ];

    const grid = buildHeatmapGrid(data);

    const maxCell = grid.cells.find((c) => c.date === maxDate);
    expect(maxCell).toBeDefined();
    expect(maxCell!.level).toBe(4);
  });

  it("generates at least 12 month labels", () => {
    const grid = buildHeatmapGrid([]);
    // ~1 year of data should have 12 or 13 month label entries
    expect(grid.monthLabels.length).toBeGreaterThanOrEqual(12);
  });

  it("month labels have increasing weekIndex values", () => {
    const grid = buildHeatmapGrid([]);
    for (let i = 1; i < grid.monthLabels.length; i++) {
      expect(grid.monthLabels[i]!.weekIndex).toBeGreaterThanOrEqual(
        grid.monthLabels[i - 1]!.weekIndex,
      );
    }
  });

  it("start date is aligned to Sunday", () => {
    const grid = buildHeatmapGrid([]);
    const firstCell = grid.cells[0];
    expect(firstCell).toBeDefined();
    // dayOfWeek 0 = Sunday
    expect(firstCell!.dayOfWeek).toBe(0);
  });

  it("cells have correct dayOfWeek values (0–6)", () => {
    const grid = buildHeatmapGrid([]);
    const unique = new Set(grid.cells.map((c) => c.dayOfWeek));
    // Should have all 7 days of the week represented
    expect(unique.size).toBe(7);
    for (const day of unique) {
      expect(day).toBeGreaterThanOrEqual(0);
      expect(day).toBeLessThanOrEqual(6);
    }
  });
});
