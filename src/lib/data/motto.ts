// Mottos shown on the front page (linked) and listed on the Arbeitsweise
// section of the projects page (with anchors + explanation).
//
// Language-keyed like arbeitsweise.ts; the component fails fast on an
// unknown lang.

export interface Motto {
  id: string;
  text: string;
  description: string;
}

export interface MottoSection {
  ueberschrift: string;
  intro: string;
  items: Motto[];
}

export const mottos: Record<string, MottoSection> = {
  de: {
    ueberschrift: "Mottos",
    intro: "Das sind die Grundprinzipien, nach denen ich lebe und arbeite.",
    items: [
      {
        id: "tackle-fearlessly",
        text: "Tackle fearlessly",
        description:
          "Keine Berührungsängste - jedes neue Thema ist eine Gelegenheit zu wachsen.",
      },
      {
        id: "execute-relentlessly",
        text: "Execute relentlessly",
        description: "Ideas are worthless. Execution is everything.",
      },
      {
        id: "no-blaming",
        text: "No blaming",
        description:
          "Ein Fehler wirkt immer total offensichtlich... wenn ihn jemand anders begeht.",
      },
      {
        id: "no-excuses",
        text: "No excuses",
        description:
          "Schuldzuweisungen helfen niemandem. Ursache verstehen, gemeinsam lösen, besser werden",
      },
      {
        id: "have-fun-working",
        text: "Have fun working",
        description:
          "Wenn das, was man täglich tut, keinen Spaß macht, sollte man entweder seine Einstellung oder sein Umfeld verändern.",
      },
    ],
  },
};
