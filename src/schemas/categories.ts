import { z } from "zod";

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;
const validRegexRule = z.string().refine((pattern) => {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}, "rules must contain valid regex patterns");

export const createCategoryBodySchema = z.object({
  name: z
    .string()
    .min(1, "name is required and must be a non-empty string")
    .transform((s) => s.trim())
    .pipe(z.string().min(1, "name is required and must be a non-empty string")),
  color: z
    .string()
    .regex(HEX_COLOR_REGEX, "color must be a hex string (e.g. #FF5733)")
    .optional(),
  rules: z.array(validRegexRule).optional(),
});

export const updateCategoryBodySchema = z
  .object({
    name: z
      .string()
      .min(1, "name must be a non-empty string")
      .transform((s) => s.trim())
      .pipe(z.string().min(1, "name must be a non-empty string"))
      .optional(),
    color: z
      .string()
      .regex(HEX_COLOR_REGEX, "color must be a hex string (e.g. #FF5733)")
      .optional(),
    rules: z.array(validRegexRule).optional(),
  });

export const categoryParamsSchema = z.object({
  id: z.string().uuid("id must be a valid UUID"),
});
