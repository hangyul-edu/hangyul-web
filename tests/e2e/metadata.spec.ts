import { test, expect } from "@playwright/test";

test.describe("OG Metadata", () => {
  test("/ko - 한국어 OG 태그 적용", async ({ page }) => {
    await page.goto("/ko");

    const ogTitle = await page
      .locator('meta[property="og:title"]')
      .getAttribute("content");
    const ogDescription = await page
      .locator('meta[property="og:description"]')
      .getAttribute("content");
    const ogImage = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    const ogLocale = await page
      .locator('meta[property="og:locale"]')
      .getAttribute("content");

    expect(ogTitle).toBe("AI와 함께 배우는 한국어 회화, 한귤");
    expect(ogDescription).toContain("AI 발음 분석");
    expect(ogImage).toContain("talkhangyul.com");
    expect(ogImage).not.toContain("localhost");
    expect(ogLocale).toBe("ko_KR");
  });

  test("/en - 영어 OG 태그 적용", async ({ page }) => {
    await page.goto("/en");

    const ogTitle = await page
      .locator('meta[property="og:title"]')
      .getAttribute("content");
    const ogImage = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    const ogLocale = await page
      .locator('meta[property="og:locale"]')
      .getAttribute("content");

    expect(ogTitle).toContain("Hangyul");
    expect(ogImage).not.toContain("localhost");
    expect(ogLocale).toBe("en_US");
  });

  test("/ko - 페이지 title 태그 한국어", async ({ page }) => {
    await page.goto("/ko");
    await expect(page).toHaveTitle(/한귤/);
  });

  test("/en - 페이지 title 태그 영어", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveTitle(/Hangyul/);
  });
});
