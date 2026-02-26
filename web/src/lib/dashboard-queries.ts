import type { createClientApiClient } from "@/lib/client-api";
import { getDateRangeParams } from "@/lib/timeline-utils";
import type { Category, CategoryFormData } from "@/types/categories";
import type { DateRangePreset, ActivityEventWithRelations } from "@/types/events";
import type { HeatmapDay } from "@/types/heatmap";
import type { SummaryGroupBy, SummaryItem } from "@/types/summary";

type ClientFetch = ReturnType<typeof createClientApiClient>;

async function parseApiError(response: Response, fallback: string): Promise<Error> {
  try {
    const body = (await response.json()) as { error?: string };
    if (body.error) {
      return new Error(body.error);
    }
  } catch {
    // Ignore non-JSON error responses and fall back to status-based message.
  }
  return new Error(`${fallback} (${response.status})`);
}

export const queryKeys = {
  events: (userId: string, range: DateRangePreset) =>
    ["events", userId, range] as const,
  summary: (userId: string, range: DateRangePreset, groupBy: SummaryGroupBy) =>
    ["summary", userId, range, groupBy] as const,
  heatmap: (userId: string) => ["heatmap", userId] as const,
  categories: (userId: string) => ["categories", userId] as const,
  latestEvent: (userId: string) => ["latest-event", userId] as const,
};

export async function fetchEvents(
  clientFetch: ClientFetch,
  range: DateRangePreset,
): Promise<ActivityEventWithRelations[]> {
  const { from, to } = getDateRangeParams(range);
  const params = new URLSearchParams({ from, to, limit: "500" });

  const response = await clientFetch(`/api/events?${params.toString()}`);
  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch events");
  }

  return response.json() as Promise<ActivityEventWithRelations[]>;
}

export async function fetchSummary(
  clientFetch: ClientFetch,
  range: DateRangePreset,
  groupBy: SummaryGroupBy,
): Promise<SummaryItem[]> {
  const { from, to } = getDateRangeParams(range);
  const params = new URLSearchParams({ groupBy, from, to });

  const response = await clientFetch(`/api/summary?${params.toString()}`);
  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch summary");
  }

  return response.json() as Promise<SummaryItem[]>;
}

export async function fetchHeatmap(
  clientFetch: ClientFetch,
): Promise<HeatmapDay[]> {
  const response = await clientFetch("/api/heatmap");
  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch heatmap data");
  }

  return response.json() as Promise<HeatmapDay[]>;
}

export async function fetchCategories(
  clientFetch: ClientFetch,
): Promise<Category[]> {
  const response = await clientFetch("/api/categories");
  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch categories");
  }

  return response.json() as Promise<Category[]>;
}

export async function createCategory(
  clientFetch: ClientFetch,
  data: CategoryFormData,
): Promise<Category> {
  const response = await clientFetch("/api/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to create category");
  }

  return response.json() as Promise<Category>;
}

export async function updateCategory(
  clientFetch: ClientFetch,
  categoryId: string,
  data: CategoryFormData,
): Promise<Category> {
  const response = await clientFetch(`/api/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to update category");
  }

  return response.json() as Promise<Category>;
}

export async function deleteCategory(
  clientFetch: ClientFetch,
  categoryId: string,
): Promise<void> {
  const response = await clientFetch(`/api/categories/${categoryId}`, {
    method: "DELETE",
  });

  if (response.status !== 204) {
    throw await parseApiError(response, "Failed to delete category");
  }
}

export async function fetchLatestEvent(
  clientFetch: ClientFetch,
): Promise<ActivityEventWithRelations | null> {
  const response = await clientFetch("/api/events/latest");

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch latest activity");
  }

  return response.json() as Promise<ActivityEventWithRelations>;
}
