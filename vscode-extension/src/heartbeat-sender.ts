export interface HeartbeatPayload {
  deviceName: string;
  os: string;
  appName: string;
  windowTitle: string;
  startTime: string;
  endTime: string;
  duration: number;
}

export type SendHeartbeat = (payload: HeartbeatPayload) => Promise<boolean>;

function normalizeApiBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export function createHeartbeatSender(
  apiBaseUrl: string,
  apiKey: string,
): SendHeartbeat {
  const endpoint = `${normalizeApiBaseUrl(apiBaseUrl)}/api/events/heartbeat`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey.trim().length > 0) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  return async function sendHeartbeat(
    payload: HeartbeatPayload,
  ): Promise<boolean> {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.text();
        console.error(
          `[ProdHub] Heartbeat failed (${response.status}): ${body}`,
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error(
        `[ProdHub] Heartbeat request error:`,
        (error as Error).message,
      );
      return false;
    }
  };
}
