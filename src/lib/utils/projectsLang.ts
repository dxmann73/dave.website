// Projects-collection language helpers. The generic implementation now lives
// in `src/i18n/content.ts` (shared by posts/pages/projects); this module
// re-exports the projects-facing surface so existing imports keep working.

import {
  DEFAULT_LANG,
  entrySlug,
  parseLocalizedId,
  projectUrl,
  type LocalizedId,
} from "@/i18n/content";

export { DEFAULT_LANG, projectUrl };
export type ProjectId = LocalizedId;

// Split a project id (`de/2023-11-data-hub`) into language + cleaned slug.
export const parseProjectId = (id: string): ProjectId => parseLocalizedId(id);

// Route param for `[...slug]` — the locale-agnostic slug (the `/de` prefix is
// supplied by the file route directory, not the param).
export const projectSlugParam = (id: string): string => entrySlug(id);
