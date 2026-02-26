import { ALARM_NAME, ALARM_INTERVAL_MINUTES, IDLE_THRESHOLD_SECONDS } from "./types.js";
import { handleTabChange, handleWindowBlur, handleAlarmFlush, invalidateConfigCache } from "./session-manager.js";

chrome.runtime.onInstalled.addListener(() => {
  console.log("[ProdHub] Browser extension installed");
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_INTERVAL_MINUTES });
  chrome.idle.setDetectionInterval(IDLE_THRESHOLD_SECONDS);
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_INTERVAL_MINUTES });
  chrome.idle.setDetectionInterval(IDLE_THRESHOLD_SECONDS);
});

function isSkippedUrl(url: string): boolean {
  return (
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("about:") ||
    url.startsWith("devtools://") ||
    url.startsWith("edge://") ||
    url.startsWith("brave://")
  );
}

async function getActiveTabInfo(): Promise<{ tabId: number; url: string; title: string } | null> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url || !tab.title) {
      return null;
    }

    // Skip incognito tabs
    if (tab.incognito) {
      return null;
    }

    // Skip browser internal pages
    if (isSkippedUrl(tab.url)) {
      return null;
    }

    return { tabId: tab.id, url: tab.url, title: tab.title };
  } catch {
    return null;
  }
}

// --- Tab activation ---
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // Check if the tab is in an incognito window
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.incognito) {
      await handleWindowBlur();
      return;
    }
  } catch {
    // Tab may not exist
    return;
  }

  const info = await getActiveTabInfo();
  if (info) {
    await handleTabChange(info.tabId, info.url, info.title);
  }
});

// --- Tab navigation complete ---
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.active) {
    return;
  }

  if (!tab.url || !tab.title) {
    return;
  }

  // Skip incognito tabs
  if (tab.incognito) {
    return;
  }

  if (isSkippedUrl(tab.url)) {
    return;
  }

  await handleTabChange(tabId, tab.url, tab.title);
});

// --- Window focus change (handles multiple windows) ---
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await handleWindowBlur();
    return;
  }

  // Check if the focused window is incognito
  try {
    const window = await chrome.windows.get(windowId);
    if (window.incognito) {
      await handleWindowBlur();
      return;
    }
  } catch {
    // Window may not exist
    return;
  }

  // Query the active tab in the newly focused window specifically
  try {
    const [tab] = await chrome.tabs.query({ active: true, windowId });
    if (!tab?.id || !tab.url || !tab.title) {
      return;
    }

    if (tab.incognito || isSkippedUrl(tab.url)) {
      await handleWindowBlur();
      return;
    }

    await handleTabChange(tab.id, tab.url, tab.title);
  } catch {
    // Ignore errors
  }
});

// --- Idle detection ---
chrome.idle.onStateChanged.addListener(async (newState) => {
  if (newState === "idle" || newState === "locked") {
    // User went idle or locked screen — flush current session
    await handleWindowBlur();
  } else if (newState === "active") {
    // User returned — pick up current active tab
    const info = await getActiveTabInfo();
    if (info) {
      await handleTabChange(info.tabId, info.url, info.title);
    }
  }
});

// --- Alarm flush (every 5 min) ---
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    await handleAlarmFlush();
  }
});

// --- Config changes from popup ---
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.config) {
    invalidateConfigCache();
  }
});
