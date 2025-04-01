import { z } from "zod";

export const DEFAULT_CONFIG = {
  gridSize: 20,
  lineThickness: 2,
  firstColour: "#3B82F6", // Blue
  secondColour: "#EC4899", // Pink
  seed: Math.random(),
};

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

export const configSchema = z.preprocess(
  (param) => param ?? {},
  configSchemaBase,
);

export type TenPrintConfig = z.infer<typeof configSchema>;

export const themeSchema = z
  .enum(["light", "dark", "auto"] as const)
  .default("auto");

export type ThemeMode = z.infer<typeof themeSchema>;

// localStorage keys
export const STORAGE_KEY = "tenprint-config";
export const THEME_STORAGE_KEY = "tenprint-theme";
