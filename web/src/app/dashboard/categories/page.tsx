import { CategoryManager } from "@/components/categories/category-manager";

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Categories
      </h2>
      <CategoryManager />
    </div>
  );
}
