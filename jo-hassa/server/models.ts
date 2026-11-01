import mongoose, { Schema } from "mongoose";
const model = (name: string, schema: Schema) =>
  mongoose.models[name] || mongoose.model(name, schema);
export const User = model(
  "User",
  new Schema(
    {
      name: { type: String, required: true },
      email: { type: String, unique: true, required: true },
      passwordHash: { type: String, required: true, select: false },
      roles: [String],
      sections: [String],
      active: { type: Boolean, default: true },
    },
    { timestamps: true },
  ),
);
export const Category = model(
  "Category",
  new Schema({
    name: String,
    slug: { type: String, unique: true },
    responsibility: String,
  }),
);
export const Tag = model(
  "Tag",
  new Schema({ name: { type: String, unique: true } }),
);
export const MediaAsset = model(
  "MediaAsset",
  new Schema(
    {
      url: String,
      srcSet: String,
      alt: String,
      caption: String,
      credit: String,
      mime: String,
      width: Number,
      height: Number,
      uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true },
  ),
);
const articleSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    summary: String,
    body: String,
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    editor: { type: Schema.Types.ObjectId, ref: "User" },
    proofreader: { type: Schema.Types.ObjectId, ref: "User" },
    category: {
      type: String,
      enum: ["politics", "economy", "sports"],
      required: true,
    },
    tags: [String],
    image: { type: Schema.Types.ObjectId, ref: "MediaAsset" },
    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "editing",
        "proofreading",
        "approved",
        "published",
        "archived",
      ],
      default: "draft",
    },
    featured: { type: Boolean, default: false },
    breaking: { type: Boolean, default: false },
    breakingUntil: Date,
    scheduledAt: Date,
    publishedAt: Date,
    views: { type: Number, default: 0 },
    demo: { type: Boolean, default: false },
    seo: { title: String, description: String },
  },
  { timestamps: true, optimisticConcurrency: true },
);
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ category: 1, status: 1, publishedAt: -1 });
articleSchema.index(
  { title: "text", summary: "text", body: "text", tags: "text" },
  { default_language: "none" },
);
export const Article = model("Article", articleSchema);
export const ArticleRevision = model(
  "ArticleRevision",
  new Schema(
    {
      article: Schema.Types.ObjectId,
      actor: Schema.Types.ObjectId,
      snapshot: Schema.Types.Mixed,
    },
    { timestamps: true },
  ),
);
export const EditorialReview = model(
  "EditorialReview",
  new Schema(
    {
      article: Schema.Types.ObjectId,
      actor: Schema.Types.ObjectId,
      from: String,
      to: String,
      note: String,
    },
    { timestamps: true },
  ),
);
export const AuditLog = model(
  "AuditLog",
  new Schema(
    { actor: Schema.Types.ObjectId, action: String, target: String },
    { timestamps: true },
  ),
);
export const SiteSettings = model(
  "SiteSettings",
  new Schema({
    key: { type: String, unique: true },
    contactEmail: String,
    socials: [{ label: String, url: String }],
    breakingEnabled: { type: Boolean, default: true },
  }),
);
const viewSchema = new Schema({
  article: Schema.Types.ObjectId,
  visitor: String,
  day: String,
  createdAt: { type: Date, default: Date.now },
});
viewSchema.index({ article: 1, visitor: 1, day: 1 }, { unique: true });
viewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
export const ArticleView = model("ArticleView", viewSchema);
