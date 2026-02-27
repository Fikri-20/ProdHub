"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ReportBucket, ReportPeriod } from "@/types/reports";
import { formatDuration } from "@/lib/timeline-utils";

interface ReportChartProps {
  data: ReportBucket[];
  period: ReportPeriod;
}

function formatLabel(dateStr: string, period: ReportPeriod): string {
  const date = new Date(dateStr + "T00:00:00");
  if (period === "weekly") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function formatYAxisDuration(seconds: number): string {
  if (seconds >= 3600) return `${Math.round(seconds / 3600)}h`;
  if (seconds >= 60) return `${Math.round(seconds / 60)}m`;
  return `${seconds}s`;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ReportBucket }>;
  period: ReportPeriod;
}

function CustomTooltip({ active, payload, period }: CustomTooltipProps) {
  if (!active || !payload?.[0]) return null;
  const bucket = payload[0].payload;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
      <p className="font-medium text-zinc-900 dark:text-zinc-100">
        {period === "weekly" ? "Week of " : ""}{formatLabel(bucket.periodStart, period)}
      </p>
      <p className="text-zinc-500 dark:text-zinc-400">
        {formatDuration(bucket.totalDuration)}
      </p>
      <p className="text-zinc-400 dark:text-zinc-500">
        {bucket.eventCount} events
      </p>
    </div>
  );
}

export function ReportChart({ data, period }: ReportChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatLabel(d.periodStart, period),
  }));

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={formatYAxisDuration}
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip period={period} />} />
          <Bar dataKey="totalDuration" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
