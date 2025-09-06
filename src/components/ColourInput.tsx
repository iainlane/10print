import { Color, formatCss, formatHex, parse } from "culori";
import React, { useMemo } from "react";
import { Label } from "@/components/ui/label";

interface ColourInputProps {
  id: string;
  label: string;
  value: Color;
  onChange: (value: Color) => void;
}

export function ColourInput({ id, label, value, onChange }: ColourInputProps) {
  const hexValue = useMemo(() => formatHex(value), [value]);
  const cssValue = useMemo(() => formatCss(value), [value]);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const parsed = parse(event.target.value);
    if (parsed === undefined) return;
    onChange(parsed);
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div
        className="relative h-10 w-full overflow-hidden rounded-md border border-neutral-300/80 dark:border-neutral-700"
        style={{ background: cssValue }}
      >
        <input
          type="color"
          id={id}
          value={hexValue}
          onChange={handleInputChange}
          aria-label={`${label}: ${cssValue}`}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 focus:opacity-100 focus:outline-none"
          title={cssValue}
        />
      </div>
    </div>
  );
}
