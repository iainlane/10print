import { lexer, parse } from "css-tree";
import { z } from "zod";

/**
 * Check if a string is a valid CSS colour.
 *
 * Uses `csstree` to do the heavy lifting.
 *
 * @param val The string to check.
 * @returns `true` if the string is a valid CSS colour, `false` otherwise.
 */
function validateColour(colorValue: string): boolean {
  // Try to parse the value as a CSS property value
  const ast = parse(colorValue, {
    context: "value",
  });

  if (ast.type !== "Value") {
    return false;
  }

  const matchResult = lexer.matchProperty("color", ast);

  if (matchResult.error !== null) {
    return false;
  }

  return true;
}

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
    .default(DEFAULT_CONFIG.firstColour)
    .refine(validateColour, "Invalid colour"),
  secondColour: z
    .string()
    .default(DEFAULT_CONFIG.secondColour)
    .refine(validateColour, "Invalid colour"),
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
