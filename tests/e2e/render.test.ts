import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ui } from "../../src/i18n/ui";

// Slow suite: globalSetup (global-setup.ts) runs `pnpm build`, then these tests
// crawl the emitted `dist/` with fs + regex only (zero new deps). Four checks,
// per the i18n plan:
//   1. EN/DE route parity — every `/` route has a `/de` twin and vice versa
//   2. non-empty main content — each page renders real text, not a blank shell
//   3. no leaked tokens — raw UI keys / object stringification never ship
//   4. internal link integrity — every internal href resolves to a dist file

const distDir = fileURLToPath(new URL("../../dist", import.meta.url));

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const htmlFiles = walk(distDir).filter((f) => f.endsWith(".html"));

// dist/about/index.html -> "/about"; dist/index.html -> "/"; dist/de -> "/de".
function toRoute(file: string): string {
  let rel = relative(distDir, file).split(sep).join("/");
  rel = rel.replace(/index\.html$/, "").replace(/\.html$/, "");
  rel = "/" + rel;
  rel = rel.replace(/\/+$/, "");
  return rel === "" ? "/" : rel;
}

const routes = new Set(htmlFiles.map(toRoute));

const isDeRoute = (r: string) => r === "/de" || r.startsWith("/de/");
const enTwinOf = (r: string) => (r === "/de" ? "/" : r.slice(3)); // /de/x -> /x
const deTwinOf = (r: string) => (r === "/" ? "/de" : "/de" + r);

describe("dist build", () => {
  it("emits HTML pages", () => {
    expect(htmlFiles.length).toBeGreaterThan(0);
  });

  it("has an EN/DE twin for every route", () => {
    const orphans: string[] = [];
    for (const r of routes) {
      const twin = isDeRoute(r) ? enTwinOf(r) : deTwinOf(r);
      if (!routes.has(twin)) orphans.push(`${r} (missing ${twin})`);
    }
    expect(orphans, `routes without a locale twin:\n${orphans.join("\n")}`).toEqual([]);
  });

  it("renders non-empty main content on every page", () => {
    const thin: string[] = [];
    for (const file of htmlFiles) {
      const html = readFileSync(file, "utf8");
      const main =
        /<main[^>]*>([\s\S]*?)<\/main>/i.exec(html)?.[1] ??
        /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html)?.[1] ??
        "";
      const text = main
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (text.length < 30) thin.push(`${toRoute(file)} (${text.length} chars)`);
    }
    expect(thin, `pages with too little content:\n${thin.join("\n")}`).toEqual([]);
  });

  it("never leaks raw UI keys or stringified objects", () => {
    // Literal UI keys (e.g. "nav.home") would only appear if a t() lookup
    // leaked its key into the output instead of the translation.
    const uiKeys = Object.keys(ui.en);
    const leaks: string[] = [];
    for (const file of htmlFiles) {
      const html = readFileSync(file, "utf8");
      for (const key of uiKeys) {
        if (html.includes(`>${key}<`) || html.includes(`"${key}"`)) {
          leaks.push(`${toRoute(file)}: leaked key "${key}"`);
        }
      }
      if (html.includes("[object Object]")) {
        leaks.push(`${toRoute(file)}: "[object Object]"`);
      }
    }
    expect(leaks, leaks.join("\n")).toEqual([]);
  });

  it("has no broken internal links", () => {
    const broken: string[] = [];
    for (const file of htmlFiles) {
      const html = readFileSync(file, "utf8");
      for (const m of html.matchAll(/\shref="([^"]+)"/g)) {
        const href = m[1];
        // Only site-internal absolute paths; skip external, anchors, mailto…
        if (!href.startsWith("/") || href.startsWith("//")) continue;
        const clean = href.split("#")[0].split("?")[0].replace(/\/+$/, "");
        if (!resolvesInDist(clean)) {
          broken.push(`${toRoute(file)} -> ${href}`);
        }
      }
    }
    expect(broken, `broken internal links:\n${broken.join("\n")}`).toEqual([]);
  });
});

// A cleaned internal path resolves if it maps to a real dist file: a page
// (directory index or .html) or a static asset (image, rss.xml, sitemap…).
function resolvesInDist(path: string): boolean {
  if (path === "") return existsSync(join(distDir, "index.html"));
  return [
    join(distDir, path),
    join(distDir, `${path}.html`),
    join(distDir, path, "index.html"),
  ].some(existsSync);
}
