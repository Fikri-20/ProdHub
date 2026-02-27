"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { DateRangePicker } from "@/components/timeline/date-range-picker";
import { GroupByToggle } from "@/components/summary/group-by-toggle";
import { SummaryPieChart } from "@/components/summary/summary-pie-chart";
import { SummaryBarChart } from "@/components/summary/summary-bar-chart";
import { useAuthedClientApi } from "@/hooks/use-authed-client-api";
import { fetchSummary, queryKeys } from "@/lib/dashboard-queries";
import type { DateRangePreset } from "@/types/events";
import type { SummaryGroupBy } from "@/types/summary";
import SummaryLoading from "./loading";

const validPresets = new Set<DateRangePreset>(["today", "yesterday", "7d", "30d"]);
const validGroupBy = new Set<SummaryGroupBy>(["app", "category", "project"]);

function isValidPreset(value: string): value is DateRangePreset {
  return validPresets.has(value as DateRangePreset);
}

function isValidGroupBy(value: string): value is SummaryGroupBy {
  return validGroupBy.has(value as SummaryGroupBy);
}

export default function SummaryPage() {
  const searchParams = useSearchParams();
  const rangeParam = searchParams.get("range") ?? "today";
  const groupByParam = searchParams.get("groupBy") ?? "app";

  const range: DateRangePreset = isValidPreset(rangeParam) ? rangeParam : "today";
  const groupBy: SummaryGroupBy = isValidGroupBy(groupByParam) ? groupByParam : "app";

  const { clientApi, userId, isSessionLoading } = useAuthedClientApi();

  const summaryQuery = useQuery({
    queryKey: userId ? queryKeys.summary(userId, range, groupBy) : ["summary", "anonymous", range, groupBy],
    queryFn: () => fetchSummary(clientApi!, range, groupBy),
    enabled: Boolean(clientApi && userId),
  });

  if (isSessionLoading || summaryQuery.isPending) {
    return <SummaryLoading />;
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

  const data = summaryQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Summary
        </h2>
        <div className="flex flex-wrap gap-3">
          <GroupByToggle />
          <DateRangePicker />
        </div>
      </div>

      {summaryQuery.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">
            {summaryQuery.error.message}
          </p>
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No activity data for this period.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Distribution
            </h3>
            <SummaryPieChart data={data} />
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Duration by {groupBy === "app" ? "Application" : groupBy === "category" ? "Category" : "Project"}
            </h3>
            <SummaryBarChart data={data} />
          </div>
        </div>
      )}
    </div>
  );
}
