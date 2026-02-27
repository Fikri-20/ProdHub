import { z } from "zod";

export const summaryQuerySchema = z.object({
  groupBy: z.enum(["app", "category", "project"], {
    error: "groupBy query param is required and must be 'app', 'category', or 'project'",
  }),
  from: z.coerce.date({ error: "from must be a valid ISO date string" }).optional(),
  to: z.coerce.date({ error: "to must be a valid ISO date string" }).optional(),
});
