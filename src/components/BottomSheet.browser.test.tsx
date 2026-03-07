/// <reference types="vitest/browser" />

import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import { BottomSheetPanel } from "@/components/BottomSheet";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DEFAULT_CONFIG } from "@/lib/config";

function firePointer(
  el: Element,
  type: "pointerdown" | "pointermove" | "pointerup",
  clientY: number,
) {
  el.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      clientY,
      pointerId: 1,
      pointerType: "mouse",
    }),
  );
}

function clickEl(el: Element) {
  el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

function tap(el: Element) {
  const rect = el.getBoundingClientRect();
  const y = rect.top + rect.height / 2;

  firePointer(el, "pointerdown", y);
  firePointer(el, "pointerup", y);
  clickEl(el);
}

function drag(el: Element, deltaY: number) {
  const rect = el.getBoundingClientRect();
  const startY = rect.top + rect.height / 2;

  firePointer(el, "pointerdown", startY);
  firePointer(el, "pointermove", startY + deltaY);
  firePointer(el, "pointerup", startY + deltaY);
}

async function renderPanel() {
  return render(
    <ThemeProvider>
      <BottomSheetPanel
        config={DEFAULT_CONFIG}
        onGridSizeChange={vi.fn()}
        onLineThicknessChange={vi.fn()}
        onFirstColourChange={vi.fn()}
        onSecondColourChange={vi.fn()}
        onRandomiseColours={vi.fn()}
        onReset={vi.fn()}
      />
    </ThemeProvider>,
  );
}

function getHandle(): HTMLButtonElement {
  const el = document.querySelector<HTMLButtonElement>(
    'button[aria-label="Settings panel"]',
  );
  if (!el) {
    throw new Error("Handle button not found");
  }
  return el;
}

function getPopover(): HTMLElement {
  const el = document.getElementById("settings-panel");
  if (!el) {
    throw new Error("Popover element not found");
  }
  return el;
}

describe("BottomSheetPanel", () => {
  it("toggles open and closed via tap", async () => {
    await renderPanel();

    const handle = getHandle();
    const popover = getPopover();

    expect(popover.matches(":popover-open")).toBe(false);

    tap(handle);
    expect(popover.matches(":popover-open")).toBe(true);

    tap(handle);
    expect(popover.matches(":popover-open")).toBe(false);
  });

  it("treats a short upward drag as a tap and opens", async () => {
    await renderPanel();

    const handle = getHandle();
    const popover = getPopover();

    // Open first so the handle is visible, then close
    tap(handle);
    tap(handle);
    expect(popover.matches(":popover-open")).toBe(false);

    // Short drag (4px, below TAP_THRESHOLD of 5) — the component treats
    // this as a tap, allowing the subsequent click to toggle the popover.
    drag(handle, -4);
    clickEl(handle);

    expect(popover.matches(":popover-open")).toBe(true);
    expect(popover.classList.contains("dragging")).toBe(false);
  });

  it("closes on a strong downward drag after opening", async () => {
    await renderPanel();

    const handle = getHandle();
    const popover = getPopover();

    // Open via tap
    tap(handle);
    expect(popover.matches(":popover-open")).toBe(true);

    // Drag down by 120px (above SNAP_THRESHOLD of 60) to close
    drag(handle, 120);
    expect(popover.matches(":popover-open")).toBe(false);
  });
});
