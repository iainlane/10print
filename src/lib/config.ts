import { z } from "zod";

// Zod schema for validating configuration
export const configSchema = z.object({
  gridSize: z.number().int().min(10).max(100),
  lineThickness: z.number().int().min(1).max(5),
  firstColour: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i),
  secondColour: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i),
  seed: z.number(),
});

export type TenPrintConfig = z.infer<typeof configSchema>;

export const DEFAULT_CONFIG: TenPrintConfig = {
  gridSize: 20,
  lineThickness: 2,
  firstColour: "#3B82F6", // Blue
  secondColour: "#EC4899", // Pink
  seed: Math.random(),
};

export const themeSchema = z.enum(["light", "dark", "auto"] as const);

export type ThemeMode = z.infer<typeof themeSchema>;

// localStorage keys
export const STORAGE_KEY = "tenprint-config";
export const THEME_STORAGE_KEY = "tenprint-theme";
