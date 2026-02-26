import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Session } from "next-auth";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

describe("apiClient (server-side)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue(new Response(JSON.stringify({ ok: true })));
  });

  it("should set X-User-Id header from session", async () => {
    const { auth } = await import("@/auth");
    const { apiClient } = await import("@/lib/api-client");
    const mockedAuth = vi.mocked(auth);

    const session: Session = {
      user: {
        id: "user-123",
        email: "test@example.com",
        name: null,
        image: null,
      },
      expires: new Date(Date.now() + 86_400_000).toISOString(),
    };
    mockedAuth.mockResolvedValue(session);

    await apiClient("/api/events");

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0]!;
    expect(url).toBe("http://localhost:3000/api/events");
    expect(options.headers).toMatchObject({
      "X-User-Id": "user-123",
      "Content-Type": "application/json",
    });
  });

  it("should throw if not authenticated", async () => {
    const { auth } = await import("@/auth");
    const { apiClient } = await import("@/lib/api-client");
    const mockedAuth = vi.mocked(auth);

    mockedAuth.mockResolvedValue(null);

    await expect(apiClient("/api/events")).rejects.toThrow("Not authenticated");
  });
});

describe("createClientApiClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue(new Response(JSON.stringify({ ok: true })));
  });

  it("should create a fetch function that sets X-User-Id header", async () => {
    const { createClientApiClient } = await import("@/lib/client-api");

    const userId = "test-user-uuid-123";
    const clientFetch = createClientApiClient(userId);

    await clientFetch("/api/events");

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0]!;

    expect(url).toBe("http://localhost:3000/api/events");
    expect(options.headers).toMatchObject({
      "Content-Type": "application/json",
      "X-User-Id": userId,
    });
  });

  it("should set the correct base URL", async () => {
    const { createClientApiClient } = await import("@/lib/client-api");

    const clientFetch = createClientApiClient("user-1");
    await clientFetch("/api/summary?groupBy=app");

    const [url] = mockFetch.mock.calls[0]!;
    expect(url).toBe("http://localhost:3000/api/summary?groupBy=app");
  });

  it("should merge custom headers with default headers", async () => {
    const { createClientApiClient } = await import("@/lib/client-api");

    const clientFetch = createClientApiClient("user-2");
    await clientFetch("/api/events", {
      method: "POST",
      headers: { "X-Custom": "value" },
    });

    const [, options] = mockFetch.mock.calls[0]!;
    expect(options.headers).toMatchObject({
      "Content-Type": "application/json",
      "X-User-Id": "user-2",
      "X-Custom": "value",
    });
    expect(options.method).toBe("POST");
  });
});
