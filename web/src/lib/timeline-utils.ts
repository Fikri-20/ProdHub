import type {
  ActivityEventWithRelations,
  TimelineGroup,
  DateRangePreset,
} from "@/types/events";

/**
 * Format a duration in seconds to a human-readable string.
 * Examples: "2h 15m", "45m", "30s"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * Format an ISO date string to a time string like "2:30 PM".
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Format an ISO date string to a full date label like "Monday, February 24, 2026".
 */
export function formatDateLabel(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Get the local YYYY-MM-DD date string for a given ISO date.
 */
function toLocalDateKey(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Group events by local date, sorted newest day first.
 * Events within each group are sorted newest first (as returned by API).
 */
export function groupEventsByDay(
  events: ActivityEventWithRelations[],
): TimelineGroup[] {
  const groups = new Map<string, ActivityEventWithRelations[]>();

  for (const event of events) {
    const dateKey = toLocalDateKey(event.startTime);
    const existing = groups.get(dateKey);
    if (existing) {
      existing.push(event);
    } else {
      groups.set(dateKey, [event]);
    }
  }

  const result: TimelineGroup[] = [];
  for (const [date, dayEvents] of groups) {
    result.push({
      date,
      label: formatDateLabel(dayEvents[0]!.startTime),
      events: dayEvents,
    });
  }

  // Sort groups newest first
  result.sort((a, b) => b.date.localeCompare(a.date));

  return result;
}

/**
 * Get ISO date range params for a given preset.
 */
export function getDateRangeParams(preset: DateRangePreset): {
  from: string;
  to: string;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  switch (preset) {
    case "today":
      return { from: today.toISOString(), to: tomorrow.toISOString() };
    case "yesterday": {
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return { from: yesterday.toISOString(), to: today.toISOString() };
    }
    case "7d": {
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { from: sevenDaysAgo.toISOString(), to: tomorrow.toISOString() };
    }
    case "30d": {
      const thirtyDaysAgo = new Date(
        today.getTime() - 30 * 24 * 60 * 60 * 1000,
      );
      return { from: thirtyDaysAgo.toISOString(), to: tomorrow.toISOString() };
    }
  }
}
