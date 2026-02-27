"use client";

import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { CategoryForm } from "./category-form";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import type { Category, CategoryFormData } from "@/types/categories";
import { useAuthedClientApi } from "@/hooks/use-authed-client-api";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  queryKeys,
  updateCategory,
} from "@/lib/dashboard-queries";

export function CategoryManager() {
  const { userId, clientApi, isSessionLoading } = useAuthedClientApi();
  const queryClient = useQueryClient();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const categoriesQuery = useQuery({
    queryKey: userId ? queryKeys.categories(userId) : ["categories", "anonymous"],
    queryFn: () => fetchCategories(clientApi!),
    enabled: Boolean(userId && clientApi),
  });

  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) => {
      if (!clientApi) throw new Error("Not authenticated");
      return createCategory(clientApi, data);
    },
    onSuccess: (created) => {
      if (!userId) return;
      queryClient.setQueryData(queryKeys.categories(userId), (previous: Category[] = []) =>
        [...previous, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) => {
      if (!clientApi) throw new Error("Not authenticated");
      return updateCategory(clientApi, id, data);
    },
    onSuccess: (updated) => {
      if (!userId) return;
      queryClient.setQueryData(queryKeys.categories(userId), (previous: Category[] = []) =>
        previous
          .map((category) => (category.id === updated.id ? updated : category))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      setEditingCategory(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!clientApi) throw new Error("Not authenticated");
      await deleteCategory(clientApi, id);
      return id;
    },
    onSuccess: (deletedId) => {
      if (!userId) return;
      queryClient.setQueryData(queryKeys.categories(userId), (previous: Category[] = []) =>
        previous.filter((category) => category.id !== deletedId),
      );
      setCategoryToDelete(null);
    },
    onSettled: () => {
      setDeleting(null);
    },
  });

  async function handleCreate(data: CategoryFormData) {
    await createMutation.mutateAsync(data);
  }

  async function handleUpdate(data: CategoryFormData) {
    if (!editingCategory) return;
    await updateMutation.mutateAsync({ id: editingCategory.id, data });
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  }

  if (isSessionLoading || categoriesQuery.isPending) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-indigo-500 dark:border-zinc-700 dark:border-t-indigo-400" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Loading categories...
        </p>
      </div>
    );
  }

  if (!clientApi || !userId) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
        <p className="text-sm text-red-600 dark:text-red-400">
          Not authenticated
        </p>
      </div>
    );
  }

  if (categoriesQuery.error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
        <p className="text-sm text-red-600 dark:text-red-400">
          {categoriesQuery.error.message}
        </p>
      </div>
    );
  }

  const categories = categoriesQuery.data ?? [];

  if (showForm) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">New Category</h3>
        <CategoryForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      </div>
    );
  }

  if (editingCategory) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Edit &ldquo;{editingCategory.name}&rdquo;
        </h3>
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {categories.length} categor{categories.length === 1 ? "y" : "ies"}
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-zinc-200 py-16 dark:border-zinc-800">
          <div className="mb-4 rounded-full bg-zinc-100 p-4 dark:bg-zinc-800/60">
            <svg className="h-8 w-8 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            No categories yet
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Create one to start organizing your activity
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group relative overflow-hidden rounded-xl border border-zinc-100 bg-white p-4 shadow-sm transition-all hover:border-zinc-200 hover:shadow-md dark:border-zinc-800/60 dark:bg-zinc-900/80 dark:hover:border-zinc-700"
            >
              {/* Color accent bar */}
              <div
                className="absolute left-0 top-0 h-full w-1 rounded-l-xl"
                style={{ backgroundColor: category.color }}
              />

              <div className="flex items-start justify-between pl-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-block h-4 w-4 rounded-full ring-2 ring-white dark:ring-zinc-900"
                    style={{ backgroundColor: category.color }}
                  />
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{category.name}</h3>
                </div>
                <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                    aria-label={`Edit ${category.name}`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCategoryToDelete(category)}
                    disabled={deleting === category.id}
                    className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950 dark:hover:text-red-400"
                    aria-label={`Delete ${category.name}`}
                  >
                    {deleting === category.id ? (
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

              {category.rules.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 pl-2">
                  {category.rules.map((rule, index) => (
                    <code
                      key={index}
                      className="rounded-md bg-zinc-50 px-2 py-0.5 text-xs text-zinc-500 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-400 dark:ring-zinc-700"
                    >
                      {rule}
                    </code>
                  ))}
                </div>
              )}

              {category.rules.length === 0 && (
                <p className="mt-2 pl-2 text-xs text-zinc-400 dark:text-zinc-500">
                  No rules defined
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={categoryToDelete !== null}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={deleting === categoryToDelete?.id}
        onConfirm={() => {
          if (categoryToDelete) {
            handleDelete(categoryToDelete.id);
          }
        }}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
}
