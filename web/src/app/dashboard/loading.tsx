"use client";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </div>
      </div>

      {/* Day group skeleton */}
      {Array.from({ length: 2 }).map((_, groupIdx) => (
        <div key={groupIdx} className="space-y-4">
          {/* Date label */}
          <div className="h-4 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

          {/* Event cards */}
          {Array.from({ length: 3 }).map((_, cardIdx) => (
            <div key={cardIdx} className="flex gap-4 pb-6">
              {/* Dot */}
              <div className="flex flex-col items-center">
                <div className="mt-1.5 h-3 w-3 animate-pulse rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <div className="w-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
              </div>

              {/* Card */}
              <div className="flex-1 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-4 w-64 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                  <div className="h-6 w-14 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800" />
                </div>
                <div className="mt-3 flex gap-2">
                  <div className="h-4 w-28 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                  <div className="h-5 w-16 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
