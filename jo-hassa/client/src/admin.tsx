import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  LayoutDashboard,
  FileText,
  Image,
  Users,
  Settings,
  LogOut,
  Plus,
  ArrowRight,
  Save,
  Eye,
  Bold,
  Italic,
  List,
  Heading2,
  Quote,
  Search,
  ShieldCheck,
  Check,
} from "lucide-react";
import { api, mutate, cats, statusNames, date, Article } from "./api";
import {
  canEdit,
  canTransition,
  chief,
  editor as isEditor,
  roles,
} from "../../shared/workflow";
import { Loading, Failure, ArtImage } from "./main";
const loginSchema = z.object({
  email: z.string().email("أدخل بريدًا إلكترونيًا صحيحًا"),
  password: z.string().min(1, "أدخل كلمة المرور"),
});
function Login({ onLogin }: { onLogin: () => void }) {
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });
  return (
    <div className="login-wrap">
      <form
        className="login-card"
        onSubmit={handleSubmit(async (v) => {
          try {
            await mutate("/auth/login", v);
            onLogin();
          } catch (e: any) {
            setError(e.message);
          }
        })}
      >
        <div className="login-icon">
          <ShieldCheck size={27} />
        </div>
        <span className="eyebrow">غرفة أخبار Jo هسّا</span>
        <h1>أهلًا بصنّاع الحكاية.</h1>
        <p>سجّل الدخول إلى مساحة التحرير الخاصة بالفريق.</p>
        <label>
          البريد الإلكتروني
          <input
            dir="ltr"
            type="email"
            autoComplete="username"
            {...register("email")}
          />
          {errors.email && (
            <small className="red">{errors.email.message}</small>
          )}
        </label>
        <label>
          كلمة المرور
          <input
            dir="ltr"
            type="password"
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && (
            <small className="red">{errors.password.message}</small>
          )}
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button disabled={isSubmitting}>
          {isSubmitting ? "جارٍ الدخول…" : "دخول غرفة الأخبار"}
        </button>
        <small>الوصول متاح لأعضاء الفريق المعتمدين فقط.</small>
      </form>
    </div>
  );
}
function Overview() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api("/admin/dashboard"),
  });
  if (isLoading) return <Loading />;
  if (error) return <Failure message={error.message} />;
  return (
    <>
      <div className="stats-grid">
        {[
          ["إجمالي الأخبار", data.total],
          ["منشور", data.published],
          ["مسودات", data.drafts],
          ["قيد المراجعة", data.pending],
          ["القراءات الفعلية", data.views],
        ].map(([name, n]) => (
          <div className="stat" key={name}>
            <span>{name}</span>
            <strong>{Number(n).toLocaleString("ar-JO")}</strong>
          </div>
        ))}
      </div>
      <div className="admin-panel">
        <h2>الأخبار حسب القسم</h2>
        {data.categories.map((c: any) => (
          <div className="category-stat" key={c.category}>
            <span>{cats[c.category]}</span>
            <div>
              <i
                style={{
                  width: (data.total ? (c.count / data.total) * 100 : 0) + "%",
                }}
              />
            </div>
            <b>{c.count}</b>
          </div>
        ))}
      </div>
      <div className="admin-panel">
        <h2>النشاط التحريري الأخير</h2>
        {data.activity.map((a: any) => (
          <div className="activity" key={a._id}>
            <b>{a.actor?.name || "النظام"}</b>
            <code>{a.action}</code>
            <small>{date(a.createdAt)}</small>
          </div>
        ))}
        {!data.activity.length && (
          <p className="muted">لا يوجد نشاط متاح للعرض.</p>
        )}
      </div>
    </>
  );
}
function ArticleEditor({
  article,
  user,
  close,
}: {
  article?: Article;
  user: any;
  close: () => void;
}) {
  const qc = useQueryClient();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [history, setHistory] = useState<any>();
  const [scheduledAt, setScheduledAt] = useState("");
  const [note, setNote] = useState("");
  const { data: media = [] } = useQuery({
    queryKey: ["media"],
    queryFn: () => api("/admin/media"),
  });
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => api("/admin/users"),
    enabled: chief(user),
  });
  const [form, setForm] = useState({
    title: article?.title || "",
    slug: article?.slug || "",
    summary: article?.summary || "",
    body: article?.body || "<p></p>",
    category: article?.category || "politics",
    tags: article?.tags?.join("، ") || "",
    image: article?.image?._id || "",
    editor: article?.editor || "",
    proofreader: article?.proofreader || "",
    featured: article?.featured || false,
    breaking: article?.breaking || false,
    seoTitle: (article as any)?.seo?.title || "",
    seoDescription: (article as any)?.seo?.description || "",
    breakingUntil: article?.breakingUntil?.slice(0, 16) || "",
  });
  const canWrite =
    !article ||
    (canEdit(user, { ...article, author: article.author?._id }) &&
      !["approved", "published", "archived"].includes(article.status));
  const editor = useEditor({
    extensions: [StarterKit],
    content: form.body,
    editable: canWrite,
    onUpdate: ({ editor }) =>
      setForm((f) => ({ ...f, body: editor.getHTML() })),
  });
  const field = (key: string, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));
  async function save() {
    setBusy(true);
    setMessage("");
    try {
      const body: any = {
        title: form.title,
        slug: form.slug,
        summary: form.summary,
        body: form.body,
        category: form.category,
        tags: form.tags
          .split(/[،,]/)
          .map((s) => s.trim())
          .filter(Boolean),
        image: form.image || null,
        seo: { title: form.seoTitle, description: form.seoDescription },
      };
      if (isEditor(user, form.category)) {
        Object.assign(body, {
          editor: form.editor || null,
          proofreader: form.proofreader || null,
          featured: form.featured,
          breaking: form.breaking,
          breakingUntil: form.breakingUntil
            ? new Date(form.breakingUntil).toISOString()
            : null,
        });
      }
      await mutate(
        "/admin/articles" + (article ? "/" + article._id : ""),
        body,
        article ? "PATCH" : "POST",
      );
      qc.invalidateQueries();
      close();
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function transition(action: string) {
    setBusy(true);
    setMessage("");
    try {
      await mutate("/admin/articles/" + article!._id + "/" + action, {
        note,
        ...(action === "publish" && scheduledAt
          ? { scheduledAt: new Date(scheduledAt).toISOString() }
          : {}),
      });
      qc.invalidateQueries();
      close();
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  const authorId = article?.author?._id;
  return (
    <div className="editor-screen">
      <div className="admin-title">
        <div>
          <button className="text-button" onClick={close}>
            <ArrowRight size={16} />
            عودة للأخبار
          </button>
          <h2>{article ? "تحرير الخبر" : "حكاية جديدة"}</h2>
        </div>
        <div className="button-row">
          <button className="secondary" onClick={() => setPreview(!preview)}>
            <Eye size={16} />
            {preview ? "العودة للتحرير" : "معاينة"}
          </button>
          {canWrite && (
            <button disabled={busy} onClick={save}>
              <Save size={16} />
              حفظ المسودة
            </button>
          )}
        </div>
      </div>
      {message && (
        <div className="error" role="alert">
          {message}
        </div>
      )}
      {preview ? (
        <article className="preview admin-panel">
          <span className="notice">معاينة داخلية — لم يُنشر هذا المحتوى</span>
          <span className="category">{cats[form.category]}</span>
          <h1>{form.title}</h1>
          <p>{form.summary}</p>
          {form.image && (
            <img
              src={media.find((m: any) => m._id === form.image)?.url}
              alt={media.find((m: any) => m._id === form.image)?.alt || ""}
            />
          )}
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: form.body }}
          />
        </article>
      ) : (
        <div className="editor-grid">
          <div className="admin-panel">
            <label>
              عنوان الخبر
              <input
                value={form.title}
                disabled={!canWrite}
                onChange={(e) => field("title", e.target.value)}
                maxLength={240}
              />
            </label>
            <label>
              الرابط المختصر
              <input
                value={form.slug}
                disabled={!canWrite}
                onChange={(e) => field("slug", e.target.value)}
                placeholder="حكاية-من-الأردن"
              />
            </label>
            <label>
              ملخص الخبر
              <textarea
                value={form.summary}
                disabled={!canWrite}
                onChange={(e) => field("summary", e.target.value)}
                maxLength={600}
              />
            </label>
            <label>نص الخبر</label>
            <div className="editor-toolbar">
              {[
                [
                  Bold,
                  () => editor?.chain().focus().toggleBold().run(),
                  "عريض",
                ],
                [
                  Italic,
                  () => editor?.chain().focus().toggleItalic().run(),
                  "مائل",
                ],
                [
                  Heading2,
                  () =>
                    editor?.chain().focus().toggleHeading({ level: 2 }).run(),
                  "عنوان فرعي",
                ],
                [
                  List,
                  () => editor?.chain().focus().toggleBulletList().run(),
                  "قائمة",
                ],
                [
                  Quote,
                  () => editor?.chain().focus().toggleBlockquote().run(),
                  "اقتباس",
                ],
              ].map(([Icon, fn, label]: any) => (
                <button
                  key={label}
                  type="button"
                  className="icon-button"
                  aria-label={label}
                  disabled={!canWrite}
                  onClick={fn}
                >
                  <Icon size={17} />
                </button>
              ))}
            </div>
            <EditorContent editor={editor} />
          </div>
          <aside>
            <div className="admin-panel">
              <h3>تفاصيل النشر</h3>
              <p className="status">
                {article ? statusNames[article.status] : "مسودة جديدة"}
              </p>
              <label>
                القسم
                <select
                  value={form.category}
                  disabled={
                    !canWrite ||
                    (!!article && !isEditor(user, article.category))
                  }
                  onChange={(e) => field("category", e.target.value)}
                >
                  {Object.entries(cats).map(([s, n]) => (
                    <option key={s} value={s}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                الكلمات المفتاحية
                <input
                  value={form.tags}
                  disabled={!canWrite}
                  onChange={(e) => field("tags", e.target.value)}
                  placeholder="افصل بفاصلة"
                />
              </label>
              <label>
                عنوان محركات البحث (اختياري)
                <input
                  value={form.seoTitle}
                  disabled={!canWrite}
                  maxLength={240}
                  onChange={(e) => field("seoTitle", e.target.value)}
                />
              </label>
              <label>
                وصف محركات البحث (اختياري)
                <textarea
                  value={form.seoDescription}
                  disabled={!canWrite}
                  maxLength={600}
                  onChange={(e) => field("seoDescription", e.target.value)}
                />
              </label>
              <label>
                الصورة الرئيسية
                <select
                  value={form.image}
                  disabled={!canWrite}
                  onChange={(e) => field("image", e.target.value)}
                >
                  <option value="">بدون صورة</option>
                  {media.map((m: any) => (
                    <option value={m._id} key={m._id}>
                      {m.alt}
                    </option>
                  ))}
                </select>
              </label>
              {isEditor(user, form.category) && (
                <>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      disabled={!canWrite}
                      onChange={(e) => field("featured", e.target.checked)}
                    />
                    خبر رئيسي
                  </label>
                  {users.length > 0 && (
                    <>
                      <label>
                        المحرر المكلّف
                        <select
                          value={form.editor}
                          disabled={!canWrite}
                          onChange={(e) => field("editor", e.target.value)}
                        >
                          <option value="">غير معيّن</option>
                          {users
                            .filter((u: any) =>
                              u.roles.some((r: string) =>
                                [
                                  "super_admin",
                                  "editor_in_chief",
                                  "section_editor",
                                ].includes(r),
                              ),
                            )
                            .map((u: any) => (
                              <option key={u._id} value={u._id}>
                                {u.name}
                              </option>
                            ))}
                        </select>
                      </label>
                      <label>
                        المدقق المكلّف
                        <select
                          value={form.proofreader}
                          disabled={!canWrite}
                          onChange={(e) => field("proofreader", e.target.value)}
                        >
                          <option value="">غير معيّن</option>
                          {users
                            .filter((u: any) => u.roles.includes("proofreader"))
                            .map((u: any) => (
                              <option key={u._id} value={u._id}>
                                {u.name}
                              </option>
                            ))}
                        </select>
                      </label>
                    </>
                  )}
                  {article &&
                    ["approved", "published"].includes(article.status) && (
                      <>
                        <label className="checkbox">
                          <input
                            type="checkbox"
                            checked={form.breaking}
                            onChange={(e) =>
                              field("breaking", e.target.checked)
                            }
                          />
                          خبر عاجل
                        </label>
                        <label>
                          انتهاء ظهور العاجل
                          <input
                            type="datetime-local"
                            value={form.breakingUntil}
                            onChange={(e) =>
                              field("breakingUntil", e.target.value)
                            }
                          />
                        </label>
                        <button
                          className="secondary"
                          onClick={async () => {
                            try {
                              await mutate(
                                "/admin/breaking/" + article._id,
                                {
                                  breaking: form.breaking,
                                  breakingUntil: form.breakingUntil
                                    ? new Date(form.breakingUntil).toISOString()
                                    : null,
                                },
                                "PATCH",
                              );
                              qc.invalidateQueries();
                              setMessage("تم تحديث إعدادات العاجل");
                            } catch (e: any) {
                              setMessage(e.message);
                            }
                          }}
                        >
                          تحديث العاجل
                        </button>
                      </>
                    )}
                </>
              )}
            </div>
            {article && (
              <div className="admin-panel">
                <h3>مسار التحرير</h3>
                <label>
                  ملاحظة المراجعة
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={2000}
                  />
                </label>
                {article.status === "approved" &&
                  isEditor(user, article.category) && (
                    <label>
                      جدولة النشر (اختياري)
                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                      />
                    </label>
                  )}
                {article.scheduledAt && (
                  <p>
                    موعد النشر:{" "}
                    {new Date(article.scheduledAt).toLocaleString("ar-JO")}
                  </p>
                )}
                <div className="workflow-buttons">
                  {[
                    ["submit", "submitted", "إرسال للمراجعة"],
                    ["edit", "editing", "بدء التحرير / طلب تعديلات"],
                    ["proofread", "proofreading", "إرسال للتدقيق"],
                    ["approve", "approved", "اعتماد الخبر"],
                    [
                      "publish",
                      "published",
                      scheduledAt ? "جدولة النشر" : "نشر الخبر",
                    ],
                    ["unpublish", "draft", "إعادة إلى المسودة"],
                    ["archive", "archived", "أرشفة"],
                  ]
                    .filter(([, next]) =>
                      canTransition(
                        user,
                        { ...article, author: authorId },
                        next,
                      ),
                    )
                    .map(([action, , label]) => (
                      <button
                        key={action}
                        disabled={busy}
                        onClick={() => transition(action)}
                      >
                        {label}
                      </button>
                    ))}
                </div>
                <button
                  className="text-button"
                  onClick={async () => {
                    try {
                      setHistory(await api("/admin/history/" + article._id));
                    } catch (e: any) {
                      setMessage(e.message);
                    }
                  }}
                >
                  عرض سجل المراجعات
                </button>
                {history && (
                  <div className="history">
                    {history.reviews.map((r: any) => (
                      <p key={r._id}>
                        <b>{r.actor?.name}</b> {statusNames[r.from]} ←{" "}
                        {statusNames[r.to] || r.to}
                        <br />
                        {r.note}
                        <small>{date(r.createdAt)}</small>
                      </p>
                    ))}
                    <h4>النسخ السابقة ({history.revisions.length})</h4>
                    {history.revisions.map((r: any) => (
                      <details key={r._id}>
                        <summary>
                          {date(r.createdAt)} — {r.actor?.name}
                        </summary>
                        <h4>{r.snapshot.title}</h4>
                        <p>{r.snapshot.summary}</p>
                        <div
                          dangerouslySetInnerHTML={{ __html: r.snapshot.body }}
                        />
                      </details>
                    ))}
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
function Articles({ user }: { user: any }) {
  const {
    data = [],
    isLoading,
    error,
  } = useQuery<Article[]>({
    queryKey: ["admin-articles"],
    queryFn: () => api("/admin/articles"),
  });
  const [editing, setEditing] = useState<Article | null | undefined>();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  if (editing !== undefined)
    return (
      <ArticleEditor
        key={editing?._id || "new"}
        user={user}
        article={editing || undefined}
        close={() => setEditing(undefined)}
      />
    );
  return (
    <>
      <div className="admin-title">
        <h2>
          الأخبار <span className="count">{data.length}</span>
        </h2>
        {user.roles.some((r: string) =>
          [
            "writer",
            "super_admin",
            "editor_in_chief",
            "section_editor",
          ].includes(r),
        ) && (
          <button onClick={() => setEditing(null)}>
            <Plus size={17} />
            خبر جديد
          </button>
        )}
      </div>
      <div className="search-filters">
        <input
          aria-label="البحث في أخبار غرفة التحرير"
          placeholder="ابحث في الأخبار…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          aria-label="تصفية حسب الحالة"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">كل الحالات</option>
          {Object.entries(statusNames).map(([s, n]) => (
            <option key={s} value={s}>
              {n}
            </option>
          ))}
        </select>
      </div>
      {isLoading ? (
        <Loading />
      ) : error ? (
        <Failure message={error.message} />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>الخبر</th>
                <th>القسم</th>
                <th>الحالة</th>
                <th>الكاتب</th>
                <th>آخر تعديل</th>
                <th>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {data
                .filter(
                  (a) =>
                    a.title.includes(q) && (!status || a.status === status),
                )
                .map((a) => (
                  <tr key={a._id}>
                    <td>
                      <b>{a.title}</b>
                      {a.scheduledAt && <small>مجدول للنشر</small>}
                    </td>
                    <td>{cats[a.category]}</td>
                    <td>
                      <span className={"status " + a.status}>
                        {statusNames[a.status]}
                      </span>
                    </td>
                    <td>{a.author?.name}</td>
                    <td>{date(a.updatedAt)}</td>
                    <td>
                      <button
                        className="secondary"
                        onClick={() => setEditing(a)}
                      >
                        فتح الخبر
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {!data.length && (
            <div className="empty">لا توجد أخبار بعد. ابدأ بإنشاء مسودة.</div>
          )}
        </div>
      )}
    </>
  );
}
function Media() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["media", q],
    queryFn: () => api("/admin/media?q=" + encodeURIComponent(q)),
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<any>();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    try {
      const d = new FormData(form);
      if (editing) {
        await mutate(
          "/admin/media/" + editing._id,
          {
            alt: d.get("alt"),
            caption: d.get("caption"),
            credit: d.get("credit"),
          },
          "PATCH",
        );
      } else await mutate("/admin/media", d);
      qc.invalidateQueries({ queryKey: ["media"] });
      form.reset();
      setEditing(undefined);
      setMessage("تم حفظ الصورة وبياناتها");
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <h2>مكتبة الوسائط</h2>
      <form
        className="admin-panel media-form"
        onSubmit={submit}
        key={editing?._id || "upload"}
      >
        <h3>{editing ? "تعديل بيانات الصورة" : "رفع صورة جديدة"}</h3>
        {!editing && (
          <label>
            الصورة (JPEG / PNG / WebP، حتى 8 ميغابايت)
            <input
              type="file"
              name="file"
              accept="image/jpeg,image/png,image/webp"
              required
            />
          </label>
        )}
        <label>
          النص البديل
          <input
            name="alt"
            defaultValue={editing?.alt}
            required
            minLength={3}
          />
        </label>
        <label>
          وصف الصورة
          <input name="caption" defaultValue={editing?.caption} />
        </label>
        <label>
          الحقوق / المصوّر
          <input
            name="credit"
            defaultValue={editing?.credit}
            required
            minLength={2}
          />
        </label>
        <div className="button-row">
          <button disabled={busy}>{busy ? "جارٍ الحفظ…" : "حفظ الصورة"}</button>
          {editing && (
            <button
              type="button"
              className="secondary"
              onClick={() => setEditing(undefined)}
            >
              إلغاء
            </button>
          )}
        </div>
        <p role="status">{message}</p>
      </form>
      <input
        aria-label="بحث في الصور"
        placeholder="ابحث بالنص البديل…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {isLoading ? (
        <Loading />
      ) : error ? (
        <Failure message={error.message} />
      ) : (
        <div className="media-library">
          {data.map((m: any) => (
            <div key={m._id}>
              <img src={m.url} alt={m.alt} loading="lazy" />
              <b>{m.alt}</b>
              <p>{m.caption}</p>
              <small>{m.credit}</small>
              <button className="text-button" onClick={() => setEditing(m)}>
                تعديل البيانات
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
const roleNames: Record<string, string> = {
  super_admin: "مدير النظام",
  editor_in_chief: "رئيس التحرير",
  section_editor: "محرر قسم",
  writer: "صحفي / كاتب",
  proofreader: "مدقق لغوي",
  photographer: "مصوّر",
};
function UserRow({ u, current }: { u: any; current: any }) {
  const qc = useQueryClient();
  const [v, setV] = useState(u);
  const [msg, setMsg] = useState("");
  return (
    <div className="admin-panel">
      <b>{u.name}</b>
      <p dir="ltr">{u.email}</p>
      <div className="role-options">
        {roles.map((r) => (
          <label className="checkbox" key={r}>
            <input
              type="checkbox"
              checked={v.roles.includes(r)}
              onChange={(e) =>
                setV({
                  ...v,
                  roles: e.target.checked
                    ? [...v.roles, r]
                    : v.roles.filter((x: string) => x !== r),
                })
              }
            />
            {roleNames[r]}
          </label>
        ))}
      </div>
      <div className="role-options">
        {Object.entries(cats).map(([s, n]) => (
          <label className="checkbox" key={s}>
            <input
              type="checkbox"
              checked={v.sections.includes(s)}
              onChange={(e) =>
                setV({
                  ...v,
                  sections: e.target.checked
                    ? [...v.sections, s]
                    : v.sections.filter((x: string) => x !== s),
                })
              }
            />
            {n}
          </label>
        ))}
      </div>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={v.active}
          onChange={(e) => setV({ ...v, active: e.target.checked })}
        />
        حساب نشط
      </label>
      <button
        disabled={current._id === u._id}
        onClick={async () => {
          try {
            await mutate(
              "/admin/users/" + u._id,
              { roles: v.roles, sections: v.sections, active: v.active },
              "PATCH",
            );
            qc.invalidateQueries();
            setMsg("تم الحفظ");
          } catch (e: any) {
            setMsg(e.message);
          }
        }}
      >
        حفظ الصلاحيات
      </button>
      <span role="status">{msg}</span>
    </div>
  );
}
function UsersPanel({ user }: { user: any }) {
  const qc = useQueryClient();
  const { data = [], error } = useQuery({
    queryKey: ["users"],
    queryFn: () => api("/admin/users"),
  });
  const [msg, setMsg] = useState("");
  return (
    <>
      <h2>أعضاء غرفة الأخبار</h2>
      {user.roles.includes("super_admin") && (
        <form
          className="admin-panel"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = e.currentTarget;
            const d = new FormData(f);
            try {
              await mutate("/admin/users", {
                name: d.get("name"),
                email: d.get("email"),
                password: d.get("password"),
                roles: d.getAll("roles"),
                sections: d.getAll("sections"),
              });
              qc.invalidateQueries();
              f.reset();
              setMsg("تم إنشاء الحساب");
            } catch (e: any) {
              setMsg(e.message);
            }
          }}
        >
          <h3>إضافة عضو</h3>
          <label>
            الاسم
            <input name="name" required minLength={2} />
          </label>
          <label>
            البريد
            <input type="email" name="email" required />
          </label>
          <label>
            كلمة مرور أولية (12 حرفًا على الأقل)
            <input
              type="password"
              name="password"
              minLength={12}
              required
              autoComplete="new-password"
            />
          </label>
          <div className="role-options">
            {roles.map((r) => (
              <label className="checkbox" key={r}>
                <input type="checkbox" name="roles" value={r} />
                {roleNames[r]}
              </label>
            ))}
          </div>
          <div className="role-options">
            {Object.entries(cats).map(([s, n]) => (
              <label className="checkbox" key={s}>
                <input type="checkbox" name="sections" value={s} />
                {n}
              </label>
            ))}
          </div>
          <button>إنشاء الحساب</button>
          <p role="status">{msg}</p>
        </form>
      )}
      {error && <Failure message={error.message} />}
      <div>
        {data.map((u: any) =>
          user.roles.includes("super_admin") ? (
            <UserRow key={u._id} u={u} current={user} />
          ) : (
            <div className="admin-panel" key={u._id}>
              {u.name} — {u.roles.map((r: string) => roleNames[r]).join("، ")}
            </div>
          ),
        )}
      </div>
    </>
  );
}
function SettingsPanel() {
  const qc = useQueryClient();
  const { data, error } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api("/settings"),
  });
  const [msg, setMsg] = useState("");
  if (error) return <Failure message={error.message} />;
  if (!data) return <Loading />;
  return (
    <form
      className="admin-panel"
      onSubmit={async (e) => {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        try {
          const socials = String(d.get("socials"))
            .split("\n")
            .filter(Boolean)
            .map((line) => {
              const [label, ...url] = line.split("|");
              return { label: label.trim(), url: url.join("|").trim() };
            });
          await mutate(
            "/admin/settings",
            {
              contactEmail: d.get("email"),
              breakingEnabled: d.get("breaking") === "on",
              socials,
            },
            "PATCH",
          );
          qc.invalidateQueries();
          setMsg("تم حفظ الإعدادات");
        } catch (e: any) {
          setMsg(e.message);
        }
      }}
    >
      <h2>إعدادات المنصة</h2>
      <label>
        البريد الرسمي للتواصل
        <input
          type="email"
          name="email"
          defaultValue={data.contactEmail || ""}
        />
      </label>
      <label>
        روابط التواصل (اسم | رابط HTTPS، كل حساب في سطر)
        <textarea
          name="socials"
          defaultValue={data.socials
            ?.map((s: any) => s.label + " | " + s.url)
            .join("\n")}
        />
      </label>
      <label className="checkbox">
        <input
          type="checkbox"
          name="breaking"
          defaultChecked={data.breakingEnabled !== false}
        />
        إظهار شريط الأخبار العاجلة
      </label>
      <button>حفظ الإعدادات</button>
      <p role="status">{msg}</p>
    </form>
  );
}
export default function Admin() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["me"],
    queryFn: () => api("/auth/me"),
    retry: false,
  });
  const [tab, setTab] = useState("articles");
  if (isLoading) return <Loading />;
  if (error) return <Failure message={error.message} />;
  const user = data?.user;
  if (!user)
    return <Login onLogin={() => qc.invalidateQueries({ queryKey: ["me"] })} />;
  const manager = chief(user) || user.roles.includes("section_editor");
  return (
    <div className="container admin-layout">
      <aside className="admin-sidebar">
        <span className="eyebrow">غرفة الأخبار</span>
        <h2>مرحبًا، {user.name.split(" ")[0]}</h2>
        <small>{user.roles.map((r: string) => roleNames[r]).join("، ")}</small>
        {[
          [LayoutDashboard, "overview", "نظرة عامة", manager],
          [FileText, "articles", "إدارة الأخبار", true],
          [Image, "media", "مكتبة الوسائط", true],
          [Users, "users", "الفريق والصلاحيات", chief(user)],
          [Settings, "settings", "إعدادات المنصة", chief(user)],
        ]
          .filter((x) => x[3])
          .map(([Icon, key, label]: any) => (
            <button
              key={key}
              className={tab === key ? "selected" : ""}
              onClick={() => setTab(key)}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        <button
          onClick={async () => {
            await mutate("/auth/logout");
            qc.clear();
          }}
        >
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </aside>
      <section className="admin-content">
        <div className="admin-welcome">
          <span>
            لوحة التحرير /{" "}
            {tab === "articles"
              ? "الأخبار"
              : tab === "media"
                ? "الوسائط"
                : tab === "overview"
                  ? "نظرة عامة"
                  : tab === "users"
                    ? "الفريق"
                    : "الإعدادات"}
          </span>
          <span className="green-dot" />
          مساحة آمنة للفريق
        </div>
        {tab === "overview" ? (
          <Overview />
        ) : tab === "articles" ? (
          <Articles user={user} />
        ) : tab === "media" ? (
          <Media />
        ) : tab === "users" ? (
          <UsersPanel user={user} />
        ) : (
          <SettingsPanel />
        )}
      </section>
    </div>
  );
}
