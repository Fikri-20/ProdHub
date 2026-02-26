export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  totalDuration: number; // seconds
}

/** Intensity level 0 (no activity) through 4 (max activity) */
export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatmapCell {
  date: string; // YYYY-MM-DD
  totalDuration: number;
  level: HeatmapLevel;
  weekIndex: number;
  dayOfWeek: number; // 0 = Sun, 6 = Sat
}

export interface HeatmapGridData {
  cells: HeatmapCell[];
  monthLabels: Array<{ label: string; weekIndex: number }>;
  totalWeeks: number;
}
