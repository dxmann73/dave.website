# AGENTS.md

Agent guide for this repository. `CLAUDE.md` is a symlink to this file.

## Project

Personal website / blog for **dxmann73** (<https://github.com/dxmann73>).

Built on the [Hydrogen](https://github.com/statichunt/hydrogen-astro) Astro theme (MIT), pinned at
commit `245c433`. Static site, image-optimized, deployable to Cloudflare Workers or Netlify.

## Stack

- **Astro 6.3.1** (stable) — static output, Content Layer API with `glob()` loaders
- **Tailwind CSS v4** via `@tailwindcss/vite` (plus `@tailwindcss/typography`, `forms`)
- **React 19** islands (`@astrojs/react`) — used sparingly for interactive bits
- **MDX** content with auto-imported shortcodes
- **sharp** image service — build-time optimization to `.webp`
- **pnpm** package manager (Node LTS, repo built on Node 24)
- Extras: `@astrojs/sitemap`, `@astrojs/rss`, `astro-llms-md`, `astro-gtm-lite`, Disqus

## Commands

```bash
pnpm install        # install deps (build scripts allow-listed in pnpm-workspace.yaml)
pnpm dev            # local dev server with live reload
pnpm build          # production build to dist/ (runs image optimization)
pnpm preview        # preview the production build
pnpm check          # astro check (type + content validation)
pnpm format         # prettier write ./src
```

Deploy: `pnpm deploy:cf-workers` (Cloudflare) — see `wrangler.jsonc`. Netlify config in
`netlify.toml`.

## Directory layout

```text
src/
  config/         site config — config.json, menu.json, social.json, theme.json
  content/        content collections (Markdown/MDX)
    posts/        blog posts
    pages/        standalone pages
    contact/      contact page content
  content.config.ts   collection schemas (zod)
  layouts/
    components/   reusable .astro components (incl. ImageMod.astro)
    partials/     header, footer, post listings
    shortcodes/   MDX shortcodes (Button, Accordion, Notice, Video, Youtube, Tabs, Tab)
    helpers/      layout helpers
  lib/utils/      utilities (slug, sorting, taxonomy, bgImageMod)
  pages/          routes (index, posts, categories, pagination)
  styles/         Tailwind layers — base, components, utilities, navigation, buttons
  types/          TypeScript types
public/images/    source images (referenced by ImageMod)
```

## Site configuration

Edit these, do not hardcode in templates:

- `src/config/config.json` — title, base_url, profile (name/bio/image), metadata, GTM, Disqus
- `src/config/menu.json` — nav menu
- `src/config/social.json` — social links + react-icons names
- `src/config/theme.json` — fonts (Google Fonts) and colors

## Content collections

Schemas in `src/content.config.ts`. Post frontmatter:

```yaml
---
title: "Post title"          # required
date: 2026-05-09T05:00:00Z   # optional, coerced to Date
description: "One-sentence summary"  # optional, for SEO + social cards
image: /images/posts/x.jpg   # optional
author: "David Mann"         # defaults to "Admin"
categories: ["Programming"]  # defaults to ["others"]
tags: ["astro"]              # defaults to ["others"]
link: https://source.example.com  # optional reference/source URL
draft: false                 # drafts excluded from production build
---
```

Use `/blog` (project slash command) to create a new post — handles slug, Unsplash image,
frontmatter, and an optional X.com draft. See `skills/blog/SKILL.md` for the full workflow.

Set `UNSPLASH_ACCESS_KEY` env var for automatic image fetch.

## Image optimization

Use the `ImageMod` component for all content images. It wraps Astro's `astro:assets` `<Image>`,
auto-imports from `public/images/`, and emits optimized `.webp`. `width`/`height` are required to
prevent layout shift.

```astro
---
import ImageMod from "@/components/ImageMod.astro";
---
<ImageMod
  src="/images/posts/post-1.jpg"
  alt="Descriptive alt text"
  width={600}
  height={400}
  format="webp"
  loading="lazy"
/>
```

Source images live in `public/images/`. The `src` path is relative to `public`. A missing image
logs an error at build time (fail-fast, do not silently skip).

## i18n & content fallback

EN is the default locale (unprefixed); DE lives under `/de`. Content collections use per-language
folders: `src/content/<col>/<lang>/<slug>` (collections: `posts`, `pages`, `projects`).

- **EN-always rule:** every content slug MUST exist in English. EN is the source of truth and a
  strict superset of every other locale. There must be no non-EN slug without an EN counterpart.
  Enforced twice: the filesystem parity test (`src/i18n/content-parity.test.ts`, runs in
  `pnpm check`/CI) and a build-time throw in `getLocalizedPagesWithFallback`.
- **DE fallback:** a DE translation is optional. When a DE file is absent, the `/de/...` route
  still renders — it serves the EN body inside the DE layout (DE header/nav, `<html lang="de">`),
  shows a localized "showing English" notice (`FallbackNotice`), sets `canonical` → the EN URL,
  and advertises `hreflang` only for locales that truly have the content. Do NOT copy an EN file
  into the DE folder just to fill a gap — omit it and let the fallback handle it.
- **Helper:** DE (and EN, for symmetry) content routes call
  `getLocalizedPagesWithFallback(collection, lang)` from `src/lib/contentParser.astro`. It returns
  `{ entry, isFallback, translatedLangs }`; pass `isFallback` + `translatedLangs` to `Base.astro`.
- **`needs_translation`:** only for the "DE file exists but text is still English" case (a started,
  untranslated stub). A missing DE file no longer needs this flag — just omit the file.
- **Translation-gap report:** `pnpm build` / `pnpm dev` print, per collection, EN slugs missing in
  DE and any `needs_translation` stubs (report-only, never fails the build). Source of truth for
  both the report and the parity test is `src/i18n/contentLocales.ts`.
- **UI strings** (`src/i18n/ui.ts`) are separately EN-always; parity enforced by
  `src/i18n/parity.test.ts` via `src/i18n/registry.ts`.
- The Astro config `i18n.fallback` (rewrite) is only a last-resort safety net for routes the helper
  does not generate; it serves EN chrome with no notice. The helper is the primary mechanism.

## Sensible defaults & conventions

- **Path alias:** import via `@/` (maps to `src/`). Components: `@/components/...`,
  shortcodes auto-imported in MDX (no manual import needed).
- **Styling:** Tailwind utility-first. Shared patterns go in `src/styles/components.css`. Avoid
  inline `style` except dynamic values.
- **React islands:** add a client directive only when interactivity is needed
  (`client:load` / `client:visible`). Default to static `.astro` — ship zero JS where possible.
- **Images:** always `ImageMod` with explicit `width`/`height` and meaningful `alt`. Prefer
  `loading="lazy"` below the fold.
- **Links/SEO:** respect `trailingSlash` from config; let `@astrojs/sitemap` handle the sitemap.
- **Content:** mark unfinished posts `draft: true`. Validate with `pnpm check` before commit.
- **Fail fast:** on bad config/content values, throw — no silent defaults or empty placeholders.
- **Accessibility:** semantic HTML, alt text, visible focus states, sufficient contrast.
- **Performance budget:** keep client JS minimal, optimize images, prefer static rendering.
- **Formatting:** run `pnpm format` (Prettier + astro + tailwind plugins) before commit.

## Recommended skills

For agents working in this repo:

- `pnpm` — package manager commands, workspace, lockfile handling (this repo uses pnpm)
- `firecrawl` — fetch Astro / theme docs and external references (preferred web access)
- `markdownlint` — lint Markdown content and docs (100-char lines; `.markdownlint.json`)
- `frontend-design` — build distinctive, production-grade UI components and pages
- `web-design-guidelines` — review UI for accessibility and UX best practices
- `visual-design-foundations` — typography, color, spacing, design tokens (`theme.json`)
- `verify` / `run` — launch the dev server and confirm changes render correctly
- `verification-before-completion` — run `pnpm check` + `pnpm build` before claiming done
- `gg-commit-push` — commit-and-push workflow (`gg`)
- `/blog` (project command) — new post scaffold: slug, Unsplash image, frontmatter, X.com draft

Not applicable here: `tailwind-design-system` / `shadcn-ui` (theme already on Tailwind v4 with its
own styles), `no-use-effect` (only if adding React data-fetching islands), TanStack skills (no
TanStack in this stack).

## Attribution

Theme: Hydrogen by [Statichunt](https://statichunt.com/themes/astro-hydrogen), MIT licensed. See
`LICENSE`.
