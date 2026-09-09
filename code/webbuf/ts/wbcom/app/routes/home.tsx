import { Link, href } from "react-router";
import { Button } from "@astrohacker/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@astrohacker/ui/card";
import { glassCard } from "@astrohacker/ui/surfaces";

import Logo from "../components/Logo";
import CodeBlock from "../components/CodeBlock";
import Icon from "../components/Icon";
import bookOpen from "lucide-static/icons/book-open.svg?raw";
import externalLink from "lucide-static/icons/external-link.svg?raw";
import cpu from "lucide-static/icons/cpu.svg?raw";
import zap from "lucide-static/icons/zap.svg?raw";
import binary from "lucide-static/icons/binary.svg?raw";

const features = [
  {
    title: "Rust-powered",
    icon: cpu,
    body: "Cryptography written or wrapped in Rust and compiled to WebAssembly for native-grade performance.",
  },
  {
    title: "Synchronous loading",
    icon: zap,
    body: "WASM is inlined as base64, so packages load like ordinary JavaScript — no async imports, no top-level await.",
  },
  {
    title: "Typed buffers",
    icon: binary,
    body: "A common WebBuf format and FixedBuf<N> give every package a shared, type-safe buffer surface.",
  },
];
import { HighlightedCode } from "../components/CodeBlock";
import { highlight } from "../lib/highlight.server";
import type { Route } from "./+types/home";
export const meta: Route.MetaFunction = () => [
  { title: "WebBuf" },
  {
    name: "description",
    content:
      "High-performance buffer manipulation and cryptography for the web.",
  },
];
export const loader = () =>
  highlight([{ code: "npm install webbuf", lang: "bash" }]);
export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <HighlightedCode value={loaderData}>
      <section className="flex flex-col items-center pt-8 text-center sm:pt-12">
        <Logo size={128} className="mb-8" />
        <h1 className="font-heading text-5xl font-bold tracking-tight sm:text-7xl">
          WebBuf
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          High-performance buffer manipulation and cryptography for the web,
          written in Rust, compiled to WebAssembly, and shipped as zero-config
          TypeScript packages.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to={href("/docs")}>
              <Icon icon={bookOpen} size={16} />
              Read the docs
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a
              href="https://github.com/astrohackerlabs/webbuf"
              rel="noopener noreferrer"
            >
              GitHub
              <Icon icon={externalLink} size={16} />
            </a>
          </Button>
        </div>
      </section>

      <section className="mx-auto mt-12 w-full max-w-2xl">
        <CodeBlock code="npm install webbuf" lang="bash" />
      </section>

      <section className="my-16 grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className={`${glassCard} gap-3 p-4 shadow-none`}
          >
            <CardHeader className="px-0">
              <Icon
                icon={feature.icon}
                size={24}
                className="mb-2 text-primary"
              />
              <CardTitle>
                <h2 className="text-xl">{feature.title}</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <p className="text-muted-foreground">{feature.body}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </HighlightedCode>
  );
}
