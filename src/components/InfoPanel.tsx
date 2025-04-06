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
      <SheetDescription className="prose p-4" asChild>
        <div>
          <p>
            The "10 PRINT" algorithm is a one-line BASIC program for the
            Commodore 64:
          </p>
          <pre className="prose-code my-2 overflow-auto rounded p-2 text-xs">
            10 PRINT CHR$(205.5+RND(1)); : GOTO 10
          </pre>
          <p>
            It generates a maze-like pattern of diagonal lines by randomly
            choosing between "\" and "/" characters. This web app reimagines the
            classic algorithm with SVG for modern browsers.
          </p>
        </div>
      </SheetDescription>
    </details>
  );
}
