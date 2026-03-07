"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import type { ActivityEventWithRelations } from "@/types/events";
import { formatDuration } from "@/lib/timeline-utils";

// Distinct colors for apps that have no category color
const APP_COLORS = [
  "#f87171", "#fb923c", "#fbbf24", "#a3e635", "#4ade80",
  "#34d399", "#22d3ee", "#60a5fa", "#818cf8", "#a78bfa",
  "#c084fc", "#e879f9", "#f472b6", "#fb7185",
];

function getAppColor(appName: string, index: number): string {
  return APP_COLORS[index % APP_COLORS.length]!;
}

function formatAxisTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatAxisDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

interface GanttTimelineProps {
  events: ActivityEventWithRelations[];
}

interface TooltipData {
  event: ActivityEventWithRelations;
  x: number;
  y: number;
}

export function GanttTimeline({ events }: GanttTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  // Compute timeline range and group events by app
  const { appRows, timeStart, timeEnd, timeMarkers, dayMarkers } = useMemo(() => {
    if (events.length === 0) {
      return { appRows: [], timeStart: 0, timeEnd: 1, timeMarkers: [], dayMarkers: [] };
    }

    let minTime = Infinity;
    let maxTime = -Infinity;

    for (const evt of events) {
      const start = new Date(evt.startTime).getTime();
      const end = new Date(evt.endTime).getTime();
      if (start < minTime) minTime = start;
      if (end > maxTime) maxTime = end;
    }

    // Add 2% padding on each side
    const range = maxTime - minTime;
    const padding = Math.max(range * 0.02, 60000); // at least 1 minute padding
    const tStart = minTime - padding;
    const tEnd = maxTime + padding;
    const totalRange = tEnd - tStart;

    // Group events by appName
    const appMap = new Map<string, ActivityEventWithRelations[]>();
    for (const evt of events) {
      const existing = appMap.get(evt.appName);
      if (existing) {
        existing.push(evt);
      } else {
        appMap.set(evt.appName, [evt]);
      }
    }

    // Sort apps by total duration descending
    const rows = Array.from(appMap.entries())
      .map(([appName, appEvents]) => ({
        appName,
        events: appEvents.sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        ),
        totalDuration: appEvents.reduce((sum, e) => sum + e.duration, 0),
      }))
      .sort((a, b) => b.totalDuration - a.totalDuration);

    // Generate time axis markers (aim for ~6-10 markers)
    const markers: { time: number; label: string }[] = [];
    const markerCount = Math.min(10, Math.max(4, Math.floor(totalRange / (5 * 60 * 1000))));
    const step = totalRange / markerCount;

    for (let i = 0; i <= markerCount; i++) {
      const t = tStart + i * step;
      markers.push({
        time: t,
        label: formatAxisTime(new Date(t)),
      });
    }

    // Generate day markers for multi-day ranges
    const days: { time: number; label: string }[] = [];
    const startDate = new Date(tStart);
    startDate.setHours(0, 0, 0, 0);
    const dayMs = 24 * 60 * 60 * 1000;
    let dayTime = startDate.getTime();
    while (dayTime <= tEnd) {
      if (dayTime >= tStart) {
        days.push({ time: dayTime, label: formatAxisDate(new Date(dayTime)) });
      }
      dayTime += dayMs;
    }

    return {
      appRows: rows,
      timeStart: tStart,
      timeEnd: tEnd,
      timeMarkers: markers,
      dayMarkers: days.length > 1 ? days : [],
    };
  }, [events]);

  const totalRange = timeEnd - timeStart;

  const handleMouseEnter = useCallback(
    (evt: ActivityEventWithRelations, e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setTooltip({
        event: evt,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const LABEL_WIDTH = 180;

  return (
    <div
      ref={containerRef}
      className="relative overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
    >
      {/* Gantt rows */}
      <div className="min-w-[700px]">
        {appRows.map((row, rowIndex) => (
          <div
            key={row.appName}
            className={`flex border-b border-zinc-100 dark:border-zinc-800/60 ${
              rowIndex % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-50/50 dark:bg-zinc-900/60"
            }`}
          >
            {/* App label */}
            <div
              className="flex shrink-0 items-center border-r border-zinc-200 px-3 py-2 dark:border-zinc-800"
              style={{ width: LABEL_WIDTH }}
            >
              <span className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {row.appName}
              </span>
            </div>

            {/* Event blocks */}
            <div className="relative flex-1" style={{ height: 36 }}>
              {row.events.map((evt) => {
                const start = new Date(evt.startTime).getTime();
                const end = new Date(evt.endTime).getTime();
                const leftPct = ((start - timeStart) / totalRange) * 100;
                const widthPct = Math.max(((end - start) / totalRange) * 100, 0.3);

                const color =
                  evt.categories[0]?.category.color ??
                  getAppColor(evt.appName, rowIndex);

                return (
                  <div
                    key={evt.id}
                    className="absolute top-1 cursor-pointer rounded-sm transition-all hover:brightness-110 hover:shadow-sm"
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      height: 28,
                      backgroundColor: color,
                      opacity: 0.85,
                    }}
                    onMouseEnter={(e) => handleMouseEnter(evt, e)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {widthPct > 5 && (
                      <span className="block truncate px-1.5 py-1 text-[10px] font-medium leading-tight text-white drop-shadow-sm">
                        {evt.windowTitle}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Time axis */}
        <div className="flex border-t border-zinc-200 dark:border-zinc-700">
          <div
            className="shrink-0 border-r border-zinc-200 dark:border-zinc-800"
            style={{ width: LABEL_WIDTH }}
          />
          <div className="relative h-10 flex-1">
            {timeMarkers.map((marker, i) => {
              const leftPct = ((marker.time - timeStart) / totalRange) * 100;
              return (
                <div
                  key={i}
                  className="absolute top-0 flex flex-col items-center"
                  style={{ left: `${leftPct}%` }}
                >
                  <div className="h-2 w-px bg-zinc-300 dark:bg-zinc-600" />
                  <span className="mt-0.5 whitespace-nowrap text-[10px] text-zinc-500 dark:text-zinc-400"
                    style={{ transform: "translateX(-50%)" }}
                  >
                    {marker.label}
                  </span>
                </div>
              );
            })}

            {/* Day markers below time markers */}
            {dayMarkers.length > 0 && dayMarkers.map((marker, i) => {
              const leftPct = ((marker.time - timeStart) / totalRange) * 100;
              if (leftPct < 0 || leftPct > 100) return null;
              return (
                <div
                  key={`day-${i}`}
                  className="absolute bottom-0 flex items-center"
                  style={{ left: `${leftPct}%`, transform: "translateX(-50%)" }}
                >
                  <span className="whitespace-nowrap text-[9px] font-medium text-zinc-400 dark:text-zinc-500">
                    {marker.label}
                  </span>
                </div>
              );
            })}

            {/* Vertical grid lines */}
            {timeMarkers.map((marker, i) => {
              const leftPct = ((marker.time - timeStart) / totalRange) * 100;
              return (
                <div
                  key={`grid-${i}`}
                  className="pointer-events-none absolute top-0 w-px bg-zinc-100 dark:bg-zinc-800/40"
                  style={{
                    left: `${leftPct}%`,
                    height: `${appRows.length * 36}px`,
                    marginTop: `-${appRows.length * 36}px`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Tooltip — rendered in a portal-like wrapper outside the overflow container */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 max-w-xs rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
          style={{
            left: Math.min(
              (containerRef.current?.getBoundingClientRect().left ?? 0) + tooltip.x + 12,
              window.innerWidth - 280,
            ),
            top: Math.max(
              8,
              (containerRef.current?.getBoundingClientRect().top ?? 0) + tooltip.y - 80,
            ),
          }}
        >
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {tooltip.event.appName}
          </p>
          <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
            {tooltip.event.windowTitle}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-300">
            <span className="font-medium">{formatDuration(tooltip.event.duration)}</span>
            <span className="text-zinc-400 dark:text-zinc-500">
              {new Date(tooltip.event.startTime).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
              {" – "}
              {new Date(tooltip.event.endTime).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>
          {tooltip.event.categories.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {tooltip.event.categories.map((ca) => (
                <span
                  key={ca.id}
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: ca.category.color + "20",
                    color: ca.category.color,
                  }}
                >
                  {ca.category.name}
                </span>
              ))}
            </div>
          )}
          <div className="mt-1 flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500">
            {tooltip.event.device.os === "Browser" ? (
              <span className="text-blue-500">Browser</span>
            ) : (
              <span className="text-emerald-500">{tooltip.event.device.os}</span>
            )}
            <span>&middot;</span>
            <span>{tooltip.event.device.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}
