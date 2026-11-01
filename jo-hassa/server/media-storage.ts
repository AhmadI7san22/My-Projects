import mongoose from "mongoose";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
export function mediaBucket() {
  if (!mongoose.connection.db) throw Error("Database not connected");
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "newsroomMedia",
  });
}
export async function storeImage(filename: string, buffer: Buffer) {
  if (process.env.MEDIA_STORAGE === "gridfs") {
    await new Promise<void>((resolve, reject) => {
      const upload = mediaBucket().openUploadStream(filename, {
        metadata: { contentType: "image/webp" },
      });
      upload.on("finish", () => resolve());
      upload.on("error", reject);
      upload.end(buffer);
    });
  } else {
    await mkdir("uploads", { recursive: true });
    await writeFile(path.join("uploads", filename), buffer);
  }
}
