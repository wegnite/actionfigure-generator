---
title: Traffic-driven Sitemap
description: Use a JSON allowlist to keep only pages that have traffic/value
---

# Traffic-driven Sitemap

Use a JSON allowlist to keep only pages that have traffic/value. This avoids indexing low-quality or zero-traffic pages.

## How it works

- Place an allowlist JSON at `docs/seo/sitemap-allowlist.json` (or set `SITEMAP_ALLOWLIST_PATH` to a custom path).
- `src/app/sitemap.ts` will read it at build/runtime and only include listed paths (homepage is always included).
- Locales can be restricted via the JSON file or environment variables.

## JSON schema

```json
{
  "locales": ["en", "zh"],
  "paths": ["", "/pricing", "/showcase", "/character-figure", "/character-figure/video"]
}
```

- `locales` (optional): subset of locales to include. If omitted, uses `NEXT_PUBLIC_SITEMAP_LOCALES` or defaults to `en`.
- `paths`: list of pathnames to include. Use empty string `""` for homepage.

## Environment variables

- `SITEMAP_ALLOWLIST_PATH`: path to the allowlist JSON file (relative to repo root or absolute).
- `NEXT_PUBLIC_SITEMAP_LOCALES`: comma-separated locales (e.g., `en,zh`). Intersected with JSON `locales` if both provided.
- `NEXT_PUBLIC_SITEMAP_INCLUDE_LEGAL`: set to `true` to include legal pages (privacy/terms) in the sitemap.

## Tips

- Export GA or GSC top pages to CSV/JSON and convert to this JSON format.
- Keep the list short and focused on high-value pages.

