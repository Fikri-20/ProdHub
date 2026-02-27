"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthedClientApi } from "@/hooks/use-authed-client-api";
import {
  fetchGoals,
  createGoal,
  deleteGoal,
  queryKeys,
} from "@/lib/dashboard-queries";
import type { GoalFormData } from "@/types/goals";
import { GoalCard } from "./goal-card";
import { GoalForm } from "./goal-form";

export function GoalsManager() {
  const { clientApi, userId } = useAuthedClientApi();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const goalsQuery = useQuery({
    queryKey: userId ? queryKeys.goals(userId) : ["goals", "anonymous"],
    queryFn: () => fetchGoals(clientApi!),
    enabled: Boolean(clientApi && userId),
    refetchInterval: 60_000, // refresh progress every minute
  });

  const createMutation = useMutation({
    mutationFn: (data: GoalFormData) => createGoal(clientApi!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals(userId!) });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (goalId: string) => deleteGoal(clientApi!, goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals(userId!) });
    },
  });

  if (!clientApi || !userId) return null;

  const goals = goalsQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Set daily targets and track your progress throughout the day.
        </p>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Add Goal
          </button>
        )}
      </div>

      {showForm && (
        <GoalForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {(createMutation.error || deleteMutation.error) && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">
            {(createMutation.error ?? deleteMutation.error)?.message}
          </p>
        </div>
      )}

      {goalsQuery.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          ))}
        </div>
      ) : goals.length === 0 && !showForm ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No goals yet. Create one to start tracking your daily targets.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
