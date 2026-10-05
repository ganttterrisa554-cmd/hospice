<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project verification and SEO

- Use pnpm. Run `pnpm build` and `git diff --check` before handing off changes.
- Shared metadata is in `src/site.js`; Next.js metadata routes generate social images, robots.txt, and sitemap.xml.
- `SITE_URL` is an optional, confirmed HTTPS origin without a path, query, or fragment. It sets canonical and social URLs at build time. Without it, no canonical is emitted and local social previews use localhost:3000.
- Indexing defaults to disabled. `SITE_INDEXABLE=true` only enables it for production builds outside Vercel preview/development deployments and with `SITE_URL` set. Rebuild after changing these variables.
- Before enabling indexing, verify the employer/domain, replace placeholder content, and implement production-safe application handling. Do not publish JobPosting structured data for sample roles.
- Pre-launch robots.txt allows the landing page to be crawled so bots can read its noindex directive; its sitemap is empty. API routes are excluded from crawling and carry X-Robots-Tag. These are crawl directives, not access controls.
