import type { DailyStats } from "./types.js";

export function recordTime(
  stats: DailyStats,
  domain: string,
  seconds: number,
): DailyStats {
  if (seconds <= 0 || !domain) {
    return stats;
  }

  const existing = stats.domains[domain] ?? 0;
  return {
    ...stats,
    domains: {
      ...stats.domains,
      [domain]: existing + seconds,
    },
  };
}

export interface TopSite {
  domain: string;
  seconds: number;
}

export function getTodayTopSites(stats: DailyStats, limit: number = 10): TopSite[] {
  return Object.entries(stats.domains)
    .map(([domain, seconds]) => ({ domain, seconds }))
    .sort((a, b) => b.seconds - a.seconds)
    .slice(0, limit);
}

export function getTotalSeconds(stats: DailyStats): number {
  return Object.values(stats.domains).reduce((sum, s) => sum + s, 0);
}

export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return "";
  }
}
