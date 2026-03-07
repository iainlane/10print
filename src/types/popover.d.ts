interface ShowPopoverOptions {
  source?: HTMLElement;
}

interface TogglePopoverOptions extends ShowPopoverOptions {
  force?: boolean;
}

interface HTMLElement {
  showPopover(options?: ShowPopoverOptions): void;
  togglePopover(options?: TogglePopoverOptions | boolean): boolean;
}
