import { memo, useEffect, useRef } from "react";

import { useWindowSize } from "@/hooks/useWindowSize";
import { TenPrintConfig } from "@/lib/config";
import { generateTenPrintGroupContent } from "@/lib/tenprint";
import { cn } from "@/lib/utils";

const SVG_NS = "http://www.w3.org/2000/svg";

interface TenPrintSvgProps extends TenPrintConfig {
  className?: string;
  onRegenerate: () => void;
}

function TenPrintSvgComponent({
  className,
  onRegenerate,
  ...config
}: TenPrintSvgProps) {
  const { width, height } = useWindowSize();
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(
    function () {
      const svgElement = svgRef.current;

      if (width === 0 || height === 0 || !svgElement) {
        return;
      }

      while (svgElement.firstChild) {
        svgElement.removeChild(svgElement.firstChild);
      }

      const newGroupContent = generateTenPrintGroupContent(
        document,
        config,
        width,
        height,
      );

      svgElement.appendChild(newGroupContent);
    },
    [width, height, config],
  );

  return (
    <svg
      ref={svgRef}
      className={cn(
        "bg-background fixed top-0 left-0 z-0 h-full w-full cursor-pointer",
        className,
      )}
      width={width}
      height={height}
      viewBox={`0 0 ${width.toString()} ${height.toString()}`}
      xmlns={SVG_NS}
      onClick={onRegenerate}
      aria-hidden="true"
    />
  );
}

export const TenPrintSvg = memo(TenPrintSvgComponent);
