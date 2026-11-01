# Editorial workflow

Draft → Submitted → Editing → Proofreading → Approved → Published.

Writers create and edit their own drafts and requested edits, then submit. They cannot publish, approve, set editorial flags, change assignments or mutate workflow status through article PATCH. Section editors work only inside assigned sections. Chiefs work across all sections. An assigned proofreader can edit during proofreading and approve; section editors and chiefs can also approve after the proofreading stage. Photographers upload media but cannot create or publish articles unless they separately have a permitted editorial role.

The CMS shows only actions permitted for the current role and state; the server independently enforces every action. The editor assignment is recorded for coordination, while authorization remains governed by section/role permissions. Chief roles assign reviewers in the editor. Review notes record requests for changes. A returned approved article loses approval; published articles must be unpublished before editing. Republishing requires the full editorial path again.

Scheduling is available only for approved articles and authorized publishers. Scheduled articles remain private until published. Editors can mark approved or published articles as breaking and set an expiry. The public ticker also honors the global visibility setting. Publishing does not create a breaking flag automatically.

Revisions store prior content before edits; reviews store workflow history. Audit records capture administrative actions. The UI exposes history but has no automatic restore button: copy the desired prior content into a draft and resubmit for approval.
