import { href } from "react-router";

href("/");
href("/docs");
href("/docs/:slug", { slug: "core" });
// @ts-expect-error Unknown route names must fail the generated contract.
href("/not-a-route");
// @ts-expect-error A package link must supply its slug.
href("/docs/:slug");
// @ts-expect-error Wrong parameter names must also fail.
href("/docs/:slug", { package: "core" });
