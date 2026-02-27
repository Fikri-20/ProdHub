import { GoalsManager } from "@/components/goals/goals-manager";

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Goals
      </h2>
      <GoalsManager />
    </div>
  );
}
