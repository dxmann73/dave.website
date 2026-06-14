import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Slow e2e suite: builds the site once (globalSetup) then crawls dist/.
// Separate from vitest.config.ts so `pnpm test` stays fast (parity only) and
// `pnpm test:e2e` opts into the full build + render crawl. CI runs both.
const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\/components\//, replacement: `${r("./src/layouts/components")}/` },
      { find: /^@\/shortcodes\//, replacement: `${r("./src/layouts/shortcodes")}/` },
      { find: /^@\/helpers\//, replacement: `${r("./src/layouts/helpers")}/` },
      { find: /^@\/partials\//, replacement: `${r("./src/layouts/partials")}/` },
      { find: /^@\//, replacement: `${r("./src")}/` },
    ],
  },
  test: {
    include: ["tests/e2e/**/*.{test,spec}.ts"],
    globalSetup: ["./tests/e2e/global-setup.ts"],
    testTimeout: 60_000,
    hookTimeout: 600_000, // production build can take minutes
  },
});
