import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "fs";
import path from "path";

/**
 * /download?resource=<slug>&lang=<UI 언어> 무료 학습 자료 다운로드 페이지
 *
 * - 같은 /download 진입점의 ?app=ganada 스마트 링크와 공존해야 합니다.
 *   (스마트 링크 자체의 상세 동작은 download-smartlink.spec.ts에서 검증)
 * - lang은 화면 언어만 바꾸고, PDF 판(영어판)은 그대로이며 그 사실이 화면에 드러나야 합니다.
 * - 모르는 자료는 404 안내를 보여주고 다른 자료를 내려주지 않아야 합니다.
 */

const SLUG = "ep01-en-study-guide";
const RESOURCE_LINK = `/download?resource=${SLUG}`;
const EN_LINK = `${RESOURCE_LINK}&lang=en`;
const PDF_PATH = `/download/files/${SLUG}.pdf`;
const DOWNLOAD_FILE_NAME =
  "Hangyul_EP01_100_Everyday_Korean_Sentences_Study_Guide_EN.pdf";
const SOURCE_PDF = path.join(
  process.cwd(),
  "src/assets/downloads/EP01_EN_Study_Guide.pdf"
);
const YOUTUBE_URL = "https://www.youtube.com/watch?v=HGa7xurxL5c";
const PROD = "https://www.talkhangyul.com";

const IOS_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36";
const PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.talkhangyul.ganada";
const APP_STORE_URL =
  "https://apps.apple.com/us/app/hangyul-ganada/id6804839101";

/** 화면 언어별 기대 문구는 번역 파일에서 직접 읽습니다. */
type ResourceMessages = {
  common: Record<string, string>;
  editionLanguages: Record<string, Record<string, string>>;
  resources: Record<string, Record<string, string>>;
  notFound: Record<string, string>;
};
function messages(locale: string): ResourceMessages {
  const file = path.join(process.cwd(), "messages", `${locale}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8")).ResourceDownload;
}
const copy = (locale: string) => messages(locale).resources.ep01EnStudyGuide;

function rawResponse(page: Page, url: string, userAgent = IOS_UA) {
  return page.request.get(url, {
    headers: { "user-agent": userAgent },
    maxRedirects: 0,
  });
}

const heroDownload = (page: Page) => page.getByTestId("resource-download-hero");
const h1 = (page: Page) => page.getByRole("heading", { level: 1 });
const languageTrigger = (page: Page) =>
  page.getByRole("banner").getByRole("button", { expanded: false }).or(
    page.getByRole("banner").getByRole("button", { expanded: true })
  );

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

  test("app takes priority when resource and lang are also present", async ({ page }) => {
    const response = await rawResponse(
      page,
      `/download?app=ganada&resource=${SLUG}&lang=ja`,
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

  test("resource links render in place (no redirect) on every device", async ({ page }) => {
    for (const url of [RESOURCE_LINK, EN_LINK, `${RESOURCE_LINK}&lang=ja`]) {
      for (const ua of [IOS_UA, ANDROID_UA, devices["Desktop Chrome"].userAgent]) {
        const response = await rawResponse(page, url, ua);
        expect(response.status()).toBe(200);
        expect(response.headers()["location"]).toBeUndefined();
      }
    }
  });
});

test.describe("English UI — /download?resource=ep01-en-study-guide&lang=en", () => {
  test("shows the English page for the English edition", async ({ page }) => {
    await page.goto(EN_LINK);

    // 공개 URL이 그대로 유지됩니다 (rewrite).
    await expect(page).toHaveURL(new RegExp(`/download\\?resource=${SLUG}&lang=en$`));
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");

    await expect(h1(page)).toHaveText("100 Everyday Korean Sentences");
    await expect(page.getByText("Free Study Guide", { exact: true })).toBeVisible();
    await expect(page.getByText("Korean While You Sleep · EP01")).toBeVisible();
    await expect(page.getByTestId("edition-badge")).toHaveText("English edition");
    // 화면과 PDF 언어가 같으면 별도 안내는 없습니다.
    await expect(page.getByTestId("edition-notice")).toHaveCount(0);
    await expect(page.getByText("40 pages · PDF · No sign-up required")).toBeVisible();
    await expect(page.getByRole("img", { name: /cover of the hangyul study guide/i })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /what.s inside/i })).toBeVisible();
  });

  test("the logo links to the Hangyul homepage in the same language", async ({ page }) => {
    await page.goto(EN_LINK);
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Hangyul home" })
    ).toHaveAttribute("href", "/en");
  });

  test("the YouTube button opens EP.01 in a new tab", async ({ page }) => {
    await page.goto(EN_LINK);
    const youtube = page.getByRole("link", { name: /watch ep\.01 on youtube/i });
    await expect(youtube).toHaveAttribute("href", YOUTUBE_URL);
    await expect(youtube).toHaveAttribute("target", "_blank");
    await expect(youtube).toHaveAttribute("rel", /noopener/);
  });

  test("has English SEO metadata with a clean canonical and hreflang", async ({ page }) => {
    await page.goto(`${EN_LINK}&utm_source=youtube`);

    await expect(page).toHaveTitle(
      "100 Everyday Korean Sentences — Free Study Guide | Hangyul"
    );
    // 대표 주소에는 utm_*이 붙지 않습니다.
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${PROD}${EN_LINK}`
    );
    await expect(page.locator('link[rel="alternate"][hreflang="ja"]')).toHaveAttribute(
      "href",
      `${PROD}${RESOURCE_LINK}&lang=ja`
    );
    await expect(
      page.locator('link[rel="alternate"][hreflang="x-default"]')
    ).toHaveAttribute("href", `${PROD}${EN_LINK}`);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /^https:\/\/www\.talkhangyul\.com\/.+\.jpg$/
    );
  });

  test("does not expose source paths", async ({ page }) => {
    await page.goto(EN_LINK);
    expect(await page.content()).not.toContain("src/assets");
  });

  test("the download CTA is reachable by keyboard right after the header", async ({ page }) => {
    await page.goto(EN_LINK);
    // 로고 → 언어 선택기 → 다운로드 버튼
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(heroDownload(page)).toBeFocused();
  });
});

