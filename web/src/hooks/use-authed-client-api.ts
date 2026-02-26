"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { createClientApiClient } from "@/lib/client-api";

export function useAuthedClientApi() {
  const { data, status } = useSession();
  const userId = data?.user?.id;

  const clientApi = useMemo(() => {
    if (!userId) return null;
    return createClientApiClient(userId);
  }, [userId]);

  return {
    status,
    userId,
    clientApi,
    isSessionLoading: status === "loading",
  };
}
