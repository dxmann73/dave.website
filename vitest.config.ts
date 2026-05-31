import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Mirror the path aliases from tsconfig.json so tests import the same way the
// app does. More specific prefixes must come before the catch-all "@/".
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
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
