import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createCategory,
  deleteCategory,
  fetchEvents,
  fetchLatestEvent,
} from "@/lib/dashboard-queries";

type ClientFetch = (path: string, init?: RequestInit) => Promise<Response>;

describe("dashboard query functions", () => {
  let clientFetch: ReturnType<typeof vi.fn<ClientFetch>>;

  beforeEach(() => {
    clientFetch = vi.fn<ClientFetch>();
  });

  it("fetchEvents builds range params with limit", async () => {
    clientFetch.mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));

    await fetchEvents(clientFetch, "7d");

    expect(clientFetch).toHaveBeenCalledOnce();
    const [path] = clientFetch.mock.calls[0]!;
    expect(path.startsWith("/api/events?")).toBe(true);

    const params = new URLSearchParams(path.split("?")[1]);
    expect(params.get("limit")).toBe("500");
    expect(params.get("from")).toBeTruthy();
    expect(params.get("to")).toBeTruthy();
  });

  it("fetchLatestEvent returns null for 204", async () => {
    clientFetch.mockResolvedValueOnce(new Response(null, { status: 204 }));

    const event = await fetchLatestEvent(clientFetch);

    expect(event).toBeNull();
  });

  it("createCategory sends POST payload", async () => {
    const created = {
      id: "cat-1",
      name: "Work",
      color: "#6B7280",
      rules: [],
      userId: "user-1",
    };
    clientFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(created), { status: 201 }),
    );

    await createCategory(clientFetch, {
      name: "Work",
      color: "#6B7280",
      rules: [],
    });

    const [path, init] = clientFetch.mock.calls[0]!;
    expect(path).toBe("/api/categories");
    expect(init?.method).toBe("POST");
    expect(init?.body).toBe(
      JSON.stringify({ name: "Work", color: "#6B7280", rules: [] }),
    );
  });

  it("deleteCategory throws for non-204 responses", async () => {
    clientFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "nope" }), { status: 500 }),
    );

    await expect(deleteCategory(clientFetch, "cat-1")).rejects.toThrow("nope");
  });
});
