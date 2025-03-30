import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(debounceMs: number = 100): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [debouncedWidth] = useDebounce(windowSize.width, debounceMs);
  const [debouncedHeight] = useDebounce(windowSize.height, debounceMs);

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    //
    // Call handler once initially to ensure correct size
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [debounceMs]); // Only re-run effect if debounceMs changes

  return {
    width: debouncedWidth,
    height: debouncedHeight,
  };
}
