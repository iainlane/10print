import debounce from "lodash.debounce";
import { useEffect, useState } from "react";

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(debounceMs: number = 100): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(
    function () {
      const handleResize = debounce(function () {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, debounceMs);

      window.addEventListener("resize", handleResize);
      // Call handler once initially to ensure correct size
      handleResize();

      // Cleanup function
      return function () {
        window.removeEventListener("resize", handleResize);
        handleResize.cancel();
      };
    },
    [debounceMs],
  );

  return windowSize;
}
