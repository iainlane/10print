import debounce from "lodash.debounce";

const DEBOUNCE_MS = 100;
const LOCAL_STORAGE_KEY = "background-seed";

/**
 * Viewport dimensions type
 */
interface ViewportDimensions {
  width: number;
  height: number;
}

// Determine the API base URL from the module's source
const apiBaseUrl = getApiBaseUrl();

/**
 * Dynamically determine the API base URL based on module source
 */
function getApiBaseUrl(): string {
  // Use import.meta.url to get the module URL
  const moduleUrl = new URL(import.meta.url);

  // Replace any specific paths like /dist/ with /api/
  return `${moduleUrl.origin}/api/svg`;
}

/**
 * Get current viewport dimensions
 */
function getViewportDimensions(): ViewportDimensions {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Sets the background image of the body
 */
function setImage(url: string): void {
  document.body.style.backgroundImage = `url('${url}')`;
}

/**
 * Retrieves saved seed from localStorage
 */
function getSavedSeed(): string | null {
  return localStorage.getItem(LOCAL_STORAGE_KEY);
}

/**
 * Saves seed to localStorage
 */
function saveSeed(seed: string): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, seed);
}

/**
 * Builds the image URL with the given dimensions and seed
 *
 * @param dimensions Viewport dimensions
 * @param seed Optional seed for the image
 *
 * @returns The constructed image URL to fetch the SVG from.
 */
function buildImageUrl(
  dimensions: ViewportDimensions,
  seed: string | null = null,
): string {
  const { width, height } = dimensions;

  const searchParams = new URLSearchParams({
    height: height.toString(),
  });

  if (seed !== null) {
    searchParams.set("seed", seed);
  }

  searchParams.set("width", width.toString());

  const url = new URL(apiBaseUrl);
  url.search = searchParams.toString();

  return url.toString();
}

/**
 * Converts SVG text to a data URL.
 *
 * @param svgText The SVG text to convert
 */
function svgToDataUrl(svgText: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
}

/**
 * Updates the background image based on current viewport dimensions.
 */
function updateImageUrl(): void {
  const dimensions = getViewportDimensions();
  const savedSeed = getSavedSeed();

  // Use stored seed if available
  if (savedSeed !== null) {
    setImage(buildImageUrl(dimensions, savedSeed));
    return;
  }

  // First request - capture the seed from redirect
  // Using promise chaining instead of async/await
  fetch(buildImageUrl(dimensions))
    .then(function (response) {
      if (!response.ok) {
        const { status, statusText } = response;

        throw new Error(
          `Failed to fetch SVG: ${status.toString()} ${statusText}`,
        );
      }

      // Extract seed from URL if available
      const urlParams = new URL(response.url).searchParams;
      const urlSeed = urlParams.get("seed");

      if (urlSeed) {
        saveSeed(urlSeed);
      }

      return response.text();
    })
    .then(function (svgText) {
      const dataUrl = svgToDataUrl(svgText);

      setImage(dataUrl);
    })
    .catch((error: unknown) => {
      console.error("Error updating background image:", error);
    });
}

/**
 * Initialise the background and set up event listeners
 */
function initialise(): void {
  updateImageUrl();

  const debouncedUpdate = debounce(updateImageUrl, DEBOUNCE_MS);

  const resizeObserver = new ResizeObserver(debouncedUpdate);
  resizeObserver.observe(document.body);
}

function run(): void {
  if (document.readyState !== "loading") {
    initialise();
    return;
  }

  document.addEventListener("DOMContentLoaded", initialise, { once: true });
}

run();
