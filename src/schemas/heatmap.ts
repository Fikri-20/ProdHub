import { z } from "zod";

export const heatmapQuerySchema = z.object({
  from: z.coerce.date({ error: "from must be a valid ISO date string" }).optional(),
  to: z.coerce.date({ error: "to must be a valid ISO date string" }).optional(),
});
