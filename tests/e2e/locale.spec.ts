import { test, expect } from "@playwright/test";

test.describe("Locale Switching", () => {
  test("기본 URL은 /en으로 리다이렉트", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/(en|ko)/);
  });

  test("/ko 접속 시 한국어 콘텐츠 표시", async ({ page }) => {
    await page.goto("/ko");
    await expect(page.locator("html")).toHaveAttribute("lang", "ko");
    await expect(page.getByText("지금 시작하기").first()).toBeVisible();
  });

  test("/en 접속 시 영어 콘텐츠 표시", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByText("Start Now").first()).toBeVisible();
  });

  test("언어 토글 클릭 시 로케일 전환 및 URL 변경", async ({ page }) => {
    await page.goto("/ko");

    // 언어 드롭다운 열기
    await page.locator("header button").filter({ hasText: /한국어|english/i }).click();
    await page.getByText("English").click();

    await expect(page).toHaveURL(/\/en/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("로케일 전환 후 스크롤이 최상단으로 이동", async ({ page }) => {
    await page.goto("/ko");
    await page.evaluate(() => window.scrollTo(0, 800));

    await page.locator("header button").filter({ hasText: /한국어/i }).click();
    await page.getByText("English").click();

    await page.waitForURL(/\/en/);
    // smooth scroll 완료를 기다린 후 확인
    await page.waitForFunction(() => window.scrollY < 100, { timeout: 3000 });
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(100);
  });
});
