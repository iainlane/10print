import { TenPrintConfig } from "@/lib/config";
import { formatCss } from "@/lib/culori";

export function generateEmbedCode(
  config: TenPrintConfig,
  includeSeed = false,
): string {
  const firstColourCss = formatCss(config.firstColour);
  const secondColourCss = formatCss(config.secondColour);

  const options = {
    gridSize: config.gridSize,
    lineThickness: config.lineThickness,
    firstColour: firstColourCss,
    secondColour: secondColourCss,
    ...(includeSeed && { seed: config.seed }),
  };

  return `<script type="module">
  import { TENPRINT } from "https://10print.xyz/background-element.js";

  TENPRINT(document.body, ${JSON.stringify(options, null, 2).replace(/^/gm, "  ")});
</script>`;
}
