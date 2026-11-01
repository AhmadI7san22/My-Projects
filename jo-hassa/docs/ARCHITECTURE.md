# Architecture

A Vite/React client uses React Router and TanStack Query. Login uses React Hook Form and Zod; rich-text editing uses TipTap. Tailwind is compiled by the Vite plugin with custom editorial design tokens and responsive CSS. Article data lives in MongoDB, never localStorage (only theme preference uses localStorage).

Express provides HTTP-only session cookies backed by connect-mongo. Each write requires a session-bound CSRF token. Login regenerates the session. Users are reloaded from MongoDB on every request so role changes and deactivation take immediate effect. Backend validation strictly rejects unrecognized article fields, including author/status injection. Published and approved copy is locked; returning it to editing invalidates approval. Optimistic concurrency prevents overlapping saves on the same article.

The production server serves compiled assets and injects article metadata, canonical links, Open Graph, JSON-LD, and the sanitized article text into the initial HTML. React replaces that initial public article fallback with the interactive page. Crawlers receive readable content without JavaScript. Admin HTML is noindex. The development Vite server does not provide this SEO transformation.

View collection deduplicates by a daily hash of IP/user-agent and article. Only the hash is stored, not raw IP. Counts are approximate (shared networks and user-agent changes affect uniqueness). Trending uses the last seven days of ArticleView data, and most-read uses cumulative valid counts. Views expire after 30 days; cumulative counts remain.

The scheduler checks approved, scheduled articles every 30 seconds using a conditional atomic update. Run the Node process continuously; a stopped process publishes overdue articles on its next scan. Side effects are not transactional across audit/revision writes and article saves; use MongoDB replica-set transactions and a durable queue if stronger editorial compliance guarantees are required.

Public category pages query one shared article collection. Contact and social links appear only when configured. There is no visitor messaging endpoint; the contact page uses the configured official email.
