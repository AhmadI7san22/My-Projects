import bcrypt from "bcryptjs";
import { User, Category, SiteSettings } from "./models";
export async function bootstrap() {
  for (const [slug, name, responsibility] of [
    ["politics", "السياسة", "لينا أبو شقير"],
    ["economy", "الاقتصاد", "بديعة جابر ومحمد الفايز"],
    ["sports", "الرياضة", "ميادة عبدالله ومحمد عبادي"],
  ])
    await Category.updateOne(
      { slug },
      { $setOnInsert: { name, responsibility } },
      { upsert: true },
    );
  await SiteSettings.updateOne(
    { key: "main" },
    { $setOnInsert: { contactEmail: "", socials: [], breakingEnabled: true } },
    { upsert: true },
  );
  if (
    process.env.BOOTSTRAP_ADMIN_EMAIL &&
    process.env.BOOTSTRAP_ADMIN_PASSWORD &&
    !(await User.exists({ roles: "super_admin" }))
  ) {
    if (process.env.BOOTSTRAP_ADMIN_PASSWORD.length < 16)
      throw Error("Bootstrap admin password requires 16 characters");
    const email = process.env.BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
    if (await User.exists({ email }))
      throw Error("Bootstrap admin email already belongs to another account");
    await User.create({
      name: "مدير النظام",
      email,
      passwordHash: await bcrypt.hash(process.env.BOOTSTRAP_ADMIN_PASSWORD, 12),
      roles: ["super_admin"],
      sections: [],
      active: true,
    });
  }
}
