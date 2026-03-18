import { test, expect } from "@playwright/test";

test.describe("Header Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ko");
  });

  test("로고 클릭 시 페이지 최상단으로 이동", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.locator("header a").first().click();
    await expect(page).toHaveURL(/\/ko/);
    // smooth scroll 완료를 기다린 후 확인
    await page.waitForFunction(() => window.scrollY < 50, { timeout: 3000 });
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(50);
  });

  test("'Why 한귤?' 클릭 시 intro 섹션으로 스크롤", async ({ page, isMobile }) => {
    if (isMobile) {
      await page.getByRole("button", { name: "내비게이션 메뉴" }).click();
    }
    await page.getByRole("link", { name: /why/i }).first().click();
    await page.waitForTimeout(500);
    const section = page.locator("#intro");
    await expect(section).toBeInViewport();
  });

  test("'학습 소개' 클릭 시 features 섹션으로 스크롤", async ({ page, isMobile }) => {
    if (isMobile) {
      await page.getByRole("button", { name: "내비게이션 메뉴" }).click();
    }
    await page.getByRole("link", { name: /학습/i }).first().click();
    await page.waitForTimeout(500);
    const section = page.locator("#features");
    await expect(section).toBeInViewport();
  });

  test("'멤버십' 클릭 시 pricing 섹션으로 스크롤", async ({ page, isMobile }) => {
    if (isMobile) {
      await page.getByRole("button", { name: "내비게이션 메뉴" }).click();
    }
    await page.getByRole("link", { name: /멤버십/i }).first().click();
    await page.waitForTimeout(500);
    const section = page.locator("#pricing");
    await expect(section).toBeInViewport();
  });
});
