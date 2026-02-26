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

const SKIPPED_PROTOCOLS = ["chrome:", "chrome-extension:", "about:", "devtools:", "edge:", "brave:"];

export function isTrackableUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return !SKIPPED_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    if (SKIPPED_PROTOCOLS.includes(parsed.protocol)) return "";
    return parsed.hostname;
  } catch {
    return "";
  }
}
