import { activeWindow } from "get-windows";
import { type ActivityEvent } from "./types.js";
import { insertEvent, updateEvent } from "./database.js";

let lastApp = "";
let lastTitle = "";
let lastStartTime: Date | null = null;
let currentRowId: number | null = null;

setInterval(async () => {
  const win = await activeWindow();

  if (!win) {
    console.log("No active window found.");
    return;
  }

  const currentApp = win.owner.name;
  const now = new Date();

  if (lastApp === currentApp && currentRowId !== null && lastStartTime) {
    // Same app still active — extend the existing row
    const duration = Math.floor(
      (now.getTime() - lastStartTime.getTime()) / 1000,
    );
    updateEvent(currentRowId, now.toISOString(), duration);
  } else {
    // App switched — insert a new row for the new app
    lastApp = currentApp;
    lastTitle = win.title;
    lastStartTime = now;

    const event: ActivityEvent = {
      appName: currentApp,
      windowTitle: win.title,
      startTime: now.toISOString(),
      endTime: now.toISOString(),
      duration: 0,
    };
    currentRowId = insertEvent(event);
    console.log(`Switched to: ${currentApp} — "${win.title}"`);
  }
}, 5000);

function shutdown() {
  if (currentRowId !== null && lastStartTime) {
    const now = new Date();
    const duration = Math.floor(
      (now.getTime() - lastStartTime.getTime()) / 1000,
    );
    updateEvent(currentRowId, now.toISOString(), duration);
    console.log(`Saved final event: ${lastApp} for ${duration}s`);
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
