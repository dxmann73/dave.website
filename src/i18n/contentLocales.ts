// Filesystem scan of content collections, grouped by collection + locale.
// Single source of truth for BOTH the content-parity test and the build-time
// translation-gap report. Reads the on-disk tree directly (Node fs) so it has
// no dependency on `astro:content` and can run in plain Vitest / config hooks.

import fs from "node:fs";
import path from "node:path";
import { languages, type Lang } from "./ui";
import { stripDatePrefix } from "./content";

// Collections that follow the per-language folder layout (src/content/<col>/<lang>).
export const LOCALIZED_COLLECTIONS = ["posts", "pages", "projects"] as const;
export type Collection = (typeof LOCALIZED_COLLECTIONS)[number];

const CONTENT_ROOT = path.resolve(process.cwd(), "src/content");

export interface LocaleEntry {
  slug: string; // locale-agnostic, date-prefix stripped
  needsTranslation: boolean; // frontmatter `needs_translation: true`
}

// Per collection: { en: LocaleEntry[], de: LocaleEntry[] }.
export type ContentLocales = Record<
  Collection,
  Partial<Record<Lang, LocaleEntry[]>>
>;

const KNOWN_LANGS = Object.keys(languages) as Lang[];

function listMarkdown(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      out.push(...listMarkdown(full));
    } else if (/\.(md|mdx)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

// Read only the `needs_translation` flag from the YAML frontmatter block. A
// minimal scan avoids pulling in a frontmatter parser as a direct dependency.
function readNeedsTranslation(raw: string): boolean {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return false;
  return /^\s*needs_translation:\s*true\s*$/m.test(match[1]);
}

function scanLocale(collectionDir: string, lang: Lang): LocaleEntry[] {
  const langDir = path.join(collectionDir, lang);
  return listMarkdown(langDir).map((file) => {
    const rel = path.relative(langDir, file).replace(/\.(md|mdx)$/, "");
    const slug = stripDatePrefix(rel.split(path.sep).join("/"));
    const raw = fs.readFileSync(file, "utf8");
    return { slug, needsTranslation: readNeedsTranslation(raw) };
  });
}

export function scanContentLocales(): ContentLocales {
  const result = {} as ContentLocales;
  for (const collection of LOCALIZED_COLLECTIONS) {
    const collectionDir = path.join(CONTENT_ROOT, collection);
    const byLang: Partial<Record<Lang, LocaleEntry[]>> = {};
    for (const lang of KNOWN_LANGS) {
      byLang[lang] = scanLocale(collectionDir, lang);
    }
    result[collection] = byLang;
  }
  return result;
}

export interface TranslationGap {
  collection: Collection;
  missing: Record<Lang, string[]>; // slugs in EN but absent in this locale
  started: Record<Lang, string[]>; // present but needs_translation: true
}

// Compute, per collection, the slugs that exist in EN but are missing or still
// untranslated in each non-default locale. Report-only; never throws.
export function translationGaps(
  locales: ContentLocales = scanContentLocales(),
): TranslationGap[] {
  const nonDefault = KNOWN_LANGS.filter((l) => l !== "en");
  return LOCALIZED_COLLECTIONS.map((collection) => {
    const byLang = locales[collection];
    const enSlugs = new Set((byLang.en ?? []).map((e) => e.slug));
    const missing = {} as Record<Lang, string[]>;
    const started = {} as Record<Lang, string[]>;
    for (const lang of nonDefault) {
      const entries = byLang[lang] ?? [];
      const present = new Map(entries.map((e) => [e.slug, e]));
      missing[lang] = [...enSlugs].filter((slug) => !present.has(slug)).sort();
      started[lang] = entries
        .filter((e) => e.needsTranslation && enSlugs.has(e.slug))
        .map((e) => e.slug)
        .sort();
    }
    return { collection, missing, started };
  });
}
