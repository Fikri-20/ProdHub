"use client";

import { useState } from "react";
import type { HeatmapGridData } from "@/types/heatmap";
import { formatDuration } from "@/lib/timeline-utils";
import { formatHeatmapDate } from "@/lib/heatmap-utils";

/**
 * GitHub's exact contribution graph colors.
 * Light mode: gray bg → greens
 * Dark mode: dark border/fill → GitHub dark greens
 */
const LEVEL_COLORS_LIGHT = [
  "#ebedf0", // level 0
  "#9be9a8", // level 1
  "#40c463", // level 2
  "#30a14e", // level 3
  "#216e39", // level 4
] as const;

const LEVEL_COLORS_DARK = [
  "#161b22", // level 0
  "#0e4429", // level 1
  "#006d32", // level 2
  "#26a641", // level 3
  "#39d353", // level 4
] as const;

const CELL_SIZE = 11;
const CELL_GAP = 3;
const CELL_STEP = CELL_SIZE + CELL_GAP; // 14px per cell

interface HeatmapGridProps {
  data: HeatmapGridData;
  totalDuration: number;
  activeDays: number;
}

export function HeatmapGrid({ data, totalDuration, activeDays }: HeatmapGridProps) {
  const [tooltip, setTooltip] = useState<{
    date: string;
    duration: number;
    x: number;
    y: number;
  } | null>(null);

  const gridWidth = data.totalWeeks * CELL_STEP - CELL_GAP;
  const dayLabelWidth = 36;
  const totalWidth = dayLabelWidth + gridWidth;

  return (
    <div className="relative">
      {/* Summary line */}
      <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {formatDuration(totalDuration)}
        </span>
        {" "}of activity across{" "}
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {activeDays}
        </span>
        {" "}{activeDays === 1 ? "day" : "days"} in the last year
      </p>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-[#0d1117]">
        <svg
          width={totalWidth}
          height={7 * CELL_STEP - CELL_GAP + 28}
          className="block"
        >
          {/* Month labels */}
          {data.monthLabels.map((m, i) => {
            const nextMonth = data.monthLabels[i + 1];
            const spanWeeks = nextMonth
              ? nextMonth.weekIndex - m.weekIndex
              : data.totalWeeks - m.weekIndex;

            // Only render if there's room for the label (skip if < 2 weeks)
            if (spanWeeks < 2) return null;

            return (
              <text
                key={`${m.label}-${m.weekIndex}`}
                x={dayLabelWidth + m.weekIndex * CELL_STEP}
                y={12}
                className="fill-zinc-500 text-[11px] dark:fill-zinc-400"
              >
                {m.label}
              </text>
            );
          })}

          {/* Day-of-week labels (Mon, Wed, Fri) */}
          {[1, 3, 5].map((dayIdx) => (
            <text
              key={dayIdx}
              x={0}
              y={22 + dayIdx * CELL_STEP + CELL_SIZE / 2}
              dominantBaseline="central"
              className="fill-zinc-500 text-[11px] dark:fill-zinc-400"
            >
              {dayIdx === 1 ? "Mon" : dayIdx === 3 ? "Wed" : "Fri"}
            </text>
          ))}

          {/* Cells */}
          {data.cells.map((cell) => (
            <rect
              key={cell.date}
              x={dayLabelWidth + cell.weekIndex * CELL_STEP}
              y={22 + cell.dayOfWeek * CELL_STEP}
              width={CELL_SIZE}
              height={CELL_SIZE}
              rx={2}
              ry={2}
              className="cursor-pointer"
              style={{
                fill: `var(--heatmap-level-${cell.level})`,
              }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({
                  date: cell.date,
                  duration: cell.totalDuration,
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                });
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              <title>
                {formatHeatmapDate(cell.date)}:{" "}
                {cell.totalDuration > 0
                  ? formatDuration(cell.totalDuration)
                  : "No activity"}
              </title>
            </rect>
          ))}
        </svg>

        {/* Legend */}
        <div className="mt-2 flex items-center justify-end gap-[3px] text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="mr-1">Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className="inline-block rounded-[2px]"
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: `var(--heatmap-level-${level})`,
              }}
            />
          ))}
          <span className="ml-1">More</span>
        </div>
      </div>

      {/* CSS custom properties for light/dark mode colors */}
      <style>{`
        :root {
          --heatmap-level-0: ${LEVEL_COLORS_LIGHT[0]};
          --heatmap-level-1: ${LEVEL_COLORS_LIGHT[1]};
          --heatmap-level-2: ${LEVEL_COLORS_LIGHT[2]};
          --heatmap-level-3: ${LEVEL_COLORS_LIGHT[3]};
          --heatmap-level-4: ${LEVEL_COLORS_LIGHT[4]};
        }
        .dark {
          --heatmap-level-0: ${LEVEL_COLORS_DARK[0]};
          --heatmap-level-1: ${LEVEL_COLORS_DARK[1]};
          --heatmap-level-2: ${LEVEL_COLORS_DARK[2]};
          --heatmap-level-3: ${LEVEL_COLORS_DARK[3]};
          --heatmap-level-4: ${LEVEL_COLORS_DARK[4]};
        }
      `}</style>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-md bg-zinc-800 px-3 py-1.5 text-xs text-white shadow-lg dark:bg-zinc-200 dark:text-zinc-900"
          style={{
            left: tooltip.x,
            top: tooltip.y - 8,
          }}
        >
          <p className="font-semibold">
            {tooltip.duration > 0
              ? formatDuration(tooltip.duration)
              : "No activity"}
          </p>
          <p className="text-zinc-300 dark:text-zinc-600">
            {formatHeatmapDate(tooltip.date)}
          </p>
        </div>
      )}
    </div>
  );
}
