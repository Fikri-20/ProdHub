import os from "node:os";
import { activeWindow } from "get-windows";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const API_URL = process.env.TRACKER_API_URL ?? "http://localhost:3000";
const POLL_INTERVAL_MS = 5_000;

const DEVICE_NAME = os.hostname();
const OS_NAME = (() => {
  const platform = os.platform();
  const map: Record<string, string> = {
    win32: "Windows",
    darwin: "macOS",
    linux: "Linux",
  };
  return map[platform] ?? platform;
})();

// ---------------------------------------------------------------------------
// Heartbeat sender
// ---------------------------------------------------------------------------
interface HeartbeatPayload {
  deviceName: string;
  os: string;
  appName: string;
  windowTitle: string;
  startTime: string;
  endTime: string;
  duration: number;
}

async function sendHeartbeat(payload: HeartbeatPayload): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/events/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[tracker] Heartbeat failed (${res.status}): ${body}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`[tracker] Heartbeat error:`, (err as Error).message);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Session tracking state
// ---------------------------------------------------------------------------
let currentApp = "";
let currentTitle = "";
let sessionStart: Date | null = null;

/**
 * Flush the current session — sends a heartbeat for the completed window session.
 * Returns true if the heartbeat was sent successfully.
 */
async function flushSession(): Promise<boolean> {
  if (!sessionStart || !currentApp) return true;

  const now = new Date();
  const duration = Math.max(
    0,
    Math.round((now.getTime() - sessionStart.getTime()) / 1000),
  );

  const payload: HeartbeatPayload = {
    deviceName: DEVICE_NAME,
    os: OS_NAME,
    appName: currentApp,
    windowTitle: currentTitle,
    startTime: sessionStart.toISOString(),
    endTime: now.toISOString(),
    duration,
  };

  return sendHeartbeat(payload);
}

// ---------------------------------------------------------------------------
// Main polling loop
// ---------------------------------------------------------------------------
const timer = setInterval(async () => {
  const win = await activeWindow();

  if (!win) {
    return;
  }

  const appName = win.owner.name;
  const windowTitle = win.title;

  // Same window still active — nothing to do yet
  if (appName === currentApp && windowTitle === currentTitle) {
    return;
  }

  // Window changed — flush the previous session
  if (sessionStart) {
    await flushSession();
  }

  // Start tracking the new session
  currentApp = appName;
  currentTitle = windowTitle;
  sessionStart = new Date();

  console.log(`[tracker] Switched to: ${appName} — "${windowTitle}"`);
}, POLL_INTERVAL_MS);

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------
async function shutdown() {
  clearInterval(timer);

  if (sessionStart && currentApp) {
    console.log(`[tracker] Shutting down — flushing final session...`);
    const ok = await flushSession();
    if (ok) {
      console.log(
        `[tracker] Final session sent: ${currentApp} (${Math.round((Date.now() - sessionStart.getTime()) / 1000)}s)`,
      );
    } else {
      console.error(`[tracker] Failed to send final session.`);
    }
  }

  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log(
  `[tracker] Started — device: ${DEVICE_NAME} (${OS_NAME}), API: ${API_URL}`,
);
