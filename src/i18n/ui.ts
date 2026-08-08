// UI string dictionary. Every key must exist in every locale — parity is
// enforced by tests (see src/i18n/parity.test.ts). Lookups fail fast: a
// missing key throws rather than rendering a blank or the raw key.
//
// Keys are flat dotted strings (`nav.home`) so the parity test can compare
// shapes directly. `as const` keeps the union of keys typed.

export const languages = {
  en: "English",
  de: "Deutsch",
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = "en";

export const ui = {
  en: {
    "nav.home": "Home",
    "nav.blog": "Blog",
    "nav.ai": "AI",
    "nav.about": "About",
    "nav.projects": "Projects",
    "nav.contact": "Contact",
    "nav.backHome": "Back to Home",
    "ai.overview": "Overview",
    "ai.engineering": "Engineering",
    "ai.outsourcing": "Outsourcing",
    "ai.communication": "Communication",
    "ai.aidlc": "aidlc",
    "ai.artifacts": "Artifacts",
    "ai.automation": "Automation",
    "ai.critics": "Critics",
    "ai.loops": "Loops",
    "projects.title": "Projects",
    "projects.description": "Reference projects and reference clients.",
    "projects.reference": "Reference projects",
    "common.since": "since",
    "switcher.label": "Language",
    "fallback.notice":
      "This page isn't available in German yet — showing the English version.",
  },
  de: {
    "nav.home": "Start",
    "nav.blog": "Blog",
    "nav.ai": "KI",
    "nav.about": "Über mich",
    "nav.projects": "Projekte",
    "nav.contact": "Kontakt",
    "nav.backHome": "Zurück zur Startseite",
    "ai.overview": "Überblick",
    "ai.engineering": "Engineering",
    "ai.outsourcing": "Outsourcing",
    "ai.communication": "Kommunikation",
    "ai.aidlc": "aidlc",
    "ai.artifacts": "Artefakte",
    "ai.automation": "Automatisierung",
    "ai.critics": "Kritiker",
    "ai.loops": "Schleifen",
    "projects.title": "Projekte",
    "projects.description": "Referenzprojekte und Referenzkunden.",
    "projects.reference": "Referenzprojekte",
    "common.since": "seit",
    "switcher.label": "Sprache",
    "fallback.notice":
      "Diese Seite ist noch nicht auf Deutsch verfügbar — angezeigt wird die englische Version.",
  },
} as const;

export type UiKey = keyof (typeof ui)[typeof defaultLang];

// Resolve a translator bound to one locale. The returned `t` throws on an
// unknown key — bad keys surface at build time, never as silent blanks.
export function useTranslations(lang: Lang) {
  const dict = ui[lang];
  return function t(key: UiKey): string {
    const value: string | undefined = dict[key];
    if (value === undefined || value === "") {
      throw new Error(`Missing UI translation: "${key}" for locale "${lang}".`);
    }
    return value;
  };
}
