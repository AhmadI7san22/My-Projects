import "dotenv/config";
import mongoose from "mongoose";
import { readFile } from "node:fs/promises";
import { MongoMemoryServer } from "mongodb-memory-server";
import path from "node:path";
const secrets = JSON.parse(
  await readFile(".private/hosting-secrets.json", "utf8"),
);
if (
  !secrets.MONGODB_URI?.startsWith("mongodb+srv://") ||
  !secrets.MONGODB_URI.includes("/jo-hassa?")
)
  throw Error("Expected the approved hosted jo-hassa database URI");
const remote = new mongoose.mongo.MongoClient(
  secrets.MONGODB_DIRECT_URI || secrets.MONGODB_URI,
  { serverSelectionTimeoutMS: 15000 },
);
const local = await MongoMemoryServer.create({
  instance: {
    dbPath: ".local-data",
    dbName: "jo-hassa",
    storageEngine: "wiredTiger",
    ip: "127.0.0.1",
  },
});
let source: InstanceType<typeof mongoose.mongo.MongoClient> | undefined;
try {
  source = new mongoose.mongo.MongoClient(local.getUri());
  await source.connect();
  await remote.connect();
  const from = source.db();
  const to = remote.db("jo-hassa");
  const users = await from
    .collection("users")
    .find({ roles: { $ne: "super_admin" } })
    .toArray();
  for (const u of users) {
    const existing = await to.collection("users").findOne({ email: u.email });
    if (existing && String(existing._id) !== String(u._id))
      throw Error(
        "Existing hosted account has a different identity; stop to avoid misattribution",
      );
    await to
      .collection("users")
      .updateOne({ _id: u._id }, { $setOnInsert: u }, { upsert: true });
  }
  const counts: Record<string, number> = { users: users.length };
  for (const name of [
    "articles",
    "mediaassets",
    "tags",
    "articlerevisions",
    "editorialreviews",
  ]) {
    const docs = await from.collection(name).find({}).toArray();
    for (const doc of docs) {
      if (
        name === "articles" &&
        (await to
          .collection(name)
          .findOne({ slug: doc.slug, _id: { $ne: doc._id } }))
      )
        throw Error("Hosted article slug already belongs to another article");
      await to
        .collection(name)
        .updateOne({ _id: doc._id }, { $setOnInsert: doc }, { upsert: true });
    }
    counts[name] = docs.length;
  }
  const setting = await from
    .collection("sitesettings")
    .findOne({ key: "main" });
  if (setting) {
    const { _id, ...fields } = setting;
    await to
      .collection("sitesettings")
      .updateOne({ key: "main" }, { $set: fields }, { upsert: true });
  }
  const bucket = new mongoose.mongo.GridFSBucket(to, {
    bucketName: "newsroomMedia",
  });
  const assets = await from
    .collection("mediaassets")
    .find({ url: { $regex: "^/uploads/" } })
    .toArray();
  for (const asset of assets) {
    const urls = [
      asset.url,
      ...String(asset.srcSet || "")
        .split(",")
        .map((v: string) => v.trim().split(" ")[0]),
    ].filter(Boolean);
    for (const url of new Set<string>(urls)) {
      const name = path.basename(url);
      if (!/^[a-f0-9]{32}(-[0-9]+)?\.webp$/.test(name))
        throw Error("Unexpected local media filename");
      if (await bucket.find({ filename: name }).hasNext()) continue;
      const bytes = await readFile(path.join("uploads", name));
      await new Promise<void>((resolve, reject) => {
        const out = bucket.openUploadStream(name, {
          metadata: { contentType: "image/webp" },
        });
        out.on("finish", () => resolve());
        out.on("error", reject);
        out.end(bytes);
      });
    }
  }
  await to
    .collection("auditlogs")
    .insertOne({
      action: "deployment.import_local_newsroom",
      target: "jo-hassa",
      createdAt: new Date(),
      counts,
    });
  console.log(
    "Imported project data without copying local administrator credentials:",
    JSON.stringify(counts),
  );
} finally {
  await source?.close();
  await remote.close();
  await local.stop();
}
