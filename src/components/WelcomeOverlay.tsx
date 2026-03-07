import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

import { OVERLAY_STORAGE_KEY as STORAGE_KEY } from "@/lib/config";

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-neutral-300/50 bg-white/50 px-1.5 py-0.5 font-mono text-xs text-neutral-500 shadow-sm dark:border-neutral-600/50 dark:bg-neutral-800/50 dark:text-neutral-400">
      {children}
    </kbd>
  );
}

function readMinimised(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeMinimised(value: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    // ignore
  }
}

export function WelcomeOverlay() {
  const [minimised, setMinimised] = useState(readMinimised);

  function toggle() {
    setMinimised(function (prev) {
      writeMinimised(!prev);
      return !prev;
    });
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex items-end">
      <div className="pointer-events-auto m-4 max-w-sm sm:m-6">
        <div className="overflow-hidden rounded-lg border border-white/20 bg-white/40 shadow-xl backdrop-blur-lg dark:border-white/10 dark:bg-black/30">
          <button
            onClick={toggle}
            className="flex w-full cursor-pointer items-center gap-3 p-5 text-left"
            aria-expanded={!minimised}
          >
            <h1 className="font-retro flex-1 text-2xl leading-none tracking-tighter text-neutral-900 dark:text-neutral-100">
              10 PRINT
            </h1>
            {minimised ? (
              <ChevronUp className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
            )}
          </button>

          <div
            className="grid transition-[grid-template-rows] duration-300 ease-in-out"
            style={{
              gridTemplateRows: minimised ? "0fr" : "1fr",
            }}
          >
            <div className="overflow-hidden">
              <div className="space-y-2 px-5 pb-4 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                <p>
                  The "10 PRINT" algorithm is a one‑line BASIC program for the
                  Commodore 64:
                </p>
                <pre className="font-retro overflow-auto rounded border border-neutral-200/30 bg-neutral-50/30 p-2 text-xs dark:border-white/5 dark:bg-white/5">
                  10 PRINT CHR$(205.5+RND(1)); : GOTO 10
                </pre>
                <p>
                  It generates a maze‑like pattern of diagonal lines by randomly
                  choosing between "\" and "/". This app recreates it with SVG
                  and modern colours.
                </p>
              </div>

              <div className="flex items-center gap-3 border-t border-neutral-200/30 bg-neutral-50/30 px-5 py-3 text-xs tracking-wide text-neutral-400 dark:border-white/5 dark:bg-white/5 dark:text-neutral-500">
                <span className="pointer-fine:hidden">
                  Tap anywhere to regenerate
                </span>
                <span className="hidden pointer-fine:inline">
                  <Key>Click</Key> or <Key>Space</Key> to regenerate
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
