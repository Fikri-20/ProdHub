import { apiClient } from "@/lib/api-client";
import { buildHeatmapGrid } from "@/lib/heatmap-utils";
import { HeatmapGrid } from "@/components/heatmap/heatmap-grid";
import type { HeatmapDay } from "@/types/heatmap";

async function fetchHeatmapData(): Promise<HeatmapDay[]> {
  const res = await apiClient("/api/heatmap", { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to fetch heatmap data: ${res.status}`);
  }

  return res.json() as Promise<HeatmapDay[]>;
}

export default async function HeatmapPage() {
  let data: HeatmapDay[];
  let error: string | null = null;

  try {
    data = await fetchHeatmapData();
  } catch (e) {
    data = [];
    error = e instanceof Error ? e.message : "Failed to load heatmap data";
  }

  const gridData = buildHeatmapGrid(data);
  const totalDuration = data.reduce((sum, d) => sum + d.totalDuration, 0);
  const activeDays = data.filter((d) => d.totalDuration > 0).length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Activity Heatmap
      </h2>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
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
