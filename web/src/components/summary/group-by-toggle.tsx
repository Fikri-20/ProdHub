"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { SummaryGroupBy } from "@/types/summary";

const options: { label: string; value: SummaryGroupBy }[] = [
  { label: "By App", value: "app" },
  { label: "By Category", value: "category" },
  { label: "By Project", value: "project" },
];

export function GroupByToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get("groupBy") ?? "app") as SummaryGroupBy;

  function handleSelect(value: SummaryGroupBy) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("groupBy", value);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => handleSelect(option.value)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            current === option.value
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
