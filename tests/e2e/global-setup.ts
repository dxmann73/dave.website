import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// vitest globalSetup for the e2e suite: produce a real `dist/` once, before the
// render tests crawl it. Set E2E_SKIP_BUILD=1 to reuse an existing build (fast
// local iteration on the assertions themselves).
export default function setup() {
  const distDir = fileURLToPath(new URL("../../dist", import.meta.url));
  if (process.env.E2E_SKIP_BUILD === "1" && existsSync(distDir)) {
    return;
  }
  execSync("pnpm build", {
    stdio: "inherit",
    cwd: fileURLToPath(new URL("../..", import.meta.url)),
  });
}
