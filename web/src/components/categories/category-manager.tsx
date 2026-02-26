"use client";

import { useState } from "react";
import { CategoryForm } from "./category-form";
import type { Category, CategoryFormData } from "@/types/categories";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

function clientFetch(userId: string, path: string, init?: RequestInit) {
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": userId,
      ...init?.headers,
    },
  });
}

interface CategoryManagerProps {
  initialCategories: Category[];
  userId: string;
}

export function CategoryManager({ initialCategories, userId }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleCreate(data: CategoryFormData) {
    const res = await clientFetch(userId, "/api/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { error?: string }).error ?? `Failed to create (${res.status})`);
    }

    const created = (await res.json()) as Category;
    setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    setShowForm(false);
  }

  async function handleUpdate(data: CategoryFormData) {
    if (!editingCategory) return;

    const res = await clientFetch(userId, `/api/categories/${editingCategory.id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { error?: string }).error ?? `Failed to update (${res.status})`);
    }

    const updated = (await res.json()) as Category;
    setCategories((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c)).sort((a, b) => a.name.localeCompare(b.name)),
    );
    setEditingCategory(null);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await clientFetch(userId, `/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        throw new Error(`Failed to delete (${res.status})`);
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  // Show form for creating or editing
  if (showForm) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <CategoryForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      </div>
    );
  }

  if (editingCategory) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <CategoryForm
          initialData={{
            name: editingCategory.name,
            color: editingCategory.color,
            rules: editingCategory.rules,
          }}
          onSubmit={handleUpdate}
          onCancel={() => setEditingCategory(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Category
        </button>
      </div>

      {/* Empty state */}
      {categories.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <svg className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
          </svg>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            No categories yet. Create one to start organizing your activity.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-block h-4 w-4 rounded-full border border-zinc-200 dark:border-zinc-700"
                    style={{ backgroundColor: cat.color }}
                  />
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-50">{cat.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingCategory(cat)}
                    className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                    aria-label={`Edit ${cat.name}`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${cat.name}"? This cannot be undone.`)) {
                        handleDelete(cat.id);
                      }
                    }}
                    disabled={deleting === cat.id}
                    className="rounded p-1 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950 dark:hover:text-red-400"
                    aria-label={`Delete ${cat.name}`}
                  >
                    {deleting === cat.id ? (
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {cat.rules.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {cat.rules.map((rule, i) => (
                    <code
                      key={i}
                      className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    >
                      {rule}
                    </code>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
