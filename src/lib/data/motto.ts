// Mottos shown on the front page (linked) and listed on the Arbeitsweise
// section of the projects page (with anchors + explanation).
//
// Language-keyed like arbeitsweise.ts; the component fails fast on an
// unknown lang.

export interface Motto {
  id: string;
  text: string;
  icon: string;
  // Accessible label for the emoji icon, exposed via aria-label so screen
  // readers announce the intent rather than the raw Unicode name.
  iconLabel: string;
  description: string;
}

export interface MottoSection {
  ueberschrift: string;
  intro: string;
  items: Motto[];
}

// DE original. EN is a verbatim duplicate for now (still German text) so the
// strict i18n parity holds; translate the `en` copy later.
const de: MottoSection = {
  ueberschrift: "Mottos",
    intro: "Das sind die Grundprinzipien, nach denen ich lebe und arbeite.",
    items: [
      {
        id: "tackle-fearlessly",
        text: "Tackle fearlessly",
        icon: "🤺",
        iconLabel: "fencer",
        description:
          "Keine Berührungsängste - jedes neue Thema ist eine Gelegenheit zu wachsen.",
      },
      {
        id: "execute-relentlessly",
        text: "Execute relentlessly",
        icon: "🐝",
        iconLabel: "busy bee",
        description: "Ideas are worthless. Execution is everything.",
      },
      {
        id: "no-blaming",
        text: "No blaming",
        icon: "🤗",
        iconLabel: "embrace",
        description:
          "Ein Fehler wirkt immer total offensichtlich... wenn ihn jemand anders begeht.",
      },
      {
        id: "no-excuses",
        text: "No excuses",
        icon: "🦥",
        iconLabel: "sloth",
        description:
          "Schuldzuweisungen helfen niemandem. Ursache verstehen, gemeinsam lösen, besser werden",
      },
      {
        id: "have-fun",
        text: "Have fun",
        icon: "❤️",
        iconLabel: "heart",
        description:
          "Wenn das, was man täglich tut, keinen Spaß macht, sollte man entweder seine Einstellung oder sein Umfeld verändern.",
      },
    ],
};

export const mottos: Record<string, MottoSection> = {
  de,
  en: structuredClone(de),
};
