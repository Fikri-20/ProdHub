"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { DateRangePreset } from "@/types/events";

const presets: { label: string; value: DateRangePreset }[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
];

export function DateRangePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get("range") ?? "today") as DateRangePreset;

  function handleSelect(value: DateRangePreset) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", value);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex gap-2">
      {presets.map((preset) => (
        <button
          key={preset.value}
          onClick={() => handleSelect(preset.value)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            current === preset.value
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
