import React, { Suspense, lazy, Component, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import {
  Search,
  Sun,
  Moon,
  Menu,
  X,
  ArrowUpLeft,
  ArrowLeft,
  Clock,
  ChevronLeft,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { api, cats, date, Article } from "./api";
import "./styles.css";
const Public = lazy(() => import("./public"));
const Admin = lazy(() => import("./admin"));
const query = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});
export function Loading() {
  return (
    <div className="loading" role="status">
      جارٍ التحميل…
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  );
}
export function Failure({ message }: { message: string }) {
  return (
    <div className="empty" role="alert">
      <ShieldCheck size={32} />
      <h2>تعذّر تحميل المحتوى</h2>
      <p>{message}</p>
      <button onClick={() => location.reload()}>إعادة المحاولة</button>
    </div>
  );
}
export function ArtImage({
  a,
  className = "",
}: {
  a: Article;
  className?: string;
}) {
  return a.image ? (
    <img
      className={className}
      src={a.image.url}
      srcSet={a.image.srcSet}
      alt={a.image.alt}
      width="1200"
      height="750"
      loading="lazy"
      sizes="(max-width: 720px) 100vw, 60vw"
    />
  ) : (
    <div
      className={"art-placeholder " + a.category + " " + className}
      aria-label="صورة تحريرية توضيحية"
    >
      <div className="arch arch-one" />
      <div className="arch arch-two" />
      <div className="arch arch-three" />
      <span>
        Jo هسّا <small>مساحة للحكاية</small>
      </span>
    </div>
  );
}
export function Card({
  a,
  compact = false,
}: {
  a: Article;
  compact?: boolean;
}) {
  return (
    <Link
      to={"/news/" + a.slug}
      className={"news-card " + (compact ? "compact" : "")}
    >
      <ArtImage a={a} />
      <div className="card-copy">
        <span className={"category " + a.category}>{cats[a.category]}</span>
        {a.demo && <span className="demo-mini">محتوى تجريبي</span>}
        <h3>{a.title}</h3>
        {!compact && <p>{a.summary}</p>}
        <span className="meta">
          <Clock size={13} />
          {date(a.publishedAt || a.createdAt)}
          <span>•</span>
          {a.author?.name}
        </span>
      </div>
    </Link>
  );
}
function Header() {
  const [menu, setMenu] = useState(false);
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );
  const location = useLocation();
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => setMenu(false), [location.pathname]);
  return (
    <>
      <div className="topline">
        <div className="container top-inner">
          <span>من الأردن، بعيون الشباب.</span>
          <span>
            {new Date().toLocaleDateString("ar-JO", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "Asia/Amman",
            })}
          </span>
          <Link to="/team">
            تعرّف على فريقنا <ArrowUpLeft size={13} />
          </Link>
        </div>
      </div>
      <header className="container masthead">
        <Link to="/" className="brand">
          <img
            src="/logo.jpg"
            alt="Jo هسّا — الشعار الرسمي"
            width="92"
            height="92"
          />
          <div>
            <b>
              Jo <em>هسّا</em>
            </b>
            <span>هسّا تعرف... وهسّا تفهم</span>
          </div>
        </Link>
        <p className="masthead-message">
          من الأردن نرصد الحدث،
          <br />
          <strong>وبعيون الشباب نروي الحكاية.</strong>
        </p>
        <div className="header-actions">
          <Link className="icon-button" to="/search" aria-label="البحث">
            <Search size={21} />
          </Link>
          <button
            className="icon-button"
            aria-label={dark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
            onClick={() => setDark(!dark)}
          >
            {dark ? <Sun size={21} /> : <Moon size={21} />}
          </button>
          <button
            className="icon-button mobile-toggle"
            aria-label="القائمة الرئيسية"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <div className="nav-wrap">
        <nav
          aria-label="التنقل الرئيسي"
          className={"container navigation " + (menu ? "open" : "")}
        >
          <NavLink to="/" end>
            الرئيسية
          </NavLink>
          {Object.entries(cats).map(([slug, name]) => (
            <NavLink key={slug} to={"/category/" + slug}>
              {name}
            </NavLink>
          ))}
          <span className="nav-spacer" />
          <NavLink to="/about">من نحن</NavLink>
          <NavLink to="/contact">تواصل معنا</NavLink>
          <Link to="/admin" className="newsroom-link">
            <span className="green-dot" />
            غرفة الأخبار
          </Link>
        </nav>
      </div>
    </>
  );
}
function Ticker() {
  const { data } = useQuery({
    queryKey: ["breaking"],
    queryFn: () => api("/articles?breaking=true&limit=5"),
  });
  if (!data?.items?.length) return null;
  return (
    <div className="container ticker">
      <b>
        <Radio size={16} />
        عاجل
      </b>
      <Link to={"/news/" + data.items[0].slug}>
        {data.items[0].demo ? "محتوى تجريبي — " : ""}
        {data.items[0].title}
      </Link>
      <ChevronLeft size={18} />
    </div>
  );
}
function Footer() {
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api("/settings"),
  });
  return (
    <footer>
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="brand">
            <img src="/logo.jpg" alt="Jo هسّا" width="65" height="65" />
            <b>
              Jo <em>هسّا</em>
            </b>
          </Link>
          <p>صحافة شبابية. هوية أردنية. حكاية تستحق أن تُروى.</p>
          <span>هسّا تعرف... وهسّا تفهم</span>
        </div>
        <div>
          <h4>اكتشف Jo هسّا</h4>
          {Object.entries(cats).map(([s, n]) => (
            <Link key={s} to={"/category/" + s}>
              {n}
            </Link>
          ))}
        </div>
        <div>
          <h4>عن المنصة</h4>
          <Link to="/about">من نحن</Link>
          <Link to="/team">فريق التحرير</Link>
          <Link to="/contact">تواصل معنا</Link>
        </div>
        <div>
          <h4>من الأردن، إلى العالم</h4>
          <p>منصة إخبارية رقمية يطوّرها طلبة الصحافة والإعلام الرقمي.</p>
          {data?.contactEmail && (
            <a href={"mailto:" + data.contactEmail}>{data.contactEmail}</a>
          )}
          {data?.socials?.map((s: any) => (
            <a key={s.url} href={s.url} rel="noopener noreferrer">
              {s.label}
            </a>
          ))}
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Jo هسّا. جميع الحقوق محفوظة.</span>
        <Link to="/team">
          بشغف فريق Jo هسّا <span className="red">♥</span>
        </Link>
      </div>
    </footer>
  );
}
class Boundary extends Component<
  { children: React.ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <Failure message="حدث خطأ غير متوقع. أعد تحميل الصفحة." />
    ) : (
      this.props.children
    );
  }
}
function App() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <Boundary>
      <a className="skip" href="#main">
        انتقل إلى المحتوى
      </a>
      <Header />
      {!location.pathname.startsWith("/admin") && <Ticker />}
      <main id="main">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/*" element={<Public />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </Boundary>
  );
}
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={query}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>,
);
