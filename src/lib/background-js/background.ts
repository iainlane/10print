import debounce from "lodash.debounce";

import {
  type PartialConfig,
  svgQuerySchema,
  toUrlSearchParams,
} from "@/lib/svg-api/helpers";

/**
 * Use this script like:
 *
 * ```html
 * <script>
 *  import { TENPRINT } from "https://10print.xys/static/background.js"
 *
 *  TENPRINT({
 *    gridSize: 10,
 *    lineThickness: 1,
 *    firstColour: "#000000",
 *    secondColour: "#FFFFFF",
 *  }, document.body)
 * </script>
 * ```
 * and the `document.body` element will have a background image set to a random
 * 10PRINT image.
 *
 * If you don't need to pass custom parameters and want to update the body, use
 * {@link ./background-body.ts} instead.
 */

/**
 * The base URL of the API
 *
 * @example https://10print.xyz/svg
 */
const API_BASE_URL = (() => {
  // In dev, the API is served by `wrangler pages dev` which runs on
  // http://localhost:8788.
  const ourUrl = import.meta.env.PROD
    ? import.meta.url
    : "http://localhost:8788";

  const url = new URL(ourUrl);

  url.pathname = "/svg";

  return url.toString();
})();

/**
 * Don't make requests to the SVG API more than this often, in milliseconds.
 */
const DEBOUNCE_MS = 100;

/**
 * Key used in localStorage for the random seed. Saved so that the same image is
 * shown when the page is reloaded.
 */
const LOCAL_STORAGE_KEY = "background-seed";

/**
 * Saves seed to localStorage
 */
export function saveSeed(seed: number): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, seed.toString());
}

/**
 * Fetches and parses a saved seed from localStorage. If the stored seed is
 * invalid (not a number), it will be removed from localStorage.
 *
 * @returns The parsed seed, or null if there is no seed or it's invalid,
 */
export function getSavedSeed(): number | undefined {
  const savedSeed = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (savedSeed === null) {
    return undefined;
  }

  const parsedSeed = parseInt(savedSeed, 10);

  if (Number.isNaN(parsedSeed)) {
    console.warn(`Invalid seed "${savedSeed}" found in localStorage, removing`);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  return parsedSeed;
}

/**
 * Builds the image URL with the given parameters
 *
 * @param baseUrl The base URL of the API
 * @param params The parameters to build the URL with
 *
 * @returns The constructed image URL to fetch the SVG from.
 */
export function buildImageUrl(baseUrl: string, params: PartialConfig): string {
  const searchParams = toUrlSearchParams(params);

  const url = new URL(baseUrl);
  url.search = searchParams.toString();

  return url.toString();
}

/**
 * Converts SVG text to a data URL.
 *
 * @param svgText The SVG text to convert
 */
export function svgToDataUrl(svgText: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
}

/**
 * Fetches the SVG from the given URL and sets the background image of the
 * element.
 *
 * @param element The element to set the background image on
 * @param url The URL to fetch the SVG from
 */
function setImage(element: HTMLElement, url: string): void {
  fetch(url)
    .then((response) => {
      const contentType = response.headers.get("content-type");

      if (contentType !== "image/svg+xml") {
        throw new Error(
          `Expected content type "image/svg+xml", got "${contentType ?? "unknown"}"`,
        );
      }

      return response.text();
    })
    .then((svgText) => {
      const dataUrl = svgToDataUrl(svgText);
      element.style.backgroundImage = `url('${dataUrl}')`;
    })
    .catch((error: unknown) => {
      console.error("Error setting background image", error);
    });
}

/**
 * Options for the TENPRINT function
 */
interface TENPRINTOptions {
  /**
   * Whether to use a seed stored in localStorage, if available. If `false`,
   * a new seed will be generated each time the SVG is updated.
   *
   * If `true`, the seed will be saved to localStorage when the SVG is updated.
   *
   * @default false
   */
  saveSeed?: boolean;

  /**
   * Whether to observe the element's resize and update the background image
   * when it changes.
   *
   * @default false
   */
  observeResize?: boolean;
}

/**
 * Sets the background image of the element to a random 10PRINT image.
 *
 * If `params` doesn't contain values for `width` and `height`, the element's
 * dimensions will be used.
 *
 * @param params The parameters to build the URL with
 * @param element The element to set the background image on
 * @param options The options for the TENPRINT function
 */
export function TENPRINT(
  element: HTMLElement,
  params: PartialConfig = {},
  { saveSeed = true, observeResize = true }: TENPRINTOptions = {},
): void {
  let { width, height, seed } = params;

  if (saveSeed && seed === undefined) {
    seed = getSavedSeed() ?? undefined;
  }

  // Use the element's dimensions if not provided
  if (width === undefined || height === undefined) {
    const { width: elementWidth, height: elementHeight } =
      element.getBoundingClientRect();

    width = width ?? elementWidth;
    height = height ?? elementHeight;
  }

  const parsedParams = svgQuerySchema.parse({
    width,
    height,
    seed,
    ...params,
  });

  element.style.backgroundSize = "cover";

  const url = buildImageUrl(API_BASE_URL, parsedParams);

  function update() {
    setImage(element, url);
  }

  update();

  if (!observeResize) {
    return;
  }

  const debouncedUpdate = debounce(update, DEBOUNCE_MS);
  const resizeObserver = new ResizeObserver(debouncedUpdate);
  resizeObserver.observe(element);
}
