import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "fs";
import path from "path";

/**
 * /download?resource=<slug> 무료 학습 자료 다운로드 페이지
 *
 * - 같은 /download 진입점의 ?app=ganada 스마트 링크와 공존해야 합니다.
 *   (스마트 링크 자체의 상세 동작은 download-smartlink.spec.ts에서 검증)
 * - 등록된 자료는 랜딩 페이지를, 모르는 값은 404 안내를 보여주고
 *   다른 자료를 내려주지 않아야 합니다.
 */

const SLUG = "ep01-en-study-guide";
const RESOURCE_LINK = `/download?resource=${SLUG}`;
const PDF_PATH = `/download/files/${SLUG}.pdf`;
const DOWNLOAD_FILE_NAME =
  "Hangyul_EP01_100_Everyday_Korean_Sentences_Study_Guide_EN.pdf";
const SOURCE_PDF = path.join(
  process.cwd(),
  "src/assets/downloads/EP01_EN_Study_Guide.pdf"
);
const YOUTUBE_URL = "https://www.youtube.com/watch?v=HGa7xurxL5c";

const IOS_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36";
const PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.talkhangyul.ganada";
const APP_STORE_URL =
  "https://apps.apple.com/us/app/hangyul-ganada/id6804839101";

function rawResponse(page: Page, url: string, userAgent = IOS_UA) {
  return page.request.get(url, {
    headers: { "user-agent": userAgent },
    maxRedirects: 0,
  });
}

const heroDownload = (page: Page) => page.getByTestId("resource-download-hero");

test.describe("/download — app and resource links coexist", () => {
  test("?app=ganada still redirects iOS to the App Store", async ({ page }) => {
    const response = await rawResponse(page, "/download?app=ganada", IOS_UA);
    expect(response.status()).toBe(302);
    expect(response.headers()["location"]).toBe(APP_STORE_URL);
  });

  test("?app=ganada still redirects Android to Google Play", async ({ page }) => {
    const response = await rawResponse(page, "/download?app=ganada", ANDROID_UA);
    expect(response.status()).toBe(302);
    expect(response.headers()["location"]).toBe(PLAY_URL);
  });

  test("app takes priority when both parameters are present", async ({ page }) => {
    const response = await rawResponse(
      page,
      `/download?app=ganada&resource=${SLUG}`,
      IOS_UA
    );
    expect(response.status()).toBe(302);
    expect(response.headers()["location"]).toBe(APP_STORE_URL);
  });

  test("/download with no parameters still goes to the homepage", async ({ page }) => {
    const response = await rawResponse(page, "/download");
    expect(response.status()).toBe(302);
    expect(response.headers()["location"]).toBe("/");
  });

  test("a resource link renders in place (no redirect) on every device", async ({ page }) => {
    for (const ua of [IOS_UA, ANDROID_UA, devices["Desktop Chrome"].userAgent]) {
      const response = await rawResponse(page, RESOURCE_LINK, ua);
      expect(response.status()).toBe(200);
      expect(response.headers()["location"]).toBeUndefined();
    }
  });
});

