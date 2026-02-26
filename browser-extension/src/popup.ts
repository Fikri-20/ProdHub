import { loadConfig, saveConfig, loadDailyStats } from "./storage.js";
import { getTodayTopSites, getTotalSeconds } from "./daily-stats.js";
import type { ExtensionConfig } from "./types.js";

function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function formatShortTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h}h ${rm}m`;
}

async function checkHealth(apiBaseUrl: string, apiKey: string): Promise<boolean> {
  if (!apiKey) return false;

  try {
    const url = `${apiBaseUrl.replace(/\/+$/, "")}/api/events/health`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
    };

    const response = await fetch(url, { headers, signal: AbortSignal.timeout(5000) });
    return response.ok;
  } catch {
    return false;
  }
}

function setStatus(dot: HTMLElement, text: HTMLElement, state: "connected" | "disconnected" | "paused") {
  dot.className = "status-dot";

  switch (state) {
    case "connected":
      dot.classList.add("status-dot--green");
      text.textContent = "Connected";
      break;
    case "disconnected":
      dot.classList.add("status-dot--red");
      text.textContent = "Disconnected";
      break;
    case "paused":
      dot.classList.add("status-dot--gray");
      text.textContent = "Paused";
      break;
  }
}

function renderTopSites(container: HTMLElement, stats: Awaited<ReturnType<typeof loadDailyStats>>) {
  const topSites = getTodayTopSites(stats, 10);
  container.innerHTML = "";

  if (topSites.length === 0) {
    container.innerHTML = '<div style="color: var(--text-secondary); font-size: 12px;">No activity recorded today</div>';
    return;
  }

  const maxSeconds = topSites[0]?.seconds ?? 1;

  for (const site of topSites) {
    const row = document.createElement("div");
    row.className = "site-row";

    const domain = document.createElement("span");
    domain.className = "site-row__domain";
    domain.textContent = site.domain;
    domain.title = site.domain;

    const barContainer = document.createElement("div");
    barContainer.className = "site-row__bar-container";

    const bar = document.createElement("div");
    bar.className = "site-row__bar";
    bar.style.width = `${Math.round((site.seconds / maxSeconds) * 100)}%`;

    barContainer.appendChild(bar);

    const time = document.createElement("span");
    time.className = "site-row__time";
    time.textContent = formatShortTime(site.seconds);

    row.appendChild(domain);
    row.appendChild(barContainer);
    row.appendChild(time);
    container.appendChild(row);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const statusDot = document.getElementById("status-dot")!;
  const statusText = document.getElementById("status-text")!;
  const settingsToggle = document.getElementById("settings-toggle")!;
  const settingsPanel = document.getElementById("settings-panel")!;
  const apiUrlInput = document.getElementById("api-url") as HTMLInputElement;
  const apiKeyInput = document.getElementById("api-key") as HTMLInputElement;
  const deviceNameInput = document.getElementById("device-name") as HTMLInputElement;
  const trackingToggle = document.getElementById("tracking-toggle") as HTMLInputElement;
  const saveBtn = document.getElementById("save-settings")!;
  const totalTimeEl = document.getElementById("total-time")!;
  const topSitesEl = document.getElementById("top-sites")!;

  // Settings toggle
  settingsToggle.setAttribute("aria-expanded", "false");
  settingsToggle.addEventListener("click", () => {
    const expanded = settingsToggle.getAttribute("aria-expanded") === "true";
    settingsToggle.setAttribute("aria-expanded", String(!expanded));
    settingsPanel.classList.toggle("settings-panel--collapsed", expanded);
    settingsPanel.classList.toggle("settings-panel--expanded", !expanded);
  });

  // Load config
  const config = await loadConfig();
  apiUrlInput.value = config.apiBaseUrl;
  apiKeyInput.value = config.apiKey;
  deviceNameInput.value = config.deviceName;
  trackingToggle.checked = config.trackingEnabled;

  // Save config
  saveBtn.addEventListener("click", async () => {
    const newConfig: ExtensionConfig = {
      apiBaseUrl: apiUrlInput.value || "http://localhost:3000",
      apiKey: apiKeyInput.value,
      deviceName: deviceNameInput.value || "Chrome Browser",
      trackingEnabled: trackingToggle.checked,
    };

    await saveConfig(newConfig);
    await updateStatus(newConfig);

    saveBtn.textContent = "Saved!";
    setTimeout(() => { saveBtn.textContent = "Save"; }, 1500);
  });

  // Load daily stats
  const stats = await loadDailyStats();
  const total = getTotalSeconds(stats);
  totalTimeEl.textContent = formatTime(total);
  renderTopSites(topSitesEl, stats);

  // Check status
  async function updateStatus(cfg: ExtensionConfig) {
    if (!cfg.trackingEnabled) {
      setStatus(statusDot, statusText, "paused");
      return;
    }

    if (!cfg.apiKey) {
      setStatus(statusDot, statusText, "disconnected");
      statusText.textContent = "No API key";
      return;
    }

    const healthy = await checkHealth(cfg.apiBaseUrl, cfg.apiKey);
    setStatus(statusDot, statusText, healthy ? "connected" : "disconnected");
  }

  await updateStatus(config);
});
