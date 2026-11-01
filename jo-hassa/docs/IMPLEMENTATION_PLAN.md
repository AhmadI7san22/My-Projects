# Implementation phases

1. Foundation: configure React/TypeScript/Vite/Tailwind and Express/Mongoose; preserve the supplied logo and establish RTL brand tokens.
2. Public interface: newsroom homepage, category/article routes, search, about/team/contact, responsive navigation, dark mode and useful empty/error states.
3. Data/API: ten Mongoose models, public publication filtering, indexed queries, view tracking and safe pagination.
4. Authentication/CMS: cookie sessions, CSRF, multiple roles, protected dashboard, article forms, TipTap and user administration.
5. Editorial/media: enforce review transitions, history, scheduling, breaking expiry, safe raster uploads, credits and media management.
6. Delivery quality: initial-response article SEO, sitemap/robots, route splitting, responsive image variants and automated checks.
7. Integration audit: test role bypasses, invalid transitions, malformed uploads, Arabic search and desktop/mobile behavior; patch dependency advisories and document remaining operational work.

All phases have implementation in the workspace. See STATUS.md for the actual verification scope and limitations; the application has not been deployed to a production host.
