"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClientApiClient } from "@/lib/client-api";

async function fetchUserId(): Promise<string | null> {
  const res = await fetch("/api/me");
  if (!res.ok) return null;
  const data = (await res.json()) as { userId: string | null };
  return data.userId;
}

export function useAuthedClientApi() {
  const { data: userId, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: fetchUserId,
    staleTime: Infinity,
  });

  const clientApi = useMemo(() => {
    if (!userId) return null;
    return createClientApiClient(userId);
  }, [userId]);

  return {
    status: isLoading ? ("loading" as const) : userId ? ("authenticated" as const) : ("unauthenticated" as const),
    userId,
    clientApi,
    isSessionLoading: isLoading,
  };
}
