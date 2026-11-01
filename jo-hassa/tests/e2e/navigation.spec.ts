import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    const data =
      url.pathname === "/api/auth/me"
        ? { user: null }
        : url.pathname === "/api/settings"
          ? {}
          : url.pathname === "/api/categories"
            ? []
            : { items: [], total: 0, page: 1, pages: 0 };
    await route.fulfill({ json: data });
  });
});
test("Arabic RTL and responsive menu", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  if (isMobile) {
    await page.getByRole("button", { name: "القائمة الرئيسية" }).click();
  }
  await page
    .getByRole("navigation", { name: "التنقل الرئيسي" })
    .getByRole("link", { name: "من نحن", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "من نحن", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("protects the CMS with a login screen", async ({ page }) => {
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "أهلًا بصنّاع الحكاية." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "دخول غرفة الأخبار" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "خبر جديد" })).toHaveCount(0);
});
test("theme preference persists", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "تفعيل الوضع الداكن" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
