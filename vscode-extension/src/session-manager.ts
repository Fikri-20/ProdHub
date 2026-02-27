import * as vscode from "vscode";
import type { Config, FileSession } from "./types.js";
import { IDLE_THRESHOLD_MS, FLUSH_INTERVAL_MS, loadConfig, getOsName } from "./types.js";
import { createHeartbeatSender, type SendHeartbeat } from "./heartbeat-sender.js";

let currentSession: FileSession | null = null;
let flushTimer: ReturnType<typeof setInterval> | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let sender: SendHeartbeat | null = null;
let cachedConfig: Config | null = null;

function getConfig(): Config {
  if (!cachedConfig) {
    cachedConfig = loadConfig();
  }
  return cachedConfig;
}

function getSender(): SendHeartbeat | null {
  const config = getConfig();
  if (!config.apiKey) {
    return null;
  }
  if (!sender) {
    sender = createHeartbeatSender(config.apiBaseUrl, config.apiKey);
  }
  return sender;
}

function buildWindowTitle(session: FileSession): string {
  const fileName = session.filePath.split(/[/\\]/).pop() ?? session.filePath;
  return `${fileName} [${session.languageId}] - ${session.projectName}`;
}

async function flushSession(endTime: number): Promise<void> {
  if (!currentSession) return;

  const cappedEnd = Math.min(endTime, currentSession.lastActivityTime + IDLE_THRESHOLD_MS);
  const durationSeconds = Math.max(1, Math.round((cappedEnd - currentSession.startTime) / 1000));

  if (durationSeconds <= 0) return;

  const config = getConfig();
  const send = getSender();
  if (!send) return;

  await send({
    deviceName: config.deviceName,
    os: getOsName(),
    appName: "VS Code",
    windowTitle: buildWindowTitle(currentSession),
    startTime: new Date(currentSession.startTime).toISOString(),
    endTime: new Date(cappedEnd).toISOString(),
    duration: durationSeconds,
  });
}

function resetIdleTimer(): void {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    // Idle threshold reached — flush and clear session
    if (currentSession) {
      flushSession(currentSession.lastActivityTime + IDLE_THRESHOLD_MS);
      currentSession = null;
    }
  }, IDLE_THRESHOLD_MS);
}

function getProjectName(): string {
  const folders = vscode.workspace.workspaceFolders;
  if (folders && folders.length > 0) {
    return folders[0]!.name;
  }
  return "Unknown";
}

// --- Public API ---

export function startSession(editor: vscode.TextEditor): void {
  const config = getConfig();
  if (!config.trackingEnabled) return;

  const now = Date.now();

  // Flush previous session
  if (currentSession) {
    flushSession(now);
  }

  currentSession = {
    filePath: editor.document.uri.fsPath,
    languageId: editor.document.languageId,
    projectName: getProjectName(),
    startTime: now,
    lastActivityTime: now,
  };

  resetIdleTimer();
}

export function recordActivity(): void {
  if (!currentSession) return;
  currentSession.lastActivityTime = Date.now();
  resetIdleTimer();
}

export function periodicFlush(): void {
  if (!currentSession) return;

  const now = Date.now();
  const timeSinceActivity = now - currentSession.lastActivityTime;

  // If idle beyond threshold, flush capped at last activity and clear
  if (timeSinceActivity >= IDLE_THRESHOLD_MS) {
    flushSession(currentSession.lastActivityTime + IDLE_THRESHOLD_MS);
    currentSession = null;
    return;
  }

  // Flush current segment and restart
  flushSession(now);
  currentSession.startTime = now;
}

export function handleWindowBlur(): void {
  if (!currentSession) return;
  const now = Date.now();
  flushSession(now);
  currentSession.startTime = now;
}

export function flushAndStop(): void {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
  if (currentSession) {
    flushSession(Date.now());
    currentSession = null;
  }
}

export function startPeriodicFlush(): void {
  if (flushTimer) clearInterval(flushTimer);
  flushTimer = setInterval(periodicFlush, FLUSH_INTERVAL_MS);
}

export function invalidateConfigCache(): void {
  cachedConfig = null;
  sender = null;
}
