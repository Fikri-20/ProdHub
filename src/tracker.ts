import { activeWindow } from "get-windows";

let lastApp = "";
setInterval(async () => {
  const win = await activeWindow();

  if (!win) {
    console.log("No active window found.");
    return;
  }

  if (lastApp !== win.owner.name) {
    console.log("Window title:", win.title);
    console.log("Application:", win.owner.name);
    console.log("Application path:", win.owner.path);
    console.log("Application PID:", win.owner.processId);
    lastApp = win.owner.name;
  }
}, 5000);
