import { z } from "zod";

export const reportsQuerySchema = z.object({
  period: z.enum(["weekly", "monthly"], {
    error: "period must be 'weekly' or 'monthly'",
  }),
  from: z.coerce.date({ error: "from must be a valid ISO date string" }).optional(),
  to: z.coerce.date({ error: "to must be a valid ISO date string" }).optional(),
});
