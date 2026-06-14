// Non-failing translation worklist. Lists what still needs human translation:
//   1. content entries flagged `needs_translation: true` (frontmatter)
//   2. UI / data keys whose EN and DE text are still identical (duplicated,
//      not yet translated)
//
// This never fails the build — it is a worklist, not a gate. Strict parity
// (presence + non-empty) is enforced by src/i18n/parity.test.ts; this reports
// the semantic gap parity cannot see. Run: `pnpm report:i18n`.

import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { ui, languages } from "../src/i18n/ui.ts";
import { arbeitsweise } from "../src/lib/data/arbeitsweise.ts";
import { mottos } from "../src/lib/data/motto.ts";
import config from "../src/config/config.json" with { type: "json" };

const root = fileURLToPath(new URL("..", import.meta.url));
const contentDir = join(root, "src", "content");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(md|mdx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

// 1. Flagged content entries.
const flagged: string[] = [];
for (const file of walk(contentDir)) {
  const { data } = matter(readFileSync(file, "utf8"));
  if (data.needs_translation === true) {
    flagged.push(relative(root, file));
  }
}

// 2. Identical (still-untranslated) leaf pairs across the two locales.
const langs = Object.keys(languages);
const [a, b] = langs; // en, de

function leaves(value: unknown, prefix = ""): [string, unknown][] {
  if (Array.isArray(value)) {
    return value.flatMap((v, i) => leaves(v, `${prefix}[${i}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) =>
      leaves(v, prefix ? `${prefix}.${k}` : k),
    );
  }
  return [[prefix, value]];
}

const profile = config.profile as {
  bio: Record<string, string>;
  designation: Record<string, string>;
};
const sources: Record<string, Record<string, unknown>> = {
  ui,
  arbeitsweise,
  motto: mottos,
  profile: {
    [a]: { bio: profile.bio[a], designation: profile.designation[a] },
    [b]: { bio: profile.bio[b], designation: profile.designation[b] },
  },
};

// Some leaves are locale-shared by design (motto ids double as in-page
// anchors), so identical text there is expected, not an untranslated gap.
const sharedByDesign = (path: string) => path.endsWith(".id");

const identical: string[] = [];
for (const [name, byLang] of Object.entries(sources)) {
  const left = new Map(leaves(byLang[a]));
  const right = new Map(leaves(byLang[b]));
  for (const [path, value] of left) {
    if (sharedByDesign(path)) continue;
    if (right.get(path) === value) identical.push(`${name}: ${path}`);
  }
}

// Report.
console.log("i18n translation worklist\n");
console.log(`Flagged content entries (needs_translation): ${flagged.length}`);
for (const f of flagged) console.log(`  - ${f}`);
console.log(
  `\nIdentical ${a.toUpperCase()}/${b.toUpperCase()} text (untranslated): ${identical.length}`,
);
for (const i of identical) console.log(`  - ${i}`);
console.log("\n(advisory only — does not fail the build)");
