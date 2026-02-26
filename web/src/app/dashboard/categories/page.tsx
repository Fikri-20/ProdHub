import { apiClient } from "@/lib/api-client";
import { auth } from "@/auth";
import { CategoryManager } from "@/components/categories/category-manager";
import type { Category } from "@/types/categories";

async function fetchCategories(): Promise<Category[]> {
  const res = await apiClient("/api/categories", { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to fetch categories: ${res.status}`);
  }

  return res.json() as Promise<Category[]>;
}

export default async function CategoriesPage() {
  const session = await auth();

  let categories: Category[];
  let error: string | null = null;

  try {
    categories = await fetchCategories();
  } catch (e) {
    categories = [];
    error = e instanceof Error ? e.message : "Failed to load categories";
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Categories
      </h2>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <CategoryManager
          initialCategories={categories}
          userId={session!.user!.id!}
        />
      )}
    </div>
  );
}
