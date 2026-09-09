import type { ReactNode } from "react";
import { glassCard } from "@astrohacker/ui/surfaces";
import DocsNav from "./DocsNav";
import Footer from "./Footer";

export function PageToc({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav
      aria-label="On this page"
      data-docs-toc
      className={`${glassCard} my-8 px-4 py-3`}
    >
      <p className="mb-2 font-mono text-[0.65rem] tracking-widest text-muted uppercase">
        On this page
      </p>
      <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="text-primary hover:underline">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div data-docs-page className="relative min-h-dvh">
      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-stretch lg:gap-8">
        <aside className="hidden shrink-0 lg:block lg:w-64 lg:self-stretch xl:w-72">
          <div
            data-docs-nav-sticky
            className="lg:sticky lg:top-16 lg:max-h-[calc(100dvh-5rem)] lg:overflow-y-auto lg:pt-4"
          >
            <DocsNav />
          </div>
        </aside>
        <div
          data-reading-column="docs-article"
          className="relative z-10 flex min-h-dvh w-full min-w-0 max-w-3xl flex-1 flex-col border-x border-border/40 bg-background/55 px-5 pt-10 pb-8 shadow-[0_0_40px_rgba(0,0,0,0.25)] backdrop-blur-md supports-[backdrop-filter]:bg-background/40 sm:px-8 sm:pt-12"
        >
          <main className="flex flex-1 flex-col">
            <article data-docs-article className="docs-prose min-w-0 pb-14">
              {children}
            </article>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
