import { describe, expect, it } from "vitest";
import { DEFAULT_LANG } from "@/lib/utils/projectsLang";
import { mottos } from "@/lib/data/motto";

// Missing or empty motto content is treated as a bug (components throw at
// build time / render blank). These tests assert the invariants the
// front page and Arbeitsweise component rely on.

const langs = Object.keys(mottos);

const nonEmpty = (s: unknown) => typeof s === "string" && s.trim().length > 0;

describe("motto content", () => {
  it("provides content for the default language", () => {
    expect(mottos[DEFAULT_LANG]).toBeDefined();
  });

  it("defines at least one language", () => {
    expect(langs.length).toBeGreaterThan(0);
  });

  describe.each(langs)("lang %s", (lang) => {
    const section = mottos[lang];

    it("has a non-empty heading and intro", () => {
      expect(nonEmpty(section.ueberschrift)).toBe(true);
      expect(nonEmpty(section.intro)).toBe(true);
    });

    it("has at least one motto", () => {
      expect(section.items.length).toBeGreaterThan(0);
    });

    it("every motto has a non-empty id, text and description", () => {
      for (const m of section.items) {
        expect(nonEmpty(m.id), `id for "${m.text}"`).toBe(true);
        expect(nonEmpty(m.text), `text for id "${m.id}"`).toBe(true);
        expect(nonEmpty(m.description), `description for "${m.text}"`).toBe(
          true,
        );
      }
    });

    it("every motto id is unique", () => {
      const ids = section.items.map((m) => m.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
