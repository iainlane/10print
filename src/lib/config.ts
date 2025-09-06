import { lexer, parse } from "css-tree";
import {
  type Color,
  modeHsl,
  modeOklch,
  modeP3,
  modeRgb,
  parse as parseColour,
  useMode,
} from "culori/fn";
import { z } from "zod";

/**
 * Register only the colour spaces we actually use.
 * - rgb: common input/output
 * - p3: wide‑gamut inputs and gamut checks
 * - oklch: perceptual working space and validation target
 */
useMode(modeRgb);
useMode(modeP3);
useMode(modeOklch);
useMode(modeHsl);

/**
 * Check if a string is a valid CSS colour and parse it with culori.
 *
 * Uses `csstree` for validation and `culori` for conversion.
 *
 * @param val The string to check.
 * @returns The colour object if valid, or null if invalid.
 */
export function validateAndConvertColour(colorValue: string): Color | null {
  // First validate with csstree
  const ast = parse(colorValue, {
    context: "value",
  });

  if (ast.type !== "Value") {
    return null;
  }

  const matchResult = lexer.matchProperty("color", ast);

  if (matchResult.error !== null) {
    return null;
  }

  // If valid, parse and convert with culori
  const parsed = parseColour(colorValue);
  if (parsed === undefined) {
    return null;
  }

  return parsed;
}

/**
 * Strict Zod schemas for supported culori Color objects.
 * Alpha is optional and must be within [0, 1] when present.
 */
const alphaSchema = z.number().min(0).max(1).optional();

const rgbSchema = z.object({
  mode: z.literal("rgb"),
  r: z.number(),
  g: z.number(),
  b: z.number(),
  alpha: alphaSchema,
});

const p3Schema = z.object({
  mode: z.literal("p3"),
  r: z.number(),
  g: z.number(),
  b: z.number(),
  alpha: alphaSchema,
});

const oklchSchema = z.object({
  mode: z.literal("oklch"),
  l: z.number(),
  c: z.number(),
  h: z.number(),
  alpha: alphaSchema,
});

const hslSchema = z.object({
  mode: z.literal("hsl"),
  h: z.number(),
  s: z.number(),
  l: z.number(),
  alpha: alphaSchema,
});

const supportedColorSchema = z.union([
  hslSchema,
  oklchSchema,
  p3Schema,
  rgbSchema,
]);

/**
 * Custom Zod transform for colour strings or Color objects to Color objects.
 */
const colourTransform = z
  .union([z.string(), supportedColorSchema])
  .transform((val, ctx) => {
    // If it's already a Color object, return as-is
    if (typeof val === "object") {
      return val;
    }

    // Otherwise it's a string, validate and convert
    const converted = validateAndConvertColour(val);
    if (converted === null) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid colour",
      });
      return z.NEVER;
    }

    return converted;
  });

/**
 * Default configuration values, used if not provided in the request.
 */
export const DEFAULT_CONFIG = {
  gridSize: 20,
  lineThickness: 2,
  firstColour: { mode: "rgb", r: 0.23, g: 0.51, b: 0.965 }, // Blue (#3B82F6)
  secondColour: { mode: "rgb", r: 0.925, g: 0.282, b: 0.6 }, // Pink (#EC4899)
  seed: Math.random(),
} as const;

/**
 * Base schema for the configuration. Each field has a default value, so when
 * parsed, missing fields will be given their default values.
 *
 * @see {@link DEFAULT_CONFIG}
 */
export const configSchemaBase = z.object({
  gridSize: z.coerce
    .number()
    // this is silly, but there is no coerce method for integers
    .multipleOf(1)
    .min(10)
    .max(100)
    .default(DEFAULT_CONFIG.gridSize),
  lineThickness: z.coerce
    .number()
    .multipleOf(1)
    .min(1)
    .max(5)
    .default(DEFAULT_CONFIG.lineThickness),
  firstColour: colourTransform.default(() => DEFAULT_CONFIG.firstColour),
  secondColour: colourTransform.default(() => DEFAULT_CONFIG.secondColour),
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
