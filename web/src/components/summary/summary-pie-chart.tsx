"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { SummaryItem } from "@/types/summary";
import { formatDuration } from "@/lib/timeline-utils";

const COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#14b8a6",
  "#e11d48", "#84cc16", "#0ea5e9", "#a855f7", "#d946ef",
];

interface Props {
  data: SummaryItem[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: SummaryItem }>;
}) {
  if (!active || !payload?.[0]) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-md dark:border-zinc-700 dark:bg-zinc-800">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.name}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {formatDuration(item.totalDuration)} ({item.percentage}%)
      </p>
    </div>
  );
}

export function SummaryPieChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          dataKey="totalDuration"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={120}
          innerRadius={60}
          paddingAngle={2}
          strokeWidth={0}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value: string) => (
            <span className="text-xs text-zinc-600 dark:text-zinc-400">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
