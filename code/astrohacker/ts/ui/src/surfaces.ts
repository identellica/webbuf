/**
 * Product surfaces — shared fill recipes for site + TermSurf apps.
 * Austin Night tokens: --ah-background-highlight / --card
 * (#292e42 cool gray-blue plate at /40 for glass transparency).
 * Prefer these over per-app bg-background-highlight/… copies.
 */

/** Guest marketing + docs glass (matches webapp install/blog cards). */
export const glassCard =
  "rounded-lg border border-border bg-background-highlight/40 backdrop-blur-md";

/** Glass panel for code / diagram blocks. */
export const glassCodePanel = `${glassCard} overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground-dark sm:text-sm`;

/**
 * SpaceRain app shell / primary panel (kpnode, ahkey, ahcalc).
 * Same highlight token as glassCard; slightly heavier blur/shadow.
 */
export const shellPanel =
  "rounded-xl border border-border bg-background-highlight/40 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-[12px]";
