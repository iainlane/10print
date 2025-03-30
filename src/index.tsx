import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "@/app";
import { ThemeProvider } from "@/components/ThemeProvider";

const main = document.getElementById("main");

if (main === null) {
  throw new Error("<main> element not found");
}

const root = createRoot(main);
root.render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
