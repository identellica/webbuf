import type { Config } from "@react-router/dev/config";
import { PACKAGES } from "./src/data/packages";

export default {
  ssr: false,
  prerender: [
    "/",
    "/docs/",
    ...PACKAGES.map(({ slug }) => `/docs/${slug}/`),
    "/404",
  ],
} satisfies Config;
