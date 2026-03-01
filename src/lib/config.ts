import * as z from "zod/mini";

import { parse as parseColour } from "@/lib/culori";

/**
 * Strict Zod schemas for supported culori Color objects.
 * Alpha is optional and must be within [0, 1] when present.
 */
const alphaSchema = z.optional(z.number().check(z.gte(0), z.lte(1)));

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
const colourTransform = z.pipe(
  z.union([z.string(), supportedColorSchema]),
  z.transform((val, ctx) => {
    // If it's already a Color object, return as-is
    if (typeof val === "object") {
      return val;
    }

    const parsed = parseColour(val);
    if (parsed === undefined) {
      ctx.issues.push({
        code: "custom",
        input: val,
        message: "Invalid colour",
      });
      return z.NEVER;
    }

    return parsed;
  }),
);

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
  gridSize: z._default(
    z.coerce
      .number()
      // this is silly, but there is no coerce method for integers
      .check(z.multipleOf(1), z.gte(10), z.lte(100)),
    DEFAULT_CONFIG.gridSize,
  ),
  lineThickness: z._default(
    z.coerce.number().check(z.multipleOf(1), z.gte(1), z.lte(5)),
    DEFAULT_CONFIG.lineThickness,
  ),
  firstColour: z._default(colourTransform, () => DEFAULT_CONFIG.firstColour),
  secondColour: z._default(colourTransform, () => DEFAULT_CONFIG.secondColour),
  seed: z._default(z.coerce.number(), Math.random),
});

/**
 * Schema for the configuration. Can parse `null` as an input, returning a
 * configuration with all fields set to their default values.
 *
 * @see {@link configSchemaBase}
 */
export const configSchema = z.pipe(
  z.transform((param) => param ?? {}),
  configSchemaBase,
);

export type TenPrintConfig = z.infer<typeof configSchema>;

/**
 * Valid values for the theme mode.
 */
export const themeSchema = z._default(
  z.enum(["light", "dark", "auto"] as const),
  "auto",
);

export type ThemeMode = z.infer<typeof themeSchema>;

/**
 * Key for storing the configuration in localStorage.
 */
export const STORAGE_KEY = "tenprint-config";

/**
 * Key for storing the theme mode in localStorage.
 */
export const THEME_STORAGE_KEY = "tenprint-theme";
