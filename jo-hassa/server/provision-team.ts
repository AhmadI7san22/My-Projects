import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { MongoMemoryServer } from "mongodb-memory-server";
import { User, AuditLog } from "./models";

if (process.env.NODE_ENV === "production")
  throw Error("This account bootstrap is for the local project only.");
const team = [
  {
    name: "لينا أبو شقير",
    roles: ["writer", "section_editor"],
    sections: ["politics"],
    description:
      "الأخبار السياسية، كتابة الأخبار وتحريرها ونشر المعتمد منها في قسم السياسة",
  },
  {
    name: "بديعة جابر",
    roles: ["writer", "section_editor"],
    sections: ["economy"],
    description:
      "الأخبار الاقتصادية، كتابة الأخبار وتحريرها ونشر المعتمد منها في قسم الاقتصاد",
  },
  {
    name: "محمد الفايز",
    roles: ["writer", "proofreader", "photographer"],
    sections: ["economy"],
    description:
      "الأخبار الاقتصادية، الكتابة، التدقيق اللغوي للمواد المكلّف بها، التصوير — دون صلاحية النشر",
  },
  {
    name: "ميادة عبدالله",
    roles: ["writer", "section_editor", "photographer"],
    sections: ["sports"],
    description:
      "الأخبار الرياضية، الكتابة والتحرير وإعادة الصياغة والتصوير ونشر المعتمد في قسم الرياضة",
  },
  {
    name: "محمد عبادي",
    roles: ["writer", "section_editor"],
    sections: ["sports"],
    description:
      "الأخبار الرياضية، الكتابة والتحرير وإعادة الصياغة ونشر المعتمد في قسم الرياضة",
  },
  {
    name: "بدر بصال",
    roles: ["writer", "proofreader", "photographer"],
    sections: ["politics", "economy"],
    description:
      "الأخبار السياسية والاقتصادية، كتابة الخبر، التدقيق اللغوي للمواد المكلّف بها، التصوير — دون صلاحية النشر",
  },
];
await mkdir(".private", { recursive: true });
let accounts: any[];
try {
  accounts = JSON.parse(await readFile(".private/team-accounts.json", "utf8"));
  if (accounts.length !== team.length) throw Error("Unexpected account list");
} catch (e: any) {
  if (e.code !== "ENOENT") throw e;
  accounts = team.map((t, i) => ({
    ...t,
    email: "team-" + i + "@example.invalid",
    password: randomBytes(18).toString("base64url"),
  }));
  await writeFile(
    ".private/team-accounts.json",
    JSON.stringify(accounts, null, 2),
    { flag: "wx" },
  );
}
let mongo: MongoMemoryServer | undefined;
try {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    await mkdir(".local-data", { recursive: true });
    mongo = await MongoMemoryServer.create({
      instance: {
        dbPath: ".local-data",
        dbName: "jo-hassa",
        storageEngine: "wiredTiger",
        ip: "127.0.0.1",
      },
    });
    uri = mongo.getUri();
  }
  await mongoose.connect(uri);
  for (const [i, t] of team.entries()) {
    const account = accounts[i];
    if (
      account.email !== "team-" + i + "@example.invalid" ||
      account.name !== t.name
    )
      throw Error("Credential export does not match team");
    const existing = await User.findOne({ email: account.email });
    if (existing && existing.name !== t.name)
      throw Error("Existing account identity differs");
    const passwordHash = await bcrypt.hash(account.password, 12);
    const user = await User.findOneAndUpdate(
      { email: account.email },
      {
        $set: {
          name: t.name,
          passwordHash,
          roles: t.roles,
          sections: t.sections,
          active: true,
        },
      },
      { upsert: true, new: true },
    );
    if (
      !(await bcrypt.compare(
        account.password,
        (await User.findById(user._id).select("+passwordHash"))!.passwordHash,
      ))
    )
      throw Error("Password verification failed");
    await AuditLog.create({
      action: "user.local_team_provision",
      target: String(user._id),
    });
  }
  const text = [
    "حسابات فريق Jo هسّا",
    "ملف خاص — يحتوي على كلمات مرور. شارك مع كل عضو بيانات حسابه فقط.",
    "هذه الحسابات مفعّلة في قاعدة بيانات المشروع المحلية.",
    "صفحة الدخول: http://127.0.0.1:4000/admin",
    "لتشغيل الموقع: npm run preview",
    "المعرّفات التي تشبه البريد أدناه مخصصة لتسجيل الدخول، وليست صناديق بريد حقيقية.",
    "لا يملك أي حساب في هذه القائمة صلاحية إدارة المستخدمين.",
    "",
  ]
    .concat(
      team.flatMap((t, i) => [
        "الاسم: " + t.name,
        "معرّف الدخول: " + accounts[i].email,
        "كلمة المرور: " + accounts[i].password,
        "الصلاحيات: " + t.description,
        "----------------------------------------",
      ]),
    )
    .join("\n");
  await writeFile(".private/team-accounts.txt", "\uFEFF" + text, "utf8");
  console.log(
    "Provisioned and verified six active team accounts. Private export: .private/team-accounts.txt",
  );
} finally {
  await mongoose.disconnect();
  await mongo?.stop();
}
