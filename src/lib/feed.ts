// Per-locale RSS feed builder. EN lives at /rss.xml, DE at /de/rss.xml.
// Both delegate here so title/description/item shape stay in one place.
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import config from "@/config/config.json";
import { parseLocalizedId, postUrl } from "@/i18n/content";
import { type Lang } from "@/i18n/ui";
import { sortByDate } from "@/lib/utils/sortFunctions";

const feedTitle: Record<Lang, string> = {
  en: `${config.profile.name} — Blog`,
  de: `${config.profile.name} — Blog`,
};

const feedDescription: Record<Lang, string> = {
  en: config.metadata.meta_description,
  de: config.metadata.meta_description,
};

export async function buildFeed(lang: Lang, context: APIContext) {
  if (!context.site) {
    throw new Error("RSS needs `site` set in astro.config.mjs.");
  }

  const posts = (await getCollection("posts"))
    .filter((post) => !post.data.draft)
    .filter((post) => parseLocalizedId(post.id).lang === lang);

  const items = sortByDate(posts).map((post) => ({
    title: post.data.title,
    description: post.data.description ?? "",
    pubDate: post.data.date,
    link: postUrl(post.id),
  }));

  return rss({
    title: feedTitle[lang],
    description: feedDescription[lang],
    site: context.site,
    items,
    customData: `<language>${lang}</language>`,
  });
}
