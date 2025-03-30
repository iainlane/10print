import { FaGithub } from "react-icons/fa";

import { ColourInput } from "@/components/ColourInput";
import { InfoPanel } from "@/components/InfoPanel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
} from "@/components/ui/sheet";
import { TenPrintConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

import { RangeInput } from "./RangeInput";
import { ThemeSelector } from "./ThemeSelector";

interface ControlPanelProps {
  className?: string;
  config: TenPrintConfig;
  // Pass specific, type-safe handlers instead of a generic setConfig
  onGridSizeChange: (value: number) => void;
  onLineThicknessChange: (value: number) => void;
  onFirstColourChange: (value: string) => void;
  onSecondColourChange: (value: string) => void;
  onRegenerate: () => void;
  onReset: () => void;
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
}: ControlPanelProps) {
  return (
    <SheetContent className={cn("overflow-y-auto", className)}>
      <SheetHeader>
        <InfoPanel />
        <SheetDescription>
          Click or tap anywhere on the background to regenerate.
        </SheetDescription>
      </SheetHeader>

      <div className="grid gap-6 p-4 pt-0">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ColourInput
            id="firstColour"
            label="First Colour"
            value={config.firstColour}
            onChange={onFirstColourChange}
          />

          <ColourInput
            id="secondColour"
            label="Second Colour"
            value={config.secondColour}
            onChange={onSecondColourChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button className="w-full block truncate" onClick={onRegenerate}>
            Regenerate
          </Button>
          <Button
            className="w-full block truncate"
            onClick={onReset}
            variant="outline"
          >
            Reset
          </Button>
        </div>
      </div>
      <SheetFooter className="grid gap-4">
        <Separator />

        <div className="grid grid-cols-1 sm:grid-cols-2">
          <Label className="text-sm text-muted-foreground">Appearance</Label>
          <ThemeSelector className="w-full" />
        </div>

        <Separator />

        <div className="grid grid-cols-2">
          <p className="text-sm text-muted-foreground">
            Made by{" "}
            <a
              href="https://orangesquash.org.uk/~laney"
              className="underline decoration-dashed decoration-accent-foreground"
            >
              <span className="font-mono">laney</span>
            </a>
          </p>
          <a
            href="https://github.com/iainlane/10print"
            className="justify-self-end"
          >
            <FaGithub />
          </a>
        </div>
      </SheetFooter>
    </SheetContent>
  );
}
