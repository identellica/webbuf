import { useEffect, useState } from "react";
import { Link, href, useLocation } from "react-router";
import { Button } from "@astrohacker/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@astrohacker/ui/sheet";
import DocsNav from "./DocsNav";
import Logo from "./Logo";
import { isDocsPath } from "../lib/docs-navigation";

export default function SiteHeader() {
  const { pathname } = useLocation();
  const onDocs = isDocsPath(pathname);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const desktop = matchMedia("(min-width: 1024px)");
    const close = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", close);
    return () => desktop.removeEventListener("change", close);
  }, []);
  return (
    <Sheet open={open && onDocs} onOpenChange={setOpen}>
      <header className="sticky top-0 z-50 flex h-16 w-full items-center border-b border-border/40 bg-background/45 backdrop-blur-md supports-[backdrop-filter]:bg-background/30">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center gap-2 px-4 sm:px-6">
          {onDocs && (
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 lg:hidden"
                aria-label="Open menu"
                data-docs-nav-burger
              >
                <svg
                  className="size-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </SheetTrigger>
          )}
          <Link
            to={href("/")}
            className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight"
          >
            <Logo size={28} />
            WebBuf
          </Link>
          <nav
            aria-label="Site"
            className="ml-4 flex items-center text-sm text-muted"
          >
            <Link to={href("/")} className="hover:text-primary">
              Home
            </Link>
            <span aria-hidden="true" className="mx-2">
              ·
            </span>
            <Link to={href("/docs")} className="hover:text-primary">
              Docs
            </Link>
          </nav>
        </div>
      </header>
      <SheetContent
        data-wbcom-drawer
        side="left"
        aria-describedby={undefined}
        className="top-16 flex h-[calc(100dvh-4rem)] w-[18.4rem] max-w-[85vw] flex-col border-border/50 bg-background/55 p-0 backdrop-blur-md supports-[backdrop-filter]:bg-background/40"
      >
        <div className="flex items-center justify-between px-4 pt-3">
          <SheetTitle className="sr-only">Documentation</SheetTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            Close menu
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
          <DocsNav onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
