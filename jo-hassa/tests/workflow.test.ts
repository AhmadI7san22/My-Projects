import { describe, it, expect } from "vitest";
import { canEdit, canTransition } from "../shared/workflow";
const writer = { _id: "w", roles: ["writer"], sections: [] };
const editor = { _id: "e", roles: ["section_editor"], sections: ["politics"] };
const proof = { _id: "p", roles: ["proofreader"], sections: [] };
describe("Editorial authorization", () => {
  it("allows authors to submit drafts, never publish", () => {
    expect(
      canTransition(
        writer,
        { author: "w", category: "politics", status: "draft" },
        "submitted",
      ),
    ).toBe(true);
    for (const status of [
      "draft",
      "submitted",
      "editing",
      "proofreading",
      "approved",
    ])
      expect(
        canTransition(
          writer,
          { author: "w", category: "politics", status },
          "published",
        ),
      ).toBe(false);
  });
  it("scopes section editors to their assigned category", () => {
    expect(
      canTransition(
        editor,
        { category: "economy", status: "approved" },
        "published",
      ),
    ).toBe(false);
    expect(
      canTransition(
        editor,
        { category: "politics", status: "approved" },
        "published",
      ),
    ).toBe(true);
  });
  it("requires proofreading before approval", () => {
    expect(
      canTransition(
        editor,
        { category: "politics", status: "submitted" },
        "approved",
      ),
    ).toBe(false);
  });
  it("requires the assigned proofreader", () => {
    expect(
      canTransition(
        proof,
        { category: "politics", status: "proofreading", proofreader: "p" },
        "approved",
      ),
    ).toBe(true);
    expect(
      canTransition(
        proof,
        { category: "politics", status: "proofreading", proofreader: "other" },
        "approved",
      ),
    ).toBe(false);
  });
  it("protects other authors drafts", () => {
    expect(
      canEdit(writer, {
        author: "other",
        category: "politics",
        status: "draft",
      }),
    ).toBe(false);
  });
});
