// Locale handling for content collections (posts, pages, projects).
//
// Every entry lives in a per-language folder, so its `id` is `<lang>/<slug>`
// (e.g. `de/post-1`, `en/2024-12-data-hub`). The default locale (EN) is served
// unprefixed (`/posts/post-1`); others are front-prefixed (`/de/posts/post-1`),
// matching the Astro i18n routing config (prefixDefaultLocale: false).

import { defaultLang, languages, type Lang } from "./ui";

export const DEFAULT_LANG: Lang = defaultLang;

const isLang = (value: string): value is Lang => value in languages;

// Project filenames are date-prefixed (`2023-11-data-hub`) for on-disk
// ordering; the date is stripped from URLs. Posts/pages have no prefix, so the
// regex simply no-ops on them.
export const stripDatePrefix = (slug: string): string =>
  slug.replace(/^\d{4}-\d{2}-/, "");

export interface LocalizedId {
  lang: Lang;
  slug: string;
}

// Split a collection id into locale + cleaned slug. Fail fast: an entry must
// sit inside a known language folder.
export const parseLocalizedId = (id: string): LocalizedId => {
  const slashIndex = id.indexOf("/");
  if (slashIndex < 1) {
    throw new Error(
      `Content "${id}" is not inside a language folder. Expected e.g. "de/${id}".`,
    );
  }
  const lang = id.slice(0, slashIndex);
  if (!isLang(lang)) {
    throw new Error(`Content "${id}" has unknown locale folder "${lang}".`);
  }
  return { lang, slug: stripDatePrefix(id.slice(slashIndex + 1)) };
};

// The locale-agnostic slug of an entry (no language, no date prefix).
export const entrySlug = (id: string): string => parseLocalizedId(id).slug;

// URL path prefix for a locale: empty for the default, `/<lang>` otherwise.
export const langPrefix = (lang: Lang): string =>
  lang === DEFAULT_LANG ? "" : `/${lang}`;

// Front-prefix a locale-agnostic path for a locale. Root ("/") collapses to
// the bare prefix so DE home is "/de" not "/de/" (trailingSlash: "never").
export const localeHref = (lang: Lang, path: string): string => {
  const href = `${langPrefix(lang)}${path}`;
  return href.length > 1 && href.endsWith("/") ? href.slice(0, -1) : href;
};

export const postUrl = (id: string): string => {
  const { lang, slug } = parseLocalizedId(id);
  return localeHref(lang, `/posts/${slug}`);
};

export const projectUrl = (id: string): string => {
  const { lang, slug } = parseLocalizedId(id);
  return localeHref(lang, `/projects/${slug}`);
};

export const categoryUrl = (lang: Lang, category: string): string =>
  localeHref(lang, `/categories/${category}`);
