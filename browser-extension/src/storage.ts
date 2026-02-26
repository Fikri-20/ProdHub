import { type ExtensionConfig, type TabSession, type DailyStats, DEFAULT_CONFIG } from "./types.js";

function hasChromeStorage(): boolean {
  return typeof chrome !== "undefined" && !!chrome.storage;
}

export async function loadConfig(): Promise<ExtensionConfig> {
  if (!hasChromeStorage()) return { ...DEFAULT_CONFIG };

  const result = await chrome.storage.sync.get("config");
  if (result.config) {
    return { ...DEFAULT_CONFIG, ...result.config } as ExtensionConfig;
  }
  return { ...DEFAULT_CONFIG };
}

export async function saveConfig(config: ExtensionConfig): Promise<void> {
  if (!hasChromeStorage()) return;
  await chrome.storage.sync.set({ config });
}

export async function loadSession(): Promise<TabSession | null> {
  if (!hasChromeStorage()) return null;

  const result = await chrome.storage.local.get("session");
  return (result.session as TabSession | undefined) ?? null;
}

export async function saveSession(session: TabSession | null): Promise<void> {
  if (!hasChromeStorage()) return;

  if (session === null) {
    await chrome.storage.local.remove("session");
  } else {
    await chrome.storage.local.set({ session });
  }
}

export async function loadDailyStats(): Promise<DailyStats> {
  const today = new Date().toISOString().slice(0, 10);

  if (!hasChromeStorage()) return { date: today, domains: {} };

  const result = await chrome.storage.local.get("dailyStats");
  const stats = result.dailyStats as DailyStats | undefined;

  if (stats && stats.date === today) {
    return stats;
  }

  return { date: today, domains: {} };
}

export async function saveDailyStats(stats: DailyStats): Promise<void> {
  if (!hasChromeStorage()) return;
  await chrome.storage.local.set({ dailyStats: stats });
}
