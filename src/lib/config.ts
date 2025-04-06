import { z } from "zod";

/**
 * Default configuration values, used if not provided in the request.
 */
export const DEFAULT_CONFIG = {
  gridSize: 20,
  lineThickness: 2,
  firstColour: "#3B82F6", // Blue
  secondColour: "#EC4899", // Pink
  seed: Math.random(),
};

/**
 * Base schema for the configuration. Each field has a default value, so when
 * parsed, missing fields will be given their default values.
 *
 * @see {@link DEFAULT_CONFIG}
 */
export const configSchemaBase = z.object({
  gridSize: z.coerce
    .number()
    .int()
    .min(10)
    .max(100)
    .default(DEFAULT_CONFIG.gridSize),
  lineThickness: z.coerce
    .number()
    .int()
    .min(1)
    .max(5)
    .default(DEFAULT_CONFIG.lineThickness),
  firstColour: z
    .string()
    .regex(/^#([0-9A-F]{3}){1,2}$/i)
    .default(DEFAULT_CONFIG.firstColour),
  secondColour: z
    .string()
    .regex(/^#([0-9A-F]{3}){1,2}$/i)
    .default(DEFAULT_CONFIG.secondColour),
  seed: z.coerce.number().default(Math.random),
});

/**
 * Schema for the configuration. Can parse `null` as an input, returning a
 * configuration with all fields set to their default values.
 *
 * @see {@link configSchemaBase}
 */
export const configSchema = z.preprocess(
  (param) => param ?? {},
  configSchemaBase,
);

export type TenPrintConfig = z.infer<typeof configSchema>;

/**
 * Valid values for the theme mode.
 */
export const themeSchema = z
  .enum(["light", "dark", "auto"] as const)
  .default("auto");

export type ThemeMode = z.infer<typeof themeSchema>;

/**
 * Key for storing the configuration in localStorage.
 */
export const STORAGE_KEY = "tenprint-config";

/**
 * Key for storing the theme mode in localStorage.
 */
export const THEME_STORAGE_KEY = "tenprint-theme";
