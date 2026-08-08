import { describe, expect, it } from "vitest";
import {
  LOCALIZED_COLLECTIONS,
  scanContentLocales,
  translationGaps,
} from "./contentLocales";
import { languages, type Lang } from "./ui";

// EN-always content parity (guard #1, see the i18n fallback plan). The runtime
// helper throw is guard #2 at build. Here we assert on the filesystem that EN
// is a superset of every other locale per collection: no non-EN slug may exist
// without an EN counterpart (an orphan would 404 / have no source of truth).
//
// What is NOT enforced: EN slugs missing in DE. That is the expected, allowed
// case (auto-fallback serves EN), surfaced report-only by `translationGaps`.

const locales = scanContentLocales();
const nonDefault = (Object.keys(languages) as Lang[]).filter((l) => l !== "en");

describe.each(LOCALIZED_COLLECTIONS)("content parity: %s", (collection) => {
  const byLang = locales[collection];
  const enSlugs = new Set((byLang.en ?? []).map((e) => e.slug));

  it("has at least one EN entry", () => {
    expect(enSlugs.size).toBeGreaterThan(0);
  });

  for (const lang of nonDefault) {
    it(`has no ${lang} orphan (EN is a superset)`, () => {
      const orphans = (byLang[lang] ?? [])
        .map((e) => e.slug)
        .filter((slug) => !enSlugs.has(slug));
      expect(orphans, `${lang} slugs without an EN counterpart`).toEqual([]);
    });
  }
});

// Report-only: makes the translation backlog visible in test output without
// failing. Missing DE entries are expected (auto-fallback covers them).
it("reports the translation backlog (informational)", () => {
  const gaps = translationGaps(locales);
  for (const { collection, missing, started } of gaps) {
    for (const lang of nonDefault) {
      if (missing[lang].length || started[lang].length) {
        console.info(
          `[i18n] ${collection} (${lang}): missing=[${missing[lang].join(
            ", ",
          )}] started=[${started[lang].join(", ")}]`,
        );
      }
    }
  }
  expect(gaps.length).toBe(LOCALIZED_COLLECTIONS.length);
});
