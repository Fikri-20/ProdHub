// Load .env for development (no-op in packaged builds where .env doesn't exist)
try {
  process.loadEnvFile();
} catch {}
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { app, Menu, Tray, nativeImage, shell } from "electron";
import { activeWindow } from "get-windows";
import {
  configureAutoStart,
  parseAllowDevAutoStart,
} from "./auto-start.js";
import { getConfigPath, loadConfig } from "./config.js";
import { createHeartbeatAgent } from "./heartbeat-agent.js";
import { createHeartbeatSender } from "./heartbeat-sender.js";
import { DESKTOP_APP_NAME, TRAY_TOOLTIP } from "./tray-constants.js";
import { buildTrayMenuTemplate } from "./tray-menu.js";

let tray: Tray | null = null;
let isShuttingDown = false;
let isTrackingPaused = false;
let heartbeatAgent: ReturnType<typeof createHeartbeatAgent> | null = null;

const config = loadConfig();

const API_URL = config.apiUrl;
const API_KEY = config.apiKey;
const AUTO_START_ENABLED = config.autoStartEnabled;
const AUTO_START_ALLOW_DEV = parseAllowDevAutoStart(
  process.env.TRACKER_AUTOSTART_ALLOW_DEV,
);
const POLL_INTERVAL_MS = config.pollIntervalMs;
const DEVICE_NAME = os.hostname();
const DASHBOARD_URL = normalizeUrl(config.dashboardUrl);

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function resolveOsName(): string {
  const platform = os.platform();
  const mapping: Record<string, string> = {
    win32: "Windows",
    darwin: "macOS",
    linux: "Linux",
  };
  return mapping[platform] ?? platform;
}

async function getActiveWindowInfo() {
  try {
    const win = await activeWindow();
    if (!win) {
      return null;
    }

    return {
      appName: win.owner?.name ?? "",
      windowTitle: win.title ?? "",
    };
  } catch (error) {
    console.error(
      "[desktop] activeWindow() failed:",
      (error as Error).message,
    );
    return null;
  }
}

function ensureHeartbeatAgentRunning() {
  if (isTrackingPaused) {
    return;
  }

  if (heartbeatAgent) {
    heartbeatAgent.start();
    return;
  }

  const sendHeartbeat = createHeartbeatSender({
    apiBaseUrl: API_URL,
    apiKey: API_KEY,
  });

  heartbeatAgent = createHeartbeatAgent({
    deviceName: DEVICE_NAME,
    os: resolveOsName(),
    pollIntervalMs: POLL_INTERVAL_MS,
    getActiveWindow: getActiveWindowInfo,
    sendHeartbeat,
  });
  heartbeatAgent.start();
}

function refreshTrayMenu() {
  if (!tray) {
    return;
  }

  tray.setContextMenu(
    Menu.buildFromTemplate(
      buildTrayMenuTemplate({
        isTrackingPaused,
        onToggleTracking: () => {
          void toggleTracking();
        },
        onOpenDashboard: () => {
          void openExternalUrl(DASHBOARD_URL, "dashboard");
        },
        onOpenSettings: () => {
          void openSettings();
        },
        onQuit: () => app.quit(),
      }),
    ),
  );
}

async function openExternalUrl(url: string, label: string): Promise<void> {
  try {
    await shell.openExternal(url);
  } catch (error) {
    console.error(
      `[desktop] Failed to open ${label} URL:`,
      (error as Error).message,
    );
  }
}

async function openSettings(): Promise<void> {
  try {
    await shell.openPath(getConfigPath());
  } catch (error) {
    console.error(
      "[desktop] Failed to open settings:",
      (error as Error).message,
    );
  }
}

async function pauseTracking(): Promise<void> {
  if (isTrackingPaused) {
    return;
  }

  isTrackingPaused = true;
  refreshTrayMenu();

  if (!heartbeatAgent) {
    return;
  }

  await heartbeatAgent.stop();
}

function resumeTracking(): void {
  if (!isTrackingPaused) {
    return;
  }

  isTrackingPaused = false;
  ensureHeartbeatAgentRunning();
  refreshTrayMenu();
}

async function toggleTracking(): Promise<void> {
  if (isTrackingPaused) {
    resumeTracking();
    return;
  }

  await pauseTracking();
}

function createTrayIcon() {
  // Load icon.png from app directory (works inside asar via patched fs)
  const iconPath = path.join(__dirname, "icon.png");
  try {
    const iconData = readFileSync(iconPath);
    const icon = nativeImage.createFromBuffer(iconData);
    if (!icon.isEmpty()) {
      return icon.resize({ width: 16, height: 16 });
    }
    console.warn("[desktop] Icon loaded but was empty:", iconPath);
  } catch (err) {
    console.error(
      "[desktop] Failed to load icon from",
      iconPath,
      (err as Error).message,
    );
  }

  console.warn("[desktop] Using empty fallback tray icon");
  return nativeImage.createEmpty();
}

function createTray() {
  const trayInstance = new Tray(createTrayIcon());
  trayInstance.setToolTip(TRAY_TOOLTIP);
  return trayInstance;
}

async function probeActiveWindow(): Promise<void> {
  try {
    const result = await activeWindow();
    console.log(
      "[desktop] activeWindow() probe:",
      result ? `OK (${result.owner?.name ?? "unknown"})` : "returned null",
    );
  } catch (error) {
    console.error(
      "[desktop] activeWindow() probe FAILED:",
      (error as Error).message,
    );
  }
}

function initializeTrayApp() {
  app.setName(DESKTOP_APP_NAME);

  console.log("[desktop] Config loaded:", {
    apiUrl: API_URL,
    apiKey: API_KEY ? `${API_KEY.slice(0, 6)}...` : "(empty)",
    dashboardUrl: DASHBOARD_URL,
    pollIntervalMs: POLL_INTERVAL_MS,
  });

  configureAutoStart({
    loginItemApi: app,
    platform: process.platform,
    enabled: AUTO_START_ENABLED,
    allowInDev: AUTO_START_ALLOW_DEV,
  });

  if (process.platform === "darwin" && app.dock) {
    app.dock.hide();
  }

  tray = createTray();
  refreshTrayMenu();

  // Probe activeWindow on startup to log whether native module works
  void probeActiveWindow();

  ensureHeartbeatAgentRunning();
}

const hasSingleInstanceLock = app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.whenReady().then(() => {
    initializeTrayApp();
  });

  app.on("before-quit", (event) => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;

    if (!heartbeatAgent) {
      return;
    }

    event.preventDefault();
    void heartbeatAgent.stop().finally(() => {
      heartbeatAgent = null;
      app.exit(0);
    });
  });

  app.on("window-all-closed", () => {
    // Tray-only app: do not quit when all windows close
  });

  app.on("second-instance", () => {
    if (!tray) {
      tray = createTray();
      refreshTrayMenu();
    }
  });

  app.on("activate", () => {
    if (!tray) {
      tray = createTray();
      refreshTrayMenu();
    }
    ensureHeartbeatAgentRunning();
  });
}
