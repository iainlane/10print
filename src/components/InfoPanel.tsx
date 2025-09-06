import { SheetDescription, SheetTitle } from "@/components/ui/sheet";

interface InfoPanelProps {
  className?: string;
}

export function InfoPanel({ className }: InfoPanelProps) {
  return (
    <details className={className}>
      <summary className="cursor-pointer">
        <SheetTitle className="inline">10 PRINT SVG Generator</SheetTitle>
      </summary>
      <SheetDescription asChild>
        <div className="p-4">
          <p>
            The “10 PRINT” algorithm is a one‑line BASIC program for the
            Commodore 64:
          </p>
          <pre className="my-2 overflow-auto rounded border border-neutral-200 bg-neutral-50 p-2 text-xs dark:border-neutral-800 dark:bg-neutral-900">
            10 PRINT CHR$(205.5+RND(1)); : GOTO 10
          </pre>
          <p>
            It generates a maze‑like pattern of diagonal lines by randomly
            choosing between “\” and “/”. This app recreates it with SVG and
            modern colours.
          </p>
        </div>
      </SheetDescription>
    </details>
  );
}
