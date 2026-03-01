import { TENPRINT } from "@/lib/background-js/background";
import { type PartialConfig, type WidthHeight } from "@/lib/svg-api/helpers";

/**
 * Use this script like:
 *
 * ```html
 * <script src="https://10print.xyz/static/background-body.js"></script>
 * ```
 *
 * and the `<body>` element will have a background image set to a random 10PRINT
 * image.
 *
 * The image is updated whenever the body is resized.
 *
 * If you need to pass custom parameters, see <./background.ts>
 */

/**
 * Get current viewport dimensions
 */
function getViewportDimensions(): WidthHeight {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Initialise the background and set up event listeners
 */
async function initialise(): Promise<void> {
  const dimensions = getViewportDimensions();

  const params: PartialConfig = {
    width: dimensions.width,
    height: dimensions.height,
  };

  await TENPRINT(document.body, params);
}

async function run(): Promise<void> {
  if (document.readyState !== "loading") {
    await initialise();
    return;
  }

  document.addEventListener("DOMContentLoaded", () => void initialise(), {
    once: true,
  });
}

void run();
