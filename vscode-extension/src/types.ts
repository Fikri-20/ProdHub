import * as os from "os";
import * as vscode from "vscode";

export interface Config {
  apiBaseUrl: string;
  apiKey: string;
  deviceName: string;
  trackingEnabled: boolean;
}

export interface FileSession {
  filePath: string;
  languageId: string;
  projectName: string;
  startTime: number;
  lastActivityTime: number;
}

export const FLUSH_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
export const IDLE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export function loadConfig(): Config {
  const cfg = vscode.workspace.getConfiguration("prodhub");
  return {
    apiBaseUrl: cfg.get<string>("apiBaseUrl", "http://localhost:3000"),
    apiKey: cfg.get<string>("apiKey", ""),
    deviceName: cfg.get<string>("deviceName", "") || os.hostname(),
    trackingEnabled: cfg.get<boolean>("trackingEnabled", true),
  };
}

export function getOsName(): string {
  switch (os.platform()) {
    case "win32":
      return "Windows";
    case "darwin":
      return "macOS";
    default:
      return "Linux";
  }
}
