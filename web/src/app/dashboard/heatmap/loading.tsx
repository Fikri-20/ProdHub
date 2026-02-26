export default function HeatmapLoading() {
  return (
    <div className="space-y-6">
      {/* Title skeleton */}
      <div className="h-8 w-48 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />

      {/* Heatmap grid skeleton */}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Month labels */}
        <div className="mb-1 ml-8 flex gap-[3px]">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-3 w-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"
              style={{ marginRight: `${Math.random() * 20 + 20}px` }}
            />
          ))}
        </div>

        {/* Grid skeleton */}
        <div className="flex gap-1">
          <div className="flex flex-col gap-[3px]">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-[13px] w-6 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800"
              />
            ))}
          </div>
          <div className="flex-1">
            <div className="h-[115px] w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>

        {/* Legend skeleton */}
        <div className="mt-3 flex items-center justify-end gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-[13px] w-[13px] animate-pulse rounded-sm bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
