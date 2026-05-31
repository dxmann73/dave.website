import { describe, expect, it } from "vitest";
import { DEFAULT_LANG } from "@/lib/utils/projectsLang";
import { arbeitsweise } from "@/lib/data/arbeitsweise";

// Missing or empty Arbeitsweise content is treated as a bug (the component
// throws at build time). These tests assert the invariants the component relies
// on, so a broken/incomplete translation fails CI instead of shipping blank.

const langs = Object.keys(arbeitsweise);

const nonEmpty = (s: unknown) => typeof s === "string" && s.trim().length > 0;

describe("arbeitsweise content", () => {
  it("provides content for the default language", () => {
    expect(arbeitsweise[DEFAULT_LANG]).toBeDefined();
  });

  it("defines at least one language", () => {
    expect(langs.length).toBeGreaterThan(0);
  });

  describe.each(langs)("lang %s", (lang) => {
    const content = arbeitsweise[lang];

    it("has a non-empty heading and intro", () => {
      expect(nonEmpty(content.ueberschrift)).toBe(true);
      expect(nonEmpty(content.intro)).toBe(true);
    });

    it("has at least one column", () => {
      expect(content.spalten.length).toBeGreaterThan(0);
    });

    it("every column has a heading and at least one trait", () => {
      for (const spalte of content.spalten) {
        expect(nonEmpty(spalte.ueberschrift)).toBe(true);
        expect(spalte.eigenschaften.length).toBeGreaterThan(0);
      }
    });

    it("every trait has a non-empty title and text", () => {
      for (const spalte of content.spalten) {
        for (const e of spalte.eigenschaften) {
          expect(nonEmpty(e.titel), `titel in "${spalte.ueberschrift}"`).toBe(
            true,
          );
          expect(nonEmpty(e.text), `text for "${e.titel}"`).toBe(true);
        }
      }
    });
  });
});
