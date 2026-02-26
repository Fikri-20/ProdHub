import type { ActivityEventWithRelations } from "@/types/events";
import { formatDuration, formatTime } from "@/lib/timeline-utils";

interface TimelineEventCardProps {
  event: ActivityEventWithRelations;
}

export function TimelineEventCard({ event }: TimelineEventCardProps) {
  const primaryCategory = event.categories[0]?.category;
  const borderColor = primaryCategory?.color ?? "#9CA3AF"; // gray-400 fallback

  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      {/* Dot connector */}
      <div className="relative flex flex-col items-center">
        <div
          className="mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-white dark:border-zinc-900"
          style={{ backgroundColor: borderColor }}
        />
        <div className="w-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
      </div>

      {/* Card */}
      <div
        className="flex-1 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        style={{ borderLeftColor: borderColor, borderLeftWidth: "3px" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-zinc-900 dark:text-zinc-50">
              {event.appName}
            </p>
            <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
              {event.windowTitle}
            </p>
          </div>
          <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {formatDuration(event.duration)}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {formatTime(event.startTime)} – {formatTime(event.endTime)}
          </span>

          {event.device.os === "Browser" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                <line x1="21" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" />
                <line x1="8" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" />
                <line x1="12" y1="3" x2="12" y2="8" stroke="currentColor" strokeWidth="2" />
                <line x1="12" y1="16" x2="12" y2="21" stroke="currentColor" strokeWidth="2" />
              </svg>
              Browser
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              {event.device.os}
            </span>
          )}

          {event.categories.map((ca) => (
            <span
              key={ca.id}
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: ca.category.color + "20",
                color: ca.category.color,
              }}
            >
              {ca.category.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
