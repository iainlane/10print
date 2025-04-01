import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { usePersistentState } from "@/hooks/usePersistentState";
import { THEME_STORAGE_KEY, ThemeMode, themeSchema } from "@/lib/config";

// Create Theme Context
type ThemeContextType = {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  effectiveTheme: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Set data theme attribute on document
function setDataTheme(effectiveTheme: "light" | "dark") {
  const root = document.documentElement;

  if (effectiveTheme === "dark") {
    root.setAttribute("data-theme", "dark");
  } else {
    root.removeAttribute("data-theme");
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Use persistent state to store theme preference
  const [themeMode, setThemeMode] = usePersistentState(
    THEME_STORAGE_KEY,
    themeSchema,
  );

  // Track the effective theme (actual light/dark mode applied)
  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">(
    themeMode === "dark" ? "dark" : "light",
  );

  // Handle theme changes and system preference
  useEffect(() => {
    if (themeMode !== "auto") {
      const newEffectiveTheme = themeMode === "dark" ? "dark" : "light";
      setEffectiveTheme(newEffectiveTheme);
      setDataTheme(newEffectiveTheme);
      return;
    }

    // Handle auto mode (system preference)
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const newEffectiveTheme = prefersDark ? "dark" : "light";
    setEffectiveTheme(newEffectiveTheme);
    setDataTheme(newEffectiveTheme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const newTheme = e.matches ? "dark" : "light";
      setEffectiveTheme(newTheme);
      setDataTheme(newTheme);
    };

    mediaQuery.addEventListener("change", handleChange);
    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [themeMode]);

  return (
    <ThemeContext.Provider
      value={{
        theme: themeMode,
        setTheme: setThemeMode,
        effectiveTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }

  return context;
}
