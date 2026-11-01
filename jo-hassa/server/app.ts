import { mediaBucket, storeImage } from "./media-storage";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import sharp, { type Metadata } from "sharp";
import sanitize from "sanitize-html";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";
import {
  Article,
  User,
  Category,
  MediaAsset,
  AuditLog,
  ArticleRevision,
  EditorialReview,
  ArticleView,
  SiteSettings,
  Tag,
} from "./models";
import {
  canEdit,
  canTransition,
  chief,
  editor,
  roles,
} from "../shared/workflow";
declare module "express-session" {
  interface SessionData {
    userId: string;
    csrf: string;
  }
}
const wrap = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);
const clean = (s: string) =>
  sanitize(s, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "s",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
    ],
    allowedAttributes: { a: ["href", "rel"] },
    allowedSchemes: ["https", "http"],
  });
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const data = z
  .object({
    title: z.string().min(5).max(240),
    slug: z
      .string()
      .min(2)
      .max(200)
      .regex(/^[\p{L}\p{N}-]+$/u),
    summary: z.string().max(600),
    body: z.string().min(10).max(150000),
    category: z.enum(["politics", "economy", "sports"]),
    tags: z.array(z.string().max(50)).max(15).default([]),
    image: z
      .string()
      .regex(/^[a-f0-9]{24}$/)
      .nullable()
      .optional(),
    editor: z
      .string()
      .regex(/^[a-f0-9]{24}$/)
      .nullable()
      .optional(),
    proofreader: z
      .string()
      .regex(/^[a-f0-9]{24}$/)
      .nullable()
      .optional(),
    featured: z.boolean().optional(),
    breaking: z.boolean().optional(),
    breakingUntil: z.string().datetime().nullable().optional(),
    seo: z
      .object({ title: z.string().max(240), description: z.string().max(600) })
      .optional(),
  })
  .strict();