test.describe("/download?resource=ep01-en-study-guide — landing page", () => {
  test("shows the EP01 study guide", async ({ page }) => {
    await page.goto(RESOURCE_LINK);

    // 공개 URL이 그대로 유지됩니다 (rewrite).
    await expect(page).toHaveURL(new RegExp(`/download\\?resource=${SLUG}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await expect(
      page.getByRole("heading", { level: 1, name: "100 Everyday Korean Sentences" })
    ).toBeVisible();
    await expect(page.getByText("Free Study Guide", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Korean While You Sleep · EP01 · English Edition")
    ).toBeVisible();
    await expect(page.getByText("40 pages · PDF · No sign-up required")).toBeVisible();
    await expect(page.getByRole("img", { name: /cover of the hangyul study guide/i })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /what.s inside/i })).toBeVisible();
  });

  test("the logo links back to the Hangyul homepage", async ({ page }) => {
    await page.goto(RESOURCE_LINK);
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Hangyul home" })
    ).toHaveAttribute("href", "/");
  });

  test("the YouTube button opens EP.01 in a new tab", async ({ page }) => {
    await page.goto(RESOURCE_LINK);
    const youtube = page.getByRole("link", { name: /watch ep\.01 on youtube/i });
    await expect(youtube).toHaveAttribute("href", YOUTUBE_URL);
    await expect(youtube).toHaveAttribute("target", "_blank");
    await expect(youtube).toHaveAttribute("rel", /noopener/);
  });

  test("utm parameters do not change the resource", async ({ page }) => {
    await page.goto(
      `/download?resource=${SLUG}&utm_source=youtube&utm_medium=comment&utm_campaign=korean-while-you-sleep-ep01`
    );
    await expect(
      page.getByRole("heading", { level: 1, name: "100 Everyday Korean Sentences" })
    ).toBeVisible();
    await expect(page).toHaveURL(/utm_source=youtube/);
  });

  test("resource can appear after other parameters and in mixed case", async ({ page }) => {
    await page.goto("/download?utm_source=youtube&resource=EP01-EN-Study-Guide");
    await expect(
      page.getByRole("heading", { level: 1, name: "100 Everyday Korean Sentences" })
    ).toBeVisible();
  });

  test("has resource-specific SEO and social metadata", async ({ page }) => {
    await page.goto(`${RESOURCE_LINK}&utm_source=youtube`);

    await expect(page).toHaveTitle(
      "100 Everyday Korean Sentences — Free Study Guide | Hangyul"
    );
    // 대표 주소에는 utm_*이 붙지 않습니다.
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://www.talkhangyul.com${RESOURCE_LINK}`
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /free Hangyul EP01 study guide/
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /^https:\/\/www\.talkhangyul\.com\/.+\.jpg$/
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image"
    );
  });

  test("does not expose source paths", async ({ page }) => {
    await page.goto(RESOURCE_LINK);
    expect(await page.content()).not.toContain("src/assets");
  });

  test("has no WCAG A/AA violations", async ({ page }) => {
    await page.goto(RESOURCE_LINK);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("the download CTA is reachable by keyboard", async ({ page }) => {
    await page.goto(RESOURCE_LINK);
    // 로고 → 다운로드 버튼 순서
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(heroDownload(page)).toBeFocused();
  });
});

test.describe("/download?resource=ep01-en-study-guide — PDF download", () => {
  test("the CTA points at the EP01 PDF with the final file name", async ({ page }) => {
    await page.goto(RESOURCE_LINK);
    await expect(heroDownload(page)).toHaveAttribute("href", PDF_PATH);
    await expect(heroDownload(page)).toHaveAttribute("download", DOWNLOAD_FILE_NAME);
    await expect(heroDownload(page)).toHaveAccessibleName("Download Free PDF");
  });

  test("the PDF endpoint serves the exact repository PDF as an attachment", async ({ page }) => {
    const response = await page.request.get(PDF_PATH);
    expect(response.status()).toBe(200);

    const headers = response.headers();
    expect(headers["content-type"]).toBe("application/pdf");
    expect(headers["content-disposition"]).toContain("attachment");
    expect(headers["content-disposition"]).toContain(`filename="${DOWNLOAD_FILE_NAME}"`);

    const body = await response.body();
    expect(body.subarray(0, 5).toString()).toBe("%PDF-");
    expect(body.equals(fs.readFileSync(SOURCE_PDF))).toBe(true);
  });

  test("clicking the CTA downloads the PDF without another page", async ({ page, browserName }) => {
    // WebKit(Mobile Safari 에뮬레이션)은 Playwright download 이벤트를 지원하지 않습니다.
    test.skip(browserName === "webkit", "download events are Chromium/Firefox only");

    await page.goto(RESOURCE_LINK);
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      heroDownload(page).click(),
    ]);

    expect(download.suggestedFilename()).toBe(DOWNLOAD_FILE_NAME);
    expect(download.url()).toContain(PDF_PATH);
    const saved = await download.path();
    expect(fs.statSync(saved).size).toBe(fs.statSync(SOURCE_PDF).size);
    // 다운로드 후에도 같은 페이지에 머뭅니다.
    await expect(page).toHaveURL(new RegExp(`resource=${SLUG}`));
  });

  test("unknown PDF names are 404, never another resource", async ({ page }) => {
    for (const p of ["/download/files/does-not-exist.pdf", `/download/files/${SLUG}.txt`]) {
      expect((await page.request.get(p)).status()).toBe(404);
    }
  });
});

test.describe("/download?resource=<unknown> — graceful not-found", () => {
  for (const value of ["does-not-exist", "../../etc/passwd", "constructor", "unknown"]) {
    test(`resource=${value} shows a not-found state`, async ({ page }) => {
      const response = await page.goto(
        `/download?resource=${encodeURIComponent(value)}`
      );
      expect(response?.status()).toBe(404);

      await expect(
        page.getByRole("heading", { level: 1, name: /couldn.t find this resource/i })
      ).toBeVisible();
      await expect(page.getByRole("link", { name: "Go to Hangyul" })).toHaveAttribute("href", "/");
      await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0);
      await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
    });
  }
});

test.describe("/download?resource=ep01-en-study-guide — responsive layout", () => {
  const viewports = [
    { name: "desktop", width: 1440, height: 900 },
    { name: "laptop", width: 1280, height: 720 },
    { name: "tablet", width: 820, height: 1180 },
    { name: "mobile", width: 390, height: 664 },
    { name: "small mobile", width: 360, height: 640 },
  ];

  for (const vp of viewports) {
    test(`${vp.name} (${vp.width}px): no horizontal overflow, CTA visible`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(RESOURCE_LINK);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBe(0);

      await expect(heroDownload(page)).toBeVisible();
      const box = await heroDownload(page).boundingBox();
      expect(box).not.toBeNull();
      // 큰 터치 영역
      expect(box!.height).toBeGreaterThanOrEqual(48);
      // 스크롤 없이 첫 화면 안에 다운로드 버튼이 보입니다. (가장 작은 화면 제외)
      if (vp.height >= 664) {
        expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height);
      }
    });
  }

  test("desktop places the cover beside the resource details", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(RESOURCE_LINK);
    const cover = await page.getByRole("img", { name: /cover of the hangyul/i }).boundingBox();
    const title = await page.getByRole("heading", { level: 1 }).boundingBox();
    expect(cover!.x + cover!.width).toBeLessThan(title!.x);
  });

  test("mobile stacks the cover above the title", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 664 });
    await page.goto(RESOURCE_LINK);
    const cover = await page.getByRole("img", { name: /cover of the hangyul/i }).boundingBox();
    const title = await page.getByRole("heading", { level: 1 }).boundingBox();
    expect(cover!.y + cover!.height).toBeLessThan(title!.y);
  });
});
