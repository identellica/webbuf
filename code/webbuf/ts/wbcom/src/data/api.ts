import apiJson from "./api.generated.json";

export type ApiKind =
  | "function"
  | "const"
  | "class"
  | "interface"
  | "type"
  | "enum"
  | "namespace"
  | "other";

export interface ApiExport {
  name: string;
  kind: ApiKind;
  /** One entry per overload (functions) or per member (classes/interfaces). */
  signatures: string[];
  /** JSDoc text, if any. */
  doc: string;
}

export interface PackageApi {
  npm: string;
  dir: string;
  /** One-line description from the package's package.json. */
  description: string;
  /** Maintainer's first TS/JS README example, or null if none. */
  usage: string | null;
  usageLang: "ts" | "js";
  exports: ApiExport[];
}

const api = apiJson as unknown as Record<string, PackageApi>;

export const allApi = api;

export const apiForPackage = (npm: string): PackageApi | undefined => api[npm];
