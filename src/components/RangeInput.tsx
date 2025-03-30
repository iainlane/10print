import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface RangeInputProps {
  id: string;
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}

export function RangeInput({
  id,
  label,
  min,
  max,
  value,
  onChange,
  step = 1,
}: RangeInputProps) {
  const handleValueChange = (values: number[]) => {
    // Slider potentially returns empty array, guard against it
    if (values.length > 0 && values[0] !== undefined) {
      onChange(values[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-sm text-muted-foreground">{value}</span>
      </div>
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={handleValueChange}
      />
    </div>
  );
}
