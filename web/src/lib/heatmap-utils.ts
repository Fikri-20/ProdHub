import type {
  HeatmapDay,
  HeatmapLevel,
  HeatmapCell,
  HeatmapGridData,
} from "@/types/heatmap";

/**
 * Compute intensity level (0-4) based on quartile thresholds.
 * Level 0 = no activity, levels 1-4 divide the range into quartiles.
 */
export function computeLevel(duration: number, max: number): HeatmapLevel {
  if (duration === 0 || max === 0) return 0;
  const ratio = duration / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

/**
 * Build a full heatmap grid (~52 weeks) from API data.
 * Generates one cell per day, filling in zeros for days with no data.
 */
export function buildHeatmapGrid(data: HeatmapDay[]): HeatmapGridData {
  // Build a lookup from date string to duration
  const durationMap = new Map<string, number>();
  for (const day of data) {
    durationMap.set(day.date, day.totalDuration);
  }

  // Find max duration for level calculation
  const maxDuration = data.reduce(
    (max, d) => Math.max(max, d.totalDuration),
    0,
  );

  // Calculate date range: ~1 year ending today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start from the Sunday ~52 weeks ago
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);
  // Align to Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const cells: HeatmapCell[] = [];
  const monthLabels: Array<{ label: string; weekIndex: number }> = [];
  const seenMonths = new Set<string>();

  const current = new Date(startDate);
  let weekIndex = 0;

  while (current <= today) {
    const dayOfWeek = current.getDay();

    // Track month labels
    const monthKey = `${current.getFullYear()}-${current.getMonth()}`;
    if (!seenMonths.has(monthKey)) {
      seenMonths.add(monthKey);
      const label = current.toLocaleDateString("en-US", { month: "short" });
      monthLabels.push({ label, weekIndex });
    }

    const dateStr = formatDateKey(current);
    const duration = durationMap.get(dateStr) ?? 0;

    cells.push({
      date: dateStr,
      totalDuration: duration,
      level: computeLevel(duration, maxDuration),
      weekIndex,
      dayOfWeek,
    });

    // Advance to next day
    current.setDate(current.getDate() + 1);

    // If we crossed into a new week (Sunday), increment weekIndex
    if (current.getDay() === 0 && current <= today) {
      weekIndex++;
    }
  }

  return {
    cells,
    monthLabels,
    totalWeeks: weekIndex + 1,
  };
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format a date string (YYYY-MM-DD) to a human-readable label.
 */
export function formatHeatmapDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year!, month! - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
