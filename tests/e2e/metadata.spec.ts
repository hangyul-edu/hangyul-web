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

  test("canonical 및 hreflang은 absolute URL로 적용", async ({ page }) => {
    await page.goto("/ko");

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://talkhangyul.com/ko"
    );
    await expect(
      page.locator('link[rel="alternate"][hreflang="ko"]')
    ).toHaveAttribute("href", "https://talkhangyul.com/ko");
    await expect(
      page.locator('link[rel="alternate"][hreflang="en"]')
    ).toHaveAttribute("href", "https://talkhangyul.com/en");
    await expect(
      page.locator('link[rel="alternate"][hreflang="x-default"]')
    ).toHaveAttribute("href", "https://talkhangyul.com/en");
  });

  test("보안 헤더 적용", async ({ page }) => {
    const response = await page.goto("/ko");
    const headers = response?.headers() ?? {};

    expect(headers["strict-transport-security"]).toBe(
      "max-age=31536000; includeSubDomains"
    );
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
    expect(headers["permissions-policy"]).toBe(
      "camera=(), microphone=(), geolocation=()"
    );
  });

  test("www host는 non-www 대표 도메인으로 301 리다이렉트", async ({
    request,
  }) => {
    const response = await request.get("/ko?legal=terms", {
      headers: {
        host: "www.talkhangyul.com",
      },
      maxRedirects: 0,
    });

    expect(response.status()).toBe(301);
    expect(response.headers()["location"]).toBe(
      "https://talkhangyul.com/ko?legal=terms"
    );
  });
});
