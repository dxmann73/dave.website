// Screenshot every built page (EN + DE) and emit a self-contained slideshow.
// Usage: node scripts/screenshot-pages.mjs [baseUrl]
// Requires a running preview server (default http://localhost:4399) and the
// dist/ build to enumerate routes.

import { readdirSync, statSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import { chromium } from "playwright";

const ROOT = new URL("..", import.meta.url).pathname;
const DIST = join(ROOT, "dist");
const OUT = join(ROOT, "slideshow");
const SHOTS = join(OUT, "shots");
const BASE = process.argv[2] ?? "http://localhost:4399";

// Collect every emitted html route from dist/, skipping 404 pages.
function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...htmlFiles(p));
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

function toRoute(file) {
  let r = "/" + relative(DIST, file).replace(/\\/g, "/");
  r = r.replace(/index\.html$/, "").replace(/\.html$/, "");
  if (r.length > 1 && r.endsWith("/")) r = r.slice(0, -1);
  return r === "" ? "/" : r;
}

const routes = htmlFiles(DIST)
  .map(toRoute)
  .filter((r) => !r.endsWith("/404") && r !== "/404")
  .sort();

// Pair routes by locale: DE routes start with /de, EN are the rest.
const slides = routes.map((route) => {
  const lang = route === "/de" || route.startsWith("/de/") ? "de" : "en";
  const key = lang === "de" ? route.replace(/^\/de/, "") || "/" : route;
  const slug = route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "_");
  return { route, lang, key, file: `${slug}.png` };
});

rmSync(SHOTS, { recursive: true, force: true });
mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// route -> set of internal hrefs found on it (for the clickability audit).
const linksByPage = new Map();

let i = 0;
for (const s of slides) {
  i++;
  const url = BASE + s.route;
  await page.goto(url, { waitUntil: "networkidle" });
  await page.screenshot({ path: join(SHOTS, s.file), fullPage: true });

  // Collect every in-site link so we can prove it actually resolves (the
  // dist-file e2e check misses trailingSlash 404s — this hits the server).
  const hrefs = await page.$$eval("a[href]", (els) =>
    els.map((el) => el.getAttribute("href")).filter(Boolean),
  );
  const internal = hrefs.filter(
    (h) => h.startsWith("/") && !h.startsWith("//"),
  );
  linksByPage.set(s.route, new Set(internal.map((h) => h.split("#")[0])));
  console.log(`[${i}/${slides.length}] ${s.lang}  ${s.route}`);
}

// Clickability audit: every distinct internal link must return 2xx with no
// redirect (a redirect means the wrong canonical form — the /de/ vs /de bug).
const targets = new Set();
for (const set of linksByPage.values()) for (const h of set) if (h) targets.add(h);

const broken = [];
for (const path of [...targets].sort()) {
  if (path === "") continue;
  const res = await page.request.get(BASE + path, { maxRedirects: 0 });
  const status = res.status();
  if (status < 200 || status >= 300) {
    broken.push({ path, status });
  }
}
await browser.close();

if (broken.length) {
  console.error(`\n✗ ${broken.length} broken/redirecting internal link(s):`);
  for (const b of broken) console.error(`  ${b.status}  ${b.path}`);
} else {
  console.log(`\n✓ all ${targets.size} distinct internal links return 2xx (no redirects)`);
}

// Sort: group by route key so EN/DE counterparts sit next to each other,
// EN before DE within each pair.
slides.sort((a, b) => (a.key === b.key ? a.lang.localeCompare(b.lang) : a.key.localeCompare(b.key)));

const data = JSON.stringify(slides, null, 2);
writeFileSync(
  join(OUT, "index.html"),
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Site slideshow — EN / DE</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 14px/1.4 system-ui, sans-serif; background: #111; color: #eee; }
  header { position: sticky; top: 0; display: flex; gap: .75rem; align-items: center;
    padding: .6rem 1rem; background: #1c1c1c; border-bottom: 1px solid #333; z-index: 10; }
  header .meta { flex: 1; min-width: 0; }
  header .route { font-weight: 600; }
  header .sub { color: #9aa; font-size: 12px; }
  .lang { padding: .1rem .5rem; border-radius: 4px; font-size: 12px; font-weight: 700; }
  .lang.en { background: #1d4ed8; }
  .lang.de { background: #b45309; }
  button { background: #2a2a2a; color: #eee; border: 1px solid #444; border-radius: 6px;
    padding: .4rem .7rem; cursor: pointer; font: inherit; }
  button:hover { background: #333; }
  #filters { display: flex; gap: .4rem; }
  #filters button.active { background: #1d4ed8; border-color: #1d4ed8; }
  .stage { padding: 1rem; display: flex; justify-content: center; }
  .stage img { max-width: 1440px; width: 100%; border: 1px solid #333; background: #fff; }
  footer { position: sticky; bottom: 0; display: flex; gap: .5rem; align-items: center;
    justify-content: center; padding: .5rem; background: #1c1c1c; border-top: 1px solid #333; }
  #count { min-width: 6rem; text-align: center; }
</style>
</head>
<body>
<header>
  <div id="filters">
    <button data-f="all" class="active">All</button>
    <button data-f="en">EN</button>
    <button data-f="de">DE</button>
  </div>
  <div class="meta">
    <div class="route"><span id="lang" class="lang"></span> <span id="route"></span></div>
    <div class="sub" id="key"></div>
  </div>
</header>
<div class="stage"><img id="shot" alt="" /></div>
<footer>
  <button id="prev">&larr; Prev</button>
  <span id="count"></span>
  <button id="next">Next &rarr;</button>
</footer>
<script>
const SLIDES = ${data};
let filter = "all";
let idx = 0;
const view = () => SLIDES.filter((s) => filter === "all" || s.lang === filter);
const img = document.getElementById("shot");
function render() {
  const v = view();
  if (idx >= v.length) idx = 0;
  if (idx < 0) idx = v.length - 1;
  const s = v[idx];
  img.src = "shots/" + s.file;
  img.alt = s.route;
  document.getElementById("route").textContent = s.route;
  document.getElementById("key").textContent = "counterpart key: " + s.key;
  const l = document.getElementById("lang");
  l.textContent = s.lang.toUpperCase();
  l.className = "lang " + s.lang;
  document.getElementById("count").textContent = (idx + 1) + " / " + v.length;
}
function go(d) { idx += d; render(); }
document.getElementById("prev").onclick = () => go(-1);
document.getElementById("next").onclick = () => go(1);
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") go(1);
  if (e.key === "ArrowLeft") go(-1);
});
for (const b of document.querySelectorAll("#filters button")) {
  b.onclick = () => {
    filter = b.dataset.f; idx = 0;
    document.querySelectorAll("#filters button").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    render();
  };
}
render();
</script>
</body>
</html>
`,
);

console.log(`\nSlideshow: ${join(OUT, "index.html")}  (${slides.length} slides)`);

if (broken.length) process.exitCode = 1;
