import { Link, href } from "react-router";
import { Button } from "@astrohacker/ui/button";
import type { Route } from "./+types/not-found";

export const meta: Route.MetaFunction = () => [
  { title: "Page not found — WebBuf" },
  {
    name: "description",
    content:
      "High-performance buffer manipulation and cryptography for the web.",
  },
];

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl py-24 text-center">
      <h1 className="font-heading text-4xl font-bold tracking-tight">
        Page not found
      </h1>
      <p className="mt-4 text-muted-foreground">This page does not exist.</p>
      <Button asChild className="mt-8">
        <Link to={href("/")}>Return to WebBuf</Link>
      </Button>
    </div>
  );
}
