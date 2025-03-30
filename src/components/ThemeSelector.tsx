import { SelectValue } from "@radix-ui/react-select";
import { Computer, Moon, Sun } from "lucide-react";
import { cloneElement, ReactElement, SVGProps } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useTheme } from "@/hooks/useTheme";
import { type ThemeMode } from "@/lib/config";

type IconProps = SVGProps<SVGSVGElement>;

const themeOptions: Readonly<{
  [key in ThemeMode]: {
    icon: ReactElement<IconProps>;
    label: string;
  };
}> = {
  light: { icon: <Sun />, label: "Light" },
  dark: { icon: <Moon />, label: "Dark" },
  auto: { icon: <Computer />, label: "Auto (system)" },
} as const;

interface ThemeSelectorProps {
  className?: string;
}

export function ThemeSelector({ className }: ThemeSelectorProps) {
  const [themeMode, setThemeMode] = useTheme();

  function handleThemeChange(value: string) {
    if (value === "light" || value === "dark" || value === "auto") {
      setThemeMode(value);
    }
  }

  return (
    <Select value={themeMode} onValueChange={handleThemeChange}>
      <SelectTrigger
        aria-label={`Change Theme. Current theme: ${themeOptions[themeMode].label}`}
        className={className}
      >
        <SelectValue placeholder="Select theme" />
      </SelectTrigger>
      <SelectContent>
        {
          /* Iterate over the theme options and create a SelectItem for each */
          Object.entries(themeOptions).map(([key, option]) => {
            return (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  {cloneElement(option.icon, {
                    className: "h-4 w-4",
                    "aria-hidden": "true",
                  })}
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            );
          })
        }
      </SelectContent>
    </Select>
  );
}
