// Content for the "Arbeitsweise" section at the top of the projects page.
//
// Structured + language-keyed so the section is translatable the same way the
// projects collection is (see lib/utils/projectsLang.ts). Add a new top-level
// key (e.g. `en`) to translate; the component fails fast on an unknown lang.

export interface Eigenschaft {
  titel: string;
  text: string;
}

export interface Spalte {
  ueberschrift: string;
  eigenschaften: Eigenschaft[];
}

export interface Arbeitsweise {
  ueberschrift: string;
  intro: string;
  spalten: Spalte[];
}

// DE original. EN is a verbatim duplicate for now (still German text) so the
// strict i18n parity holds; translate the `en` copy later.
const de: Arbeitsweise = {
  ueberschrift: "Arbeitsweise",
  intro:
    "Welche Eigenschaften bringe ich konkret in die Teams und Projekte ein?",
  spalten: [
    {
      ueberschrift: "Haltung",
      eigenschaften: [
        {
          titel: "Engagiert",
          text: "Ich übernehme Verantwortung bis zur stabilen Lieferung.",
        },
        {
          titel: "Lösungsorientiert",
          text: "Ich fokussiere auf wirksame Lösungen statt auf theoretische Diskussionen.",
        },
        {
          titel: "Ganzheitlich",
          text: "Ich betrachte Technik, Prozesse und Menschen immer gemeinsam.",
        },
      ],
    },
    {
      ueberschrift: "Vorgehen",
      eigenschaften: [
        {
          titel: "Neugierig",
          text: "Ich arbeite mich schnell und aktiv in neue Domänen und Technologien ein.",
        },
        {
          titel: "Pragmatisch",
          text: "Ich bringe Qualität, Budget und Geschwindigkeit in ein sinnvolles Gleichgewicht.",
        },
        {
          titel: "Sorgfältig",
          text: "Ich arbeite strukturiert und mit hohem Anspruch an Testbarkeit und Wartbarkeit.",
        },
      ],
    },
    {
      ueberschrift: "Nachhaltigkeit",
      eigenschaften: [
        {
          titel: "Nachhaltige Entwicklung",
          text: "Sauberer Code und klare Dokumentation sind Teil jeder Lieferung.",
        },
        {
          titel: "Nachhaltige Beratung",
          text: "Gute Beratung muss dazu führen, dass man die Berater irgendwann nicht mehr benötigt.",
        },
        {
          titel: "Nachhaltige Kommunikation",
          text: "Ich kommuniziere klar, wertschätzend, und lösungsorientert.",
        },
      ],
    },
  ],
};

export const arbeitsweise: Record<string, Arbeitsweise> = {
  de,
  en: structuredClone(de),
};
