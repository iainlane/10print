import { Menu } from "lucide-react";
import { useCallback } from "react";

import { ControlPanel } from "@/components/ControlPanel";
import { TenPrintSvg } from "@/components/TenPrintSvg";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { usePersistentState } from "@/hooks/usePersistentState";
import { DEFAULT_CONFIG, STORAGE_KEY } from "@/lib/config";
import { configSchema, TenPrintConfig } from "@/lib/config";

interface PanelsProps {
  config: TenPrintConfig;
  setConfig: React.Dispatch<React.SetStateAction<TenPrintConfig>>;
}

function Panels({ config, setConfig }: PanelsProps) {
  const handleGridSizeChange = useCallback(
    function (value: number) {
      setConfig((prevConfig: TenPrintConfig) => ({
        ...prevConfig,
        gridSize: value,
      }));
    },
    [setConfig],
  );

  const handleLineThicknessChange = useCallback(
    function (value: number) {
      setConfig((prevConfig) => ({ ...prevConfig, lineThickness: value }));
    },
    [setConfig],
  );

  const handleFirstColourChange = useCallback(
    function (value: string) {
      setConfig((prevConfig) => ({ ...prevConfig, firstColour: value }));
    },
    [setConfig],
  );

  const handleSecondColourChange = useCallback(
    function (value: string) {
      setConfig((prevConfig) => ({ ...prevConfig, secondColour: value }));
    },
    [setConfig],
  );

  const regeneratePattern = useCallback(
    function () {
      setConfig((prevConfig) => ({
        ...prevConfig,
        seed: Math.random(),
      }));
    },
    [setConfig],
  );

  const resetConfig = useCallback(
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
    <ControlPanel
      className="pointer-events-auto"
      config={config}
      onGridSizeChange={handleGridSizeChange}
      onLineThicknessChange={handleLineThicknessChange}
      onFirstColourChange={handleFirstColourChange}
      onSecondColourChange={handleSecondColourChange}
      onRegenerate={regeneratePattern}
      onReset={resetConfig}
    />
  );
}

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

  return (
    <>
      <TenPrintSvg
        className="pointer-events-auto"
        {...config}
        onRegenerate={regeneratePattern}
      />

      <div className="fixed top-4 right-4 z-20">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-accent dark:bg-accent opacity-75 dark:hover:bg-accent hover:opacity-100 transition-opacity duration-300 ease-in-out"
            >
              <Menu className="h-5 w-5" aria-label="Open Controls" />
            </Button>
          </SheetTrigger>
          <Panels config={config} setConfig={setConfig} />
        </Sheet>
      </div>
    </>
  );
}
