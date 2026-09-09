import { createContext, useContext } from "react";
import { glassCodePanel } from "@astrohacker/ui/surfaces";

export const HighlightedCode = createContext<Record<string, string>>({});

export default function CodeBlock({
  code,
  lang = "ts",
}: {
  code: string;
  lang?: string;
}) {
  const html = useContext(HighlightedCode)[`${lang}\0${code}`];
  if (!html) throw new Error("Missing prerendered code highlighting");
  return (
    <div
      className={`code-block min-w-0 ${glassCodePanel}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
