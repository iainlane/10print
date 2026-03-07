import { createHighlighterCoreSync } from "@shikijs/core";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";
import htmlLang from "@shikijs/langs/html";
import javascriptLang from "@shikijs/langs/javascript";
import catppuccinFrappeTheme from "@shikijs/themes/catppuccin-frappe";
import catppuccinLatteTheme from "@shikijs/themes/catppuccin-latte";
import type { CodeToHastOptions } from "@shikijs/types";
import { useMemo } from "react";

import { TenPrintConfig } from "@/lib/config";
import { generateEmbedCode } from "@/lib/embedCode";
import { cn } from "@/lib/utils";

import { useThemeContext } from "./ThemeProvider";

type BundledLanguage = "html" | "javascript" | "js";
type BundledTheme = "catppuccin-latte" | "catppuccin-frappe";

const bundledLanguages = {
  html: htmlLang,
  javascript: javascriptLang,
  js: javascriptLang,
};

const bundledThemes = {
  "catppuccin-latte": catppuccinLatteTheme,
  "catppuccin-frappe": catppuccinFrappeTheme,
};

const engine = createJavaScriptRegexEngine();

const highlighter = createHighlighterCoreSync({
  langs: Object.values(bundledLanguages),
  themes: Object.values(bundledThemes),
  engine,
});

function codeToHtml(
  code: string,
  options: CodeToHastOptions<BundledLanguage, BundledTheme>,
): string {
  return highlighter.codeToHtml(code, options);
}

interface EmbedCodeProps {
  config: TenPrintConfig;
  className?: string;
  includeSeed?: boolean;
}

export default function EmbedCode({
  config,
  className,
  includeSeed = false,
}: EmbedCodeProps) {
  const { effectiveTheme } = useThemeContext();
  const embedCode = useMemo(
    () => generateEmbedCode(config, includeSeed),
    [config, includeSeed],
  );

  const html = useMemo(
    () =>
      codeToHtml(embedCode, {
        lang: "html",
        theme:
          effectiveTheme === "light" ? "catppuccin-latte" : "catppuccin-frappe",
        transformers: [
          {
            pre(node) {
              node.properties["class"] = cn(
                "no-scrollbar min-w-0 py-2 overflow-x-auto transition-colors !bg-transparent",
                className,
                node.properties["class"],
              );
            },
          },
        ],
      }),
    [effectiveTheme, embedCode, className],
  );

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