test.describe("No lang / invalid lang — deterministic fallback", () => {
  test("the original link without lang still works and uses the edition language", async ({ page }) => {
    await page.goto(RESOURCE_LINK);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(h1(page)).toHaveText("100 Everyday Korean Sentences");
    // lang 없는 링크도 같은 대표 주소로 모입니다.
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${PROD}${EN_LINK}`
    );
  });

  for (const lang of ["xx", "klingon", "", "../../ja"]) {
    test(`lang=${JSON.stringify(lang)} falls back to English`, async ({ page }) => {
      const response = await page.goto(
        `${RESOURCE_LINK}&lang=${encodeURIComponent(lang)}`
      );
      expect(response?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(heroDownload(page)).toHaveAttribute("href", PDF_PATH);
    });
  }

  test("lang tolerates case and region subtags (JA, pt-BR)", async ({ page }) => {
    await page.goto(`${RESOURCE_LINK}&lang=JA`);
    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
    await page.goto(`${RESOURCE_LINK}&lang=pt-BR`);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt");
  });
});

for (const locale of ["ja", "ru"] as const) {
  test.describe(`${locale} UI for the English edition`, () => {
    const url = `${RESOURCE_LINK}&lang=${locale}`;

    test("localizes the page but keeps the English PDF clearly labeled", async ({ page }) => {
      await page.goto(url);
      const m = messages(locale);

      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(h1(page)).toHaveText(copy(locale).title);
      await expect(page.getByText(copy(locale).eyebrow, { exact: true })).toBeVisible();
      await expect(heroDownload(page)).toContainText(m.common.downloadCta);

      // PDF가 영어판이라는 사실을 배지와 안내문 두 곳에서 알립니다.
      await expect(page.getByTestId("edition-badge")).toHaveText(m.editionLanguages.en.label);
      await expect(page.getByTestId("edition-notice")).toHaveText(m.editionLanguages.en.notice);

      // 같은 영어판 PDF를 내려받습니다 (판을 지어내지 않음).
      await expect(heroDownload(page)).toHaveAttribute("href", PDF_PATH);
      await expect(heroDownload(page)).toHaveAttribute("download", DOWNLOAD_FILE_NAME);
      await expect(page.locator('a[href*="ep01-' + locale + '-"]')).toHaveCount(0);

      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `${PROD}${url}`
      );
      await expect(page).toHaveTitle(copy(locale).seoTitle);
    });

    test("has no WCAG A/AA violations", async ({ page }) => {
      // axe 전체 스캔은 무거워 WebKit 병렬 실행에서 기본 30초를 넘길 수 있습니다.
      test.slow();
      await page.goto(url);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  });
}

test.describe("Arabic (RTL)", () => {
  test("renders right-to-left with the selector at the inline end", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${RESOURCE_LINK}&lang=ar`);

    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(h1(page)).toHaveText(copy("ar").title);

    // RTL에서는 로고가 오른쪽, 언어 선택기가 왼쪽입니다.
    const logo = await page.getByRole("banner").getByRole("link").boundingBox();
    const selector = await languageTrigger(page).boundingBox();
    expect(selector!.x).toBeLessThan(logo!.x);

    // 표지가 오른쪽(시작 쪽), 정보가 왼쪽입니다.
    const cover = await page.getByRole("img").filter({ has: page.locator("[alt]") }).first();
    const coverBox = await page.locator("main img").first().boundingBox();
    const titleBox = await h1(page).boundingBox();
    expect(cover).toBeTruthy();
    expect(coverBox!.x).toBeGreaterThan(titleBox!.x);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBe(0);
  });

  test("has no WCAG A/AA violations", async ({ page }) => {
    test.slow();
    await page.goto(`${RESOURCE_LINK}&lang=ar`);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("Language selector", () => {
  test("lists every supported language and marks the current one", async ({ page }) => {
    await page.goto(EN_LINK);
    await languageTrigger(page).click();

    const options = page.getByRole("banner").getByRole("listitem");
    const localeCount = fs
      .readdirSync(path.join(process.cwd(), "messages"))
      .filter((f) => f.endsWith(".json")).length;
    await expect(options).toHaveCount(localeCount);
    await expect(
      page.getByRole("banner").locator('a[aria-current="true"]')
    ).toHaveAttribute("hreflang", "en");
  });

  test("switching language updates lang and preserves resource + UTM parameters", async ({ page }) => {
    await page.goto(
      `${EN_LINK}&utm_source=youtube&utm_medium=comment&utm_campaign=korean-while-you-sleep-ep01`
    );
    await languageTrigger(page).click();
    await page.getByRole("banner").locator('a[hreflang="ja"]').click();

    await page.waitForURL(/lang=ja/);
    const url = new URL(page.url());
    expect(url.pathname).toBe("/download");
    expect(url.searchParams.get("resource")).toBe(SLUG);
    expect(url.searchParams.get("lang")).toBe("ja");
    expect(url.searchParams.get("utm_source")).toBe("youtube");
    expect(url.searchParams.get("utm_medium")).toBe("comment");
    expect(url.searchParams.get("utm_campaign")).toBe("korean-while-you-sleep-ep01");

    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
    await expect(h1(page)).toHaveText(copy("ja").title);
  });

  test("adds lang when the original link had none", async ({ page }) => {
    await page.goto(`${RESOURCE_LINK}&utm_source=reddit`);
    await languageTrigger(page).click();
    await page.getByRole("banner").locator('a[hreflang="ru"]').click();
    await page.waitForURL(/lang=ru/);
    const url = new URL(page.url());
    expect(url.searchParams.get("resource")).toBe(SLUG);
    expect(url.searchParams.get("utm_source")).toBe("reddit");
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  });

  test("search filters languages by native and English names", async ({ page }) => {
    await page.goto(EN_LINK);
    await languageTrigger(page).click();
    const search = page.getByRole("banner").getByRole("searchbox");

    await search.fill("japan");
    await expect(page.getByRole("banner").getByRole("listitem")).toHaveCount(1);
    await expect(page.getByRole("banner").locator('a[hreflang="ja"]')).toBeVisible();

    await search.fill("Deutsch");
    await expect(page.getByRole("banner").locator('a[hreflang="de"]')).toBeVisible();
  });

  test("Escape closes the panel and returns focus to the trigger", async ({ page }) => {
    await page.goto(EN_LINK);
    await languageTrigger(page).click();
    await expect(page.getByRole("banner").getByRole("list")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("banner").getByRole("list")).toBeHidden();
    await expect(languageTrigger(page)).toBeFocused();
  });

  test("option links work without JavaScript-built URLs (progressive enhancement)", async ({ page }) => {
    await page.goto(EN_LINK);
    await expect(page.getByRole("banner").locator('a[hreflang="de"]')).toHaveAttribute(
      "href",
      `${RESOURCE_LINK}&lang=de`
    );
  });
});

test.describe("PDF download", () => {
  test("the CTA points at the EP01 PDF with the final file name", async ({ page }) => {
    await page.goto(EN_LINK);
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

  for (const lang of ["en", "ja"]) {
    test(`clicking the CTA downloads the PDF (lang=${lang})`, async ({ page, browserName }) => {
      // WebKit(Mobile Safari 에뮬레이션)은 Playwright download 이벤트를 지원하지 않습니다.
      test.skip(browserName === "webkit", "download events are Chromium/Firefox only");

      await page.goto(`${RESOURCE_LINK}&lang=${lang}`);
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        heroDownload(page).click(),
      ]);

      expect(download.suggestedFilename()).toBe(DOWNLOAD_FILE_NAME);
      expect(download.url()).toContain(PDF_PATH);
      const saved = await download.path();
      expect(fs.statSync(saved).size).toBe(fs.statSync(SOURCE_PDF).size);
      await expect(page).toHaveURL(new RegExp(`resource=${SLUG}`));
    });
  }

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

      await expect(h1(page)).toHaveText(messages("en").notFound.title);
      await expect(page.getByRole("link", { name: "Go to Hangyul" })).toHaveAttribute("href", "/en");
      await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0);
      await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
    });
  }

  test("the not-found state is localized too", async ({ page }) => {
    const response = await page.goto("/download?resource=does-not-exist&lang=ja");
    expect(response?.status()).toBe(404);
    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
    await expect(h1(page)).toHaveText(messages("ja").notFound.title);
  });
});

