import {
  clampChroma,
  type Color,
  inGamut,
  modeOklch,
  modeP3,
  type Oklch,
  useMode,
} from "culori/fn";
import seedrandom from "seedrandom";

export interface Options {
  seed?: string | number;
  background?: Color;
}

// Register only the modes we use so bundlers can tree-shake the rest.
const oklch = useMode(modeOklch);
useMode(modeP3); // enable P3 gamut operations
const isInP3 = inGamut("p3");

/**
 * Lightness bands used when selecting stroke colours, depending on whether the
 * background is light or dark. Strokes should contrast with the background:
 * - On light backgrounds, choose darker strokes but avoid going near black.
 * - On dark backgrounds, choose lighter strokes but avoid glaring whites.
 */
const LIGHTNESS_BANDS = {
  lightBackground: { min: 0.2, max: 0.7 },
  darkBackground: { min: 0.55, max: 0.92 },
} as const;

/**
 * Chroma (colourfulness) limits for strokes. Keeping chroma modest reduces
 * shimmering and eye strain in dense line patterns. Values are chosen to work
 * well within the Display P3 gamut.
 */
const CHROMA_LIMITS = {
  min: 0.06,
  maxP3: 0.2,
} as const;

/**
 * Parameters for choosing the second hue in relation to the first.
 * - Softened complements: roughly opposite on the wheel, with a small jitter
 *   so the pair feels less harsh.
 * - Analogous: nearby on the wheel, within a small window to avoid sameness.
 * - Probability: how often we pick the softened complement over analogous.
 */
const HUE_RELATION = {
  complementJitter: { minDegrees: 18, rangeDegrees: 14 }, // 18..32°
  analogousDelta: { minDegrees: 20, rangeDegrees: 20 }, // 20..40°
  complementProbability: 0.6,
} as const;

/**
 * Target separation in lightness between the two stroke colours, with a small
 * allowed variation. This keeps the two directions clearly distinct without
 * looking stark.
 */
const LIGHTNESS_DIFF = {
  centre: 0.14,
  range: 0.06, // +/- 0.03 around centre
} as const;

/**
 * Small chroma boost applied to the darker stroke so it doesn’t fade next to
 * the lighter one. This nudge is subtle and kept within a safe range.
 */
const CHROMA_NUDGE = {
  min: 0.015,
  range: 0.02,
} as const;

/**
 * Maximum number of random attempts to find a good pair before falling back.
 * In practice, a valid pair is usually found much sooner.
 */
const MAX_ATTEMPTS = 200;

/**
 * Wrap an angle to the range [0, 360).
 *
 * Hue is an angle on a circle. Wrapping keeps values in a standard range
 * after arithmetic operations.
 *
 * @param h - Angle in degrees (any number).
 * @returns Hue wrapped into [0, 360).
 */
function wrapHue(h: number): number {
  return ((h % 360) + 360) % 360;
}

/**
 * Construct an OKLCH colour from hue, chroma, and lightness.
 *
 * Lightness (l) controls how light or dark the colour is (0..1).
 * Chroma (c) controls how vivid the colour is.
 * Hue (h) selects the colour family, measured in degrees.
 *
 * @param h - Hue in degrees.
 * @param c - Chroma (vividness).
 * @param l - Lightness in [0, 1].
 * @returns An OKLCH colour object.
 */
function makeOklch(h: number, c: number, l: number): Oklch {
  return oklch({ mode: "oklch", h: wrapHue(h), c, l });
}

/**
 * Convert a culori Color to OKLCH, or return the provided fallback.
 *
 * @param color - Any culori Color (may be undefined).
 * @param fallback - The OKLCH value to return if conversion fails.
 * @returns The colour in OKLCH, or the fallback.
 */
function toOklchOr(color: Color | undefined, fallback: Oklch): Oklch {
  const converted = color ? oklch(color) : undefined;
  return converted ?? fallback;
}

/**
 * Reduce a colour’s chroma just enough to fit within the Display P3 gamut,
 * keeping its hue and lightness.
 *
 * Some colours are too vivid for certain displays. This adjusts only the
 * chroma to the nearest safe value in P3, preserving the overall character.
 *
 * @param c - An OKLCH colour.
 * @returns An OKLCH colour clamped to P3, or the original if already in-gamut.
 */
function clampChromaToP3(c: Oklch): Oklch {
  return clampChroma(c, "oklch", "p3");
}

