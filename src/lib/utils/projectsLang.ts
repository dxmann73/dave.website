// Language handling for the projects collection.
//
// Project files live under a per-language folder, e.g. `de/data-hub.md`, so the
// content `id` is `de/data-hub`. The default language is served at
// `/projects/<slug>`; every other language at `/projects/<lang>/<slug>`.
// Translations of the same project share a slug across language folders.

export const DEFAULT_LANG = "de";

export interface ProjectId {
  lang: string;
  slug: string;
}

// Filenames are date-prefixed (`2023-11-data-hub`) for chronological ordering on
// disk, but the date is stripped from URLs.
const stripDatePrefix = (slug: string): string =>
  slug.replace(/^\d{4}-\d{2}-/, "");

// Split a collection id (`de/2023-11-data-hub`) into its language and (cleaned)
// slug parts. Fail fast: a project file must sit inside a language folder.
export const parseProjectId = (id: string): ProjectId => {
  const slashIndex = id.indexOf("/");
  if (slashIndex < 1) {
    throw new Error(
      `Project "${id}" is not inside a language folder. Expected e.g. "de/${id}".`,
    );
  }
  return {
    lang: id.slice(0, slashIndex),
    slug: stripDatePrefix(id.slice(slashIndex + 1)),
  };
};

// URL for a project entry: default lang has no prefix, others are prefixed.
export const projectUrl = (id: string): string => {
  const { lang, slug } = parseProjectId(id);
  return lang === DEFAULT_LANG
    ? `/projects/${slug}`
    : `/projects/${lang}/${slug}`;
};

// Route param (`[...slug]`) for a project entry — same logic without the
// leading `/projects/`.
export const projectSlugParam = (id: string): string => {
  const { lang, slug } = parseProjectId(id);
  return lang === DEFAULT_LANG ? slug : `${lang}/${slug}`;
};
