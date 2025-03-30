import { useThemeContext } from "@/components/ThemeProvider";
import { ThemeMode } from "@/lib/config";

export function useTheme(): [ThemeMode, (mode: ThemeMode) => void] {
  const { theme, setTheme } = useThemeContext();
  return [theme, setTheme];
}
