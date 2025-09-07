import {
  clampChroma,
  type Color,
  formatCss,
  formatHex,
  formatHex8,
  inGamut,
  modeHsl,
  modeOklch,
  modeP3,
  modeRgb,
  type Oklch,
  parse,
  useMode,
} from "culori/fn";

/**
 * Use only a few colour spaces.
 *
 * - rgb: common input/output
 * - p3: wide‑gamut inputs and gamut checks
 * - oklch: perceptual working space and validation target
 * - hsl: for HSL parsing and conversion
 */
useMode(modeRgb);
useMode(modeP3);
export const oklch = useMode(modeOklch);
useMode(modeHsl);

export {
  clampChroma,
  type Color,
  formatCss,
  formatHex,
  formatHex8,
  inGamut,
  type Oklch,
  parse,
};
