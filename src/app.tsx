import { useCallback, useEffect } from "react";

import { BottomSheetPanel } from "@/components/BottomSheet";
import { TenPrintSvg } from "@/components/TenPrintSvg";
import { WelcomeOverlay } from "@/components/WelcomeOverlay";
import { usePersistentState } from "@/hooks/usePersistentState";
import { configSchema, DEFAULT_CONFIG, STORAGE_KEY } from "@/lib/config";
import { Color, parse as parseColour } from "@/lib/culori";
import { randomBackgroundColours } from "@/lib/randomBackgroundColours";

export function App() {
  const [config, setConfig] = usePersistentState(STORAGE_KEY, configSchema);

  const regeneratePattern = useCallback(
    function () {
      setConfig((prevConfig) => ({
        ...prevConfig,
        seed: Math.random(),
      }));
    },
    [setConfig],
  );

  useEffect(
    function () {
      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === " " && event.target === document.body) {
          event.preventDefault();
          regeneratePattern();
        }
      }

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    },
    [regeneratePattern],
  );

  const handleGridSizeChange = useCallback(
    function (value: number) {
      setConfig((prev) => ({ ...prev, gridSize: value }));
    },
    [setConfig],
  );

  const handleLineThicknessChange = useCallback(
    function (value: number) {
      setConfig((prev) => ({ ...prev, lineThickness: value }));
    },
    [setConfig],
  );

  const handleFirstColourChange = useCallback(
    function (value: Color) {
      setConfig((prev) => ({ ...prev, firstColour: value }));
    },
    [setConfig],
  );

  const handleSecondColourChange = useCallback(
    function (value: Color) {
      setConfig((prev) => ({ ...prev, secondColour: value }));
    },
    [setConfig],
  );

  const handleRandomiseColours = useCallback(
    function () {
      const bg = parseColour(getComputedStyle(document.body).backgroundColor);
      const colours = randomBackgroundColours({ background: bg });
      setConfig((prev) => ({ ...prev, ...colours }));
    },
    [setConfig],
  );

  const handleReset = useCallback(
    function () {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Error removing config from localStorage:", error);
      } finally {
        setConfig({ ...DEFAULT_CONFIG, seed: Math.random() });
      }
    },
    [setConfig],
  );

  return (
    <>
      <TenPrintSvg
        className="pointer-events-auto"
        {...config}
        onRegenerate={regeneratePattern}
      />

      <WelcomeOverlay />

      <BottomSheetPanel
        config={config}
        onGridSizeChange={handleGridSizeChange}
        onLineThicknessChange={handleLineThicknessChange}
        onFirstColourChange={handleFirstColourChange}
        onSecondColourChange={handleSecondColourChange}
        onRandomiseColours={handleRandomiseColours}
        onReset={handleReset}
      />
    </>
  );
}
