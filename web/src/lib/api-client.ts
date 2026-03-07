import { getDefaultUserId } from "@/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/**
 * Server-side API client that fetches the default user ID and sets X-User-Id header.
 * Use in Server Components and Route Handlers.
 */
export async function apiClient(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const userId = await getDefaultUserId();

  const url = `${API_BASE_URL}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": userId,
      ...init?.headers,
    },
  });
}
