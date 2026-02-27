"use client";

import type { ActivityEventWithRelations } from "@/types/events";
import { formatDuration, formatTime } from "@/lib/timeline-utils";

interface TimelineEventBarProps {
  event: ActivityEventWithRelations;
  maxDuration: number;
}

/**
 * Fallback card view for individual events (used outside Gantt chart contexts).
 */
export function TimelineEventBar({ event, maxDuration }: TimelineEventBarProps) {
  const primaryCategory = event.categories[0]?.category;
  const barColor = primaryCategory?.color ?? "#6366f1";
  const widthPercent = Math.max((event.duration / maxDuration) * 100, 4);

  return (
    <div className="group rounded-lg border border-zinc-100 bg-white p-3 transition-all hover:border-zinc-200 hover:shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900/80 dark:hover:border-zinc-700">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: barColor }}
          />
          <span className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {event.appName}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {formatTime(event.startTime)} – {formatTime(event.endTime)}
          </span>
          <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {formatDuration(event.duration)}
          </span>
        </div>
      </div>

      <div className="h-7 w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800/60">
        <div
          className="flex h-full items-center rounded-md px-2.5 transition-all duration-500 ease-out"
          style={{
            width: `${widthPercent}%`,
            backgroundColor: barColor + "25",
            borderLeft: `3px solid ${barColor}`,
          }}
        >
          {widthPercent > 15 && (
            <span
              className="truncate text-xs font-medium"
              style={{ color: barColor }}
            >
              {event.windowTitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
