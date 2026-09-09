import CodeBlock from "./CodeBlock";
import { Badge } from "@astrohacker/ui/badge";
import type { ApiExport } from "../../src/data/api";

interface Props {
  entry: ApiExport;
}

export default function ApiExport({ entry }: Props) {
  // Functions: one line per overload. Classes/interfaces: one line per member.
  const code = entry.signatures.join("\n");

  return (
    <div id={entry.name} className="scroll-mt-24">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-mono text-base font-semibold break-all">
          {entry.name}
        </h3>
        <Badge variant="outline">{entry.kind}</Badge>
      </div>
      {entry.doc && (
        <p className="mt-2 text-sm text-muted-foreground">{entry.doc}</p>
      )}
      <div className="mt-2">
        <CodeBlock code={code} lang="ts" />
      </div>
    </div>
  );
}
