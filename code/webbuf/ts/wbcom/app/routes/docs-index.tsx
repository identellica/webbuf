import { Link, href } from "react-router";
import { Card, CardHeader, CardTitle, CardContent } from "@astrohacker/ui/card";
import { glassCard } from "@astrohacker/ui/surfaces";

import DocsLayout from "../components/DocsLayout";
import CodeBlock from "../components/CodeBlock";
import {
  PACKAGES,
  CATEGORIES,
  packagesByCategory,
  summaryFor,
} from "../../src/data/packages";
import { HighlightedCode } from "../components/CodeBlock";
import { highlight } from "../lib/highlight.server";
import type { Route } from "./+types/docs-index";
export const meta: Route.MetaFunction = () => [
  { title: "Docs · WebBuf" },
  {
    name: "description",
    content:
      "Documentation for the WebBuf family of buffer and cryptography packages.",
  },
];
export const loader = () =>
  highlight([{ code: "npm install webbuf", lang: "bash" }]);
export default function DocsIndex({ loaderData }: Route.ComponentProps) {
  return (
    <HighlightedCode value={loaderData}>
      <DocsLayout>
        <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          Documentation
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-foreground-dark">
          WebBuf is a family of {PACKAGES.length} npm packages providing a
          common buffer format and high-performance cryptography, written in
          Rust and compiled to WebAssembly. The WASM is inlined as base64, so
          every package loads synchronously with no async imports or top-level
          await. Each package page below documents its full public API,
          generated directly from the published type signatures.
        </p>

        <h2 className="mt-10 font-heading text-2xl font-bold tracking-tight">
          Quick start
        </h2>
        <p className="mt-2 text-muted-foreground">
          Install the umbrella package to get the core utilities:
        </p>
        <div className="mt-3">
          <CodeBlock code="npm install webbuf" lang="bash" />
        </div>

        {CATEGORIES.map((category) => (
          <section key={category} className="mt-14">
            <h2 className="font-heading text-2xl font-bold tracking-tight">
              {category}
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {packagesByCategory(category).map((pkg) => (
                <Link
                  key={pkg.slug}
                  to={href("/docs/:slug", { slug: pkg.slug })}
                  className="group block min-w-0 rounded-lg"
                >
                  <Card
                    className={`${glassCard} h-full gap-2 p-4 shadow-none transition-colors group-hover:border-primary`}
                  >
                    <CardHeader className="px-0">
                      <CardTitle>
                        <p className="font-mono text-sm break-all">{pkg.npm}</p>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0">
                      <p className="text-sm text-muted-foreground">
                        {summaryFor(pkg)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </DocsLayout>
    </HighlightedCode>
  );
}
