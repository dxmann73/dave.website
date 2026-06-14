import { describe, expect, it } from "vitest";
import { languages } from "./ui";
import { registry } from "./registry";

// Generic strict-parity test for every lang-keyed source (see registry.ts).
// Replaces the old per-content tests (arbeitsweise.test.ts, motto.test.ts):
// any new translatable source added to the registry is covered automatically.
//
// What is enforced, for each source:
//   - it covers exactly the configured locales (no missing/extra locale)
//   - the key shape is identical across locales (no key present in one only)
//   - every leaf is a non-empty string (no blank/placeholder translation)
//   - source-specific invariants (e.g. unique motto ids) hold
//
// What is NOT enforced: semantic equivalence between locales. Two locales can
// hold identical (still-untranslated) text and pass — that is surfaced by the
// non-failing `needs_translation` report, not here.

const expectedLangs = Object.keys(languages).sort();

// Dotted path to every leaf in a string-leaf tree. Arrays index by position so
// differing lengths surface as differing paths.
function leafPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((v, i) => leafPaths(v, `${prefix}[${i}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) =>
      leafPaths(v, prefix ? `${prefix}.${k}` : k),
    );
  }
  return [prefix];
}

// Same traversal, but yielding (path, value) so leaves can be value-checked.
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

describe.each(registry)("i18n source: $name", (source) => {
  const langs = Object.keys(source.byLang).sort();

  it("covers exactly the configured locales", () => {
    expect(langs).toEqual(expectedLangs);
  });

  it("has an identical key shape across locales", () => {
    const shapes = langs.map((l) => leafPaths(source.byLang[l]).sort());
    const [reference, ...rest] = shapes;
    for (let i = 0; i < rest.length; i++) {
      expect(rest[i], `shape of "${langs[i + 1]}" vs "${langs[0]}"`).toEqual(
        reference,
      );
    }
  });

  it("has only non-empty string leaves", () => {
    for (const lang of langs) {
      for (const [path, value] of leaves(source.byLang[lang])) {
        const ok = typeof value === "string" && value.trim().length > 0;
        expect(ok, `${lang}:${path} = ${JSON.stringify(value)}`).toBe(true);
      }
    }
  });

  if (source.extraInvariant) {
    it("satisfies source-specific invariants", () => {
      expect(() => source.extraInvariant!(source.byLang)).not.toThrow();
    });
  }
});
