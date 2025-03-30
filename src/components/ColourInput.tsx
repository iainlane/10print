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
          className="w-6 h-6 rounded-md border shrink-0"
          style={{ backgroundColor: value }}
          aria-label={`Current colour: ${value}`}
        />
        <input
          type="color"
          id={id}
          value={value}
          onChange={handleInputChange}
          className="w-full h-8 p-0 border-none rounded cursor-pointer bg-transparent"
        />
      </div>
    </div>
  );
}
