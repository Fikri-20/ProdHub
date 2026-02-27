"use client";

import { useState } from "react";
import { useAuthedClientApi } from "@/hooks/use-authed-client-api";
import { getDateRangeParams } from "@/lib/timeline-utils";
import type { DateRangePreset } from "@/types/events";

interface ExportButtonProps {
  range: DateRangePreset;
  userId: string;
  customFrom?: string;
  customTo?: string;
  isCustom?: boolean;
}

export function ExportButton({ range, userId, customFrom, customTo, isCustom }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { clientApi } = useAuthedClientApi();

  async function handleExport(format: "json" | "csv") {
    if (!clientApi) return;
    setDownloading(true);
    setOpen(false);

    try {
      let from: string;
      let to: string;

      if (isCustom && customFrom && customTo) {
        from = new Date(customFrom).toISOString();
        to = new Date(customTo + "T23:59:59").toISOString();
      } else {
        const params = getDateRangeParams(range);
        from = params.from;
        to = params.to;
      }

      const queryParams = new URLSearchParams({ format, from, to });
      const response = await clientApi(`/api/export?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`Export failed (${response.status})`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prodhub-export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={downloading}
        className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
      >
        {downloading ? (
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        )}
        Export
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 min-w-[140px] rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          <button
            onClick={() => handleExport("json")}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-mono font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              JSON
            </span>
            Export JSON
          </button>
          <button
            onClick={() => handleExport("csv")}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-mono font-bold text-green-700 dark:bg-green-900/40 dark:text-green-300">
              CSV
            </span>
            Export CSV
          </button>
        </div>
      )}
    </div>
  );
}
