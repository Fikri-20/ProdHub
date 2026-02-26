"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { DateRangePicker } from "@/components/timeline/date-range-picker";
import { TimelineList } from "@/components/timeline/timeline-list";
import { useAuthedClientApi } from "@/hooks/use-authed-client-api";
import { fetchEvents, queryKeys } from "@/lib/dashboard-queries";
import { groupEventsByDay } from "@/lib/timeline-utils";
import type { DateRangePreset } from "@/types/events";
import DashboardLoading from "./loading";

const validPresets = new Set<DateRangePreset>(["today", "yesterday", "7d", "30d"]);

function isValidPreset(value: string): value is DateRangePreset {
  return validPresets.has(value as DateRangePreset);
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const rangeParam = searchParams.get("range") ?? "today";
  const range: DateRangePreset = isValidPreset(rangeParam) ? rangeParam : "today";

  const { clientApi, userId, isSessionLoading } = useAuthedClientApi();

  const eventsQuery = useQuery({
    queryKey: userId ? queryKeys.events(userId, range) : ["events", "anonymous", range],
    queryFn: () => fetchEvents(clientApi!, range),
    enabled: Boolean(clientApi && userId),
  });

  if (isSessionLoading || eventsQuery.isPending) {
    return <DashboardLoading />;
  }

  if (!clientApi || !userId) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
        <p className="text-sm text-red-600 dark:text-red-400">
          Not authenticated
        </p>
      </div>
    );
  }

  if (eventsQuery.error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Timeline
          </h2>
          <DateRangePicker />
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">
            {eventsQuery.error.message}
          </p>
        </div>
      </div>
    );
  }

  const groups = groupEventsByDay(eventsQuery.data ?? []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Timeline
        </h2>
        <DateRangePicker />
      </div>

      <TimelineList groups={groups} />
    </div>
  );
}
