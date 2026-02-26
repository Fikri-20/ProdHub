import type { ExtensionConfig, TabSession } from "./types.js";
import type { SendHeartbeat } from "./heartbeat-sender.js";
import { extractDomain, recordTime } from "./daily-stats.js";
import { loadConfig, loadSession, saveSession, loadDailyStats, saveDailyStats } from "./storage.js";
import { createHeartbeatSender } from "./heartbeat-sender.js";

let cachedConfig: ExtensionConfig | null = null;
let cachedSender: SendHeartbeat | null = null;

export async function getConfig(): Promise<ExtensionConfig> {
  if (!cachedConfig) {
    cachedConfig = await loadConfig();
  }
  return cachedConfig;
}

export function invalidateConfigCache(): void {
  cachedConfig = null;
  cachedSender = null;
}

function getSender(config: ExtensionConfig): SendHeartbeat | null {
  if (!config.apiKey) {
    return null;
  }

  if (!cachedSender) {
    cachedSender = createHeartbeatSender({
      apiBaseUrl: config.apiBaseUrl,
      apiKey: config.apiKey,
    });
  }

  return cachedSender;
}

async function flushSession(
  session: TabSession,
  endTime: number,
): Promise<void> {
  const durationSeconds = Math.max(1, Math.round((endTime - session.startTime) / 1000));

  // Record to daily stats
  const stats = await loadDailyStats();
  const updated = recordTime(stats, session.domain, durationSeconds);
  await saveDailyStats(updated);

  // Send heartbeat if configured
  const config = await getConfig();
  const sender = getSender(config);

  if (sender) {
    // Include domain in windowTitle so server-side category rules can match domains
    const windowTitle = session.domain
      ? `${session.domain} — ${session.title}`
      : session.title;

    await sender({
      deviceName: config.deviceName,
      os: "Browser",
      appName: "Chrome",
      windowTitle,
      startTime: new Date(session.startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration: durationSeconds,
    });
  }
}

export async function handleTabChange(
  tabId: number,
  url: string,
  title: string,
): Promise<void> {
  const config = await getConfig();
  if (!config.trackingEnabled) {
    return;
  }

  const now = Date.now();
  const currentSession = await loadSession();

  // Flush previous session
  if (currentSession) {
    await flushSession(currentSession, now);
  }

  const domain = extractDomain(url);
  if (!domain) {
    await saveSession(null);
    return;
  }

  // Start new session
  const newSession: TabSession = {
    tabId,
    url,
    title,
    domain,
    startTime: now,
  };

  await saveSession(newSession);
}

export async function handleWindowBlur(): Promise<void> {
  const currentSession = await loadSession();
  if (currentSession) {
    await flushSession(currentSession, Date.now());
    await saveSession(null);
  }
}

export async function handleAlarmFlush(): Promise<void> {
  const currentSession = await loadSession();
  if (!currentSession) {
    return;
  }

  const now = Date.now();
  await flushSession(currentSession, now);

  // Restart session from now
  await saveSession({
    ...currentSession,
    startTime: now,
  });
}
