import * as vscode from "vscode";
import { loadConfig } from "./types.js";
import {
  startSession,
  recordActivity,
  handleWindowBlur,
  flushAndStop,
  startPeriodicFlush,
  invalidateConfigCache,
} from "./session-manager.js";
import { createStatusBar, updateStatusBar, disposeStatusBar } from "./status-bar.js";

export function activate(context: vscode.ExtensionContext): void {
  // Status bar
  const statusBar = createStatusBar();
  context.subscriptions.push(statusBar);

  const config = loadConfig();
  updateStatusBar(config.trackingEnabled);

  // Start periodic flush timer
  startPeriodicFlush();

  // Toggle tracking command
  context.subscriptions.push(
    vscode.commands.registerCommand("prodhub.toggleTracking", () => {
      const cfg = vscode.workspace.getConfiguration("prodhub");
      const current = cfg.get<boolean>("trackingEnabled", true);
      cfg.update("trackingEnabled", !current, vscode.ConfigurationTarget.Global);
    }),
  );

  // File switch
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        startSession(editor);
      }
    }),
  );

  // Typing activity
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor && e.document === activeEditor.document) {
        recordActivity();
      }
    }),
  );

  // Window focus change
  context.subscriptions.push(
    vscode.window.onDidChangeWindowState((state) => {
      if (!state.focused) {
        handleWindowBlur();
      } else {
        // Resumed focus — start session for current editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          startSession(editor);
        }
      }
    }),
  );

  // Config change
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("prodhub")) {
        invalidateConfigCache();
        const newConfig = loadConfig();
        updateStatusBar(newConfig.trackingEnabled);

        if (!newConfig.trackingEnabled) {
          flushAndStop();
          startPeriodicFlush(); // keep timer alive so it resumes when re-enabled
        }
      }
    }),
  );

  // Start tracking current editor immediately
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    startSession(activeEditor);
  }
}

export function deactivate(): void {
  flushAndStop();
  disposeStatusBar();
}
