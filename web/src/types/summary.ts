export interface SummaryItem {
  name: string;
  totalDuration: number; // seconds
  percentage: number; // 0-100
}

export type SummaryGroupBy = "app" | "category";
