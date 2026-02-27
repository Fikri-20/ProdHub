"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useAuthedClientApi } from "@/hooks/use-authed-client-api";
import { fetchReports, queryKeys } from "@/lib/dashboard-queries";
import { formatDuration } from "@/lib/timeline-utils";
import { ReportChart } from "@/components/reports/report-chart";
import { PeriodToggle } from "@/components/reports/period-toggle";
import type { ReportPeriod } from "@/types/reports";
import ReportsLoading from "./loading";

const validPeriods = new Set<ReportPeriod>(["weekly", "monthly"]);

export default function ReportsPage() {
  const searchParams = useSearchParams();
  const periodParam = searchParams.get("period") ?? "weekly";
  const period: ReportPeriod = validPeriods.has(periodParam as ReportPeriod)
    ? (periodParam as ReportPeriod)
    : "weekly";

  const { clientApi, userId, isSessionLoading } = useAuthedClientApi();

  const reportsQuery = useQuery({
    queryKey: userId ? queryKeys.reports(userId, period) : ["reports", "anonymous", period],
    queryFn: () => fetchReports(clientApi!, period),
    enabled: Boolean(clientApi && userId),
  });

  if (isSessionLoading || reportsQuery.isPending) {
    return <ReportsLoading />;
  }

  if (!clientApi || !userId) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
        <p className="text-sm text-red-600 dark:text-red-400">Not authenticated</p>
      </div>
    );
  }

  const data = reportsQuery.data ?? [];
  const totalDuration = data.reduce((sum, d) => sum + d.totalDuration, 0);
  const totalEvents = data.reduce((sum, d) => sum + d.eventCount, 0);
  const avgPerPeriod = data.length > 0 ? Math.round(totalDuration / data.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Reports
        </h2>
        <PeriodToggle />
      </div>

      {reportsQuery.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">
            {reportsQuery.error.message}
          </p>
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No data for this period.
          </p>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Time</p>
              <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {formatDuration(totalDuration)}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Events</p>
              <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {totalEvents.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Avg per {period === "weekly" ? "Week" : "Month"}
              </p>
              <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {formatDuration(avgPerPeriod)}
              </p>
            </div>
          </div>

          {/* Chart */}
          <ReportChart data={data} period={period} />
        </>
      )}
    </div>
  );
}
