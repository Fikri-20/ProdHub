import { z } from "zod";

export const summaryQuerySchema = z.object({
  groupBy: z.enum(["app", "category"], {
    error: "groupBy query param is required and must be 'app' or 'category'",
  }),
  from: z.coerce.date({ error: "from must be a valid ISO date string" }).optional(),
  to: z.coerce.date({ error: "to must be a valid ISO date string" }).optional(),
});
