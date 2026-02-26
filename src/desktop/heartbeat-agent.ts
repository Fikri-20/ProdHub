import type { HeartbeatPayload, SendHeartbeat } from "./heartbeat-sender.js";

export interface ActiveWindowInfo {
  appName: string;
  windowTitle: string;
}

interface SessionState {
  appName: string;
  windowTitle: string;
  startTime: Date;
}

interface HeartbeatAgentOptions {
  deviceName: string;
  os: string;
  pollIntervalMs: number;
  getActiveWindow: () => Promise<ActiveWindowInfo | null>;
  sendHeartbeat: SendHeartbeat;
  now?: () => Date;
}

export interface HeartbeatAgent {
  start: () => void;
  stop: () => Promise<void>;
  pollOnce: () => Promise<void>;
}

function sanitizeWindowInfo(
  info: ActiveWindowInfo | null,
): ActiveWindowInfo | null {
  if (!info) {
    return null;
  }

  const appName = info.appName.trim();
  const windowTitle = info.windowTitle.trim();

  if (!appName || !windowTitle) {
    return null;
  }

  return { appName, windowTitle };
}

function buildPayload(
  deviceName: string,
  os: string,
  session: SessionState,
  endTime: Date,
): HeartbeatPayload {
  const duration = Math.max(
    1,
    Math.round((endTime.getTime() - session.startTime.getTime()) / 1000),
  );

  return {
    deviceName,
    os,
    appName: session.appName,
    windowTitle: session.windowTitle,
    startTime: session.startTime.toISOString(),
    endTime: endTime.toISOString(),
    duration,
  };
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function createHeartbeatAgent({
  deviceName,
  os,
  pollIntervalMs,
  getActiveWindow,
  sendHeartbeat,
  now = () => new Date(),
}: HeartbeatAgentOptions): HeartbeatAgent {
  let timer: NodeJS.Timeout | null = null;
  let isPolling = false;
  let currentSession: SessionState | null = null;

  async function flushCurrentSession(endTime: Date): Promise<void> {
    if (!currentSession) {
      return;
    }

    const payload = buildPayload(deviceName, os, currentSession, endTime);
    currentSession = null;
    await sendHeartbeat(payload);
  }

  async function waitForActivePoll(): Promise<void> {
    while (isPolling) {
      await sleep(10);
    }
  }

  async function pollOnce(): Promise<void> {
    if (isPolling) {
      return;
    }

    isPolling = true;
    try {
      const active = sanitizeWindowInfo(await getActiveWindow());
      if (!active) {
        return;
      }

      const currentTime = now();

      if (!currentSession) {
        currentSession = {
          appName: active.appName,
          windowTitle: active.windowTitle,
          startTime: currentTime,
        };
        return;
      }

      if (
        currentSession.appName === active.appName &&
        currentSession.windowTitle === active.windowTitle
      ) {
        return;
      }

      await flushCurrentSession(currentTime);
      currentSession = {
        appName: active.appName,
        windowTitle: active.windowTitle,
        startTime: currentTime,
      };
    } finally {
      isPolling = false;
    }
  }

  function start() {
    if (timer) {
      return;
    }

    void pollOnce();
    timer = setInterval(() => {
      void pollOnce();
    }, pollIntervalMs);
  }

  async function stop(): Promise<void> {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    await waitForActivePoll();
    await flushCurrentSession(now());
  }

  return { start, stop, pollOnce };
}
