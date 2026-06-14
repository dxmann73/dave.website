import type { APIContext } from "astro";
import { buildFeed } from "@/lib/feed";

// DE feed at /de/rss.xml. EN counterpart in src/pages/rss.xml.ts.
export const GET = (context: APIContext) => buildFeed("de", context);
