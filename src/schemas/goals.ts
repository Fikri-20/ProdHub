import { z } from "zod";

export const createGoalBodySchema = z.object({
  name: z.string().min(1, "name is required").max(100),
  targetSeconds: z.number().int().positive("targetSeconds must be a positive integer"),
  appFilter: z.string().nullable().optional(),
});

export const updateGoalBodySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  targetSeconds: z.number().int().positive().optional(),
  appFilter: z.string().nullable().optional(),
});

export const goalParamsSchema = z.object({
  id: z.string().uuid("id must be a valid UUID"),
});
