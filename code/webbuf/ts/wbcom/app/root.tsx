import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";
import type { ReactNode } from "react";
import { SpaceRain } from "@astrohacker/ui/space-rain";
import SiteHeader from "./components/SiteHeader";
import { isDocsPath } from "./lib/docs-navigation";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import Footer from "./components/Footer";
import "../src/styles/global.css";

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const docs = isDocsPath(pathname);
  return (
    <html lang="en" className="dark" data-theme="dark">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <link
          rel="icon"
          type="image/png"
          href="/favicon-light.png"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          type="image/png"
          href="/favicon-dark.png"
          media="(prefers-color-scheme: dark)"
        />
      </head>
      <body className="bg-background font-sans text-foreground antialiased">
        <div
          data-site-background
          className="relative isolate min-h-dvh bg-background text-foreground"
        >
          <SpaceRain data-testid="wbcom-space-rain" />
          <div
            data-site-scrim
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-2 bg-background/55"
          />
          <div
            data-site-content
            className="relative z-10 flex min-h-dvh flex-col"
          >
            <SiteHeader />
            {docs ? (
              children
            ) : (
              <>
                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
                  {children}
                </main>
                <Footer />
              </>
            )}
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
export default function App() {
  return <Outlet />;
}
