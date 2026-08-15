# i18n Content Fallback Plan

Date: 2026-06-21
Topic: EN-always content collections with automatic DE → EN fallback

## Goal

- Every content slug MUST exist in English. Enforce as close to compile time as possible.
- German renders when a DE entry exists; otherwise fall back to the English body, served under
  the DE URL with DE chrome (header/nav/lang), a visible "showing English" notice, and correct
  SEO signals (hreflang + canonical).
- No on-disk duplication of EN files into the DE folder for the "missing translation" case.

## Decisions (agreed)

1. Fallback mechanism: custom helper drives routes; Astro built-in `i18n.fallback` (rewrite) kept
   only as a last-resort safety net.
2. EN-always enforcement: both a Vitest filesystem parity test AND a build-time fail-fast in the
   helper.
3. Fallback UX: visible notice + correct hreflang/canonical (not silent).

## Current state (findings)

- UI strings (`src/i18n/ui.ts`) already EN-always: parity test (`src/i18n/parity.test.ts` via
  `src/i18n/registry.ts`) enforces identical key shape + non-empty leaves across locales. No work
  needed here.
- Content collections (`posts`, `pages`, `projects`, `ai`) use per-language folders
  (`src/content/<col>/<lang>/...`). The `id` is `<lang>/<slug>`. Helpers in
  `src/lib/contentParser.astro` (`getSinglePage`, `getLocalizedPages`) and `src/i18n/content.ts`
  (`parseLocalizedId`, `entrySlug`, `localeHref`) handle locale parsing.
- No parity is enforced for collections. AI essays today: EN has 9 files, DE has 5. Missing DE:
  `artifacts`, `automation`, `critics`, `loops`.
- Routes filter strictly by locale, e.g. `src/pages/de/ai/[slug].astro` keeps only
  `lang === "de"`. So `/de/ai/loops` generates no path → 404. No fallback exists today.
- `needs_translation` flag exists in all collection schemas; only used today to mark a copied DE
  stub. With auto-fallback it becomes optional (see "needs_translation" below).
- IMPORTANT: `src/layouts/Base.astro` (lines ~37-111) already emits `hreflang` alternates for
  EVERY locale via `counterpartUrl`, with a comment asserting "a counterpart exists in every
  locale". A fallback page (EN body at `/de/...`) would violate that assumption: it would falsely
  advertise `hreflang="de"` for content that is actually English. Base must learn which locales a
  page truly has, and set canonical to the EN URL on fallback pages.
- `astro.config.mjs` i18n: `defaultLocale: "en"`, `locales: ["en","de"]`,
  `routing.prefixDefaultLocale: false`. No `fallback` configured.
- Astro built-in fallback (docs verified 2026-06-21): `i18n.fallback: { de: "en" }` +
  `routing.fallbackType: "rewrite"` builds a `/de/...` page for every `/...` page that lacks one,
  serving the EN page's FULL output (EN chrome included). It only fires for routes that are NOT
  otherwise generated. Because our helper will generate the full EN-superset of DE routes for each
  collection, the built-in fallback will not fire for collections — it only covers static pages /
  future gaps. Acceptable as a safety net; not the primary mechanism.

## Approach

Layer three pieces:

