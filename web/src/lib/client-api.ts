const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/**
 * Client-side API client factory.
 * Use in Client Components where userId is available from the session.
 */
export function createClientApiClient(userId: string) {
  return async function clientFetch(
    path: string,
    init?: RequestInit,
  ): Promise<Response> {
    const url = `${API_BASE_URL}${path}`;
    const headers: Record<string, string> = {
      "X-User-Id": userId,
    };

    // Only set Content-Type when there's a body
    if (init?.body) {
      headers["Content-Type"] = "application/json";
    }

    // Merge any additional headers from init
    if (init?.headers) {
      const extra = init.headers as Record<string, string>;
      for (const [key, value] of Object.entries(extra)) {
        headers[key] = value;
      }
    }

    return fetch(url, {
      ...init,
      headers,
    });
  };
}
