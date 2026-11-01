import sharp from "sharp";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp, publishScheduled } from "../server/app";
import { User, Article } from "../server/models";
let mongo: MongoMemoryServer;
let app: any;
let writer: any;
let editor: any;
let wToken: string;
let eToken: string;
let id: string;
beforeAll(async () => {
  process.env.SESSION_SECRET =
    "integration-test-secret-of-at-least-32-characters";
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  app = createApp({ memorySession: true });
  await Promise.all([
    User.create({
      name: "كاتب تجريبي",
      email: "writer@example.test",
      passwordHash: await bcrypt.hash("testing-password", 4),
      roles: ["writer"],
      sections: [],
    }),
    User.create({
      name: "محرر تجريبي",
      email: "editor@example.test",
      passwordHash: await bcrypt.hash("testing-password", 4),
      roles: ["section_editor"],
      sections: ["politics"],
    }),
  ]);
  writer = request.agent(app);
  editor = request.agent(app);
  for (const [agent, email] of [
    [writer, "writer@example.test"],
    [editor, "editor@example.test"],
  ]) {
    const csrf = await agent.get("/api/auth/csrf");
    const login = await agent
      .post("/api/auth/login")
      .set("X-CSRF-Token", csrf.body.token)
      .send({ email, password: "testing-password" });
    expect(login.status).toBe(200);
    if (agent === writer) wToken = login.body.token;
    else eToken = login.body.token;
  }
}, 120000);
afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});
describe("Newsroom API integration", () => {
  it("protects administrative routes", async () => {
    expect((await request(app).get("/api/admin/articles")).status).toBe(401);
  });
  it("rejects login without CSRF and rejects bad credentials", async () => {
    expect((await request(app).post("/api/auth/login").send({})).status).toBe(
      403,
    );
    const a = request.agent(app);
    const token = (await a.get("/api/auth/csrf")).body.token;
    expect(
      (
        await a
          .post("/api/auth/login")
          .set("X-CSRF-Token", token)
          .send({ email: "writer@example.test", password: "wrong" })
      ).status,
    ).toBe(401);
  });
  it("creates a sanitized draft, rejecting status injection", async () => {
    const body = {
      title: "خبر تجريبي للتحقق من المنصة",
      slug: "test-news",
      summary: "ملخص تجريبي",
      body: "<p>نص تجريبي للخبر</p><script>alert(1)</script>",
      category: "politics",
      tags: ["تجريبي"],
    };
    expect(
      (
        await writer
          .post("/api/admin/articles")
          .set("X-CSRF-Token", wToken)
          .send({ ...body, status: "published" })
      ).status,
    ).toBe(400);
    const r = await writer
      .post("/api/admin/articles")
      .set("X-CSRF-Token", wToken)
      .send(body);
    expect(r.status).toBe(201);
    expect(r.body.status).toBe("draft");
    expect(r.body.body).not.toContain("script");
    id = r.body._id;
    expect((await request(app).get("/api/articles/test-news")).status).toBe(
      404,
    );
  });
  it("prevents journalist publication and skipped approval", async () => {
    expect(
      (
        await writer
          .post("/api/admin/articles/" + id + "/publish")
          .set("X-CSRF-Token", wToken)
          .send({})
      ).status,
    ).toBe(403);
    expect(
      (
        await editor
          .post("/api/admin/articles/" + id + "/approve")
          .set("X-CSRF-Token", eToken)
          .send({})
      ).status,
    ).toBe(403);
  });
  it("runs the complete approval workflow and publishes", async () => {
    expect(
      (
        await writer
          .post("/api/admin/articles/" + id + "/submit")
          .set("X-CSRF-Token", wToken)
          .send({})
      ).status,
    ).toBe(200);
    for (const action of ["edit", "proofread", "approve", "publish"]) {
      const r = await editor
        .post("/api/admin/articles/" + id + "/" + action)
        .set("X-CSRF-Token", eToken)
        .send({ note: "مراجعة اختبارية" });
      expect(r.status).toBe(200);
    }
    expect((await request(app).get("/api/articles/test-news")).status).toBe(
      200,
    );
  });
  it("searches published Arabic content and enforces safe limits", async () => {
    const r = await request(app)
      .get("/api/search")
      .query({ q: "تجريبي", category: "politics" });
    expect(r.body.total).toBe(1);
    expect((await request(app).get("/api/articles?limit=500")).status).toBe(
      400,
    );
    expect(
      (await request(app).get("/api/search").query({ q: ".*" })).body.total,
    ).toBe(0);
  });
  it("deduplicates daily views", async () => {
    const a = request.agent(app);
    const token = (await a.get("/api/auth/csrf")).body.token;
    for (let i = 0; i < 2; i++)
      expect(
        (
          await a
            .post("/api/articles/test-news/view")
            .set("X-CSRF-Token", token)
            .send({})
        ).status,
      ).toBe(200);
    expect((await Article.findById(id))?.views).toBe(1);
  });
  it("prevents editing published content until returned to draft", async () => {
    expect(
      (
        await editor
          .patch("/api/admin/articles/" + id)
          .set("X-CSRF-Token", eToken)
          .send({ title: "تغيير عنوان الخبر المنشور" })
      ).status,
    ).toBe(403);
  });
  it("keeps author and category search matches when sorting by relevance", async () => {
    for (const q of ["كاتب تجريبي", "السياسة"]) {
      const r = await request(app)
        .get("/api/search")
        .query({ q, sort: "relevance" });
      expect(r.status).toBe(200);
      expect(r.body.total).toBe(1);
    }
  });
  it("publishes approved scheduled stories only when due", async () => {
    const original = await Article.findById(id);
    const scheduled = await Article.create({
      title: "خبر مجدول تجريبي",
      slug: "scheduled-news",
      summary: "اختبار الجدولة",
      body: "<p>نص تجريبي للجدولة</p>",
      author: original!.author,
      category: "politics",
      status: "approved",
      scheduledAt: new Date(Date.now() + 3600000),
    });
    await publishScheduled();
    expect(
      (await request(app).get("/api/articles/scheduled-news")).status,
    ).toBe(404);
    await Article.updateOne(
      { _id: scheduled._id },
      { $set: { scheduledAt: new Date(Date.now() - 1000) } },
    );
    await publishScheduled();
    expect(
      (await request(app).get("/api/articles/scheduled-news")).status,
    ).toBe(200);
  });
  it("reencodes images and requires descriptive rights information", async () => {
    const image = await sharp({
      create: { width: 1200, height: 800, channels: 3, background: "#007a3d" },
    })
      .png()
      .toBuffer();
    const r = await editor
      .post("/api/admin/media")
      .set("X-CSRF-Token", eToken)
      .field("alt", "رسم اختبار تجريبي")
      .field("caption", "صورة لاختبار التحويل")
      .field("credit", "اختبار آلي")
      .attach("file", image, "test.png");
    expect(r.status).toBe(201);
    expect(r.body.mime).toBe("image/webp");
    expect(r.body.srcSet).toContain("480w");
    expect(r.body.width).toBe(1200);
    const bad = await editor
      .post("/api/admin/media")
      .set("X-CSRF-Token", eToken)
      .field("alt", "ملف غير آمن")
      .field("caption", "")
      .field("credit", "اختبار آلي")
      .attach(
        "file",
        Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
        "image.svg",
      );
    expect(bad.status).toBe(400);
  });
  it("persists uploaded image variants in MongoDB and serves them", async () => {
    const previous = process.env.MEDIA_STORAGE;
    process.env.MEDIA_STORAGE = "gridfs";
    try {
      const imageApp=createApp({memorySession:true});const imageEditor=request.agent(imageApp);const csrf=(await imageEditor.get("/api/auth/csrf")).body.token;const imageToken=(await imageEditor.post("/api/auth/login").set("X-CSRF-Token",csrf).send({email:"editor@example.test",password:"testing-password"})).body.token;
      const image = await sharp({
        create: { width: 640, height: 400, channels: 3, background: "#ce1126" },
      })
        .png()
        .toBuffer();
      const r = await imageEditor
        .post("/api/admin/media")
        .set("X-CSRF-Token", imageToken)
        .field("alt", "صورة اختبار مخزنة في قاعدة البيانات")
        .field("caption", "اختبار التخزين الدائم")
        .field("credit", "اختبار آلي")
        .attach("file", image, "test.png");
      expect(r.status).toBe(201);
      expect(r.body.srcSet).toContain("480w");
      const publicImage = await request(imageApp).get(r.body.url);
      expect(publicImage.status).toBe(200);
      expect(publicImage.headers["content-type"]).toContain("image/webp");
      expect(Buffer.isBuffer(publicImage.body)).toBe(true);
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db!, {
        bucketName: "newsroomMedia",
      });
      expect(await bucket.find({}).toArray()).toHaveLength(2);
      expect((await request(imageApp).get("/uploads/not-valid.webp")).status).toBe(
        404,
      );
    } finally {
      if (previous === undefined) delete process.env.MEDIA_STORAGE;
      else process.env.MEDIA_STORAGE = previous;
    }
  });
  it("logs out and invalidates the session", async () => {
    expect(
      (
        await writer
          .post("/api/auth/logout")
          .set("X-CSRF-Token", wToken)
          .send({})
      ).status,
    ).toBe(200);
    expect((await writer.get("/api/admin/articles")).status).toBe(401);
  });
});