test.describe("One container for header, hero, sections and footer", () => {
  /** 요소의 실제 내용(텍스트·글리프) 좌우 끝 */
  const edges = (page: Page) =>
    page.evaluate(() => {
      const box = (el: Element | null) => {
        const b = el!.getBoundingClientRect();
        return { left: Math.round(b.left), right: Math.round(b.right) };
      };
      const text = (el: Element | null) => {
        const range = document.createRange();
        range.selectNodeContents(el!);
        const b = range.getBoundingClientRect();
        return { left: Math.round(b.left), right: Math.round(b.right) };
      };
      const footer = document.querySelector("footer")!;
      const rightColumn = footer.querySelector("address")!.parentElement!
        .nextElementSibling!;
      const icons = rightColumn.querySelectorAll("ul a svg");
      return {
        headerLogo: box(document.querySelector("header a img")),
        selector: box(document.querySelector("header button")),
        cover: box(document.querySelector("main img")),
        info: box(document.querySelector("h1")!.parentElement),
        closing: box(document.querySelector("#closing-title")!.closest("div")!.parentElement),
        footerLogo: box(footer.querySelector("img")),
        footerAddress: text(footer.querySelector("address p")),
        socialTitle: text(rightColumn.querySelector("h2")),
        lastSocialIcon: box(icons[icons.length - 1]),
        legal: box(rightColumn.children[1]),
        copyright: text(rightColumn.querySelector("p span")),
      };
    });

  // 홈페이지(/en)가 기준입니다: 헤더·푸터 컨테이너의 좌우 끝선이 자료 페이지와 같아야 합니다.
  for (const width of [1280, 1440, 1600, 1920, 820]) {
    test(`uses the homepage container width at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const contentEdges = () =>
        page.evaluate(() => {
          const inner = (el: Element) => {
            const r = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            return {
              left: Math.round(r.left + parseFloat(cs.paddingLeft)),
              right: Math.round(r.right - parseFloat(cs.paddingRight)),
            };
          };
          return {
            header: inner(document.querySelector("header > div")!),
            footer: inner(document.querySelector("footer > div")!),
          };
        });

      await page.goto("/en");
      const home = await contentEdges();
      await page.goto(EN_LINK);
      const resource = await contentEdges();

      expect(resource.header).toEqual(home.header);
      expect(resource.footer).toEqual(home.footer);
      expect(resource.header).toEqual(resource.footer);
    });
  }

  for (const width of [1920, 1440, 1280, 1024, 820]) {
    test(`footer edges match the page container at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(EN_LINK);
      const e = await edges(page);

      const left = e.headerLogo.left;
      for (const key of ["cover", "closing", "footerLogo", "footerAddress"] as const) {
        expect(e[key].left, key).toBe(left);
      }
      const right = e.selector.right;
      for (const key of ["info", "closing", "socialTitle", "lastSocialIcon", "legal", "copyright"] as const) {
        expect(e[key].right, key).toBe(right);
      }
    });
  }

  test("footer edges are mirrored in RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${RESOURCE_LINK}&lang=ar`);
    const e = await edges(page);

    const start = e.headerLogo.right;
    for (const key of ["cover", "closing", "footerLogo", "footerAddress"] as const) {
      expect(e[key].right, key).toBe(start);
    }
    const end = e.selector.left;
    for (const key of ["info", "closing", "socialTitle", "lastSocialIcon", "legal", "copyright"] as const) {
      expect(e[key].left, key).toBe(end);
    }
  });

  test("mobile footer stays on the same gutter", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(EN_LINK);
    const e = await edges(page);
    for (const key of ["headerLogo", "info", "closing", "footerLogo", "footerAddress", "socialTitle", "legal", "copyright"] as const) {
      expect(e[key].left, key).toBe(16);
    }
  });
});

