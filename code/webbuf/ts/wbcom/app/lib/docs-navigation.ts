import { href } from "react-router";
import {
  CATEGORIES,
  PACKAGES,
  packagesByCategory,
} from "../../src/data/packages";

export const docsGroups = [
  { title: "Start", items: [{ label: "Overview", to: href("/docs") }] },
  ...CATEGORIES.map((title) => ({
    title,
    items: packagesByCategory(title).map((pkg) => ({
      label: pkg.npm,
      to: href("/docs/:slug", { slug: pkg.slug }),
    })),
  })),
];

export function normalizePath(path: string) {
  return path.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
}

export function isDocsPath(path: string) {
  const normalized = normalizePath(path);
  return docsGroups.some((group) =>
    group.items.some((item) => item.to === normalized),
  );
}

export function adjacentPackages(slug: string) {
  const index = PACKAGES.findIndex((pkg) => pkg.slug === slug);
  return index < 0
    ? {}
    : { prev: PACKAGES[index - 1], next: PACKAGES[index + 1] };
}
