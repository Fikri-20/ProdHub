import type { TimelineGroup } from "@/types/events";
import { TimelineEventCard } from "./timeline-event-card";

interface TimelineListProps {
  groups: TimelineGroup[];
}

export function TimelineList({ groups }: TimelineListProps) {
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 py-16 dark:border-zinc-700">
        <svg
          className="mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600"
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
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.date}>
          <h3 className="sticky top-0 z-10 mb-4 bg-zinc-50 py-2 text-sm font-semibold text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
            {group.label}
          </h3>
          <div className="ml-1">
            {group.events.map((event) => (
              <TimelineEventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
