# i18n Followup Plan

Date: 2026-06-21
Topic: Followup / cleanup after i18n content-fallback landing

Tracks loose ends after `2026-06-21-i18n-content-fallback-plan.md` shipped (Phases 1–3 done:
helper, Base fallback, FallbackNotice, parity test, build-time gap report, DE routes wired, 5
English DE AI stubs deleted).

## Items

### 1. Screenshot gallery via script (index.html slideshow)

Current `scripts/shoot.mjs` renders all built pages to PNGs and montages them, but produces no
navigable artifact. Extend it to emit an `index.html` gallery.

- Output dir: `plans/screenshots/` (or a configurable `--out`).
- Script responsibilities (single command, no manual server step):
  - start `astro preview`, wait for `:4321` ready, run, then stop the server (lifecycle owned by
    the script — currently started/stopped by hand).
  - screenshot every route (slug-less request form, `trailingSlash: never`).
  - keep the montages (`ai-en-vs-de`, `key-en-vs-de`, `all-pages`).
  - write `index.html`: a grid linking each PNG, grouped EN vs DE, with the fallback pages
    visually tagged (reuse `_links.json` + the gap report so fallback routes get an "EN" marker).
  - re-emit `_links.json` (page count, unique links, broken-link problems) as today.
- Add a `package.json` script alias, e.g. `pnpm shots`.
- Decide PNG fate (see item 5) before wiring output into the repo.

### 2. Trim AGENTS.md i18n section

The "i18n & content fallback" section added to `AGENTS.md` is too verbose (≈20 lines, full
sentences). Cut to terse bullets — match the telegraphic density of the rest of the file.

- Keep only: EN-always rule (one line), DE-fallback behavior (one line), helper name, revised
  `needs_translation` meaning, where the gap report prints. Drop the prose explanations and the
  safety-net paragraph (link to this plan / the original plan instead).
- Target: ~6–8 lines.
- `CLAUDE.md` is a symlink — edit `AGENTS.md` only. Run `markdownlint` (100-char), not on plans.

### 3. Listing-page "EN" badges (deferred Phase 2)

DE listing routes still show only DE entries via `getLocalizedPages`; fallback items are absent
from the lists. Switch them to the fallback helper and badge fallback items with a small "EN"
marker (via `Post` / `ProjectCard`).

- Routes: `de/posts/index.astro`, `de/posts/page/[slug].astro`, `de/categories/[category].astro`,
  `de/projects/index.astro`.
- Currently low-impact: posts/projects/pages have full DE parity, so only the AI section has gaps
  and AI has no content-listing page. Real payoff only once a non-AI DE gap exists. Keep low
  priority; revisit when the first posts/projects DE gap appears.
- After switch, re-evaluate whether `getLocalizedPages` (only-present entries) is still needed.

### 4. Fix `<Tldr>` inline-bullets content bug

EN `src/content/ai/en/overview.mdx`: the `<Tldr>` block renders its markdown list inline as
`- text - text` instead of bullets (list not parsed inside the shortcode). Cosmetic, pre-existing,
out of the original i18n scope.

- Check the `Tldr` shortcode: needs a blank line / proper MDX list handling so nested markdown
  renders. Audit other `<Tldr>` usages for the same issue.

### 5. Decide fate of untracked artifacts

`scripts/shoot.mjs` and `plans/screenshots/*.png` (~17 MB) are untracked.

- `scripts/shoot.mjs`: keep + commit (reusable tooling).
- PNGs: do NOT commit 17 MB of binaries — add `plans/screenshots/*.png` (and `/tmp` outputs) to
  `.gitignore`; regenerate on demand via item 1. Confirm with user before committing either way.

## Sequence

1. Trim AGENTS.md (item 2) — quick, isolated.
2. Extend `shoot.mjs` → index.html + server lifecycle + `pnpm shots` (item 1).
3. `.gitignore` the PNGs, commit the script (item 5).
4. Tldr fix (item 4).
5. Listing badges (item 3) — lowest priority, revisit on first non-AI DE gap.

## Verification

- `pnpm shots` produces `plans/screenshots/index.html` + montages, starts/stops preview itself,
  reports zero broken internal links.
- `pnpm check` + `pnpm build` stay green.
- `git status` clean of large binaries.
