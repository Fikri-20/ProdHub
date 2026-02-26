import os from "node:os";
import { app, Menu, Tray, nativeImage } from "electron";
import { activeWindow } from "get-windows";
import {
  configureAutoStart,
  parseAllowDevAutoStart,
  parseAutoStartEnabled,
} from "./auto-start.js";
import { createHeartbeatAgent } from "./heartbeat-agent.js";
import { createHeartbeatSender } from "./heartbeat-sender.js";
import {
  DESKTOP_APP_NAME,
  TRAY_TOOLTIP,
} from "./tray-constants.js";
import { buildTrayMenuTemplate } from "./tray-menu.js";

let tray: Tray | null = null;
let isShuttingDown = false;
let heartbeatAgent: ReturnType<typeof createHeartbeatAgent> | null = null;

const API_URL = process.env.TRACKER_API_URL ?? "http://localhost:3000";
const API_KEY = process.env.TRACKER_API_KEY ?? "";
const AUTO_START_ENABLED = parseAutoStartEnabled(process.env.TRACKER_AUTO_START);
const AUTO_START_ALLOW_DEV = parseAllowDevAutoStart(
  process.env.TRACKER_AUTOSTART_ALLOW_DEV,
);

function parsePollInterval(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 5_000;
  }
  return parsed;
}

const POLL_INTERVAL_MS = parsePollInterval(process.env.TRACKER_POLL_INTERVAL_MS);
const DEVICE_NAME = os.hostname();

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
  const win = await activeWindow();
  if (!win) {
    return null;
  }

  return {
    appName: win.owner?.name ?? "",
    windowTitle: win.title ?? "",
  };
}

function ensureHeartbeatAgentRunning() {
  if (heartbeatAgent) {
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

function createTrayIcon() {
  const icon = nativeImage.createFromPath(process.execPath);

  if (!icon.isEmpty()) {
    return icon.resize({ width: 16, height: 16 });
  }

  return nativeImage.createEmpty();
}

function createTray() {
  const trayInstance = new Tray(createTrayIcon());
  trayInstance.setToolTip(TRAY_TOOLTIP);
  trayInstance.setContextMenu(
    Menu.buildFromTemplate(
      buildTrayMenuTemplate({
        onQuit: () => app.quit(),
      }),
    ),
  );
  return trayInstance;
}

function initializeTrayApp() {
  app.setName(DESKTOP_APP_NAME);

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

  app.on("window-all-closed", (event) => {
    if (!isShuttingDown) {
      event.preventDefault();
    }
  });

  app.on("second-instance", () => {
    if (!tray) {
      tray = createTray();
    }
  });

  app.on("activate", () => {
    if (!tray) {
      tray = createTray();
    }
    ensureHeartbeatAgentRunning();
  });
}
