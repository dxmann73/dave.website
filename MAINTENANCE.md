# Maintenance tasks

## Repo state

- Update dependencies
- Check current skills and suggest relevant or out of date skills using skills.sh

## Content

- Check all translations are there.
- Check if translation itself is there but content seems different
  (e.g. when only updating one content and forgetting the translation in the other language)

### i18n upkeep (EN default / DE)

- Review the `needs_translation` report worklist; clear the flag on a file once it is
  actually translated (not just a duplicated copy).
- After content changes run `pnpm test` (key/data parity) and `pnpm test:e2e`
  (build + dist crawl: route parity, non-empty, no leaked keys, link integrity).
- Watch for drift: EN and DE both present but edited out of sync. Tests cannot detect
  semantic drift — this is the manual check above ("translation there but content
  seems different").

## UX

- Replace arbitrary `px`/`rem`/`em` sizing expressions with standard Tailwind positioning/sizing
- check arbitray typography-only visual-effect values against standard Tailwind
- check how stuff renders at breakpoints (use slideshow script)

## Clean code

- Remove unused functions
- inline One-line functions and constants that are only used once
- fix all warnings in the code base
