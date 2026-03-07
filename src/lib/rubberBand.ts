const DAMPING_FACTOR = 3;

/**
 * Apply rubber-band dampening to a drag delta.
 *
 * Values within [-limit, limit] pass through unchanged. Beyond that range the
 * excess is compressed with a logarithmic curve, giving a springy feel.
 * When limit is 0 the entire delta is dampened.
 */
export function applyRubberBand(delta: number, limit: number): number {
  const sign = Math.sign(delta);
  const abs = Math.abs(delta);

  if (abs <= limit) return delta;

  const excess = abs - limit;
  return sign * (limit + Math.log1p(excess) * DAMPING_FACTOR);
}
