import * as vscode from "vscode";

let statusBarItem: vscode.StatusBarItem | null = null;

export function createStatusBar(): vscode.StatusBarItem {
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  statusBarItem.command = "prodhub.toggleTracking";
  updateStatusBar(true);
  statusBarItem.show();
  return statusBarItem;
}

export function updateStatusBar(trackingEnabled: boolean): void {
  if (!statusBarItem) return;

  if (trackingEnabled) {
    statusBarItem.text = "$(pulse) ProdHub";
    statusBarItem.tooltip = "ProdHub: Tracking active (click to pause)";
  } else {
    statusBarItem.text = "$(circle-slash) ProdHub";
    statusBarItem.tooltip = "ProdHub: Tracking paused (click to resume)";
  }
}

export function disposeStatusBar(): void {
  if (statusBarItem) {
    statusBarItem.dispose();
    statusBarItem = null;
  }
}
