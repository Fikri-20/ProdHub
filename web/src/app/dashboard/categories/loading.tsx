export default function CategoriesLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-36 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-9 w-36 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-4 w-4 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-5 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="mt-3 flex gap-1.5">
              <div className="h-5 w-16 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-5 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
