# Live deployment

Deployed and verified on 1 November 2026 (Asia/Amman).

- Public site: https://jo-hassa.onrender.com
- Editor/admin login: https://jo-hassa.onrender.com/admin
- Source: https://github.com/AhmadI7san22/My-Projects/tree/main/jo-hassa
- Running application commit: 25e70750904e1c2251f4f3671ab0574cef76b441
- Web server: Render Free, Node.js 24.15.0, Frankfurt
- Database: a separate Atlas Free cluster/project named Jo Hassa, AWS Frankfurt
- Media: optimized WebP with responsive variants in MongoDB GridFS, surviving host restarts
- Health endpoint: /healthz

The six existing editorial accounts and nine clearly labeled demo articles were migrated. Team users retain their original passwords and roles. The local preview administrator was not copied: the hosted administrator has separate generated credentials. The account export and hosted administrator login are in ignored local .private/ files, never in GitHub.

Live checks passed: health, public articles, protected CMS, administrator login, secure HTTP-only cookies, real dashboard totals, MongoDB-backed image upload/retrieval, all six team logins, initial-response article SEO and sitemap. The original supplied logo was uploaded to the media library to verify persistent storage.

Render network access is limited to its documented Frankfurt shared outbound ranges 74.220.51.0/24 and 74.220.59.0/24 plus the local development address added by Atlas during setup. Database password authentication remains enabled. The auto-created Atlas admin role was reduced to readWriteAnyDatabase in the isolated Jo Hassa project. The unrelated Atlas project was not modified.

Free-tier limits: the web service sleeps after inactivity, and waking can take about a minute. Scheduled news may be delayed until the service wakes. Atlas storage is limited; monitor image usage. Managed backups, a custom domain and real editorial content are not configured. Keep all demo labels until replacing demo articles.

To deploy later changes, push the app folder to GitHub and choose Manual Deploy → Deploy latest commit in Render. The service currently uses the existing GitHub monorepo and the jo-hassa root directory. Do not upload local database files, .env files, account passwords or private exports.
