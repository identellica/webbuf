import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("docs", "routes/docs-index.tsx"),
  route("docs/:slug", "routes/package.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
