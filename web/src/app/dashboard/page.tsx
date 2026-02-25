import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Your activity dashboard is coming soon.
      </p>
    </div>
  );
}
