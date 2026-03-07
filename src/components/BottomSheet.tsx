import { ChevronRight, RotateCcw, Shuffle } from "lucide-react";
import { lazy, Suspense, useRef, useState } from "react";
import { siGithub } from "simple-icons";

import { ColourInput } from "@/components/ColourInput";
import { CopyButton } from "@/components/CopyButton";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TenPrintConfig } from "@/lib/config";
import { Color } from "@/lib/culori";
import { generateEmbedCode } from "@/lib/embedCode";
import { applyRubberBand } from "@/lib/rubberBand";

import { RangeInput } from "./RangeInput";
import { ThemeSelector } from "./ThemeSelector";

const EmbedCode = lazy(() => import("@/components/EmbedCode"));

const SETTINGS_POPOVER_ID = "settings-panel";
const SETTINGS_PANEL_BODY_ID = "settings-panel-body";
const SNAP_THRESHOLD = 60;
const TAP_THRESHOLD = 5;

/** How far (px) you need to drag before the header snaps to expanded. */
const HEADER_EXPAND_THRESHOLD = 20;

function EmbedSection({ config }: { config: TenPrintConfig }) {
  const [includeSeed, setIncludeSeed] = useState(false);

  return (
    <details className="group border-t border-white/15 text-sm dark:border-white/10">
      <summary className="text-muted-foreground flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-xs font-medium tracking-wider uppercase select-none [&::-webkit-details-marker]:hidden">
        <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
        Embed
      </summary>
      <div className="space-y-3 px-4 pb-4">
        <p className="text-muted-foreground text-xs leading-relaxed">
          Add the code below to use this pattern as a background on any HTML
          page. Change <code>document.body</code> to target any element.
        </p>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Switch
              id="bs-include-seed"
              checked={includeSeed}
              onCheckedChange={setIncludeSeed}
            />
            <label
              htmlFor="bs-include-seed"
              className="text-muted-foreground text-xs"
            >
              Include seed
            </label>
          </div>
          <CopyButton
            text={generateEmbedCode(config, includeSeed)}
            className="h-7 px-2"
            tooltip="Copy embed code"
          />
        </div>

        <Suspense
          fallback={
            <div className="text-muted-foreground py-2 text-xs">Loading…</div>
          }
        >
          <EmbedCode config={config} includeSeed={includeSeed} />
        </Suspense>
      </div>
    </details>
  );
}

interface BottomSheetPanelProps {
  config: TenPrintConfig;
  onGridSizeChange: (value: number) => void;
  onLineThicknessChange: (value: number) => void;
  onFirstColourChange: (value: Color) => void;
  onSecondColourChange: (value: Color) => void;
  onReset: () => void;
  onRandomiseColours: () => void;
}

