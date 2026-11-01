# Deployment

Use a persistent Node.js 22+ host and MongoDB 7+ or Atlas. This Express/Mongoose stack is not a static-only or Cloudflare Workers deployment. No hosting account or production MongoDB credentials are included.

1. Install dependencies with npm ci after a lockfile is generated. Run npm run build and npm test.
2. Configure NODE_ENV=production, MONGODB_URI, a cryptographically random SESSION_SECRET (32+ characters), PUBLIC_URL=https://your-domain and CLIENT_ORIGIN=https://your-domain. Never commit .env.
3. Bootstrap an admin in an isolated development environment using the seed, then remove the demo articles before launch; alternatively provision a User with a bcrypt cost-12 hash through a trusted database administration process. The seed is deliberately disabled in production. Do not deploy example credentials.
4. Start npm start under a process supervisor. Reverse-proxy HTTPS to 127.0.0.1:4000. Exactly one trusted reverse proxy is assumed. Set request upload limits consistently with the 8 MB application limit. Secure cookies require HTTPS and NODE_ENV=production.
5. Use a persistent uploads directory or set CLOUDINARY_URL. Restrict filesystem permissions. Back up MongoDB and media; test recovery. Serve the built application from this Express process so article metadata is rendered on first response.
6. Confirm /robots.txt, /sitemap.xml, article source metadata, login/logout, roles, upload rights, accessibility and mobile layouts against the deployed origin. Remove fictional development stories, configure contact information and social links, create real accounts, and review all image licenses.

Security: the application uses Helmet, an origin allowlist, CSRF tokens, request/login rate limits, bcrypt, secure cookies, strict validation, HTML sanitization, safe decoded image uploads and administrative audit history. Memory session storage is used only by integration tests. Production rate-limit counters are process-local; install a shared store when running multiple replicas. Add centralized logs, alerting, uptime checks, password reset/invitation flows and optional MFA before a public production rollout. Those operational integrations are not included.

Scheduling runs in-process every 30 seconds. For a larger or multi-region newsroom, replace it with a durable queue and an external scheduler. MongoDB access should use TLS, a least-privilege user and backups. Do not enable unrestricted CORS.
