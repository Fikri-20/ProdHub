import { Suspense } from "react";
import { apiClient } from "@/lib/api-client";
import { getDateRangeParams, groupEventsByDay } from "@/lib/timeline-utils";
import { DateRangePicker } from "@/components/timeline/date-range-picker";
import { TimelineList } from "@/components/timeline/timeline-list";
import type { ActivityEventWithRelations, DateRangePreset } from "@/types/events";

const validPresets = new Set<DateRangePreset>(["today", "yesterday", "7d", "30d"]);

function isValidPreset(value: string): value is DateRangePreset {
  return validPresets.has(value as DateRangePreset);
}

async function fetchEvents(range: DateRangePreset): Promise<ActivityEventWithRelations[]> {
  const { from, to } = getDateRangeParams(range);
  const params = new URLSearchParams({ from, to, limit: "500" });

  const res = await apiClient(`/api/events?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch events: ${res.status}`);
  }

  return res.json() as Promise<ActivityEventWithRelations[]>;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rangeParam = typeof params.range === "string" ? params.range : "today";
  const range: DateRangePreset = isValidPreset(rangeParam) ? rangeParam : "today";

  let events: ActivityEventWithRelations[];
  let error: string | null = null;

  try {
    events = await fetchEvents(range);
  } catch (e) {
    events = [];
    error = e instanceof Error ? e.message : "Failed to load events";
  }

  const groups = groupEventsByDay(events);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Timeline
        </h2>
        <Suspense fallback={null}>
          <DateRangePicker />
        </Suspense>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        </div>
      ) : (
        <TimelineList groups={groups} />
      )}
    </div>
  );
}
