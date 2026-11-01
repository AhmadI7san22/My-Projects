# Database

User: unique lowercase email, hidden passwordHash, roles[], sections[], active flag. Passwords use bcrypt cost 12. Multiple roles are supported. Only super_admin can assign roles.

Article: unique slug; title, summary, sanitized HTML body, author/editor/proofreader references, category slug, tag names, MediaAsset reference, workflow status, featured/breaking flags, breaking expiry, scheduledAt, publishedAt, timestamps, views, demo flag, SEO fields. Categories are restricted to politics/economy/sports. Compound indexes cover public time/category queries; text index uses language none to support Arabic tokens. Search defaults to escaped substring matching; relevance adds MongoDB text scoring. Arabic stemming is not implemented.

Category: unique slug, Arabic name and responsibility. Tag: unique name (reserved taxonomy collection; article tags are currently stored inline). MediaAsset: URL, alt text, caption, credit, MIME, dimensions, uploader. ArticleRevision stores a snapshot before permitted content edits. EditorialReview stores actor, transition, review note, timestamp. AuditLog records administrative actions; no passwords or uploaded bytes are logged. SiteSettings holds configured contact/socials and global breaking visibility. ArticleView has a unique compound article/visitor/day index and 30-day TTL.

Public pagination is 1–50 per page, page 1–10000. Admin lists are bounded to 200 articles and media to 100 assets; larger newsroom installations need cursor pagination in the CMS. The demo seed never deletes data. Back up MongoDB and local uploaded files together.
