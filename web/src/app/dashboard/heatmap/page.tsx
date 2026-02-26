"use client";

import { useQuery } from "@tanstack/react-query";
import { HeatmapGrid } from "@/components/heatmap/heatmap-grid";
import { useAuthedClientApi } from "@/hooks/use-authed-client-api";
import { fetchHeatmap, queryKeys } from "@/lib/dashboard-queries";
import { buildHeatmapGrid } from "@/lib/heatmap-utils";
import HeatmapLoading from "./loading";

export default function HeatmapPage() {
  const { clientApi, userId, isSessionLoading } = useAuthedClientApi();

  const heatmapQuery = useQuery({
    queryKey: userId ? queryKeys.heatmap(userId) : ["heatmap", "anonymous"],
    queryFn: () => fetchHeatmap(clientApi!),
    enabled: Boolean(clientApi && userId),
  });

  if (isSessionLoading || heatmapQuery.isPending) {
    return <HeatmapLoading />;
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

  const data = heatmapQuery.data ?? [];
  const gridData = buildHeatmapGrid(data);
  const totalDuration = data.reduce((sum, d) => sum + d.totalDuration, 0);
  const activeDays = data.filter((d) => d.totalDuration > 0).length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Activity Heatmap
      </h2>

      {heatmapQuery.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">
            {heatmapQuery.error.message}
          </p>
        </div>
      ) : (
        <HeatmapGrid
          data={gridData}
          totalDuration={totalDuration}
          activeDays={activeDays}
        />
      )}
    </div>
  );
}
