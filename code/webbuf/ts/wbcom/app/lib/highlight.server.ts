import { codeToHtml } from "shiki";

export async function highlight(blocks: { code: string; lang?: string }[]) {
  return Object.fromEntries(
    await Promise.all(
      blocks.map(async ({ code, lang = "ts" }) => [
        `${lang}\0${code}`,
        await codeToHtml(code, { lang, theme: "tokyo-night" }),
      ]),
    ),
  );
}
