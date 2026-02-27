"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClientApiClient } from "@/lib/client-api";
import { fetchLatestEvent, queryKeys } from "@/lib/dashboard-queries";
import { formatRelativeTime } from "@/lib/timeline-utils";

const POLL_INTERVAL = 10_000;
const STALE_THRESHOLD = 60 * 60; // 1 hour in seconds

interface LiveStatusIndicatorProps {
  userId: string;
}

function useWebSocket(userId: string) {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = `${(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(/^http/, "ws")}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data as string) as { type: string; event: unknown };
        if (data.type === "heartbeat") {
          // Update the latest event cache immediately
          queryClient.setQueryData(queryKeys.latestEvent(userId), data.event);
          // Also invalidate timeline/summary queries so they refetch
          queryClient.invalidateQueries({ queryKey: ["events", userId] });
          queryClient.invalidateQueries({ queryKey: ["summary", userId] });
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      // Reconnect after 5 seconds
      setTimeout(() => {
        if (wsRef.current === ws) {
          wsRef.current = null;
        }
      }, 5000);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [userId, queryClient]);
}

export function LiveStatusIndicator({ userId }: LiveStatusIndicatorProps) {
  const clientApi = useMemo(() => createClientApiClient(userId), [userId]);

  // WebSocket for real-time updates
  useWebSocket(userId);

  // Fallback polling (slower interval since WS handles real-time)
  const latestEventQuery = useQuery({
    queryKey: queryKeys.latestEvent(userId),
    queryFn: () => fetchLatestEvent(clientApi),
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: true,
  });

  const event = latestEventQuery.data ?? null;
  const [, bumpTick] = useState(0);

  useEffect(() => {
    if (!event) return;

    const timer = setInterval(() => {
      bumpTick((tick) => tick + 1);
    }, 30_000);

    return () => clearInterval(timer);
  }, [event]);

  if (!event) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <span className="h-2 w-2 rounded-full bg-zinc-400" />
        No recent activity
      </div>
    );
  }

  const elapsedSeconds = Math.floor(
    (latestEventQuery.dataUpdatedAt - new Date(event.endTime).getTime()) / 1000,
  );
  const isStale = elapsedSeconds > STALE_THRESHOLD;

  if (isStale) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <span className="h-2 w-2 rounded-full bg-zinc-400" />
        No recent activity
      </div>
    );
  }

  const firstCategory = event.categories[0]?.category;
  const dotColor = firstCategory?.color ?? "#a1a1aa"; // zinc-400
  const relativeTime = formatRelativeTime(event.endTime);

  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
      <span className="font-medium text-zinc-700 dark:text-zinc-300">
        {event.appName}
      </span>
      <span className="text-zinc-400">
        {relativeTime}
      </span>
    </div>
  );
}
