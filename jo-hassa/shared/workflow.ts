export const roles = [
  "super_admin",
  "editor_in_chief",
  "section_editor",
  "writer",
  "proofreader",
  "photographer",
] as const;
export type Role = (typeof roles)[number];
export const statuses = [
  "draft",
  "submitted",
  "editing",
  "proofreading",
  "approved",
  "published",
  "archived",
] as const;
export type Status = (typeof statuses)[number];
export function chief(u: any) {
  return u.roles.some((r: string) =>
    ["super_admin", "editor_in_chief"].includes(r),
  );
}
export function editor(u: any, category: string) {
  return (
    chief(u) ||
    (u.roles.includes("section_editor") && u.sections.includes(category))
  );
}
export function canEdit(u: any, a: any) {
  return (
    editor(u, a.category) ||
    (String(a.author) === String(u._id) &&
      u.roles.includes("writer") &&
      ["draft", "editing"].includes(a.status)) ||
    (u.roles.includes("proofreader") &&
      String(a.proofreader) === String(u._id) &&
      a.status === "proofreading")
  );
}
export function canTransition(u: any, a: any, next: string) {
  if (next === "submitted") return a.status === "draft" && canEdit(u, a);
  if (next === "editing")
    return (
      ["submitted", "proofreading", "approved"].includes(a.status) &&
      editor(u, a.category)
    );
  if (next === "proofreading")
    return a.status === "editing" && editor(u, a.category);
  if (next === "approved")
    return (
      a.status === "proofreading" &&
      (editor(u, a.category) ||
        (u.roles.includes("proofreader") &&
          String(a.proofreader) === String(u._id)))
    );
  if (next === "published")
    return a.status === "approved" && editor(u, a.category);
  if (next === "draft")
    return (
      ["published", "submitted", "archived"].includes(a.status) &&
      editor(u, a.category)
    );
  if (next === "archived") return editor(u, a.category);
  return false;
}
