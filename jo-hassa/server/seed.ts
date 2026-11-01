import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { User, Category, Article, SiteSettings } from "./models";
if (process.env.NODE_ENV === "production")
  throw Error("Demo seeding is disabled in production");
if (
  !process.env.ADMIN_EMAIL ||
  !process.env.ADMIN_PASSWORD ||
  process.env.ADMIN_PASSWORD.length < 12
)
  throw Error(
    "Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) before seeding",
  );
await mongoose.connect(
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/jo-hassa",
);
const team = [
  {
    name: "لينا أبو شقير",
    roles: ["writer", "section_editor"],
    sections: ["politics"],
  },
  {
    name: "بديعة جابر",
    roles: ["writer", "section_editor"],
    sections: ["economy"],
  },
  {
    name: "محمد الفايز",
    roles: ["writer", "proofreader", "photographer"],
    sections: ["economy"],
  },
  {
    name: "ميادة عبدالله",
    roles: ["writer", "section_editor", "photographer"],
    sections: ["sports"],
  },
  {
    name: "محمد عبادي",
    roles: ["writer", "section_editor"],
    sections: ["sports"],
  },
  { name: "بدر بصال", roles: ["writer", "proofreader", "photographer"], sections: ["politics", "economy"] },
];
const admin = await User.findOneAndUpdate(
  { email: process.env.ADMIN_EMAIL.toLowerCase() },
  {
    $setOnInsert: {
      name: "مدير النظام",
      email: process.env.ADMIN_EMAIL.toLowerCase(),
      passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
      roles: ["super_admin"],
      sections: [],
      active: true,
    },
  },
  { upsert: true, new: true },
);
const members = [];
for (const [i, t] of team.entries())
  members.push(
    await User.findOneAndUpdate(
      { email: "team-" + i + "@example.invalid" },
      {
        $setOnInsert: {
          ...t,
          email: "team-" + i + "@example.invalid",
          passwordHash: await bcrypt.hash(randomBytes(32).toString("hex"), 12),
          active: false,
        },
      },
      { upsert: true, new: true },
    ),
  );
// Upgrade only Badr's unconfigured demo placeholder; preserve deliberate role assignments.
await User.updateOne({email:'team-5@example.invalid',name:'بدر بصال',roles:{$size:0}},{$set:{roles:['writer','proofreader','photographer'],sections:['politics','economy']}});
for (const [slug, name, responsibility] of [
  ["politics", "السياسة", "لينا أبو شقير"],
  ["economy", "الاقتصاد", "بديعة جابر ومحمد الفايز"],
  ["sports", "الرياضة", "ميادة عبدالله ومحمد عبادي"],
])
  await Category.updateOne(
    { slug },
    { $set: { name, responsibility } },
    { upsert: true },
  );
await SiteSettings.updateOne(
  { key: "main" },
  { $setOnInsert: { contactEmail: "", socials: [], breakingEnabled: true } },
  { upsert: true },
);
const stories = [
  [
    "politics",
    "كيف نصنع حوارًا شبابيًا حول الشأن العام؟",
    "قراءة تدريبية في دور الشباب في النقاش العام، وكيف تتحول الأسئلة إلى حكايات صحفية تستحق المتابعة.",
  ],
  [
    "economy",
    "من الفكرة إلى المشروع: حكايات من اقتصاد الشباب",
    "ملف تدريبي يستكشف خطوات بناء مشروع صغير، وأهمية المعرفة المالية في بداية الطريق.",
  ],
  [
    "sports",
    "بعيدًا عن صافرة النهاية… الرياضة حكاية مجتمع",
    "تغطية تدريبية عن روح الفريق، والمساحات التي تجمع الشباب حول شغفهم بالرياضة.",
  ],
  [
    "politics",
    "وراء العنوان: كيف نقرأ الخبر السياسي؟",
    "دليل تجريبي لفهم السياق، والتحقق من المصادر، والتمييز بين الخبر والرأي.",
  ],
  [
    "economy",
    "لغة الأرقام: مفاهيم اقتصادية أقرب إلى يومنا",
    "مادة توضيحية تدريبية عن الميزانية والادخار واتخاذ القرارات المالية.",
  ],
  [
    "sports",
    "ملعب الحي… أول الطريق نحو الحلم",
    "حكاية تجريبية عن أثر المساحات الرياضية في تنمية المواهب والعمل الجماعي.",
  ],
  [
    "politics",
    "من السؤال إلى المصدر: يوم في غرفة الأخبار",
    "نموذج تدريبي يشرح كيف يعمل الصحفي على التحقق من المعلومة قبل نشرها.",
  ],
  [
    "economy",
    "مشروع صغير، أسئلة كبيرة: ماذا نحتاج قبل البداية؟",
    "تقرير تجريبي يقدّم إطارًا تعليميًا لدراسة الأفكار وتقدير تكاليفها.",
  ],
  [
    "sports",
    "كيف نحكي المباراة بعدسة مختلفة؟",
    "تمرين تحريري في كتابة التقرير الرياضي بعيدًا عن النتائج المجردة.",
  ],
];
for (const [i, [category, title, summary]] of stories.entries()) {
  const author =
    members[category === "politics" ? 0 : category === "economy" ? 1 : 3];
  await Article.updateOne(
    { slug: "demo-story-" + (i + 1) },
    {
      $setOnInsert: {
        title,
        summary,
        slug: "demo-story-" + (i + 1),
        category,
        author: author._id,
        body:
          "<p><strong>محتوى تجريبي — لأغراض العرض فقط.</strong> هذه مادة خيالية للتدريب على إدارة المنصة، ولا تصف أحداثًا حقيقية.</p><p>" +
          summary +
          "</p><h2>الحكاية من زاوية أخرى</h2><p>تمنح الصحافة الجيدة مساحة للسؤال والبحث. يبدأ عمل الفريق بفهم الموضوع، ثم مراجعة المصادر، وكتابة نص واضح يضع القارئ في قلب الحكاية. هذا النص نموذج تعليمي يمكن استبداله بمادة صحفية أصلية بعد مراجعتها واعتمادها في غرفة الأخبار.</p><p>تخضع الأخبار في هذه المنصة للتحرير والتدقيق قبل النشر، بهدف تقديم محتوى دقيق يحترم القارئ وحقوق أصحاب الصور والمعلومات.</p>",
        tags: [
          "تجريبي",
          "شباب",
          category === "politics"
            ? "سياسة"
            : category === "economy"
              ? "اقتصاد"
              : "رياضة",
        ],
        status: "published",
        demo: true,
        featured: i === 0,
        breaking: i === 0,
        breakingUntil: new Date(Date.now() + 86400000),
        publishedAt: new Date(Date.now() - i * 3600000),
        views: 0,
      },
    },
    { upsert: true },
  );
}
console.log(
  "Demo seed complete. Admin uses the credentials you configured. New team placeholders start inactive; existing provisioned accounts are preserved.",
);
await mongoose.disconnect();
