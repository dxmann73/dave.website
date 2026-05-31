---
name: blog
description: |
  Create a new blog post for the dxmann73 website. Handles slug generation, Unsplash image
  fetch, full frontmatter, starter content, and an optional X.com cross-post draft.
  Invoke with /blog or /project:blog.
allowed-tools:
  - Bash(curl *)
  - Bash(mkdir *)
  - Bash(jq *)
  - Write
  - Read
  - Edit
  - Bash(pnpm check)
  - Bash(firecrawl *)
---

# /blog — New Blog Post Workflow

Creates a new post in `src/content/posts/` with an Unsplash image, complete frontmatter, a
starter body, and an optional X.com cross-post draft.

## Inputs

Accept as arguments or ask the user:

| Field          | Required | Notes                                          |
| -------------- | -------- | ---------------------------------------------- |
| `title`        | yes      | Post title, quoted string                      |
| `description`  | no       | One-sentence SEO summary; generate if absent   |
| `categories`   | no       | Comma-separated; default `others`              |
| `tags`         | no       | Comma-separated; default `others`              |
| `link`         | no       | Reference/source URL                           |
| `image_query`  | no       | Unsplash search term; derive from title if absent |

## Step 1 — Slug and filename

Derive slug from title: lowercase, spaces → hyphens, strip non-alphanumeric except hyphens.

```
title  : "How Terraform Saved My Sanity"
slug   : how-terraform-saved-my-sanity
file   : src/content/posts/YYYY-MM-DD-how-terraform-saved-my-sanity.md
image  : public/images/posts/how-terraform-saved-my-sanity.jpg
```

Use today's date in `YYYY-MM-DD` format.

## Step 2 — Unsplash image

Check for `UNSPLASH_ACCESS_KEY` env var.

**If key present:**

```bash
RESULT=$(curl -s "https://api.unsplash.com/search/photos?query={image_query}&per_page=5&orientation=landscape&client_id=$UNSPLASH_ACCESS_KEY")
URL=$(echo "$RESULT"   | jq -r '.results[0].urls.regular')
CREDIT=$(echo "$RESULT" | jq -r '.results[0].user.name')
CREDIT_URL=$(echo "$RESULT" | jq -r '.results[0].links.html')

curl -L "$URL" -o "public/images/posts/{slug}.jpg"
```

Add photo credit comment at bottom of post body:

```markdown
---

Photo by [{CREDIT}]({CREDIT_URL}) on [Unsplash](https://unsplash.com)
```

**If key absent:**

- Leave `image:` field blank in frontmatter.
- Print a warning with direct search URL:
  `https://unsplash.com/s/photos/{image_query}` (spaces → hyphens)
- Instruct user to download an image to `public/images/posts/{slug}.jpg` and update the
  `image:` frontmatter field.

## Step 3 — Create the post file

Write `src/content/posts/{date}-{slug}.md`:

```markdown
---
title: "{title}"
date: {YYYY-MM-DDT12:00:00Z}
description: "{description}"
image: /images/posts/{slug}.jpg
author: "David Mann"
categories:
  - {category}
tags:
  - {tag}
link: {link}
draft: true
---

{Write a 2–3 sentence opener based on title and description. Be specific and direct — no filler.}

## {First logical section heading derived from title/topic}

{One paragraph of substantive content. Leave a clear signal where the user should continue writing.}

<!-- Continue writing here -->

{if link provided, append:}
---

Source: [{link hostname}]({link})

{if Unsplash image fetched, append:}
Photo by [{CREDIT}]({CREDIT_URL}) on [Unsplash](https://unsplash.com)
```

Omit the `link:` frontmatter line entirely if no link provided (keep YAML clean).

## Step 4 — Optional X.com draft

Ask: "Generate an X.com post draft? (y/n)"

If yes, compose a tweet:
- Max 280 characters including the URL
- Lead with the hook — the most concrete/surprising insight from title + description
- Placeholder for post URL: `https://david-mann.dev/{slug}` (update base_url once live)
- 2–3 relevant hashtags at end
- If `link` provided, credit with "via {link hostname}"

Output format:

```
--- X.com draft ---
{tweet text}

Post at: https://x.com/compose/tweet
---
```

## Step 5 — Validate and report

Run:

```bash
pnpm check
```

Report to user:
- File: `src/content/posts/{filename}`
- Image: `public/images/posts/{slug}.jpg` — or manual instruction if no API key
- Photo credit (if fetched)
- X.com draft (if generated)
- Next steps: write the post, set `draft: false` when ready, run `pnpm build`

## Frontmatter reference

Full schema (all optional fields shown):

```yaml
---
title: "Post Title"
date: 2026-05-31T12:00:00Z
description: "One sentence. For SEO and social cards."
image: /images/posts/my-slug.jpg
author: "David Mann"
categories:
  - DevOps
tags:
  - terraform
  - iac
link: https://example.com/source-article
draft: true
---
```

`link` maps to `content.config.ts` → `postCollection` → `link: z.string().url().optional()`.
