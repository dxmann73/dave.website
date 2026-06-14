// Central registry of every lang-keyed source in the codebase. The parity
// test (src/i18n/parity.test.ts) iterates this list, so adding a translatable
// source here automatically subjects it to the strict locale-parity checks:
// same locale set, identical key shape, non-empty leaf strings.
//
// Each source is normalized to `byLang` — an outer map `{ en: tree, de: tree }`
// — regardless of how it is stored in its own module. `extraInvariant` is an
// optional hook for source-specific rules that parity alone cannot express.

import { ui, languages } from "./ui";
import { arbeitsweise } from "@/lib/data/arbeitsweise";
import { mottos } from "@/lib/data/motto";
import config from "@/config/config.json";

export interface RegistrySource {
  name: string;
  // outer-keyed by locale; the value is an arbitrary string-leaf tree
  byLang: Record<string, unknown>;
  // optional source-specific invariant; throws on violation
  extraInvariant?: (byLang: Record<string, unknown>) => void;
}

// `config.profile` stores translatable fields inner-keyed (`bio: {en, de}`).
// Invert to outer-keyed so it matches the other sources. `name`/`image` are
// shared (not translated) and excluded.
const profile = config.profile as {
  bio: Record<string, string>;
  designation: Record<string, string>;
};
const profileByLang: Record<string, { bio: string; designation: string }> = {};
for (const lang of Object.keys(languages)) {
  const bio = profile.bio[lang];
  const designation = profile.designation[lang];
  if (bio === undefined || designation === undefined) {
    throw new Error(`config.profile is missing translations for "${lang}".`);
  }
  profileByLang[lang] = { bio, designation };
}

export const registry: RegistrySource[] = [
  { name: "ui", byLang: ui },
  { name: "arbeitsweise", byLang: arbeitsweise },
  {
    name: "motto",
    byLang: mottos,
    // Motto ids double as in-page anchors; collisions would break links.
    extraInvariant: (byLang) => {
      for (const [lang, section] of Object.entries(byLang)) {
        const items = (section as { items: { id: string }[] }).items;
        const ids = items.map((m) => m.id);
        if (new Set(ids).size !== ids.length) {
          throw new Error(`Duplicate motto id in locale "${lang}".`);
        }
      }
    },
  },
  { name: "profile", byLang: profileByLang },
];
