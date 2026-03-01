import { Shuffle } from "lucide-react";
import { siGithub } from "simple-icons";
import { Slot } from "@radix-ui/react-slot";

import { ColourInput } from "@/components/ColourInput";
import { CopyButton } from "@/components/CopyButton";
import { EmbedCode, generateEmbedCode } from "@/components/EmbedCode";
import { InfoPanel } from "@/components/InfoPanel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TenPrintConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { RangeInput } from "./RangeInput";
import { ThemeSelector } from "./ThemeSelector";
import { Color } from "@/lib/culori";
import React, { useId, useState } from "react";

interface SectionProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

function Section({
  title,
  action,
  className,
  children,
  asChild = false,
}: React.PropsWithChildren<SectionProps>) {
  const titleId = useId();

  const Comp = asChild ? Slot : "div";

  return (
    <section
      aria-labelledby={titleId}
      className={cn("min-w-0 space-y-4", className)}
    >
      <div className="border-border flex items-center justify-between border-b">
        <h3 id={titleId} className="mb-1 font-medium">
          {title}
        </h3>
        {action}
      </div>
      <Comp>{children}</Comp>
    </section>
  );
}

interface ControlPanelProps {
  className?: string;
  config: TenPrintConfig;
  onGridSizeChange: (value: number) => void;
  onLineThicknessChange: (value: number) => void;
  onFirstColourChange: (value: Color) => void;
  onSecondColourChange: (value: Color) => void;
  onRegenerate: () => void;
  onReset: () => void;
  onRandomiseColours: () => void;
}

export function ControlPanel({
  className,
  config,
  onGridSizeChange,
  onLineThicknessChange,
  onFirstColourChange,
  onSecondColourChange,
  onRegenerate,
  onReset,
  onRandomiseColours,
}: ControlPanelProps) {
  const [includeSeed, setIncludeSeed] = useState(false);
  return (
    <SheetContent className={cn("overflow-y-auto text-sm", className)}>
      <SheetHeader>
        <InfoPanel />
        <SheetDescription>
          Click or tap anywhere on the background to regenerate.
        </SheetDescription>
      </SheetHeader>

      <main aria-label="Pattern settings" className="grid gap-8 p-4 pt-0">
        <Section title="Grid">
          <div className="grid gap-4">
            <RangeInput
              id="gridSize"
              label="Grid Size"
              min={10}
              max={100}
              value={config.gridSize}
              onChange={onGridSizeChange}
            />

            <RangeInput
              id="lineThickness"
              label="Line Thickness"
              min={1}
              max={5}
              value={config.lineThickness}
              onChange={onLineThicknessChange}
            />
          </div>
        </Section>

        <Section
          title="Stroke colours"
          action={
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Randomise colours"
                    onClick={onRandomiseColours}
                    className="h-8 w-8"
                    title="Randomise colours"
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">Randomise colours</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ColourInput
              id="firstColour"
              label="First colour"
              value={config.firstColour}
              onChange={onFirstColourChange}
            />
            <ColourInput
              id="secondColour"
              label="Second colour"
              value={config.secondColour}
              onChange={onSecondColourChange}
            />
          </div>
        </Section>

        <Section
          title="Embed"
          action={
            <CopyButton
              text={generateEmbedCode(config, includeSeed)}
              className="h-8 px-2"
              tooltip="Copy embed code"
            />
          }
        >
          <details>
            <summary className="text-muted-foreground cursor-pointer">
              Show embed code
            </summary>
            <div className="space-y-4 p-4">
              <p>
                Add the code below to use this pattern as a background on any
                HTML page. Change <code>document.body</code> to target any
                element.
              </p>
              <p>
                Include the seed to reproduce this exact pattern. If disabled, a
                new random pattern will be generated for each user, and saved in
                local storage.
              </p>

              <header
                aria-labelledby="embed"
                className="flex items-center gap-2 border-b border-neutral-200 pb-1 dark:border-neutral-800"
              >
                <h4 id="embed" className="mr-auto">
                  Embed Code
                </h4>
                <Switch
                  id="include-seed"
                  checked={includeSeed}
                  onCheckedChange={setIncludeSeed}
                />
                <label htmlFor="include-seed">Include seed</label>
              </header>

              <EmbedCode config={config} includeSeed={includeSeed} />
            </div>
          </details>
        </Section>

        <Separator />

        <section aria-label="Actions">
          <div className="grid grid-cols-2 gap-4">
            <Button className="w-full truncate" onClick={onRegenerate}>
              Regenerate
            </Button>
            <Button
              className="w-full truncate"
              onClick={onReset}
              variant="outline"
            >
              Reset
            </Button>
          </div>
        </section>
      </main>

      <SheetFooter className="grid gap-4">
        <Separator />

        <section
          aria-labelledby="appearance-heading"
          className="grid grid-cols-1 items-center sm:grid-cols-2"
        >
          <h3 id="appearance-heading" className="font-medium">
            Appearance
          </h3>
          <ThemeSelector className="w-full" />
        </section>

        <Separator />

        <section
          aria-labelledby="about-heading"
          className="grid grid-cols-2 items-center"
        >
          <h3 id="about-heading" className="sr-only">
            About
          </h3>
          <p className="text-muted-foreground">
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
            className="justify-self-end"
            aria-label="Source on GitHub"
            title="Source on GitHub"
          >
            <svg
              role="img"
              viewBox="0 0 24 24"
              width={24}
              height={24}
              fill="currentColor"
            >
              <path d={siGithub.path} />
            </svg>
          </a>
        </section>
      </SheetFooter>
    </SheetContent>
  );
}