test.describe("Responsive layout", () => {
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
      await page.goto(EN_LINK);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBe(0);

      await expect(heroDownload(page)).toBeVisible();
      const box = await heroDownload(page).boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(48);
      // 스크롤 없이 첫 화면 안에 다운로드 버튼이 보입니다. (가장 작은 화면 제외)
      if (vp.height >= 664) {
        expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height);
      }

      // 언어 선택기는 손가락으로 누르기 쉬운 크기입니다.
      const trigger = await languageTrigger(page).boundingBox();
      expect(trigger!.height).toBeGreaterThanOrEqual(40);
    });
  }

  // 길게 늘어나는 언어와 문자 체계가 다른 언어에서도 넘침이 없어야 합니다.
  for (const lang of ["de", "fr", "pt", "ru", "uk", "ar", "ja", "zh", "th", "vi", "ta", "te"]) {
    for (const width of [360, 1280]) {
      test(`lang=${lang} at ${width}px has no horizontal overflow`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(`${RESOURCE_LINK}&lang=${lang}`);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        expect(overflow).toBe(0);

        // 버튼 글자가 버튼 밖으로 넘치지 않습니다.
        for (const cta of await page.locator('a[data-testid^="resource-download"]').all()) {
          const fits = await cta.evaluate((el) => el.scrollWidth <= el.clientWidth + 1);
          expect(fits).toBe(true);
        }
      });
    }
  }

  test("desktop places the cover beside the resource details", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(EN_LINK);
    const cover = await page.locator("main img").first().boundingBox();
    const title = await h1(page).boundingBox();
    expect(cover!.x + cover!.width).toBeLessThan(title!.x);
  });

  test("mobile stacks the cover above the title", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 664 });
    await page.goto(EN_LINK);
    const cover = await page.locator("main img").first().boundingBox();
    const title = await h1(page).boundingBox();
    expect(cover!.y + cover!.height).toBeLessThan(title!.y);
  });
});
