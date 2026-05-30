# website

Personal website and blog for [dxmann73](https://github.com/dxmann73).

A fast, static, image-optimized site built with [Astro](https://astro.build), based on the
[Hydrogen](https://github.com/statichunt/hydrogen-astro) theme.

## Idea

A minimal personal site with a blog. Content is authored in Markdown / MDX, images are optimized at
build time to `.webp`, and the output is a static site that can be hosted anywhere (Cloudflare
Workers or Netlify out of the box). Priorities: speed, accessibility, and near-zero client-side
JavaScript.

## Stack

- [Astro 6.3.1](https://astro.build) — static site, Content Layer API
- [Tailwind CSS v4](https://tailwindcss.com) — styling
- React 19 islands — interactive components, used sparingly
- MDX — content with reusable shortcodes
- sharp — build-time image optimization
- pnpm — package manager

## Getting started

Prerequisites: [Node.js](https://nodejs.org) LTS and [pnpm](https://pnpm.io).

```bash
pnpm install     # install dependencies
pnpm dev         # start dev server (http://localhost:4321)
```

Build and preview production output:

```bash
pnpm build       # output to dist/ (optimizes images)
pnpm preview     # serve the production build locally
pnpm check       # type + content validation
```

## Authoring content

- Blog posts: `src/content/posts/*.md` or `*.mdx`
- Pages: `src/content/pages/`
- Site config: `src/config/` (`config.json`, `menu.json`, `social.json`, `theme.json`)

Post frontmatter and image usage are documented in [AGENTS.md](AGENTS.md). Use the `ImageMod`
component for content images so they get optimized.

## Deployment

- **Cloudflare Workers:** `pnpm deploy:cf-workers` (config in `wrangler.jsonc`)
- **Netlify:** connect the repo; config in `netlify.toml`

This repo will be published to GitHub as a private repository named `website`.

## Setup notes

- Scaffolded from Hydrogen pinned at commit `245c433` via `degit` (clean copy, no upstream
  history).
- `pnpm-workspace.yaml` allow-lists native build scripts (`sharp`, `esbuild`, `workerd`).
- Agent guidance lives in [AGENTS.md](AGENTS.md); `CLAUDE.md` is a symlink to it.

## License

Code released under the [MIT](LICENSE) license.

Theme: [Hydrogen](https://statichunt.com/themes/astro-hydrogen) by
[Statichunt](https://statichunt.com), MIT licensed.
