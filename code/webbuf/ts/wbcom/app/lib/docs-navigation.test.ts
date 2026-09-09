import { describe, expect, test } from "bun:test";
import { PACKAGES } from "../../src/data/packages";
import {
  adjacentPackages,
  docsGroups,
  isDocsPath,
  normalizePath,
} from "./docs-navigation";

describe("docs navigation", () => {
  test("rail order is the existing package sequence", () => {
    expect(
      docsGroups
        .slice(1)
        .flatMap((group) => group.items.map((item) => item.label)),
    ).toEqual(PACKAGES.map((pkg) => pkg.npm));
  });
  test("all adjacency, including category boundaries and endpoints", () => {
    PACKAGES.forEach((pkg, index) => {
      expect(adjacentPackages(pkg.slug)).toEqual({
        prev: PACKAGES[index - 1],
        next: PACKAGES[index + 1],
      });
    });
    expect(adjacentPackages("missing")).toEqual({});
  });
  test("URL-derived active paths normalize slash, hash and query", () => {
    expect(normalizePath("/")).toBe("/");
    for (const item of docsGroups.flatMap((group) => group.items)) {
      expect(normalizePath(item.to + "/?test=1#section-api")).toBe(item.to);
      expect(isDocsPath(item.to + "/")).toBe(true);
    }
    expect(isDocsPath("/docs/not-a-package")).toBe(false);
    expect(isDocsPath("/docs-other")).toBe(false);
    expect(isDocsPath("/")).toBe(false);
  });
});
