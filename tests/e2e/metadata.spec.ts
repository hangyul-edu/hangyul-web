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

    expect(ogTitle).toBe("한귤(HANGYUL) | AI 한국어 학습 앱");
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
      "https://www.talkhangyul.com/ko"
    );
    await expect(
      page.locator('link[rel="alternate"][hreflang="ko"]')
    ).toHaveAttribute("href", "https://www.talkhangyul.com/ko");
    await expect(
      page.locator('link[rel="alternate"][hreflang="en"]')
    ).toHaveAttribute("href", "https://www.talkhangyul.com/en");
    await expect(
      page.locator('link[rel="alternate"][hreflang="x-default"]')
    ).toHaveAttribute("href", "https://www.talkhangyul.com/en");
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

});

test.describe("브랜드 엔티티 구조화 데이터", () => {
  test("/ko - WebSite/Organization JSON-LD가 초기 HTML에 포함", async ({
    page,
  }) => {
    const response = await page.goto("/ko");
    const html = (await response?.text()) ?? "";

    // 클라이언트 렌더링이 아니라 서버가 내려준 HTML에 들어 있어야 한다.
    expect(html).toContain('type="application/ld+json"');

    const raw = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    const graph = JSON.parse(raw ?? "{}")["@graph"];

    const website = graph.find((n: { "@type": string }) => n["@type"] === "WebSite");
    expect(website.name).toBe("Hangyul");
    expect(website.url).toBe("https://www.talkhangyul.com/");
    expect(website.alternateName).toEqual(
      expect.arrayContaining(["한귤", "HANGYUL", "HanGyul", "talkhangyul.com"])
    );

    const org = graph.find(
      (n: { "@type": string }) => n["@type"] === "Organization"
    );
    expect(org.name).toBe("Hangyul");
    expect(org.alternateName).toEqual(expect.arrayContaining(["한귤"]));
  });

  test("/en - 홈페이지에 h1이 하나 존재", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("noindex가 걸려 있지 않음", async ({ page }) => {
    await page.goto("/ko");
    const robots = await page
      .locator('meta[name="robots"]')
      .getAttribute("content");
    expect(robots ?? "").not.toContain("noindex");
  });
});
