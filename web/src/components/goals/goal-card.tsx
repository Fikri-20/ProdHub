"use client";

import type { GoalWithProgress } from "@/types/goals";
import { formatDuration } from "@/lib/timeline-utils";

interface GoalCardProps {
  goal: GoalWithProgress;
  onDelete: (id: string) => void;
}

export function GoalCard({ goal, onDelete }: GoalCardProps) {
  const progressColor =
    goal.percentage >= 100
      ? "bg-green-500"
      : goal.percentage >= 50
        ? "bg-blue-500"
        : "bg-amber-500";

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
            {goal.name}
          </h3>
          {goal.appFilter && (
            <p className="text-xs text-zinc-400">
              App: {goal.appFilter}
            </p>
          )}
        </div>
        <button
          onClick={() => onDelete(goal.id)}
          className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all ${progressColor}`}
          style={{ width: `${Math.min(100, goal.percentage)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-500 dark:text-zinc-400">
          {formatDuration(goal.currentSeconds)} / {formatDuration(goal.targetSeconds)}
        </span>
        <span className={`font-medium ${goal.percentage >= 100 ? "text-green-500" : "text-zinc-600 dark:text-zinc-300"}`}>
          {goal.percentage}%
        </span>
      </div>
    </div>
  );
}
