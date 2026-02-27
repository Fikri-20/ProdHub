export interface ReportBucket {
  periodStart: string; // YYYY-MM-DD
  totalDuration: number; // seconds
  eventCount: number;
}

export type ReportPeriod = "weekly" | "monthly";
