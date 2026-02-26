"use client";

import { useState } from "react";
import type { CategoryFormData } from "@/types/categories";

interface CategoryFormProps {
  initialData?: CategoryFormData;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
}

function validateRegex(pattern: string): string | null {
  try {
    new RegExp(pattern);
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : "Invalid regex";
  }
}

export function CategoryForm({ initialData, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [color, setColor] = useState(initialData?.color ?? "#6366f1");
  const [rules, setRules] = useState<string[]>(initialData?.rules ?? []);
  const [ruleInput, setRuleInput] = useState("");
  const [ruleError, setRuleError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = initialData !== undefined;

  function addRule() {
    const trimmed = ruleInput.trim();
    if (!trimmed) return;

    const regexError = validateRegex(trimmed);
    if (regexError) {
      setRuleError(regexError);
      return;
    }

    setRules((prev) => [...prev, trimmed]);
    setRuleInput("");
    setRuleError(null);
  }

  function removeRule(index: number) {
    setRules((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({ name: name.trim(), color, rules });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {isEdit ? "Edit Category" : "New Category"}
      </h3>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <label htmlFor="cat-name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Name
        </label>
        <input
          id="cat-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Development"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>

      {/* Color */}
      <div className="space-y-1.5">
        <label htmlFor="cat-color" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Color
        </label>
        <div className="flex items-center gap-3">
          <input
            id="cat-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-9 w-9 cursor-pointer rounded border border-zinc-300 bg-transparent p-0.5 dark:border-zinc-700"
          />
          <span className="text-sm font-mono text-zinc-500 dark:text-zinc-400">{color}</span>
        </div>
      </div>

      {/* Rules */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Rules (regex patterns matched against window titles)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={ruleInput}
            onChange={(e) => {
              setRuleInput(e.target.value);
              setRuleError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addRule();
              }
            }}
            placeholder="e.g. \.tsx?$ or VS Code"
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
          <button
            type="button"
            onClick={addRule}
            className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Add
          </button>
        </div>
        {ruleError && (
          <p className="text-xs text-red-500 dark:text-red-400">{ruleError}</p>
        )}
        {rules.length > 0 && (
          <ul className="space-y-1.5 pt-1">
            {rules.map((rule, i) => (
              <li key={i} className="flex items-center gap-2 rounded-md bg-zinc-50 px-3 py-1.5 dark:bg-zinc-800/50">
                <code className="flex-1 text-xs text-zinc-700 dark:text-zinc-300">{rule}</code>
                <button
                  type="button"
                  onClick={() => removeRule(i)}
                  className="text-zinc-400 transition-colors hover:text-red-500"
                  aria-label={`Remove rule ${rule}`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Category"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
