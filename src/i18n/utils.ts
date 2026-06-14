// URL <-> locale helpers, layered on Astro native i18n (astro.config.mjs
// `i18n` block). EN is the default locale and is unprefixed; DE lives under
// `/de`. These wrap `astro:i18n` so the routing config stays the single
// source of truth.

import { localeHref } from "./content";
import { defaultLang, languages, type Lang } from "./ui";

const isLang = (value: string): value is Lang => value in languages;

// Locale of a URL: the first path segment if it names a known locale,
// otherwise the default (unprefixed EN).
export function getLangFromUrl(url: URL): Lang {
  const [, first] = url.pathname.split("/");
  return first && isLang(first) ? first : defaultLang;
}

// Strip a leading locale segment, returning the locale-agnostic path
// (always leading-slash, no trailing slash except root).
export function stripLangFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] && isLang(segments[0])) segments.shift();
  return "/" + segments.join("/");
}

// Build the URL for a locale-agnostic path in a given locale. Defers to
// `localeHref` so default-vs-prefixed and trailingSlash:never rules match the
// rest of the site (Astro's getRelativeLocaleUrl appends a trailing slash,
// which 404s under trailingSlash: "never").
export function localizedPath(lang: Lang, path: string): string {
  return localeHref(lang, path);
}

// The counterpart of the current URL in `targetLang` — same content path,
// swapped locale. Used by the header language switcher.
export function counterpartUrl(url: URL, targetLang: Lang): string {
  return localizedPath(targetLang, stripLangFromPath(url.pathname));
}
