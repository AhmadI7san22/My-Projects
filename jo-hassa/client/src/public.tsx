import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpLeft,
  Clock,
  Link as LinkIcon,
  Share2,
  Search,
  ChevronLeft,
  Check,
  Eye,
  Camera,
  ArrowRight,
} from "lucide-react";
import { api, mutate, cats, date, Article } from "./api";
import { Card, ArtImage, Loading, Failure } from "./main";
function Meta({ title, description }: { title: string; description?: string }) {
  useEffect(() => {
    document.title = title + " | Jo هسّا";
    const el = document.querySelector('meta[name="description"]');
    if (el)
      el.setAttribute(
        "content",
        description || "من الأردن نرصد الحدث، وبعيون الشباب نروي الحكاية.",
      );
  }, [title, description]);
  return null;
}
const queryArticles = (s = "") => ({
  queryKey: ["articles", s],
  queryFn: () => api("/articles?" + s),
});
function Empty({ text = "لا توجد أخبار منشورة بعد" }: { text?: string }) {
  return (
    <div className="empty">
      <Search />
      <h3>{text}</h3>
      <p>تُعرض هنا الأخبار التي يعتمدها فريق التحرير.</p>
      <Link to="/">العودة للرئيسية ←</Link>
    </div>
  );
}
function Section({ category }: { category: string }) {
  const { data } = useQuery(queryArticles("category=" + category + "&limit=3"));
  return (
    <section className="news-section">
      <div className="section-title">
        <h2>
          <i className={category} />
          آخر الأخبار{" "}
          {category === "politics"
            ? "السياسية"
            : category === "economy"
              ? "الاقتصادية"
              : "الرياضية"}
        </h2>
        <Link to={"/category/" + category}>
          كل الأخبار <ArrowLeft size={17} />
        </Link>
      </div>
      <div className="cards-three">
        {data?.items?.map((a: Article) => (
          <Card a={a} key={a._id} />
        ))}
      </div>
      {data && !data.items.length && <Empty />}
    </section>
  );
}
function Home() {
  const { data, isLoading, error } = useQuery(queryArticles("limit=12"));
  const { data: popular } = useQuery(queryArticles("sort=popular&limit=5"));
  const { data: trending } = useQuery(queryArticles("sort=trending&limit=4"));
  if (isLoading) return <Loading />;
  if (error) return <Failure message={error.message} />;
  const articles: Article[] = data.items;
  const lead = articles.find((a) => a.featured) || articles[0];
  return (
    <div className="container home">
      <Meta title="الرئيسية — هسّا تعرف... وهسّا تفهم" />
      <div className="edition-line">
        <span>
          <i className="green-dot" />
          الأردن في قلب الخبر
        </span>
        <span>السياسة، الاقتصاد، الرياضة… وما وراء العنوان.</span>
      </div>
      {lead ? (
        <>
          <section className="hero-grid">
            <Link to={"/news/" + lead.slug} className="lead-story">
              <ArtImage a={lead} />
              <div className="lead-shade" />
              <div className="lead-copy">
                <span className="lead-label">
                  تحت المجهر <ArrowUpLeft size={14} />
                </span>
                <div>
                  <span className="light-category">{cats[lead.category]}</span>
                  {lead.demo && (
                    <span className="lead-demo">
                      محتوى تجريبي — لأغراض العرض فقط
                    </span>
                  )}
                </div>
                <h1>{lead.title}</h1>
                <p>{lead.summary}</p>
                <span className="meta">
                  <Clock size={14} />
                  {date(lead.publishedAt)}
                  <span>•</span>
                  {lead.author?.name}
                </span>
              </div>
              <span className="lead-arrow">
                <ArrowUpLeft size={25} />
              </span>
            </Link>
            <div className="hero-side">
              {articles
                .filter((a) => a._id !== lead._id)
                .slice(0, 2)
                .map((a) => (
                  <Link
                    to={"/news/" + a.slug}
                    key={a._id}
                    className="side-story"
                  >
                    <ArtImage a={a} />
                    <div className="side-story-copy">
                      <span className={"category " + a.category}>
                        {cats[a.category]}
                      </span>
                      {a.demo && (
                        <span className="demo-mini">محتوى تجريبي</span>
                      )}
                      <h2>{a.title}</h2>
                      <span className="meta">
                        <Clock size={13} />
                        {date(a.publishedAt)}
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
          <div className="editorial-strip">
            <span className="outline-star">✳</span>
            <div>
              <b>الخبر بداية الحكاية.</b>
              <p>نقرأ ما وراء العنوان، ونضع المعلومة بين يديك.</p>
            </div>
            <Link to="/about">
              تعرّف على رؤيتنا <ArrowUpLeft size={19} />
            </Link>
          </div>
          <div className="content-with-sidebar">
            <div>
              <div className="section-title">
                <h2>
                  <i />
                  آخر الأخبار
                </h2>
                <Link to="/search">
                  جميع الأخبار <ArrowLeft size={17} />
                </Link>
              </div>
              <div className="latest-list">
                {articles.slice(1, 5).map((a) => (
                  <Card a={a} compact key={a._id} />
                ))}
              </div>
            </div>
            <aside>
              <div className="section-title">
                <h2>
                  <i className="green" />
                  الأكثر قراءة
                </h2>
                <Eye size={18} />
              </div>
              <div className="ranked">
                {popular?.items
                  ?.filter((a: Article) => a.views > 0)
                  .map((a: Article, i: number) => (
                    <Link to={"/news/" + a.slug} key={a._id}>
                      <span className="rank">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <span className={"category " + a.category}>
                          {cats[a.category]}
                        </span>
                        <h3>{a.title}</h3>
                        <small>{a.views.toLocaleString("ar-JO")} قراءة</small>
                      </div>
                    </Link>
                  ))}
                {!popular?.items?.some((a: Article) => a.views > 0) && (
                  <p className="muted">
                    تظهر الأخبار هنا بعد تسجيل قراءات فعلية.
                  </p>
                )}
              </div>
              <div className="voice-card">
                <span>مساحة إعلامية شبابية</span>
                <h3>
                  حكايتنا تبدأ
                  <br />
                  من هون.
                </h3>
                <p>
                  ستة أصوات، شغف واحد.
                  <br />
                  تعرّف على الوجوه وراء الخبر.
                </p>
                <Link to="/team">
                  فريق Jo هسّا <ArrowUpLeft size={19} />
                </Link>
              </div>
            </aside>
          </div>
          {["politics", "economy", "sports"].map((c) => (
            <Section key={c} category={c} />
          ))}
          {trending?.items?.length > 0 && (
            <section className="news-section">
              <div className="section-title">
                <h2>
                  <i />
                  الأكثر تداولًا هذا الأسبوع
                </h2>
                <span className="muted">حسب القراءات الفعلية خلال ٧ أيام</span>
              </div>
              <div className="cards-three">
                {trending.items.slice(0, 3).map((a: Article) => (
                  <Card key={a._id} a={a} />
                ))}
              </div>
            </section>
          )}
          <section className="multimedia">
            <div className="section-title">
              <h2>
                <Camera />
                بعدسة Jo هسّا
              </h2>
              <span>للصورة حكاية</span>
            </div>
            <div className="media-grid">
              {articles
                .filter((a) => a.image)
                .slice(0, 3)
                .map((a) => (
                  <Link to={"/news/" + a.slug} key={a._id}>
                    <ArtImage a={a} />
                    <h3>{a.image?.caption || a.title}</h3>
                    <span>{a.image?.credit}</span>
                  </Link>
                ))}
            </div>
            {!articles.some((a) => a.image) && (
              <p>
                تظهر هنا الصور الأصلية التي ينشرها فريق التحرير، مع أسماء
                أصحابها.
              </p>
            )}
          </section>
        </>
      ) : (
        <Empty />
      )}
    </div>
  );
}
function Category() {
  const { slug = "" } = useParams();
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [slug]);
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api("/categories"),
  });
  const { data, isLoading, error } = useQuery(
    queryArticles("category=" + slug + "&page=" + page),
  );
  if (!cats[slug]) return <NotFound />;
  return (
    <div className="container page">
      <Meta title={cats[slug]} />
      <div className="page-heading">
        <span className="eyebrow">من زوايا الخبر</span>
        <h1>{cats[slug]}</h1>
        <p>
          مسؤولية التحرير:{" "}
          {categories?.find((c: any) => c.slug === slug)?.responsibility}
        </p>
      </div>
      {isLoading ? (
        <Loading />
      ) : error ? (
        <Failure message={error.message} />
      ) : (
        <>
          <div className="cards-three">
            {data.items.map((a: Article) => (
              <Card key={a._id} a={a} />
            ))}
          </div>
          {!data.items.length && <Empty />}
          <Pagination page={page} pages={data.pages} setPage={setPage} />
        </>
      )}
    </div>
  );
}
function Pagination({
  page,
  pages,
  setPage,
}: {
  page: number;
  pages: number;
  setPage: (p: number) => void;
}) {
  if (pages < 2) return null;
  return (
    <div className="pagination">
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>
        السابق
      </button>
      <span>
        {page} / {pages}
      </span>
      <button disabled={page >= pages} onClick={() => setPage(page + 1)}>
        التالي
      </button>
    </div>
  );
}
function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [page, setPage] = useState(1);
  const qs = new URLSearchParams(params);
  qs.set("page", String(page));
  const { data, isLoading, error } = useQuery({
    queryKey: ["search", qs.toString()],
    queryFn: () => api("/search?" + qs),
  });
  function change(k: string, v: string) {
    setPage(1);
    const next = new URLSearchParams(params);
    v ? next.set(k, v) : next.delete(k);
    setParams(next);
  }
  return (
    <div className="container page">
      <Meta title="البحث في الأخبار" />
      <div className="page-heading">
        <span className="eyebrow">ابحث. اقرأ. افهم.</span>
        <h1>أيّ حكاية تبحث عنها؟</h1>
      </div>
      <form
        className="search-bar"
        onSubmit={(e) => {
          e.preventDefault();
          change("q", q);
        }}
      >
        <Search />
        <input
          aria-label="كلمات البحث"
          placeholder="ابحث بالعنوان، الكاتب، أو الكلمات المفتاحية…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button>بحث</button>
      </form>
      <div className="search-filters">
        <select
          aria-label="تصنيف الأخبار"
          value={params.get("category") || ""}
          onChange={(e) => change("category", e.target.value)}
        >
          <option value="">جميع الأقسام</option>
          {Object.entries(cats).map(([s, n]) => (
            <option value={s} key={s}>
              {n}
            </option>
          ))}
        </select>
        <select
          aria-label="ترتيب النتائج"
          value={params.get("sort") || "newest"}
          onChange={(e) => change("sort", e.target.value)}
        >
          <option value="newest">الأحدث أولًا</option>
          <option value="relevance">الأكثر صلة</option>
          <option value="popular">الأكثر قراءة</option>
        </select>
        <label>
          من تاريخ{" "}
          <input
            type="date"
            value={params.get("from") || ""}
            onChange={(e) => change("from", e.target.value)}
          />
        </label>
        <span className="muted">{data?.total ?? "…"} نتيجة</span>
      </div>
      {isLoading ? (
        <Loading />
      ) : error ? (
        <Failure message={error.message} />
      ) : (
        <>
          <div className="cards-three">
            {data.items.map((a: Article) => (
              <Card a={a} key={a._id} />
            ))}
          </div>
          {!data.items.length && <Empty text="لم نعثر على نتائج مطابقة" />}
          <Pagination page={page} pages={data.pages} setPage={setPage} />
        </>
      )}
    </div>
  );
}
function ArticlePage() {
  const { slug } = useParams();
  const {
    data: a,
    isLoading,
    error,
  } = useQuery<Article>({
    queryKey: ["article", slug],
    queryFn: () => api("/articles/" + slug),
  });
  const [copied, setCopied] = useState(false);
  const { data: related } = useQuery({
    ...queryArticles("category=" + a?.category + "&limit=4"),
    enabled: !!a,
  });
  useEffect(() => {
    if (a) mutate("/articles/" + slug + "/view").catch(() => {});
  }, [slug, a?._id]);
  if (isLoading) return <Loading />;
  if (error || !a)
    return <Failure message={error?.message || "الخبر غير موجود"} />;
  return (
    <div className="container page article-page">
      <Meta title={a.title} description={a.summary} />
      <nav className="breadcrumbs" aria-label="مسار التصفح">
        <Link to="/">الرئيسية</Link>
        <ChevronLeft size={13} />
        <Link to={"/category/" + a.category}>{cats[a.category]}</Link>
        <ChevronLeft size={13} />
        <span>تفاصيل الخبر</span>
      </nav>
      <header className="article-heading">
        <span className={"category " + a.category}>{cats[a.category]}</span>
        {a.demo && (
          <div className="demo-banner">
            محتوى تجريبي — لأغراض العرض فقط. لا يمثّل هذا الخبر حدثًا حقيقيًا.
          </div>
        )}
        <h1>{a.title}</h1>
        <p>{a.summary}</p>
        <div className="article-byline">
          <div className="avatar">{a.author?.name?.charAt(0)}</div>
          <div>
            <b>{a.author?.name}</b>
            <span className="meta">
              {date(a.publishedAt)} •{" "}
              {Math.max(
                1,
                Math.ceil(
                  a.body.replace(/<[^>]*>/g, "").split(/\s+/).length / 200,
                ),
              )}{" "}
              دقائق قراءة
            </span>
            {new Date(a.updatedAt).getTime() -
              new Date(a.publishedAt).getTime() >
              60000 && <small>آخر تحديث: {date(a.updatedAt)}</small>}
          </div>
          <div className="share-buttons">
            <button
              aria-label="نسخ رابط الخبر"
              onClick={async () => {
                await navigator.clipboard.writeText(location.href);
                setCopied(true);
              }}
            >
              {copied ? <Check size={18} /> : <LinkIcon size={18} />}{" "}
              {copied ? "تم النسخ" : "نسخ الرابط"}
            </button>
            <button
              aria-label="مشاركة الخبر"
              onClick={() =>
                navigator.share
                  ? navigator
                      .share({ title: a.title, url: location.href })
                      .catch(() => {})
                  : window.open(
                      "https://wa.me/?text=" +
                        encodeURIComponent(a.title + " " + location.href),
                      "_blank",
                      "noopener,noreferrer",
                    )
              }
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </header>
      <figure className="article-figure">
        <ArtImage a={a} />
        {a.image && (
          <figcaption>
            {a.image.caption} — {a.image.credit}
          </figcaption>
        )}
      </figure>
      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: a.body }}
      />
      <div className="article-tags">
        {a.tags.map((t) => (
          <Link key={t} to={"/search?q=" + encodeURIComponent(t)}>
            #{t}
          </Link>
        ))}
      </div>
      <section className="news-section">
        <div className="section-title">
          <h2>
            <i />
            اقرأ أيضًا
          </h2>
        </div>
        <div className="cards-three">
          {related?.items
            ?.filter((r: Article) => r._id !== a._id)
            .slice(0, 3)
            .map((r: Article) => (
              <Card key={r._id} a={r} />
            ))}
        </div>
      </section>
    </div>
  );
}
const team = [
  [
    "لينا أبو شقير",
    "السياسة",
    "الأخبار السياسية • تصميم الموقع • تصميم الشعار الرسمي",
  ],
  [
    "بديعة جابر",
    "الاقتصاد",
    "الأخبار الاقتصادية • كتابة الأخبار • تصميم الموقع",
  ],
  ["محمد الفايز", "الاقتصاد", "الأخبار الاقتصادية • التدقيق اللغوي • التصوير"],
  [
    "ميادة عبدالله",
    "الرياضة",
    "الأخبار الرياضية • التحرير وإعادة الصياغة • التصوير",
  ],
  ["محمد عبادي", "الرياضة", "الأخبار الرياضية • التحرير وإعادة الصياغة"],
  ["بدر بصال", "السياسة والاقتصاد", "الأخبار السياسية والاقتصادية • كتابة الخبر • التدقيق اللغوي • التصوير"],
];
function Team() {
  return (
    <div className="container page">
      <Meta title="فريق Jo هسّا" />
      <div className="page-heading">
        <span className="eyebrow">وراء كل خبر، إنسان.</span>
        <h1>
          فريق Jo <em>هسّا</em>
        </h1>
        <p>أصوات شبابية يجمعها الشغف بالحقيقة وفنّ رواية الحكاية.</p>
      </div>
      <div className="team-grid">
        {team.map(([name, section, desc], i) => (
          <article className="team-card" key={name}>
            <div className="team-initial">
              {name.charAt(0)}
              <span>0{i + 1}</span>
            </div>
            <span className="eyebrow">{section}</span>
            <h2>{name}</h2>
            <p>{desc}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
function About() {
  return (
    <div className="container page about-page">
      <Meta title="من نحن" />
      <div className="about-hero">
        <div>
          <span className="eyebrow">صحافة بروح الشباب</span>
          <h1>
            من هون،
            <br />
            نروي <em>الحكاية.</em>
          </h1>
          <p>هسّا تعرف... وهسّا تفهم</p>
        </div>
        <img
          src="/logo.jpg"
          alt="الشعار الرسمي لمنصة Jo هسّا"
          width="350"
          height="350"
        />
      </div>
      <section className="about-intro">
        <h2>من نحن</h2>
        <div>
          <p>
            في عالمٍ تتسارع فيه الأحداث وتتزاحم فيه الأخبار، وُلدت فكرة «Jo
            هسّا» لتكون مساحة إعلامية شبابية تنبض بالحياة، وتواكب الحدث لحظة
            بلحظة، وتقدّم المعلومة بروح عصرية ورؤية مختلفة.
          </p>
          <p>
            نحن منصة إخبارية رقمية أردنية، انطلقت من شغف مجموعة من طلبة الصحافة
            والإعلام الرقمي، جمعهم الإيمان بأن الصحافة ليست مجرد نقلٍ للأحداث،
            بل مسؤولية في البحث عن الحقيقة، وفنّ في رواية الحكاية.
          </p>
          <p>
            نفتح نوافذنا على السياسة والاقتصاد والرياضة، لنقدّم محتوى إخباريًا
            متنوعًا يجمع بين الدقة والوضوح والإبداع.
          </p>
        </div>
      </section>
      <div className="mission-grid">
        <section>
          <span>01 /</span>
          <h2>رؤيتنا</h2>
          <p>
            أن نكون صوتًا إعلاميًا شبابيًا أردنيًا متميزًا في فضاء الصحافة
            الرقمية، ووجهة موثوقة لكل من يبحث عن الحقيقة والمعرفة، من خلال صناعة
            محتوى إخباري يواكب سرعة العصر دون أن يتنازل عن عمق المعلومة
            ومصداقيتها.
          </p>
        </section>
        <section>
          <span>02 /</span>
          <h2>رسالتنا</h2>
          <p>
            نؤمن بأن الخبر ليس مجرد عنوان عابر، بل رسالة تحمل الحقيقة وتُسهم في
            تشكيل الوعي.
          </p>
          <p>
            نسعى إلى تقديم صحافة رقمية مسؤولة، تنقل الأحداث السياسية والاقتصادية
            والرياضية بمهنية وموضوعية، وتوظّف أدوات الإعلام الحديث في إنتاج
            محتوى بصري وتحريري جذاب.
          </p>
        </section>
      </div>
      <section className="goals">
        <div className="section-title">
          <h2>
            <i />
            أهدافنا
          </h2>
        </div>
        <div className="goals-grid">
          {[
            "تعزيز المصداقية والدقة الصحفية.",
            "تقديم تغطية سياسية واقتصادية ورياضية متنوعة.",
            "توظيف أدوات الإعلام الرقمي الحديثة.",
            "دعم الإبداع والطاقات الإعلامية الشبابية.",
            "المساهمة في رفع الوعي المجتمعي.",
            "توفير تجربة إخبارية رقمية سهلة ومتطورة.",
          ].map((t, i) => (
            <div key={t}>
              <span>0{i + 1}</span>
              <h3>{t}</h3>
            </div>
          ))}
        </div>
        <Link className="button" to="/team">
          تعرّف على فريقنا <ArrowLeft size={18} />
        </Link>
      </section>
    </div>
  );
}
function Contact() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api("/settings"),
  });
  return (
    <div className="container page contact-page">
      <Meta title="تواصل معنا" />
      <span className="eyebrow">الحوار أول الحكاية</span>
      <h1>نسمعك. ونحكي معك.</h1>
      <p>للتواصل مع فريق التحرير، تقديم اقتراح أو طلب تصحيح.</p>
      {isLoading ? (
        <Loading />
      ) : error ? (
        <Failure message={error.message} />
      ) : data?.contactEmail ? (
        <a className="button" href={"mailto:" + data.contactEmail}>
          {data.contactEmail}
          <ArrowUpLeft />
        </a>
      ) : (
        <div className="notice">
          لم يضف فريق التحرير معلومات التواصل بعد. ستظهر القنوات الرسمية هنا عند
          اعتمادها.
        </div>
      )}
      {data?.socials?.map((s: any) => (
        <a
          className="button secondary"
          key={s.url}
          href={s.url}
          rel="noopener noreferrer"
        >
          {s.label}
          <ArrowUpLeft size={18} />
        </a>
      ))}
      <Link className="text-link" to="/team">
        تعرّف على فريق التحرير ←
      </Link>
    </div>
  );
}
function NotFound() {
  return (
    <div className="container page empty">
      <Meta title="الصفحة غير موجودة" />
      <span className="eyebrow">404</span>
      <h1>يبدو أن الحكاية في مكان آخر.</h1>
      <Link className="button" to="/">
        العودة للرئيسية <ArrowLeft size={18} />
      </Link>
    </div>
  );
}
export default function Public() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="category/:slug" element={<Category />} />
      <Route path="news/:slug" element={<ArticlePage />} />
      <Route path="search" element={<SearchPage />} />
      <Route path="about" element={<About />} />
      <Route path="team" element={<Team />} />
      <Route path="contact" element={<Contact />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
