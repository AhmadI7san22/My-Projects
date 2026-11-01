# Jo هسّا — هسّا تعرف... وهسّا تفهم

Arabic RTL digital newsroom built with React, TypeScript, Vite, Tailwind, Express and MongoDB. Uses the supplied official logo unchanged. The public application and role-protected CMS share a real API; no browser-local article database is used.

## Requirements

Node.js 22+, npm, MongoDB 7+ (local service or MongoDB Atlas). HTTPS is required in production.

## Run locally

1. Run npm install.
2. Copy .env.example to .env. Set MONGODB_URI and a random SESSION_SECRET of at least 32 characters. Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) for the initial development seed.
3. Start MongoDB, then run npm run seed. This is idempotent and does not overwrite existing articles or credentials. It is disabled in production.
4. Run npm run dev. Open http://localhost:5173. The API listens on http://localhost:4000.
5. Open /admin and sign in with the credentials you configured.

The six team profiles are public credit information. Seeded team account placeholders are INACTIVE and have random unknown passwords. Create active accounts using the super administrator UI and real team emails. Never assume all team members are administrators. بدر بصال covers political and economic news, news writing, language proofreading and photography (writer, proofreader and photographer roles; no publishing or administrative role).

## Production

Run npm run build, then NODE_ENV=production npm start (set the environment through your host on Windows). Serve the Node process behind an HTTPS reverse proxy. The built public pages and API are served together. See docs/DEPLOYMENT.md. Do not expose the Vite development server in production.

## Validation

- npm run build: strict TypeScript validation and production client build.
- npm test: workflow unit tests and MongoDB-backed API integration tests. mongodb-memory-server downloads an isolated MongoDB binary on first run.
- npx playwright install chromium: install the browser once.
- npm run test:e2e: desktop/mobile navigation, RTL, protected admin and theme tests. Browser tests stub API data; integration tests exercise the actual API.

## Content and media

All development articles are prominently labeled fictional examples. No real news, contact accounts, biographies or photos are fabricated. Geometric CSS artwork is a fallback until licensed images are uploaded. Uploaded images are decoded, resized, stripped of metadata and converted to WebP; optional CLOUDINARY_URL enables Cloudinary. Local uploads require a persistent disk.

## Implementation map

- client/: public React pages, newsroom UI, TipTap editing, light/dark styles
- server/: models, authenticated REST API, scheduling, production SEO HTML, seed
- shared/: role and transition rules
- tests/: unit, database integration, Playwright
- docs/: architecture, API, data, workflow and deployment

See docs/STATUS.md for verification results and remaining operational limitations.

## Quick public preview

After building, npm run preview starts a loopback-only MongoDB-backed demo at http://localhost:4000 without a separate MongoDB installation. It uses mongodb-memory-server and stores local development data in ignored .local-data/. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before the first run to sign in to the CMS; otherwise random local credentials are saved in the ignored .local-preview.env file. This mode is development-only.

## Local team accounts

The six local team accounts have been provisioned and verified through the login API. The same six accounts have also been migrated to the hosted site and their logins verified. Their private credentials and permission descriptions are in .private/team-accounts.txt. These are local login identifiers, not real mailboxes. The entire .private/ directory is excluded from Git. Share only each member's own credentials. None of these team accounts has a system administrator role. To deliberately reprovision these same local accounts using the saved credential export, run npx tsx server/provision-team.ts while the local preview is stopped. This does not provision a production database.

## Free hosting

See [docs/FREE_HOSTING.md](docs/FREE_HOSTING.md) for the free Render + MongoDB Atlas configuration. Use jo-hassa/render.yaml when deploying this project from the My-Projects monorepo. Production uploads can use MongoDB GridFS for persistence.

## Live website

https://jo-hassa.onrender.com — editors sign in at /admin. Hosting is Render Free with a MongoDB Atlas Free cluster. The free web service sleeps when idle; the first request may take about a minute. See docs/HOSTED_DEPLOYMENT.md for the verified deployment details.
