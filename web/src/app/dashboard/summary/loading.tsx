"use client";

export default function SummaryLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-8 w-32 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex gap-3">
          <div className="flex gap-2">
            <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-8 w-28 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-20 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Chart skeletons */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex items-center justify-center">
            <div className="h-[300px] w-[300px] animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 h-4 w-36 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div
                  className="h-6 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800"
                  style={{ width: `${80 - i * 15}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
