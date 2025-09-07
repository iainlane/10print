import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ComponentProps } from "react";

interface CopyButtonProps
  extends Omit<ComponentProps<typeof Button>, "onClick" | "children"> {
  text: string;
  children?: React.ReactNode;
  tooltip?: string;
}

export function CopyButton({
  text,
  variant = "ghost",
  size = "sm",
  className,
  tooltip,
  ...buttonProps
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={className}
      aria-label={copied ? "Copied" : "Copy"}
      {...buttonProps}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" />
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
        </>
      )}
    </Button>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="left">{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}