export function BottomSheetPanel({
  config,
  onGridSizeChange,
  onLineThicknessChange,
  onFirstColourChange,
  onSecondColourChange,
  onReset,
  onRandomiseColours,
}: BottomSheetPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const contentHeight = useRef(0);
  const dragDeltaRef = useRef(0);
  const wasOpenRef = useRef(false);
  const isDraggingRef = useRef(false);

  function handleToggle() {
    containerRef.current?.style.removeProperty("--sheet-y");
  }

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    const el = containerRef.current;
    if (!el || e.defaultPrevented) {
      return;
    }

    // JSDOM does not implement declarative popover controls, so keep a
    // click-path fallback for tests and older browsers.
    if ("popoverTargetElement" in HTMLButtonElement.prototype) {
      return;
    }

    el.togglePopover({ source: e.currentTarget });
  }

  function handlePointerDown(e: React.PointerEvent) {
    const el = containerRef.current;
    if (!el) {
      return;
    }

    wasOpenRef.current = el.matches(":popover-open");
    isDraggingRef.current = true;
    dragStartY.current = e.clientY;
    dragDeltaRef.current = 0;
    el.classList.add("dragging");
    contentHeight.current = el.offsetHeight;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    const el = containerRef.current;
    if (!isDraggingRef.current || !el) {
      return;
    }

    const rawDelta = e.clientY - dragStartY.current;
    const h = contentHeight.current;
    const wasOpen = wasOpenRef.current;

    let delta: number;
    if (wasOpen) {
      delta =
        rawDelta < 0
          ? applyRubberBand(rawDelta, 0)
          : applyRubberBand(rawDelta, h);
    } else {
      delta =
        rawDelta > 0
          ? applyRubberBand(rawDelta, 0)
          : applyRubberBand(rawDelta, h);
    }

    dragDeltaRef.current = delta;

    el.style.setProperty(
      "--sheet-y",
      wasOpen ? `${String(delta)}px` : `calc(100% + ${String(delta)}px)`,
    );

    const expanded = wasOpen
      ? delta < HEADER_EXPAND_THRESHOLD
      : -delta > HEADER_EXPAND_THRESHOLD;
    el.classList.toggle("drag-expanded", expanded);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    const el = containerRef.current;
    if (!isDraggingRef.current || !el) {
      return;
    }

    isDraggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    const delta = dragDeltaRef.current;
    const absDelta = Math.abs(delta);
    const wasOpen = wasOpenRef.current;

    if (absDelta < TAP_THRESHOLD) {
      el.classList.remove("dragging", "drag-expanded");
      el.style.removeProperty("--sheet-y");
      return;
    }

    e.currentTarget.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
      },
      {
        once: true,
      },
    );

    const shouldClose = wasOpen && delta > SNAP_THRESHOLD;
    const shouldOpen = !wasOpen && delta < -SNAP_THRESHOLD;

    if (shouldClose) {
      el.hidePopover();
    } else if (shouldOpen) {
      el.showPopover({ source: e.currentTarget });
    }

    el.classList.remove("dragging", "drag-expanded");

    requestAnimationFrame(() => {
      el.style.removeProperty("--sheet-y");
    });
  }

  return (
    <div
      ref={containerRef}
      id={SETTINGS_POPOVER_ID}
      popover="auto"
      onToggle={handleToggle}
      className="group ease-spring fixed inset-auto inset-x-0 bottom-0 z-20 m-0 mx-auto block w-auto max-w-2xl translate-y-(--sheet-y) overflow-visible border-none bg-transparent p-0 text-inherit transition-transform duration-[350ms] [--sheet-y:100%] [&.dragging]:transition-none [&:popover-open]:[--sheet-y:0px]"
    >
      {/* Header / handle */}
      <div className="absolute inset-x-0 bottom-full">
        <div className="pointer-events-none absolute inset-y-0 left-4 z-10 hidden items-center group-[.drag-expanded]:flex group-[:popover-open]:flex">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Reset to defaults"
                  onClick={onReset}
                  className="pointer-events-auto h-8 w-8"
                  title="Reset to defaults"
                  type="button"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset to defaults</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={handleClick}
          className="block w-full cursor-grab touch-none select-none active:cursor-grabbing"
          aria-controls={SETTINGS_PANEL_BODY_ID}
          aria-label="Settings panel"
          popoverTarget={SETTINGS_POPOVER_ID}
          popoverTargetAction="toggle"
        >
          <div className="sheet-handle-height ease-spring relative flex min-h-0 items-center px-4 py-2 transition-[min-height] duration-200 group-[.drag-expanded]:min-h-10 group-[:popover-open]:min-h-10">
            {/* Animated background shape */}
            <div className="sheet-handle-bg ease-spring absolute inset-y-0 right-[calc(50%-3rem)] left-[calc(50%-3rem)] rounded-t-xl border-x border-t border-white/20 bg-white/40 shadow-lg backdrop-blur-xl transition-[left,right,border-radius] duration-200 group-[.drag-expanded]:right-0 group-[.drag-expanded]:left-0 group-[.drag-expanded]:rounded-t-2xl group-[:popover-open]:right-0 group-[:popover-open]:left-0 group-[:popover-open]:rounded-t-2xl dark:border-white/10 dark:bg-black/30" />

            {/* Drag pill — always centred */}
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <div className="h-1 w-8 rounded-full bg-neutral-400/50 dark:bg-neutral-500/40" />
            </div>
          </div>
        </button>
      </div>

      {/* Sheet content body */}
      <div
        id={SETTINGS_PANEL_BODY_ID}
        className="hidden border-x border-white/20 bg-white/40 shadow-2xl backdrop-blur-xl group-[.dragging]:block group-[:popover-open]:block dark:border-white/10 dark:bg-black/30"
      >
        <div className="max-h-[70dvh] overflow-y-auto overscroll-contain">
          <div className="grid gap-6 px-4 py-4 text-sm sm:grid-cols-2">
            <section aria-label="Grid controls" className="space-y-3">
              <h3 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Grid
              </h3>
              <div className="grid gap-3">
                <RangeInput
                  id="bs-gridSize"
                  label="Grid Size"
                  min={10}
                  max={100}
                  value={config.gridSize}
                  onChange={onGridSizeChange}
                />
                <RangeInput
                  id="bs-lineThickness"
                  label="Line Thickness"
                  min={1}
                  max={5}
                  value={config.lineThickness}
                  onChange={onLineThicknessChange}
                />
              </div>
            </section>

            <section aria-label="Stroke colours" className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Colours
                </h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Randomise colours"
                        onClick={onRandomiseColours}
                        className="h-7 w-7"
                        title="Randomise colours"
                      >
                        <Shuffle className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      Randomise colours
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ColourInput
                  id="bs-firstColour"
                  label="First colour"
                  value={config.firstColour}
                  onChange={onFirstColourChange}
                />
                <ColourInput
                  id="bs-secondColour"
                  label="Second colour"
                  value={config.secondColour}
                  onChange={onSecondColourChange}
                />
              </div>
            </section>
          </div>

          <EmbedSection config={config} />

          <footer className="border-t border-white/15 px-4 py-3 dark:border-white/10">
            <div className="flex items-center gap-4">
              <ThemeSelector
                className="w-full max-w-48"
                portalContainer={containerRef.current}
              />

              <div className="ml-auto flex items-center gap-3">
                <p className="text-muted-foreground text-xs">
                  Made by{" "}
                  <a
                    href="https://orangesquash.org.uk/~laney"
                    className="underline decoration-dashed"
                  >
                    <span className="font-mono">laney</span>
                  </a>
                </p>
                <a
                  href="https://github.com/iainlane/10print"
                  aria-label="Source on GitHub"
                  title="Source on GitHub"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    width={20}
                    height={20}
                    fill="currentColor"
                  >
                    <path d={siGithub.path} />
                  </svg>
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
