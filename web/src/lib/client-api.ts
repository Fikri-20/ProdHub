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
    return fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": userId,
        ...init?.headers,
      },
    });
  };
}
