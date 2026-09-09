import { apiForPackage, type PackageApi } from "./api";

export type Category =
  | "Core buffers"
  | "Hashing & KDF"
  | "Elliptic curve"
  | "Symmetric ciphers"
  | "Authenticated encryption"
  | "Diffie-Hellman encryption"
  | "Post-quantum primitives"
  | "Hybrid post-quantum";

export interface Package {
  /** URL slug under /docs/. */
  slug: string;
  /** Published npm package name. */
  npm: string;
  category: Category;
}

export const CATEGORIES: readonly Category[] = [
  "Core buffers",
  "Hashing & KDF",
  "Elliptic curve",
  "Symmetric ciphers",
  "Authenticated encryption",
  "Diffie-Hellman encryption",
  "Post-quantum primitives",
  "Hybrid post-quantum",
];

// Curated mapping of the 29 published packages to categories and slugs.
// Summary/description and the API come from the generated catalog (see ./api).
export const PACKAGES: readonly Package[] = [
  // Core buffers
  { slug: "webbuf", npm: "webbuf", category: "Core buffers" },
  { slug: "core", npm: "@webbuf/webbuf", category: "Core buffers" },
  { slug: "fixedbuf", npm: "@webbuf/fixedbuf", category: "Core buffers" },
  { slug: "numbers", npm: "@webbuf/numbers", category: "Core buffers" },
  { slug: "rw", npm: "@webbuf/rw", category: "Core buffers" },

  // Hashing & KDF
  { slug: "blake3", npm: "@webbuf/blake3", category: "Hashing & KDF" },
  { slug: "sha256", npm: "@webbuf/sha256", category: "Hashing & KDF" },
  { slug: "ripemd160", npm: "@webbuf/ripemd160", category: "Hashing & KDF" },
  {
    slug: "pbkdf2-sha256",
    npm: "@webbuf/pbkdf2-sha256",
    category: "Hashing & KDF",
  },

  // Elliptic curve
  { slug: "secp256k1", npm: "@webbuf/secp256k1", category: "Elliptic curve" },
  { slug: "p256", npm: "@webbuf/p256", category: "Elliptic curve" },
  { slug: "x25519", npm: "@webbuf/x25519", category: "Elliptic curve" },
  { slug: "ed25519", npm: "@webbuf/ed25519", category: "Elliptic curve" },

  // Symmetric ciphers
  { slug: "aescbc", npm: "@webbuf/aescbc", category: "Symmetric ciphers" },
  { slug: "aesgcm", npm: "@webbuf/aesgcm", category: "Symmetric ciphers" },

  // Authenticated encryption
  { slug: "acb3", npm: "@webbuf/acb3", category: "Authenticated encryption" },
  { slug: "acs2", npm: "@webbuf/acs2", category: "Authenticated encryption" },

  // Diffie-Hellman encryption
  {
    slug: "acb3dh",
    npm: "@webbuf/acb3dh",
    category: "Diffie-Hellman encryption",
  },
  {
    slug: "acb3p256dh",
    npm: "@webbuf/acb3p256dh",
    category: "Diffie-Hellman encryption",
  },
  {
    slug: "acs2dh",
    npm: "@webbuf/acs2dh",
    category: "Diffie-Hellman encryption",
  },
  {
    slug: "acs2p256dh",
    npm: "@webbuf/acs2p256dh",
    category: "Diffie-Hellman encryption",
  },
  {
    slug: "aesgcm-p256dh",
    npm: "@webbuf/aesgcm-p256dh",
    category: "Diffie-Hellman encryption",
  },

  // Post-quantum primitives
  { slug: "mlkem", npm: "@webbuf/mlkem", category: "Post-quantum primitives" },
  { slug: "mldsa", npm: "@webbuf/mldsa", category: "Post-quantum primitives" },
  {
    slug: "slhdsa",
    npm: "@webbuf/slhdsa",
    category: "Post-quantum primitives",
  },

  // Hybrid post-quantum
  {
    slug: "aesgcm-mlkem",
    npm: "@webbuf/aesgcm-mlkem",
    category: "Hybrid post-quantum",
  },
  {
    slug: "aesgcm-p256dh-mlkem",
    npm: "@webbuf/aesgcm-p256dh-mlkem",
    category: "Hybrid post-quantum",
  },
  {
    slug: "aesgcm-x25519dh-mlkem",
    npm: "@webbuf/aesgcm-x25519dh-mlkem",
    category: "Hybrid post-quantum",
  },
  {
    slug: "sig-ed25519-mldsa",
    npm: "@webbuf/sig-ed25519-mldsa",
    category: "Hybrid post-quantum",
  },
];

export const packagesByCategory = (category: Category): Package[] =>
  PACKAGES.filter((pkg) => pkg.category === category);

export const installCommand = (pkg: Package): string =>
  `npm install ${pkg.npm}`;

/** The verified API + description for a package, from the generated catalog. */
export const apiFor = (pkg: Package): PackageApi | undefined =>
  apiForPackage(pkg.npm);

/** Short summary: the package's description with trailing runtime boilerplate trimmed. */
export const summaryFor = (pkg: Package): string => {
  const description = apiForPackage(pkg.npm)?.description ?? "";
  return description
    .replace(/\s+for (the )?web, node\.js, deno,? and bun\.?$/i, "")
    .trim();
};
