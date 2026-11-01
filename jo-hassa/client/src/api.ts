export let csrf = "";
export async function api<T = any>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  if (options.method && !["GET", "HEAD"].includes(options.method) && !csrf) {
    const r = await fetch("/api/auth/csrf", { credentials: "include" });
    csrf = (await r.json()).token;
  }
  const headers: any = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(options.method ? { "X-CSRF-Token": csrf } : {}),
    ...options.headers,
  };
  const r = await fetch("/api" + url, {
    ...options,
    headers,
    credentials: "include",
  });
  const data = await r.json().catch(() => ({ error: "تعذر الاتصال بالخادم" }));
  if (!r.ok) throw Error(data.error || "حدث خطأ");
  if (data.token) csrf = data.token;
  return data;
}
export const mutate = (url: string, body: any = {}, method = "POST") =>
  api(url, {
    method,
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
export const cats: Record<string, string> = {
  politics: "السياسة",
  economy: "الاقتصاد",
  sports: "الرياضة",
};
export const statusNames: Record<string, string> = {
  draft: "مسودة",
  submitted: "بانتظار المراجعة",
  editing: "قيد التحرير",
  proofreading: "قيد التدقيق",
  approved: "معتمد",
  published: "منشور",
  archived: "مؤرشف",
};
export const date = (d: string) =>
  new Date(d).toLocaleDateString("ar-JO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Amman",
  });
export type Article = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  category: string;
  author: { _id: string; name: string };
  image?: {
    _id: string;
    url: string;
    srcSet?: string;
    alt: string;
    caption: string;
    credit: string;
  };
  publishedAt: string;
  updatedAt: string;
  createdAt: string;
  status: string;
  views: number;
  tags: string[];
  demo: boolean;
  featured: boolean;
  breaking: boolean;
  breakingUntil?: string;
  scheduledAt?: string;
  editor?: string;
  proofreader?: string;
};
