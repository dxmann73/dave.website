import type { APIContext } from "astro";
import { buildFeed } from "@/lib/feed";

// EN feed at /rss.xml. DE counterpart in src/pages/de/rss.xml.ts.
export const GET = (context: APIContext) => buildFeed("en", context);
