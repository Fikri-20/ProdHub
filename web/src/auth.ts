const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

let cachedUserId: string | null = null;

/**
 * Get the default user ID from the Fastify server.
 * In self-hosted mode, there is always exactly one user.
 */
export async function getDefaultUserId(): Promise<string> {
  if (cachedUserId) return cachedUserId;

  const res = await fetch(`${API_BASE_URL}/api/setup/status`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch setup status from API server");
  }

  const data = (await res.json()) as { userId: string | null };
  if (!data.userId) {
    throw new Error("No default user configured on API server");
  }

  cachedUserId = data.userId;
  return cachedUserId;
}

/**
 * Compatibility shim: returns a session-like object for components
 * that previously used Auth.js session.
 */
export async function auth(): Promise<{ user: { id: string; email: string } } | null> {
  try {
    const userId = await getDefaultUserId();
    return {
      user: {
        id: userId,
        email: "admin@localhost",
      },
    };
  } catch {
    return null;
  }
}
