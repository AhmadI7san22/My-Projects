# REST API

All JSON writes require X-CSRF-Token from GET /api/auth/csrf and the session cookie. Errors return {error}; validation errors may include details. Login returns a new token after session regeneration. CORS accepts only configured CLIENT_ORIGIN values. Use same-origin requests in production.

## Public

GET /api/articles — query page, limit, q, category, sort (newest/popular/trending/relevance), from (YYYY-MM-DD), breaking=true. Returns items,total,page,pages. Only published, nonfuture articles are returned.
GET /api/articles/:slug — published detail, populated author and image.
POST /api/articles/:slug/view — deduplicated view registration; CSRF required.
GET /api/search — same filters as articles.
GET /api/categories; GET /api/categories/:slug/articles.
GET /api/settings — configured contact links and breaking visibility.
GET /robots.txt; GET /sitemap.xml — production server SEO endpoints.

## Authentication

GET /api/auth/csrf; POST /api/auth/login {email,password}; POST /api/auth/logout; GET /api/auth/me.

## CMS (all authenticated)

GET /api/admin/articles — scoped to author, assignments or permitted sections; maximum 200.
POST /api/admin/articles — draft creation.
PATCH /api/admin/articles/:id — permitted edits; published/approved/archived states are locked.
POST /api/admin/articles/:id/{submit,edit,proofread,approve,publish,unpublish,archive,changes} — optional note; publish accepts future scheduledAt in ISO format. Schedule preserves approved state until due.
GET /api/admin/history/:id — reviews and revision snapshots for permitted viewers.
PATCH /api/admin/breaking/:id — approved/published items only; breaking boolean and optional breakingUntil ISO date/null.
GET /api/admin/dashboard — real database aggregates and chief-only recent global audit activity.
GET /api/admin/media?q= — metadata search; maximum 100.
POST /api/admin/media — multipart file,alt,caption,credit. Image data is decoded and reencoded; no SVG/HTML uploads.
PATCH /api/admin/media/:id — uploader or chief can edit descriptive metadata.
GET /api/admin/users — chief roles only.
POST /api/admin/users — super_admin only; name,email,password,roles[],sections[].
PATCH /api/admin/users/:id — super_admin; roles[],sections[],active; self-role edits blocked.
PATCH /api/admin/settings — chiefs; contactEmail,socials[{label,url}],breakingEnabled.

Article writes accept title,slug,summary,body,category,tags,image plus permitted editor/proofreader/featured/breaking fields. Author, status, demo flag, view counters and publication dates cannot be injected through content writes. Unique conflicts return 409. Invalid transitions return 403.