export function createApp(opts: { memorySession?: boolean } = {}) {
  const app = express();
  const prod = process.env.NODE_ENV === "production";
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)
    throw Error("SESSION_SECRET must contain at least 32 characters");
  app.disable("x-powered-by");
  if (prod) app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
          connectSrc: ["'self'"],
        },
      },
    }),
  );
  const origins = (
    process.env.CLIENT_ORIGIN ||
    process.env.RENDER_EXTERNAL_URL ||
    "http://localhost:5173"
  ).split(",");
  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || origins.includes(origin)),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "200kb" }));
  app.use(rateLimit({ windowMs: 60000, limit: 300 }));
  app.use(
    session({
      name: "jo.sid",
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: opts.memorySession
        ? undefined
        : MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
      cookie: {
        httpOnly: true,
        secure: prod,
        sameSite: "lax",
        maxAge: 8 * 3600000,
      },
    }),
  );
  app.use(
    wrap(async (req: any, _res: any, next: any) => {
      req.user = req.session.userId
        ? await User.findOne({ _id: req.session.userId, active: true })
        : null;
      next();
    }),
  );
  app.get("/api/auth/csrf", (req, res) => {
    req.session.csrf ||= randomBytes(32).toString("hex");
    res.json({ token: req.session.csrf });
  });
  app.use("/api", (req, res, next) => {
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      (!req.session.csrf || req.get("X-CSRF-Token") !== req.session.csrf)
    )
      return res
        .status(403)
        .json({ error: "رمز الحماية غير صالح، أعد تحميل الصفحة" });
    next();
  });
  const auth = (req: any, res: any, next: any) =>
    req.user ? next() : res.status(401).json({ error: "يرجى تسجيل الدخول" });
  const audit = async (req: any, action: string, target: string) =>
    AuditLog.create({ actor: req.user._id, action, target });
  app.post(
    "/api/auth/login",
    rateLimit({ windowMs: 15 * 60000, limit: 10 }),
    wrap(async (req: any, res: any) => {
      const v = z
        .object({
          email: z.string().email(),
          password: z.string().min(1).max(200),
        })
        .parse(req.body);
      const user = await User.findOne({
        email: v.email.toLowerCase(),
        active: true,
      }).select("+passwordHash");
      if (!user || !(await bcrypt.compare(v.password, user.passwordHash)))
        return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
      await new Promise<void>((resolve, reject) =>
        req.session.regenerate((e: any) => (e ? reject(e) : resolve())),
      );
      req.session.userId = String(user._id);
      req.session.csrf = randomBytes(32).toString("hex");
      res.json({
        user: {
          _id: user._id,
          name: user.name,
          roles: user.roles,
          sections: user.sections,
        },
        token: req.session.csrf,
      });
    }),
  );
  app.post("/api/auth/logout", auth, (req, res) =>
    req.session.destroy(() => {
      res.clearCookie("jo.sid");
      res.json({ ok: true });
    }),
  );
  app.get("/api/auth/me", (req: any, res) => res.json({ user: req.user }));
  app.get(
    "/api/categories",
    wrap(async (_req: any, res: any) => res.json(await Category.find())),
  );
  app.get(
    "/api/settings",
    wrap(async (_req: any, res: any) =>
      res.json((await SiteSettings.findOne({ key: "main" })) || {}),
    ),
  );
  const list = wrap(async (req: any, res: any) => {
    const p = z
      .object({
        page: z.coerce.number().int().min(1).max(10000).default(1),
        limit: z.coerce.number().int().min(1).max(50).default(12),
        q: z.string().max(150).optional(),
        category: z.enum(["politics", "economy", "sports"]).optional(),
        sort: z
          .enum(["newest", "popular", "trending", "relevance"])
          .default("newest"),
        from: z.string().date().optional(),
        breaking: z.enum(["true"]).optional(),
      })
      .parse({
        ...req.query,
        ...(req.params.slug ? { category: req.params.slug } : {}),
      });
    const filter: any = {
      status: "published",
      publishedAt: { $lte: new Date() },
    };
    if (p.category) filter.category = p.category;
    if (p.from) filter.publishedAt.$gte = new Date(p.from);
    if (p.breaking) {
      const settings = await SiteSettings.findOne({ key: "main" });
      if (settings?.breakingEnabled === false)
        return res.json({ items: [], total: 0, page: p.page, pages: 0 });
      filter.breaking = true;
      filter.$and = [
        {
          $or: [
            { breakingUntil: null },
            { breakingUntil: { $gt: new Date() } },
          ],
        },
      ];
    }
    if (p.q) {
      const regex = new RegExp(escapeRegex(p.q), "i");
      const authors = await User.find({ name: regex }).select("_id");
      filter.$or = [
        { title: regex },
        { summary: regex },
        { body: regex },
        { tags: regex },
        { category: regex },
        {
          category: {
            $in: Object.entries({
              politics: "السياسة",
              economy: "الاقتصاد",
              sports: "الرياضة",
            })
              .filter(([, name]) => regex.test(name))
              .map(([slug]) => slug),
          },
        },
        { author: { $in: authors.map((a) => a._id) } },
      ];
    }
    let sort: any = { publishedAt: -1, _id: -1 };
    if (p.sort === "popular") sort = { views: -1, publishedAt: -1 };
    if (p.sort === "relevance" && p.q) {
      const regex = escapeRegex(p.q);
      const score = (field: string, weight: number) => ({
        $cond: [
          {
            $regexMatch: {
              input: { $ifNull: ["$" + field, ""] },
              regex,
              options: "i",
            },
          },
          weight,
          0,
        ],
      });
      const [ranked, total] = await Promise.all([
        Article.aggregate([
          { $match: filter },
          {
            $addFields: {
              relevance: {
                $add: [
                  score("title", 5),
                  score("summary", 3),
                  score("body", 1),
                ],
              },
            },
          },
          { $sort: { relevance: -1, publishedAt: -1, _id: -1 } },
          { $skip: (p.page - 1) * p.limit },
          { $limit: p.limit },
        ]),
        Article.countDocuments(filter),
      ]);
      const items = await Article.populate(ranked, [
        { path: "author", select: "name" },
        { path: "image" },
      ]);
      return res.json({
        items,
        total,
        page: p.page,
        pages: Math.ceil(total / p.limit),
      });
    }
    if (p.sort === "trending") {
      const ranked = await ArticleView.aggregate([
        {
          $match: { createdAt: { $gte: new Date(Date.now() - 7 * 86400000) } },
        },
        { $group: { _id: "$article", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 50 },
      ]);
      filter._id = { $in: ranked.map((r) => r._id) };
      const items = await Article.find(filter)
        .populate("author", "name")
        .populate("image");
      items.sort(
        (a, b) =>
          ranked.findIndex((r) => String(r._id) === String(a._id)) -
          ranked.findIndex((r) => String(r._id) === String(b._id)),
      );
      return res.json({
        items: items.slice((p.page - 1) * p.limit, p.page * p.limit),
        total: items.length,
        page: p.page,
        pages: Math.ceil(items.length / p.limit),
      });
    }
    const [items, total] = await Promise.all([
      Article.find(filter)
        .sort(sort)
        .skip((p.page - 1) * p.limit)
        .limit(p.limit)
        .populate("author", "name")
        .populate("image"),
      Article.countDocuments(filter),
    ]);
    res.json({ items, total, page: p.page, pages: Math.ceil(total / p.limit) });
  });
  app.get(
    ["/api/articles", "/api/search", "/api/categories/:slug/articles"],
    list,
  );
  app.get(
    "/api/articles/:slug",
    wrap(async (req: any, res: any) => {
      const article = await Article.findOne({
        slug: req.params.slug,
        status: "published",
        publishedAt: { $lte: new Date() },
      })
        .populate("author", "name")
        .populate("image");
      if (!article) return res.status(404).json({ error: "الخبر غير موجود" });
      res.json(article);
    }),
  );
  app.post(
    "/api/articles/:slug/view",
    rateLimit({ windowMs: 60000, limit: 30 }),
    wrap(async (req: any, res: any) => {
      const a = await Article.findOne({
        slug: req.params.slug,
        status: "published",
        publishedAt: { $lte: new Date() },
      });
      if (!a) return res.sendStatus(404);
      const visitor = createHash("sha256")
        .update(
          req.ip +
            "|" +
            req.get("user-agent") +
            "|" +
            process.env.SESSION_SECRET,
        )
        .digest("hex");
      try {
        await ArticleView.create({
          article: a._id,
          visitor,
          day: new Date().toISOString().slice(0, 10),
        });
        await Article.updateOne(
          { _id: a._id },
          { $inc: { views: 1 } },
          { timestamps: false },
        );
      } catch (e: any) {
        if (e.code !== 11000) throw e;
      }
      res.json({ ok: true });
    }),
  );
  app.use("/api/admin", auth);
  app.get(
    "/api/admin/articles",
    wrap(async (req: any, res: any) => {
      const f = chief(req.user)
        ? {}
        : {
            $or: [
              { author: req.user._id },
              { editor: req.user._id },
              { proofreader: req.user._id },
              ...(req.user.roles.includes("section_editor")
                ? [{ category: { $in: req.user.sections } }]
                : []),
            ],
          };
      res.json(
        await Article.find(f)
          .sort({ updatedAt: -1 })
          .limit(200)
          .populate("author", "name")
          .populate("image"),
      );
    }),
  );
  app.get(
    "/api/admin/dashboard",
    wrap(async (req: any, res: any) => {
      if (!chief(req.user) && !req.user.roles.includes("section_editor"))
        return res.status(403).json({ error: "غير مصرح" });
      const f = chief(req.user) ? {} : { category: { $in: req.user.sections } };
      const rows = await Article.find(f);
      res.json({
        total: rows.length,
        published: rows.filter((a) => a.status === "published").length,
        drafts: rows.filter((a) => a.status === "draft").length,
        pending: rows.filter((a) =>
          ["submitted", "editing", "proofreading", "approved"].includes(
            a.status,
          ),
        ).length,
        views: rows.reduce((s, a) => s + a.views, 0),
        categories: ["politics", "economy", "sports"].map((category) => ({
          category,
          count: rows.filter((a) => a.category === category).length,
        })),
        activity: chief(req.user)
          ? await AuditLog.find()
              .sort({ createdAt: -1 })
              .limit(12)
              .populate("actor", "name")
          : [],
      });
    }),
  );
  app.post(
    "/api/admin/articles",
    wrap(async (req: any, res: any) => {
      const v = data.parse(req.body);
      if (!req.user.roles.includes("writer") && !editor(req.user, v.category))
        return res.status(403).json({ error: "غير مصرح بإنشاء الأخبار" });
      if (
        !editor(req.user, v.category) &&
        (v.featured || v.breaking || v.editor || v.proofreader)
      )
        return res.sendStatus(403);
      const a = await Article.create({
        ...v,
        body: clean(v.body),
        author: req.user._id,
        status: "draft",
      });
      await audit(req, "article.create", String(a._id));
      res.status(201).json(a);
    }),
  );
  app.patch(
    "/api/admin/articles/:id",
    wrap(async (req: any, res: any) => {
      const a = await Article.findById(req.params.id);
      if (!a) return res.sendStatus(404);
      if (
        !canEdit(req.user, a) ||
        ["approved", "published", "archived"].includes(a.status)
      )
        return res
          .status(403)
          .json({ error: "أعد الخبر إلى التحرير قبل تعديله" });
      const v = data.partial().parse(req.body);
      if (
        !editor(req.user, a.category) &&
        ((v.category && v.category !== a.category) ||
          v.featured !== undefined ||
          v.breaking !== undefined ||
          v.editor !== undefined ||
          v.proofreader !== undefined)
      )
        return res.sendStatus(403);
      if (
        v.category &&
        !editor(req.user, v.category) &&
        editor(req.user, a.category)
      )
        return res.sendStatus(403);
      await ArticleRevision.create({
        article: a._id,
        actor: req.user._id,
        snapshot: a.toObject(),
      });
      Object.assign(a, v, ...(v.body ? [{ body: clean(v.body) }] : []));
      await a.save();
      await audit(req, "article.edit", String(a._id));
      res.json(a);
    }),
  );
  app.post(
    "/api/admin/articles/:id/:action",
    wrap(async (req: any, res: any) => {
      const actions: Record<string, string> = {
        submit: "submitted",
        edit: "editing",
        proofread: "proofreading",
        approve: "approved",
        publish: "published",
        unpublish: "draft",
        archive: "archived",
        changes: "editing",
      };
      const next = actions[req.params.action];
      if (!next) return res.sendStatus(404);
      const v = z
        .object({
          note: z.string().max(2000).default(""),
          scheduledAt: z.string().datetime().optional(),
        })
        .strict()
        .parse(req.body);
      const a = await Article.findById(req.params.id);
      if (!a) return res.sendStatus(404);
      if (!canTransition(req.user, a, next))
        return res.status(403).json({
          error: "لا تملك صلاحية هذه الخطوة أو أن حالة الخبر لا تسمح بها",
        });
      const previous = a.status;
      if (next === "published" && v.scheduledAt) {
        if (new Date(v.scheduledAt) <= new Date())
          return res.status(400).json({ error: "اختر وقتًا في المستقبل" });
        a.scheduledAt = new Date(v.scheduledAt);
      } else {
        a.status = next;
        a.scheduledAt = undefined;
        if (next === "published") a.publishedAt = new Date();
        if (next !== "published") a.breaking = false;
      }
      await a.save();
      await EditorialReview.create({
        article: a._id,
        actor: req.user._id,
        from: previous,
        to: v.scheduledAt ? "scheduled" : next,
        note: v.note,
      });
      await audit(req, "article." + req.params.action, String(a._id));
      res.json(a);
    }),
  );
  app.get(
    "/api/admin/history/:id",
    wrap(async (req: any, res: any) => {
      const a = await Article.findById(req.params.id);
      if (
        !a ||
        (!canEdit(req.user, a) &&
          !editor(req.user, a.category) &&
          String(a.author) !== String(req.user._id))
      )
        return res.sendStatus(403);
      res.json({
        reviews: await EditorialReview.find({ article: a._id })
          .populate("actor", "name")
          .sort({ createdAt: -1 }),
        revisions: await ArticleRevision.find({ article: a._id })
          .populate("actor", "name")
          .sort({ createdAt: -1 }),
      });
    }),
  );
  app.patch(
    "/api/admin/breaking/:id",
    wrap(async (req: any, res: any) => {
      const a = await Article.findById(req.params.id);
      if (!a) return res.sendStatus(404);
      if (
        !editor(req.user, a.category) ||
        !["approved", "published"].includes(a.status)
      )
        return res.sendStatus(403);
      const v = z
        .object({
          breaking: z.boolean(),
          breakingUntil: z.string().datetime().nullable().optional(),
        })
        .strict()
        .parse(req.body);
      Object.assign(a, v);
      await a.save();
      await audit(req, "breaking.update", String(a._id));
      res.json(a);
    }),
  );
  app.get(
    "/api/admin/media",
    wrap(async (req: any, res: any) =>
      res.json(
        await MediaAsset.find(
          req.query.q
            ? {
                alt: new RegExp(
                  escapeRegex(String(req.query.q).slice(0, 100)),
                  "i",
                ),
              }
            : {},
        )
          .sort({ createdAt: -1 })
          .limit(100),
      ),
    ),
  );
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  });
  app.post(
    "/api/admin/media",
    upload.single("file"),
    wrap(async (req: any, res: any) => {
      if (
        !req.user.roles.some((r: string) =>
          [
            "super_admin",
            "editor_in_chief",
            "section_editor",
            "writer",
            "photographer",
          ].includes(r),
        )
      )
        return res.sendStatus(403);
      const v = z
        .object({
          alt: z.string().min(3).max(300),
          caption: z.string().max(500),
          credit: z.string().min(2).max(300),
        })
        .parse(req.body);
      if (!req.file) return res.status(400).json({ error: "اختر صورة" });
      let metadata: Metadata;
      try {
        metadata = await sharp(req.file.buffer, {
          limitInputPixels: 40000000,
        }).metadata();
      } catch {
        return res.status(400).json({ error: "ملف الصورة تالف أو غير مدعوم" });
      }
      if (!["jpeg", "png", "webp"].includes(metadata.format || ""))
        return res.status(400).json({ error: "يسمح بصور JPEG وPNG وWebP فقط" });
      const buffer = await sharp(req.file.buffer, {
        limitInputPixels: 40000000,
      })
        .rotate()
        .resize({ width: 1800, withoutEnlargement: true })
        .webp({ quality: 84 })
        .toBuffer();
      let url = "";
      let srcSet = "";
      const optimized = await sharp(buffer).metadata();
      if (process.env.CLOUDINARY_URL) {
        const result: any = await new Promise((resolve, reject) =>
          cloudinary.uploader
            .upload_stream(
              { folder: "jo-hassa", resource_type: "image" },
              (err, result) => (err ? reject(err) : resolve(result)),
            )
            .end(buffer),
        );
        url = result.secure_url;
        srcSet = [480, 960, 1800]
          .filter((w) => w <= (optimized.width || 1800))
          .map(
            (w) =>
              url.replace("/upload/", "/upload/w_" + w + ",c_limit/") +
              " " +
              w +
              "w",
          )
          .join(", ");
      } else {
        const name = randomBytes(16).toString("hex") + ".webp";
        await storeImage(name, buffer);
        url = "/uploads/" + name;
        const variants: string[] = [];
        for (const width of [480, 960]) {
          if (width >= (optimized.width || 1800)) continue;
          const variant = name.replace(".webp", "-" + width + ".webp");
          await storeImage(
            variant,
            await sharp(buffer)
              .resize({ width, withoutEnlargement: true })
              .webp({ quality: 80 })
              .toBuffer(),
          );
          variants.push("/uploads/" + variant + " " + width + "w");
        }
        variants.push(url + " " + optimized.width + "w");
        srcSet = variants.join(", ");
      }
      const m = await MediaAsset.create({
        ...v,
        url,
        srcSet,
        mime: "image/webp",
        width: optimized.width,
        height: optimized.height,
        uploadedBy: req.user._id,
      });
      await audit(req, "media.upload", String(m._id));
      res.status(201).json(m);
    }),
  );
  app.patch(
    "/api/admin/media/:id",
    wrap(async (req: any, res: any) => {
      const m = await MediaAsset.findById(req.params.id);
      if (
        !m ||
        (!chief(req.user) && String(m.uploadedBy) !== String(req.user._id))
      )
        return res.sendStatus(403);
      Object.assign(
        m,
        z
          .object({
            alt: z.string().min(3).max(300),
            caption: z.string().max(500),
            credit: z.string().min(2).max(300),
          })
          .parse(req.body),
      );
      await m.save();
      await audit(req, "media.edit", String(m._id));
      res.json(m);
    }),
  );
  app.get(
    "/api/admin/users",
    wrap(async (req: any, res: any) => {
      if (!chief(req.user)) return res.sendStatus(403);
      res.json(await User.find().select("name email roles sections active"));
    }),
  );
  app.post(
    "/api/admin/users",
    wrap(async (req: any, res: any) => {
      if (!req.user.roles.includes("super_admin")) return res.sendStatus(403);
      const v = z
        .object({
          name: z.string().min(2),
          email: z.string().email(),
          password: z.string().min(12).max(100),
          roles: z.array(z.enum(roles)).min(1),
          sections: z.array(z.enum(["politics", "economy", "sports"])),
        })
        .parse(req.body);
      const u = await User.create({
        ...v,
        email: v.email.toLowerCase(),
        passwordHash: await bcrypt.hash(v.password, 12),
      });
      await audit(req, "user.create", String(u._id));
      res.status(201).json({ _id: u._id, name: u.name });
    }),
  );
  app.patch(
    "/api/admin/users/:id",
    wrap(async (req: any, res: any) => {
      if (!req.user.roles.includes("super_admin")) return res.sendStatus(403);
      if (String(req.user._id) === req.params.id)
        return res
          .status(400)
          .json({ error: "لا يمكنك تعديل صلاحيات حسابك الحالي" });
      const v = z
        .object({
          roles: z.array(z.enum(roles)).min(1),
          sections: z.array(z.enum(["politics", "economy", "sports"])),
          active: z.boolean(),
        })
        .strict()
        .parse(req.body);
      const u = await User.findByIdAndUpdate(req.params.id, v, { new: true });
      await audit(req, "user.update", req.params.id);
      res.json(u);
    }),
  );
  app.patch(
    "/api/admin/settings",
    wrap(async (req: any, res: any) => {
      if (!chief(req.user)) return res.sendStatus(403);
      const v = z
        .object({
          contactEmail: z.union([z.string().email(), z.literal("")]),
          socials: z
            .array(
              z.object({
                label: z.string().max(40),
                url: z.string().url().startsWith("https://"),
              }),
            )
            .max(10),
          breakingEnabled: z.boolean(),
        })
        .parse(req.body);
      res.json(
        await SiteSettings.findOneAndUpdate({ key: "main" }, v, {
          upsert: true,
          new: true,
        }),
      );
      await audit(req, "settings.update", "main");
    }),
  );
  if (process.env.MEDIA_STORAGE === "gridfs")
    app.get(
      "/uploads/:filename",
      wrap(async (req: any, res: any) => {
        if (!/^[a-f0-9]{32}(-[0-9]+)?\.webp$/.test(req.params.filename))
          return res.sendStatus(404);
        const bucket = mediaBucket();
        const file = await bucket
          .find({ filename: req.params.filename })
          .limit(1)
          .next();
        if (!file) return res.sendStatus(404);
        res.type("image/webp");
        res.set("Cache-Control", "public, max-age=2592000, immutable");
        res.set("Content-Length", String(file.length));
        bucket
          .openDownloadStream(file._id)
          .on("error", () => {
            if (!res.headersSent) res.sendStatus(500);
            else res.destroy();
          })
          .pipe(res);
      }),
    );
  app.use(
    "/uploads",
    express.static("uploads", {
      dotfiles: "deny",
      immutable: true,
      maxAge: "30d",
    }),
  );
  app.use((err: any, _req: any, res: any, _next: any) => {
    if (err instanceof z.ZodError)
      return res
        .status(400)
        .json({ error: "تحقق من الحقول المطلوبة", details: err.flatten() });
    if (err.code === 11000)
      return res.status(409).json({ error: "القيمة أو الرابط مستخدم مسبقًا" });
    if (err.name === "CastError")
      return res.status(400).json({ error: "معرّف غير صالح" });
    if (err.name === "VersionError")
      return res
        .status(409)
        .json({ error: "تم تعديل الخبر بواسطة مستخدم آخر، أعد تحميله" });
    if (err instanceof multer.MulterError)
      return res
        .status(400)
        .json({ error: "الملف أكبر من الحد المسموح (8 ميغابايت)" });
    console.error(err.message);
    res.status(500).json({ error: "تعذر إتمام الطلب" });
  });
  return app;
}
export async function publishScheduled() {
  const due = await Article.find({
    status: "approved",
    scheduledAt: { $lte: new Date() },
  });
  for (const a of due) {
    const updated = await Article.findOneAndUpdate(
      { _id: a._id, status: "approved", scheduledAt: { $lte: new Date() } },
      {
        $set: { status: "published", publishedAt: new Date() },
        $unset: { scheduledAt: 1 },
      },
      { new: true },
    );
    if (updated)
      await AuditLog.create({
        action: "article.scheduled_publish",
        target: String(a._id),
      });
  }
}
