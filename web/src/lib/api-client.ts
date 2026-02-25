import { auth } from "@/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/**
 * Server-side API client that reads session and sets X-User-Id header.
 * Use in Server Components and Route Handlers.
 */
export async function apiClient(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const url = `${API_BASE_URL}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": session.user.id,
      ...init?.headers,
    },
  });
}

/**
 * Client-side API client factory.
 * Use in Client Components where userId is passed from the session context.
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
