import "dotenv/config";
import mongoose from "mongoose";
import express from "express";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createApp, publishScheduled } from "./app";
import { Article } from "./models";
import { bootstrap } from "./bootstrap";
await mongoose.connect(
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/jo-hassa",
  { serverSelectionTimeoutMS: 10000 },
);
await bootstrap();
const app = createApp();
app.get("/healthz", (_req, res) =>
  res
    .status(mongoose.connection.readyState === 1 ? 200 : 503)
    .json({ ok: mongoose.connection.readyState === 1 }),
);
const base = () =>
  process.env.PUBLIC_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  "http://localhost:4000";
const esc = (s: any) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
app.get("/robots.txt", (_req, res) =>
  res
    .type("text/plain")
    .send(
      "User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: " +
        base() +
        "/sitemap.xml",
    ),
);
app.get("/sitemap.xml", async (_req, res, next) => {
  try {
    const articles = await Article.find({
      status: "published",
      publishedAt: { $lte: new Date() },
    }).select("slug updatedAt");
    const paths = [
      "",
      "/about",
      "/team",
      "/contact",
      ...["politics", "economy", "sports"].map((c) => "/category/" + c),
    ];
    res
      .type("application/xml")
      .send(
        '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
          paths
            .map((p) => "<url><loc>" + esc(base() + p) + "</loc></url>")
            .join("") +
          articles
            .map(
              (a) =>
                "<url><loc>" +
                esc(base() + "/news/" + encodeURIComponent(a.slug)) +
                "</loc><lastmod>" +
                a.updatedAt.toISOString() +
                "</lastmod></url>",
            )
            .join("") +
          "</urlset>",
      );
  } catch (e) {
    next(e);
  }
});
const built = existsSync("dist/client/index.html");
if (built) {
  app.use(express.static("dist/client", { index: false }));
  app.get("*", async (req, res, next) => {
    try {
      if (req.path.startsWith("/api/"))
        return res.status(404).json({ error: "المسار غير موجود" });
      let html = await readFile("dist/client/index.html", "utf8");
      if (req.path.startsWith("/news/")) {
        const slug = decodeURIComponent(req.path.slice(6));
        const a = await Article.findOne({
          slug,
          status: "published",
          publishedAt: { $lte: new Date() },
        })
          .populate("author", "name")
          .populate("image");
        if (!a) return res.status(404).send("الخبر غير موجود");
        const canonical = base() + "/news/" + encodeURIComponent(a.slug);
        const title = esc(a.seo?.title || a.title);
        const image = a.image?.url
          ? a.image.url.startsWith("http")
            ? a.image.url
            : base() + a.image.url
          : base() + "/logo.jpg";
        const schema = {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: a.title,
          description: a.summary,
          datePublished: a.publishedAt?.toISOString(),
          dateModified: a.updatedAt.toISOString(),
          author: { "@type": "Person", name: a.author?.name },
          publisher: {
            "@type": "Organization",
            name: "Jo هسّا",
            logo: { "@type": "ImageObject", url: base() + "/logo.jpg" },
          },
          image: [image],
          mainEntityOfPage: canonical,
          inLanguage: "ar-JO",
        };
        html = html
          .replace(
            /<title>.*?<\/title>/,
            "<title>" + title + " | Jo هسّا</title>",
          )
          .replace(
            /<meta name="description"[^>]*>/,
            '<meta name="description" content="' +
              esc(a.seo?.description || a.summary) +
              '"/>',
          )
          .replace(
            "</head>",
            '<link rel="canonical" href="' +
              esc(canonical) +
              '"/><meta property="og:type" content="article"/><meta property="og:locale" content="ar_JO"/><meta property="og:title" content="' +
              title +
              '"/><meta property="og:description" content="' +
              esc(a.summary) +
              '"/><meta property="og:url" content="' +
              esc(canonical) +
              '"/><meta property="og:image" content="' +
              esc(image) +
              '"/><script type="application/ld+json">' +
              JSON.stringify(schema).replace(/</g, "\\u003c") +
              "</script></head>",
          );
        html = html.replace(
          "<!--app-->",
          '<main dir="rtl"><a href="/">Jo هسّا</a><article>' +
            (a.demo ? "<p>محتوى تجريبي — لأغراض العرض فقط</p>" : "") +
            "<h1>" +
            title +
            "</h1><p>" +
            esc(a.summary) +
            "</p><p>" +
            esc(a.author?.name) +
            "</p>" +
            a.body +
            "</article></main>",
        );
      } else if (req.path.startsWith("/admin"))
        html = html.replace(
          "</head>",
          '<meta name="robots" content="noindex,nofollow"/></head>',
        );
      res.type("html").send(html);
    } catch (e) {
      next(e);
    }
  });
} else
  app.get("/", (_req, res) =>
    res.send(
      "Jo Hassa API is running. Open http://localhost:5173 for development.",
    ),
  );
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err.message);
  res.status(500).send("تعذر تحميل الصفحة");
});
const timer = setInterval(
  () => publishScheduled().catch((e) => console.error(e.message)),
  30000,
);
const server = app.listen(
  Number(process.env.PORT || 4000),
  process.env.HOST ||
    (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1"),
  () => console.log("Jo Hassa: http://localhost:" + (process.env.PORT || 4000)),
);
async function shutdown() {
  clearInterval(timer);
  server.close();
  await mongoose.disconnect();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
