export interface HeartbeatPayload {
  deviceName: string;
  os: string;
  appName: string;
  windowTitle: string;
  startTime: string;
  endTime: string;
  duration: number;
}

interface HeartbeatSenderOptions {
  apiBaseUrl: string;
  apiKey: string;
  fetchImpl?: typeof fetch;
}

export type SendHeartbeat = (payload: HeartbeatPayload) => Promise<boolean>;

function normalizeApiBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export function buildHeartbeatHeaders(apiKey: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (apiKey.trim().length > 0) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  return headers;
}

export function createHeartbeatSender({
  apiBaseUrl,
  apiKey,
  fetchImpl = fetch,
}: HeartbeatSenderOptions): SendHeartbeat {
  const endpoint = `${normalizeApiBaseUrl(apiBaseUrl)}/api/events/heartbeat`;
  const headers = buildHeartbeatHeaders(apiKey);

  return async function sendHeartbeat(payload: HeartbeatPayload): Promise<boolean> {
    try {
      const response = await fetchImpl(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.text();
        console.error(
          `[extension] Heartbeat failed (${response.status}): ${body}`,
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error(
        `[extension] Heartbeat request error:`,
        (error as Error).message,
      );
      return false;
    }
  };
}
