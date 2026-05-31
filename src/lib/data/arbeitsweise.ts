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

export const arbeitsweise: Record<string, Arbeitsweise> = {
  de: {
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
            text: "Technik, Prozesse und Menschen werden gemeinsam betrachtet.",
          },
        ],
      },
      {
        ueberschrift: "Vorgehen",
        eigenschaften: [
          {
            titel: "Lernwillig",
            text: "Ich arbeite mich schnell in neue Domänen und Technologien ein.",
          },
          {
            titel: "Pragmatisch",
            text: "Qualität, Budget und Geschwindigkeit bringe ich in ein belastbares Gleichgewicht.",
          },
          {
            titel: "Sorgfältig",
            text: "Ich arbeite strukturiert, testbar und mit hohem Anspruch an Wartbarkeit.",
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
            text: "Mein Ziel ist, Teams unabhängig und handlungsfähig zu machen.",
          },
          {
            titel: "Nachhaltige Kommunikation",
            text: "Ich kommuniziere klar, respektvoll und mit Blick auf das gemeinsame Ergebnis.",
          },
        ],
      },
    ],
  },
};
