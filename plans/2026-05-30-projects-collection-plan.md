# Projects Collection — Detailed CV Cards

Date: 2026-05-30
Source: `Skillprofil David Mann.2024-11-05.pdf`

## Goal

Model the CV reference projects as a content collection, like the blog: one editable file per
project, auto-rendered as cards (list) + detail pages. Bilingual-ready (DE now, EN later).

## Decisions

1. **Bilingual:** seed German (CV language) now; structure must allow EN later without migration.
   - Folder-per-language: `src/content/projects/de/*.md`, later `src/content/projects/en/*.md`.
   - glob `id` carries lang prefix (`de/data-hub`); route logic splits lang + slug.
   - Translations linked by matching slug across folders (`translationKey` overrides if needed).
   - Do NOT touch Astro global i18n config — keep blog routing untouched. Translation handling is
     self-contained in the projects section.
2. **Seed all** ~40 CV projects (detailed ones with stack buckets; short "Weitere Projekte" with a
   single `Technologie` bucket).
3. **Stack = flexible buckets** (`label` + `items[]`): Infrastruktur / Backend / Frontend / Tooling
   / Technologie. Free-text label.

## Schema (`src/content.config.ts`)

```ts
const projectsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/projects" }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    roles: z.array(z.string()).default(() => []),
    start: z.coerce.date(),
    end: z.coerce.date().optional(),         // omit = ongoing
    summary: z.string(),
    stack: z.array(z.object({
      label: z.string(),
      items: z.array(z.string()),
    })).default(() => []),
    tags: z.array(z.string()).default(() => []),
    featured: z.boolean().default(false),
    draft: z.boolean().optional(),
  }),
});
```

Required (fail-fast): `title`, `client`, `start`, `summary`. `roles` optional (short projects list
none — do not invent).

## Files

- `src/lib/utils/projectsLang.ts` — `DEFAULT_LANG`, `parseProjectId(id)` -> `{lang, slug}`,
  `projectUrl(id)` (default lang at `/projects/<slug>`, others `/projects/<lang>/<slug>`).
- `src/layouts/components/ProjectCard.astro` — client, period, roles, summary, stack chips.
- `src/layouts/partials/ProjectSingle.astro` — detail: header (client/role/period), summary,
  stack groups, MDX body, related-by-client.
- `src/pages/projects/index.astro` — grid, default-lang only, sorted by `start` desc.
- `src/pages/projects/[...slug].astro` — detail route via `getStaticPaths`.
- `src/content.config.ts` — register collection.
- Menu already has `Projects -> /projects`.

## Build order

1. Schema + util.
2. Card + index + detail route + partial.
3. Seed Surftown trio (Core Services Suite, Data Hub, IT Security & Ops) -> `pnpm check`.
4. Bulk-seed remaining projects.
5. `pnpm check` + `pnpm build`.

## Open / later

- EN translations + lang switcher on project pages.
- Optional tag taxonomy pages (reuse categories pattern).
- Optional project images via `ImageMod`.
