import { ALARM_NAME, ALARM_INTERVAL_MINUTES } from "./types.js";
import { handleTabChange, handleWindowBlur, handleAlarmFlush, invalidateConfigCache } from "./session-manager.js";

chrome.runtime.onInstalled.addListener(() => {
  console.log("[ProdHub] Browser extension installed");
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_INTERVAL_MINUTES });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_INTERVAL_MINUTES });
});

async function getActiveTabInfo(): Promise<{ tabId: number; url: string; title: string } | null> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url || !tab.title) {
      return null;
    }

    // Skip chrome:// and extension pages
    if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
      return null;
    }

    return { tabId: tab.id, url: tab.url, title: tab.title };
  } catch {
    return null;
  }
}

chrome.tabs.onActivated.addListener(async (_activeInfo) => {
  const info = await getActiveTabInfo();
  if (info) {
    await handleTabChange(info.tabId, info.url, info.title);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only react to complete navigations on the active tab
  if (changeInfo.status !== "complete" || !tab.active) {
    return;
  }

  if (!tab.url || !tab.title) {
    return;
  }

  if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
    return;
  }

  await handleTabChange(tabId, tab.url, tab.title);
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await handleWindowBlur();
    return;
  }

  const info = await getActiveTabInfo();
  if (info) {
    await handleTabChange(info.tabId, info.url, info.title);
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    await handleAlarmFlush();
  }
});

// Listen for config changes from popup
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.config) {
    invalidateConfigCache();
  }
});
