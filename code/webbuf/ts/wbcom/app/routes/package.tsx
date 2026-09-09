import { Link, href } from "react-router";

import DocsLayout, { PageToc } from "../components/DocsLayout";
import { adjacentPackages } from "../lib/docs-navigation";
import CodeBlock from "../components/CodeBlock";
import ApiExport from "../components/ApiExport";
import {
  PACKAGES,
  installCommand,
  summaryFor,
  apiFor,
} from "../../src/data/packages";
import type { ApiKind } from "../../src/data/api";

import { HighlightedCode } from "../components/CodeBlock";
import { highlight } from "../lib/highlight.server";
import NotFound from "./not-found";
import type { Route } from "./+types/package";
export const meta: Route.MetaFunction = ({ loaderData: data }) =>
  data
    ? [
        { title: `${data.pkg.npm} · WebBuf` },
        { name: "description", content: data.summary },
      ]
    : [
        { title: "Page not found — WebBuf" },
        {
          name: "description",
          content:
            "High-performance buffer manipulation and cryptography for the web.",
        },
      ];
export async function loader({ params }: Route.LoaderArgs) {
  const index = PACKAGES.findIndex((pkg) => pkg.slug === params.slug);
  if (index < 0) return null;
  const pkg = PACKAGES[index];
  const api = apiFor(pkg);
  const code = await highlight([
    { code: installCommand(pkg), lang: "bash" },
    ...(api?.usage ? [{ code: api.usage, lang: api.usageLang }] : []),
    ...(api?.exports ?? []).map((entry) => ({
      code: entry.signatures.join("\n"),
      lang: "ts",
    })),
  ]);
  return {
    pkg,
    api,
    summary: summaryFor(pkg),
    ...adjacentPackages(pkg.slug),
    code,
  };
}
// Invalid slugs have no static data file. Render the local not-found page
// without attempting a request to a nonexistent runtime loader.
export async function clientLoader({
  params,
  serverLoader,
}: Route.ClientLoaderArgs) {
  if (!PACKAGES.some((pkg) => pkg.slug === params.slug)) return null;
  return serverLoader();
}
export default function PackagePage({ loaderData }: Route.ComponentProps) {
  if (!loaderData) return <NotFound />;
  const { pkg, api, summary, prev, next, code } = loaderData;
  // Group exports by kind for readable sections, in a sensible order.
  const KIND_ORDER: { kind: ApiKind; label: string }[] = [
    { kind: "const", label: "Constants" },
    { kind: "function", label: "Functions" },
    { kind: "class", label: "Classes" },
    { kind: "interface", label: "Interfaces" },
    { kind: "type", label: "Type aliases" },
    { kind: "enum", label: "Enums" },
    { kind: "namespace", label: "Namespaces" },
    { kind: "other", label: "Other" },
  ];
  const groups = KIND_ORDER.map((group) => ({
    ...group,
    entries: (api?.exports ?? []).filter((e) => e.kind === group.kind),
  })).filter((group) => group.entries.length > 0);

  const exportCount = api?.exports.length ?? 0;

  return (
    <HighlightedCode value={code}>
      <DocsLayout>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {pkg.category}
        </p>
        <h1 className="mt-1 font-heading text-4xl font-bold tracking-tight break-words sm:text-5xl">
          {pkg.npm}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-foreground-dark">
          {summary}
        </p>
        <PageToc
          items={[
            { id: "section-install", label: "Install" },
            ...(api?.usage ? [{ id: "section-usage", label: "Usage" }] : []),
            { id: "section-api", label: "API reference" },
          ]}
        />

        <h2
          id="section-install"
          className="mt-10 font-heading text-2xl font-bold tracking-tight"
        >
          Install
        </h2>
        <div className="mt-3">
          <CodeBlock code={installCommand(pkg)} lang="bash" />
        </div>

        {api?.usage && (
          <>
            <h2
              id="section-usage"
              className="mt-14 font-heading text-2xl font-bold tracking-tight"
            >
              Usage
            </h2>
            <div className="mt-3">
              <CodeBlock code={api.usage} lang={api.usageLang} />
            </div>
          </>
        )}

        <h2
          id="section-api"
          className="mt-14 font-heading text-2xl font-bold tracking-tight"
        >
          API reference{" "}
          <span className="ml-1 text-base font-normal text-muted-foreground lowercase">
            ({exportCount} {exportCount === 1 ? "export" : "exports"})
          </span>
        </h2>

        {groups.map((group) => (
          <section key={group.kind} className="mt-6">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {group.label}
            </h3>
            <div className="mt-4 space-y-8">
              {group.entries.map((entry) => (
                <ApiExport key={entry.name} entry={entry} />
              ))}
            </div>
          </section>
        ))}

        <nav
          className="mt-14 space-y-5 text-base leading-relaxed"
          aria-label="Pagination"
        >
          {prev ? (
            <section data-docs-previous>
              <h2 className="mb-5 font-heading text-2xl font-bold tracking-tight">
                Previous
              </h2>
              <Link
                to={href("/docs/:slug", { slug: prev.slug })}
                className="break-words text-primary hover:underline"
              >
                {prev.npm}
              </Link>
            </section>
          ) : null}
          {next ? (
            <section data-docs-next>
              <h2 className="mb-5 font-heading text-2xl font-bold tracking-tight">
                Next
              </h2>
              <Link
                to={href("/docs/:slug", { slug: next.slug })}
                className="break-words text-primary hover:underline"
              >
                {next.npm}
              </Link>
            </section>
          ) : null}
        </nav>
      </DocsLayout>
    </HighlightedCode>
  );
}
