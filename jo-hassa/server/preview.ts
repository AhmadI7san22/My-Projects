import "dotenv/config";
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
if (process.env.NODE_ENV === "production")
  throw Error("Preview is for local development only");
dotenv.config({ path: ".local-preview.env", quiet: true } as any);
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  if (
    existsSync(".local-data") &&
    process.env.ADMIN_EMAIL &&
    process.env.ADMIN_EMAIL !== "local-preview@example.invalid"
  )
    throw Error("Set both ADMIN_EMAIL and ADMIN_PASSWORD");
  process.env.ADMIN_EMAIL = "local-preview@example.invalid";
  process.env.ADMIN_PASSWORD = randomBytes(20).toString("hex");
  await writeFile(
    ".local-preview.env",
    "ADMIN_EMAIL=" +
      process.env.ADMIN_EMAIL +
      "\nADMIN_PASSWORD=" +
      process.env.ADMIN_PASSWORD +
      "\n",
  );
}
await mkdir(".local-data", { recursive: true });
const mongo = await MongoMemoryServer.create({
  instance: {
    dbPath: ".local-data",
    dbName: "jo-hassa",
    storageEngine: "wiredTiger",
    ip: "127.0.0.1",
  },
});
process.env.MONGODB_URI = mongo.getUri();
process.env.SESSION_SECRET ||= randomBytes(48).toString("hex");
await import("./seed");
await mongoose.connect(process.env.MONGODB_URI);
if (process.env.ADMIN_EMAIL === "local-preview@example.invalid") {
  const { User } = await import("./models");
  await User.updateOne(
    { email: process.env.ADMIN_EMAIL },
    {
      $set: {
        passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD!, 12),
      },
    },
  );
  console.log(
    "Local preview credentials are saved in ignored .local-preview.env.",
  );
}
await import("./index");
process.on("exit", () => {
  void mongo.stop();
});
