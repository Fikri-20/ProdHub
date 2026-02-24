import { z } from "zod";

export const createKeyBodySchema = z.object({
  name: z.string().trim().min(1, "Key name is required"),
});

export const keyParamsSchema = z.object({
  id: z.string().uuid("Invalid key ID"),
});
