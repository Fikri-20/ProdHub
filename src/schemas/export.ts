import { z } from "zod";

export const exportQuerySchema = z.object({
  format: z.enum(["json", "csv"], {
    error: "format must be 'json' or 'csv'",
  }),
  from: z.coerce.date({ error: "from must be a valid ISO date string" }).optional(),
  to: z.coerce.date({ error: "to must be a valid ISO date string" }).optional(),
});

const importEventSchema = z.object({
  deviceName: z.string().min(1),
  os: z.string().min(1),
  appName: z.string().min(1),
  windowTitle: z.string().min(1),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  duration: z.number().int().positive(),
});

export const importBodySchema = z.object({
  events: z.array(importEventSchema).min(1).max(5000),
});
