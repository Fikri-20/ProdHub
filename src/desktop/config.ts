import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { app } from "electron";

export interface DesktopConfig {
  apiUrl: string;
  apiKey: string;
  dashboardUrl: string;
  pollIntervalMs: number;
  autoStartEnabled: boolean;
}

const DEFAULTS: DesktopConfig = {
  apiUrl: "http://localhost:3000",
  apiKey: "",
  dashboardUrl: "http://localhost:3001/dashboard",
  pollIntervalMs: 5_000,
  autoStartEnabled: true,
};

export function getConfigDir(): string {
  return app.getPath("userData");
}

export function getConfigPath(): string {
  return path.join(getConfigDir(), "config.json");
}

function readJsonFile(filePath: string): Partial<DesktopConfig> {
  try {
    if (!existsSync(filePath)) {
      return {};
    }
    const raw = readFileSync(filePath, "utf8");
    return JSON.parse(raw) as Partial<DesktopConfig>;
  } catch {
    return {};
  }
}

function parsePollInterval(value: string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }
  return parsed;
}

function parseBool(value: string | undefined): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }
  return value === "true" || value === "1";
}

function envOverrides(): Partial<DesktopConfig> {
  const overrides: Partial<DesktopConfig> = {};

  if (process.env.TRACKER_API_URL !== undefined) {
    overrides.apiUrl = process.env.TRACKER_API_URL;
  }
  if (process.env.TRACKER_API_KEY !== undefined) {
    overrides.apiKey = process.env.TRACKER_API_KEY;
  }
  if (process.env.TRACKER_DASHBOARD_URL !== undefined) {
    overrides.dashboardUrl = process.env.TRACKER_DASHBOARD_URL;
  }

  const pollMs = parsePollInterval(process.env.TRACKER_POLL_INTERVAL_MS);
  if (pollMs !== undefined) {
    overrides.pollIntervalMs = pollMs;
  }

  const autoStart = parseBool(process.env.TRACKER_AUTO_START);
  if (autoStart !== undefined) {
    overrides.autoStartEnabled = autoStart;
  }

  return overrides;
}

/**
 * Try to load shared agent config from ~/.prodhub/agent.json (written by the server on startup).
 * Returns partial config with apiKey and apiUrl if available.
 */
function tryLoadSharedAgentConfig(): Partial<DesktopConfig> {
  try {
    const sharedPath = path.join(homedir(), ".prodhub", "agent.json");
    if (!existsSync(sharedPath)) {
      return {};
    }
    const raw = readFileSync(sharedPath, "utf8");
    const data = JSON.parse(raw) as { apiKey?: string; apiUrl?: string };
    const overrides: Partial<DesktopConfig> = {};
    if (data.apiKey) overrides.apiKey = data.apiKey;
    if (data.apiUrl) overrides.apiUrl = data.apiUrl;
    return overrides;
  } catch {
    return {};
  }
}

/**
 * Load config with priority: env vars > userData config.json > shared agent config > baked-in config.json > defaults.
 * On first launch, writes config.json to userData so the user has a file to edit.
 */
export function loadConfig(): DesktopConfig {
  // 1. Read userData config (e.g. %APPDATA%/ProdHub Agent/config.json)
  const userDataConfig = readJsonFile(getConfigPath());

  // 2. Read baked-in config from app directory (packaged builds)
  const bakedConfigPath = path.join(__dirname, "config.json");
  const bakedConfig = readJsonFile(bakedConfigPath);

  // 3. Load shared agent config from ~/.prodhub/agent.json
  const shared = tryLoadSharedAgentConfig();

  // 4. Get env var overrides
  const env = envOverrides();

  // Merge: defaults < baked < shared < userData < env
  const merged: DesktopConfig = {
    ...DEFAULTS,
    ...bakedConfig,
    ...shared,
    ...userDataConfig,
    ...env,
  };

  // Write to userData if config.json doesn't exist yet (first launch)
  if (!existsSync(getConfigPath())) {
    try {
      const dir = getConfigDir();
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(getConfigPath(), JSON.stringify(merged, null, 2));
    } catch {
      // Non-fatal: user can still use the app without persisted config
    }
  }

  return merged;
}

export function saveConfig(config: DesktopConfig): void {
  const dir = getConfigDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(getConfigPath(), JSON.stringify(config, null, 2));
}