/**
 * Generate two harmonious stroke colours for a 10 PRINT background.
 *
 * Strategy
 * - Work in OKLCH so lightness, chroma, and hue map cleanly to perception.
 * - Choose hues that are either softened complements or analogous.
 * - Enforce a lightness gap so the two directions remain distinct.
 * - Keep chroma modest to avoid shimmering in dense line art.
 * - Clamp chroma against Display P3 so colours are safely displayable.
 *
 * Determinism
 * - When a seed is provided, output is reproducible.
 *
 * @param opts.seed - Optional seed for deterministic output.
 * @param opts.background - Optional background colour; used to infer whether
 *   to pick darker (on light backgrounds) or lighter (on dark backgrounds)
 *   strokes. Any culori Color is accepted.
 * @returns Two OKLCH colours suitable for drawing the two stroke directions.
 */
export function randomBackgroundColours(opts: Options = {}): {
  firstColour: Color;
  secondColour: Color;
} {
  // Random source (seeded if provided).
  const rng =
    opts.seed === undefined ? Math.random : seedrandom(String(opts.seed));
  function rand(): number {
    return rng();
  }

  // Background in OKLCH; default to near-white if none provided.
  const bgDefault: Oklch = makeOklch(0, 0, 0.97);
  const bgOklch: Oklch = toOklchOr(opts.background, bgDefault);
  const isLightBg = bgOklch.l >= 0.5;

  // Lightness bands chosen to contrast with the background.
  const { min: minL, max: maxL } = isLightBg
    ? LIGHTNESS_BANDS.lightBackground
    : LIGHTNESS_BANDS.darkBackground;

  // Sampling helpers
  function sampleL(): number {
    // Pick a lightness inside the chosen band.
    return minL + rand() * (maxL - minL);
  }
  function sampleC(): number {
    // Pick a chroma inside the safe range for line art.
    return (
      CHROMA_LIMITS.min + rand() * (CHROMA_LIMITS.maxP3 - CHROMA_LIMITS.min)
    );
  }
  function sampleH(): number {
    // Pick a hue anywhere around the wheel.
    return rand() * 360;
  }

  // Try several samples; return the first pair that fits P3 after clamping.
  for (let tries = 0; tries < MAX_ATTEMPTS; tries++) {
    // Base colour
    const h1 = sampleH();
    const lBase = sampleL();
    const cBase = sampleC();

    // Related hue: softened complement (60%) or analogous (40%).
    const useComplement = rand() < HUE_RELATION.complementProbability;
    const h2 = useComplement
      ? h1 +
        180 +
        (rand() < 0.5 ? -1 : 1) *
          (HUE_RELATION.complementJitter.minDegrees +
            rand() * HUE_RELATION.complementJitter.rangeDegrees)
      : h1 +
        (rand() < 0.5 ? -1 : 1) *
          (HUE_RELATION.analogousDelta.minDegrees +
            rand() * HUE_RELATION.analogousDelta.rangeDegrees);

    // Enforce a lightness gap so both strokes read clearly.
    const deltaL =
      LIGHTNESS_DIFF.centre +
      (rand() * LIGHTNESS_DIFF.range - LIGHTNESS_DIFF.range / 2);
    const lighterFirst = rand() < 0.5;

    let l1 = lighterFirst ? lBase + deltaL / 2 : lBase - deltaL / 2;
    let l2 = lighterFirst ? lBase - deltaL / 2 : lBase + deltaL / 2;
    l1 = Math.max(minL, Math.min(maxL, l1));
    l2 = Math.max(minL, Math.min(maxL, l2));

    // Give the darker colour a little more chroma for balance.
    const dc = CHROMA_NUDGE.min + rand() * CHROMA_NUDGE.range;
    let c1 = l1 < l2 ? cBase + dc : cBase - dc;
    let c2 = l2 < l1 ? cBase + dc : cBase - dc;
    c1 = Math.max(CHROMA_LIMITS.min, Math.min(CHROMA_LIMITS.maxP3, c1));
    c2 = Math.max(CHROMA_LIMITS.min, Math.min(CHROMA_LIMITS.maxP3, c2));

    // Build candidates in OKLCH.
    let firstColour = makeOklch(h1, c1, l1);
    let secondColour = makeOklch(h2, c2, l2);

    // Reduce only chroma so both colours fit in Display P3.
    firstColour = clampChromaToP3(firstColour);
    secondColour = clampChromaToP3(secondColour);

    // Ensure both are within Display P3 after clamping.
    if (!isInP3(firstColour)) {
      continue;
    }
    if (!isInP3(secondColour)) {
      continue;
    }

    // First valid pair found.
    return { firstColour, secondColour };
  }

  // Conservative fallback: calm hues and readable lightness.
  const firstColour = clampChromaToP3(
    makeOklch(210, 0.1, isLightBg ? 0.65 : 0.75),
  );
  const secondColour = clampChromaToP3(
    makeOklch(30, 0.08, isLightBg ? 0.79 : 0.9),
  );

  return { firstColour, secondColour };
}
