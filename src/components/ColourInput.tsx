import React from "react";

import { Label } from "@/components/ui/label";

interface ColorInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColourInput({ id, label, value, onChange }: ColorInputProps) {
  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <div
          className="h-6 w-6 shrink-0 rounded-md border"
          style={{ backgroundColor: value }}
          aria-label={`Current colour: ${value}`}
        />
        <input
          type="color"
          id={id}
          value={value}
          onChange={handleInputChange}
          className="h-8 w-full cursor-pointer rounded border-none bg-transparent p-0"
        />
      </div>
    </div>
  );
}
