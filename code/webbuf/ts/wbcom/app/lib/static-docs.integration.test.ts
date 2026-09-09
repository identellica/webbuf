import { expect, test } from "bun:test";
import { resolve } from "node:path";
import { PACKAGES } from "../../src/data/packages";

const root = resolve(import.meta.dir, "../..");

test("built static preview serves every package and composed documentation", async () => {
  let output = "";
  const server = Bun.spawn(
    [process.execPath, "--no-env-file", "server.ts", "--port", "0"],
    {
      cwd: root,
      env: { PATH: process.env.PATH ?? "/usr/bin:/bin" },
      stdout: "pipe",
      stderr: "pipe",
    },
  );
  async function collect(stream: ReadableStream<Uint8Array>): Promise<void> {
    const decoder = new TextDecoder();
    const reader = stream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        output += decoder.decode(value, { stream: true });
      }
      output += decoder.decode();
    } finally {
      reader.releaseLock();
    }
  }
  const streams = [collect(server.stdout), collect(server.stderr)];
  async function wait(
    check: () => boolean,
    label: string,
    timeout = 5000,
  ): Promise<void> {
    const deadline = Date.now() + timeout;
    while (!check()) {
      if (Date.now() > deadline) throw new Error(`${label}: ${output}`);
      await Bun.sleep(10);
    }
  }
  let origin: string | undefined;
  try {
    await wait(
      () =>
        /http:\/\/127\.0\.0\.1:\d+/.test(output) || server.exitCode !== null,
      "preview ready",
    );
    origin = output.match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
    if (!origin) throw new Error(`Preview failed: ${output}`);
    for (const pkg of PACKAGES) {
      const path = `/docs/${pkg.slug}`;
      const response = await fetch(origin + path, {
        signal: AbortSignal.timeout(3000),
      });
      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain(`<title>${pkg.npm} · WebBuf</title>`);
      expect(html).toContain('id="section-usage"');
      expect(html).toContain('id="section-api"');
      const links = [...html.matchAll(/href="(\/docs\/[^"#?]+)"/g)].map(
        (match) => match[1],
      );
      expect(links.length).toBeGreaterThan(0);
      const known = new Set(PACKAGES.map((p) => `/docs/${p.slug}`));
      for (const link of links)
        expect(known.has(link.replace(/\/$/, ""))).toBe(true);
      const data = await fetch(`${origin}${path}.data`);
      const trailing = await fetch(`${origin}${path}/_.data`);
      expect(data.status).toBe(200);
      expect(trailing.status).toBe(200);
      const body = await data.text();
      expect(body.length).toBeGreaterThan(100);
      expect(await trailing.text()).toBe(body);
      if (pkg.slug === "core") {
        const text = html.replace(/<[^>]*>/g, "");
        expect(text).toContain("WebBuf 4 byte access");
        expect(text).toContain("in-progress WebBuf 4 source contract");
        expect(text).toContain("buf.bytes[i]");
        expect(text).toContain("SharedArrayBuffer");
        expect(text).toContain("selected.bytes");
        expect(text).toContain("readonly bytes");
        expect(text).toContain("subarray shares storage");
      }
    }
    for (const path of [
      "/missing-docs",
      "/docs/not-a-package",
      "/docs/not-a-package.data",
    ]) {
      const missing = await fetch(origin + path);
      expect(missing.status).toBe(404);
      expect(await missing.text()).toContain("Page not found");
    }
  } finally {
    let exited = false;
    void server.exited.then(() => {
      exited = true;
    });
    if (server.exitCode === null && server.signalCode === null)
      server.kill("SIGTERM");
    try {
      await wait(() => exited, "preview termination", 1000);
    } catch {
      server.kill("SIGKILL");
      await wait(() => exited, "preview kill", 2000);
    }
    await Promise.all(streams);
  }
  if (origin) await expect(fetch(origin)).rejects.toThrow();
}, 20000);