1. Helper `getLocalizedPagesWithFallback(collection, lang)` — drives every per-locale content
   route off the EN slug set. For each slug: use the target-locale entry if present, else the EN
   entry. Returns the entry plus an `isFallback` flag. Throws if any slug has no EN entry
   (build-time guard #2).
2. Vitest `content-parity.test.ts` — filesystem scan asserting EN is a superset of every other
   locale per collection, i.e. no non-EN orphan slug (guard #1). Runs in `pnpm check` / CI.
3. Astro `i18n.fallback: { de: "en" }` + `fallbackType: "rewrite"` — safety net so any route the
   helper does not cover degrades to EN content instead of 404.

UX: fallback pages render EN body inside the DE layout, show a localized notice, set
`canonical` → EN URL, and emit `hreflang` only for locales that truly have the content.

## Detailed changes

### 1. Helper — `src/lib/contentParser.astro`

Add:

```ts
export interface LocalizedEntry<C extends CollectionKey> {
  entry: CollectionEntry<C>;
  isFallback: boolean; // true = EN body served for a non-EN locale
}

// EN-superset driven. For each slug: target-locale entry if present, else EN.
// Throws (build fail-fast) if any slug lacks an EN entry.
export const getLocalizedPagesWithFallback = async <C extends CollectionKey>(
  collectionName: C,
  lang: Lang,
): Promise<LocalizedEntry<C>[]> => {
  const all = await getSinglePage(collectionName);
  const bySlug = new Map<string, Partial<Record<Lang, CollectionEntry<C>>>>();
  for (const e of all) {
    const { lang: l, slug } = parseLocalizedId(e.id);
    const rec = bySlug.get(slug) ?? {};
    rec[l] = e;
    bySlug.set(slug, rec);
  }
  const out: LocalizedEntry<C>[] = [];
  for (const [slug, rec] of bySlug) {
    const en = rec[DEFAULT_LANG];
    if (!en) {
      throw new Error(
        `Content "${collectionName}/${slug}" has no EN entry (locales: ${Object.keys(
          rec,
        ).join(", ")}). EN is required for every slug.`,
      );
    }
    const entry = rec[lang] ?? en;
    out.push({ entry, isFallback: entry === en && lang !== DEFAULT_LANG });
  }
  return out;
};
```

(Import `DEFAULT_LANG` from `@/i18n/content` and `Lang` from `@/i18n/ui`.) Keep existing
`getLocalizedPages` for cases that intentionally want only-present entries (none after migration —
review and remove if unused).

### 2. Base layout — `src/layouts/Base.astro`

- Add props: `isFallback?: boolean` and `translatedLangs?: Lang[]`.
- hreflang: if `translatedLangs` provided, emit alternates only for those locales; else keep
  current behavior (all locales) for parity-guaranteed pages (home/about/etc.).
- canonical: if `isFallback` and no explicit `canonical` prop, set canonical to the EN counterpart
  URL (`counterpartUrl(Astro.url, "en")`, absolute via `Astro.site`). Prevents indexing the DE URL
  as duplicate EN content.
- x-default stays EN.
- Render a `<FallbackNotice lang={lang} />` above the `<slot />` when `isFallback`.

### 3. Fallback notice — `src/layouts/components/FallbackNotice.astro` (new)

Small banner. Localized copy via UI strings. Props: `lang`.

### 4. UI strings — `src/i18n/ui.ts`

Add to both locales (parity test enforces presence + non-empty):

- `"fallback.notice"`:
  - en: `"This page isn't available in German yet — showing the English version."`
  - de: `"Diese Seite ist noch nicht auf Deutsch verfügbar — angezeigt wird die englische Version."`

### 5. Astro config — `astro.config.mjs`

```js
i18n: {
  defaultLocale: "en",
  locales: ["en", "de"],
  routing: { prefixDefaultLocale: false, fallbackType: "rewrite" },
  fallback: { de: "en" },
},
```

### 6. Route updates

DE content routes switch to the fallback helper and pass `isFallback` + `translatedLangs` to
Base. `translatedLangs` per entry = the locales actually present for that slug (compute in the
helper if convenient, or derive: `["en", ...(isFallback ? [] : ["de"])]`).

Single-entry routes:

- `src/pages/de/ai/[slug].astro` (primary gap)
- `src/pages/de/posts/[single].astro`
- `src/pages/de/projects/[...slug].astro`
- `src/pages/de/[regular].astro` (pages collection)

EN counterparts (`src/pages/ai/[slug].astro`, etc.) can keep using a simple EN filter, or the
helper with `lang="en"` (always `isFallback: false`). Prefer the helper for symmetry.

Listing routes (show merged list; mark fallback items with a small "EN" badge via `Post`
component / card):

- `src/pages/de/posts/index.astro`
- `src/pages/de/posts/page/[slug].astro`
- `src/pages/de/categories/[category].astro`
- `src/pages/de/projects/index.astro`

Badge UX is a smaller concern than single-page fallback; can land in Phase 2.

### 7. Parity test — `src/i18n/content-parity.test.ts` (new)

Filesystem scan (Node `fs`, no `astro:content` needed). For each collection dir
`src/content/<col>`: list `<lang>/**/*.{md,mdx}`, strip date prefix (reuse the same regex as
`stripDatePrefix`), build per-locale slug sets, assert:

- every non-EN slug is present in EN (EN superset; no orphan),
- (optional, report-only) list EN slugs missing in DE so the translation backlog is visible.

This is the "compile-time-ish" guard #1; the helper throw is guard #2 at build.

## Edge cases / notes

- Slug collisions across date prefixes: `stripDatePrefix` already normalizes; ensure helper and
  test use the SAME normalization (export the regex/helper from `content.ts` and reuse).
- Drafts: `getSinglePage` already filters `draft`. A draft EN entry means the slug effectively has
  no published EN → helper will throw if a published DE entry exists for it. That is correct
  (don't publish DE without published EN). Document this.
- Language switcher (`counterpartUrl`): on a DE fallback page, EN link points to the real EN URL
  (fine); on an EN page, DE link points to the DE fallback page (fine — lands on EN body + DE
  chrome + notice).
- Built-in rewrite fallback serves EN chrome (no notice) — only as last resort for routes the
  helper does not generate. Document that primary UX comes from the helper.

## needs_translation

With auto-fallback, the "DE missing" case no longer needs a copied stub — just omit the DE file.
Keep `needs_translation` only for the "DE file started but text still English" case. Update
AGENTS.md guidance accordingly. Do not remove the schema field (cheap, still useful).

## Build-time translation-gap report

Surface the backlog on every build (not just in tests).

- Shared scan util `src/i18n/contentLocales.ts` (new): reads `src/content/<col>/<lang>/**`,
  strips date prefix (reuse `stripDatePrefix`), returns per-collection per-locale slug sets. Used
  by BOTH the parity test and the build report (single source of truth).
- Small Astro integration in `astro.config.mjs` (inline object with `astro:build:start` or
  `astro:config:setup` hook, using the injected `logger`). For each collection, compute EN slugs
  missing in each non-default locale and log a compact table, e.g.:

  ```text
  [i18n] translation gaps (DE):
    ai:       artifacts, automation, critics, loops
    posts:    (none)
    projects: (none)
    pages:    (none)
  ```

- Report-only: never fails the build (the EN-superset orphan check is what fails — that lives in
  the helper throw + parity test). Missing DE is expected and informational.
- Also count `needs_translation: true` entries (DE file present but still English) and list them
  under a separate "started, untranslated" heading so both kinds of gap are visible.
- `dev` server: same hook fires on `astro:config:setup`, so the list also prints once on
  `pnpm dev` startup.

## Cleanup (Phase 3 — final step)

Once auto-fallback is live, a DE file whose content is identical to its EN counterpart is
redundant: the fallback would serve the same EN body anyway. Remove them.

- Scope: only `ai`/`posts`/`pages`/`projects` DE entries.
- Detection: a DE file is a deletion candidate when EITHER
  - it is byte-identical (or identical after normalizing whitespace/frontmatter order) to the EN
    counterpart body + translatable frontmatter, OR
  - it carries `needs_translation: true` (explicit "still English" marker).
- Safety: produce a report first (candidate list with reason), get confirmation, THEN delete.
  Do not delete files that differ from EN even slightly (real partial translations stay).
- After deletion: rerun `pnpm check` + `pnpm build`; the affected `/de/...` routes must still
  resolve via fallback (now EN body + DE chrome + notice), not 404.
- Per repo policy (destructive ops need explicit OK): list candidates and confirm before `git rm`.

## Verification

- `pnpm check` — types + content validation + the new parity test.
- `pnpm build` — exercises `getStaticPaths`; the helper throw fails the build on any EN gap.
- Manual: `/de/ai/loops` renders EN body, DE header/nav, notice shown, `<html lang="de">`,
  canonical → `/ai/loops`, hreflang `de` NOT advertised for the fallback page.
- Manual: `/de/ai/overview` (DE exists) renders DE, no notice, hreflang en+de both present.
- Confirm no 404s for any `/de/ai/*` matching an EN slug.

## Rollout sequence

1. Helper + `DEFAULT_LANG`/`Lang` imports in `contentParser.astro`.
2. Base.astro props (isFallback, translatedLangs, canonical-on-fallback, conditional hreflang) +
   FallbackNotice component + `fallback.notice` UI strings.
3. Wire `src/pages/de/ai/[slug].astro` to the helper (delivers the concrete AI gap). Verify.
4. `content-parity.test.ts`; run `pnpm check`.
5. `astro.config.mjs` fallback safety net.
6. Phase 2: posts/pages/projects single routes + listing badges.
7. Phase 3 (final cleanup): delete redundant DE files (see "Cleanup" below).
8. Update AGENTS.md (i18n/content section) + this repo's translation workflow notes.

## Docs to update (UX change → user-facing references)

- `CLAUDE.md`/`AGENTS.md`: document the fallback behavior, the EN-always rule, the parity test,
  and the revised `needs_translation` meaning.
