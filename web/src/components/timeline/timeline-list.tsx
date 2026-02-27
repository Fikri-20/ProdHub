"use client";

import { useMemo } from "react";
import type { ActivityEventWithRelations, TimelineGroup } from "@/types/events";
import { GanttTimeline } from "./gantt-timeline";

interface TimelineListProps {
  groups: TimelineGroup[];
}

export function TimelineList({ groups }: TimelineListProps) {
  // Flatten all events across groups for the Gantt chart
  const allEvents = useMemo(() => {
    const events: ActivityEventWithRelations[] = [];
    for (const group of groups) {
      events.push(...group.events);
    }
    return events;
  }, [groups]);

  if (allEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-20 dark:border-zinc-800">
        <div className="mb-4 rounded-full bg-zinc-100 p-4 dark:bg-zinc-800/60">
          <svg
            className="h-8 w-8 text-zinc-400 dark:text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          No activity events found
        </p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          Try selecting a different date range
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Events shown: <span className="font-medium text-zinc-700 dark:text-zinc-300">{allEvents.length}</span>
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Hover blocks for details
        </p>
      </div>
      <GanttTimeline events={allEvents} />
    </div>
  );
}
