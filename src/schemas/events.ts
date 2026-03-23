import { z } from "zod";

const trimmedNonEmpty = (field: string) =>
  z.string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, `${field} is required and must be a non-empty string`));

export const heartbeatBodySchema = z.object({
  deviceName: trimmedNonEmpty("deviceName"),
  os: trimmedNonEmpty("os"),
  appName: trimmedNonEmpty("appName"),
  windowTitle: trimmedNonEmpty("windowTitle"),
  startTime: z.coerce.date({ error: "startTime must be a valid ISO date string" }),
  endTime: z.coerce.date({ error: "endTime must be a valid ISO date string" }),
  duration: z.number().int().min(0, "duration must be a non-negative integer"),
});

export const eventsQuerySchema = z.object({
  from: z.coerce.date({ error: "from must be a valid ISO date string" }).optional(),
  to: z.coerce.date({ error: "to must be a valid ISO date string" }).optional(),
  limit: z.coerce.number().int().min(1).max(1000).default(100).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
  appName: z.string().optional(),
});
