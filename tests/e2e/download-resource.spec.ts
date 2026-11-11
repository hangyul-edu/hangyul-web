import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "fs";
import path from "path";

/**
 * 무료 학습 자료 페이지
 *
 * 대표 주소: /<UI 언어>/resources/<pageSlug>
 * 기존 링크: /download?resource=<edition slug>&lang=<UI 언어> → 대표 주소로 301 (utm_* 유지)
 *
 * - 같은 /download 진입점의 ?app=ganada 스마트 링크와 공존해야 합니다.
 *   (스마트 링크 자체의 상세 동작은 download-smartlink.spec.ts에서 검증)
 * - 화면 언어만 바뀌고, PDF 판(영어판)은 그대로이며 그 사실이 화면에 드러나야 합니다.
 * - 모르는 자료는 404 안내를 보여주고 다른 자료를 내려주지 않아야 합니다.
 * 기존 테스트 대부분은 실제로 공유된 기존 링크로 들어와 301을 거친 뒤의 화면을 검증합니다.
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
/** EP01 대표 주소 (화면 언어별) */
const EP01_PAGE = "100-everyday-korean-sentences-ep01";
const ep01Path = (locale: string) => `/${locale}/resources/${EP01_PAGE}`;

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
  formats: Record<string, Record<string, string>>;
  resources: Record<string, Record<string, string>>;
  notFound: Record<string, string>;
};
function messages(locale: string): ResourceMessages {
  const file = path.join(process.cwd(), "messages", `${locale}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8")).ResourceDownload;
}
const copy = (locale: string) => messages(locale).resources.ep01EnStudyGuide;
/** EP01·EP02가 함께 쓰는 학습 가이드 형식 문구 (제목, What's inside…) */
const formatCopy = (locale: string) => messages(locale).formats.everydaySentences;

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

  test("resource links 301 to the same canonical page on every device", async ({ page }) => {
    for (const [url, target] of [
      [RESOURCE_LINK, ep01Path("en")],
      [EN_LINK, ep01Path("en")],
      [`${RESOURCE_LINK}&lang=ja`, ep01Path("ja")],
    ]) {
      for (const ua of [IOS_UA, ANDROID_UA, devices["Desktop Chrome"].userAgent]) {
        const response = await rawResponse(page, url, ua);
        expect(response.status()).toBe(301);
        // Location은 같은 호스트의 상대 경로로 내려옵니다.
        expect(new URL(response.headers()["location"], PROD).pathname).toBe(target);
      }
    }
  });

  test("the redirect keeps campaign parameters and drops resource/lang", async ({ page }) => {
    const response = await rawResponse(
      page,
      `${EN_LINK}&utm_source=youtube&utm_medium=pinned_comment&utm_campaign=ep01`
    );
    expect(response.status()).toBe(301);
    const location = new URL(response.headers()["location"], PROD);
    expect(location.pathname).toBe(ep01Path("en"));
    expect([...location.searchParams.keys()]).toEqual([
      "utm_source",
      "utm_medium",
      "utm_campaign",
    ]);
    expect(location.searchParams.get("utm_medium")).toBe("pinned_comment");
  });

  test("the canonical page answers 200 directly, with no redirect chain", async ({ page }) => {
    const response = await rawResponse(page, ep01Path("en"));
    expect(response.status()).toBe(200);
    expect(response.headers()["link"]).toBeUndefined();
  });
});

test.describe("English UI — /en/resources/100-everyday-korean-sentences-ep01", () => {
  test("shows the English page for the English edition", async ({ page }) => {
    await page.goto(EN_LINK);

    // 기존 링크는 대표 주소로 이동합니다 (301).
    await expect(page).toHaveURL(new RegExp(`${ep01Path("en")}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");

    await expect(h1(page)).toHaveText("100 Everyday Korean Sentences");
    await expect(page.getByText("Free Study Guide", { exact: true })).toBeVisible();
    await expect(page.getByText("Korean While You Sleep · EP01")).toBeVisible();
    await expect(page.getByTestId("edition-badge")).toHaveText("English edition");
    // 화면과 PDF 언어가 같으면 별도 안내는 없습니다.
    await expect(page.getByTestId("edition-notice")).toHaveCount(0);
    // 실제 PDF의 물리 페이지 수(표지·뒷표지 포함)
    await expect(page.getByText("43 pages · PDF · No sign-up required")).toBeVisible();
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

    await expect(page).toHaveURL(new RegExp(`${ep01Path("en")}\\?utm_source=youtube$`));
    await expect(page).toHaveTitle(
      "100 Everyday Korean Sentences EP01 – Free Study Guide | Hangyul"
    );
    // 대표 주소에는 utm_*이 붙지 않습니다.
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${PROD}${ep01Path("en")}`
    );
    await expect(page.locator('link[rel="alternate"][hreflang="ja"]')).toHaveAttribute(
      "href",
      `${PROD}${ep01Path("ja")}`
    );
    await expect(
      page.locator('link[rel="alternate"][hreflang="x-default"]')
    ).toHaveAttribute("href", `${PROD}${ep01Path("en")}`);
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
    await expect(page).toHaveURL(new RegExp(`${ep01Path("en")}$`));
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${PROD}${ep01Path("en")}`
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
      await expect(h1(page)).toHaveText(formatCopy(locale).title);
      await expect(
        page.getByRole("main").getByText(formatCopy(locale).eyebrow, { exact: true })
      ).toBeVisible();
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
        `${PROD}${ep01Path(locale)}`
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
    await expect(h1(page)).toHaveText(formatCopy("ar").title);

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

  test("switching language goes to that language's canonical page and keeps UTM parameters", async ({ page }) => {
    await page.goto(
      `${EN_LINK}&utm_source=youtube&utm_medium=comment&utm_campaign=korean-while-you-sleep-ep01`
    );
    await languageTrigger(page).click();
    await page.getByRole("banner").locator('a[hreflang="ja"]').click();

    await page.waitForURL(/\/ja\/resources\//);
    const url = new URL(page.url());
    expect(url.pathname).toBe(ep01Path("ja"));
    expect(url.searchParams.get("resource")).toBeNull();
    expect(url.searchParams.get("lang")).toBeNull();
    expect(url.searchParams.get("utm_source")).toBe("youtube");
    expect(url.searchParams.get("utm_medium")).toBe("comment");
    expect(url.searchParams.get("utm_campaign")).toBe("korean-while-you-sleep-ep01");

    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
    await expect(h1(page)).toHaveText(formatCopy("ja").title);
  });

  test("works from an original link that had no lang", async ({ page }) => {
    await page.goto(`${RESOURCE_LINK}&utm_source=reddit`);
    await languageTrigger(page).click();
    await page.getByRole("banner").locator('a[hreflang="ru"]').click();
    await page.waitForURL(/\/ru\/resources\//);
    const url = new URL(page.url());
    expect(url.pathname).toBe(ep01Path("ru"));
    expect(url.searchParams.get("utm_source")).toBe("reddit");
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  });

  test("search filters languages by native and English names", async ({ page }) => {
    await page.goto(EN_LINK);
    await languageTrigger(page).click();
    const search = page.getByRole("banner").getByRole("textbox");

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
    // 서버가 그린 HTML에 이미 각 언어의 대표 주소가 들어 있습니다 (hreflang과 같은 주소).
    await expect(page.getByRole("banner").locator('a[hreflang="de"]')).toHaveAttribute(
      "href",
      ep01Path("de")
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
      await expect(page).toHaveURL(new RegExp(`${ep01Path(lang)}$`));
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

test.describe("Header matches the homepage header", () => {
  /** 로고·언어 선택기·국기·글자의 크기와 위치 (홈페이지와 같은 방식으로 측정) */
  const headerMetrics = (page: Page) =>
    page.evaluate(() => {
      const rect = (el: Element) => {
        const r = el.getBoundingClientRect();
        return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
      };
      const header = document.querySelector("header")!;
      const trigger = header.querySelector("button[aria-expanded]")!;
      const label = trigger.querySelector('[class*="langCode"]')!;
      const ts = getComputedStyle(trigger);
      const ls = getComputedStyle(label);
      return {
        headerHeight: Math.round(header.getBoundingClientRect().height),
        logo: rect(header.querySelector("a img")!),
        flag: rect(trigger.querySelector("img")!).slice(2),
        label: [ls.fontSize, ls.fontWeight, ls.color, (label as HTMLElement).offsetWidth > 0],
        border: [ts.borderTopWidth, ts.borderTopColor, ts.borderTopLeftRadius],
        triggerBox: rect(trigger),
      };
    });

  for (const width of [1280, 1440, 1600, 1920]) {
    test(`logo and language selector match the homepage at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/en");
      const home = await headerMetrics(page);
      await page.goto(EN_LINK);
      const resource = await headerMetrics(page);

      expect(resource).toEqual(home);
      // 홈페이지 내비게이션은 넣지 않습니다.
      await expect(page.getByRole("banner").getByRole("link")).toHaveCount(1);
    });
  }

  test("mobile logo, flag and header height match the homepage", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en");
    const home = await headerMetrics(page);
    await page.goto(EN_LINK);
    const resource = await headerMetrics(page);

    expect(resource.headerHeight).toBe(home.headerHeight);
    expect(resource.logo).toEqual(home.logo);
    expect(resource.flag).toEqual(home.flag);
    expect(resource.label).toEqual(home.label); // 모바일에서는 언어명 숨김
    expect(resource.border).toEqual(home.border);
    // 햄버거가 없으므로 국기는 컨테이너 오른쪽 끝(16px 여백) 안쪽 8px에 붙습니다.
    const flagRight = await page.evaluate(
      () => Math.round(document.querySelector("header button[aria-expanded] img")!.getBoundingClientRect().right)
    );
    expect(flagRight).toBe(390 - 16 - 8);
  });
});

test.describe("One container for header, hero and sections", () => {
  /** 요소의 좌우 끝 */
  const edges = (page: Page) =>
    page.evaluate(() => {
      const box = (el: Element | null) => {
        const b = el!.getBoundingClientRect();
        return { left: Math.round(b.left), right: Math.round(b.right) };
      };
      const footer = document.querySelector("footer")!;
      return {
        headerLogo: box(document.querySelector("header a img")),
        selector: box(document.querySelector("header button")),
        coverSurface: box(document.querySelector('[data-testid="cover-surface"]')),
        info: box(document.querySelector("h1")!.parentElement),
        closing: box(document.querySelector("#closing-title")!.closest("div")!.parentElement),
        footerLogo: box(footer.querySelector("img")),
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
    test(`hero, closing card and footer share the header edges at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(EN_LINK);
      const e = await edges(page);

      for (const key of ["coverSurface", "closing", "footerLogo"] as const) {
        expect(e[key].left, key).toBe(e.headerLogo.left);
      }
      for (const key of ["info", "closing"] as const) {
        expect(e[key].right, key).toBe(e.selector.right);
      }
    });
  }

  test("edges are mirrored in RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${RESOURCE_LINK}&lang=ar`);
    const e = await edges(page);

    for (const key of ["coverSurface", "closing", "footerLogo"] as const) {
      expect(e[key].right, key).toBe(e.headerLogo.right);
    }
    for (const key of ["info", "closing"] as const) {
      expect(e[key].left, key).toBe(e.selector.left);
    }
  });
});

/*
 * 자료 페이지는 홈페이지와 같은 Footer 컴포넌트를 변형 없이 씁니다.
 * 마크업(문구·링크·아이콘)과 렌더링된 위치·스타일이 홈페이지와 완전히 같아야 합니다.
 */
test.describe("Footer is the homepage footer", () => {
  /** 푸터 안 모든 요소의 (푸터 기준) 위치·크기와 주요 계산 스타일 */
  const footerSnapshot = (page: Page) =>
    page.evaluate(() => {
      const footer = document.querySelector("footer")!;
      const origin = footer.getBoundingClientRect();
      const props = [
        "color", "fontSize", "fontWeight", "fontFamily", "lineHeight",
        "backgroundColor", "paddingTop", "paddingBottom", "gap", "textAlign",
      ] as const;
      return {
        html: footer.outerHTML,
        // SVG <defs>(그라데이션 정의)는 화면에 그려지지 않아 위치가 의미 없으므로 제외합니다.
        nodes: [footer, ...footer.querySelectorAll("*")]
          .filter((el) => !el.closest("defs"))
          .map((el) => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return {
            tag: el.tagName,
            x: Math.round(r.left - origin.left),
            y: Math.round(r.top - origin.top),
            w: Math.round(r.width),
            h: Math.round(r.height),
            ...Object.fromEntries(props.map((p) => [p, cs[p]])),
          };
        }),
      };
    });

  for (const width of [1280, 1440, 1600, 1920, 820, 430, 390, 360]) {
    test(`renders exactly like the homepage footer at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/en");
      const home = await footerSnapshot(page);
      await page.goto(EN_LINK);
      const resource = await footerSnapshot(page);

      expect(resource.html).toBe(home.html);
      expect(resource.nodes).toEqual(home.nodes);
    });
  }

  for (const lang of ["ko", "ja", "de", "ru", "ar"]) {
    test(`follows the UI language with the homepage copy (lang=${lang})`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/${lang}`);
      const home = await footerSnapshot(page);
      await page.goto(`${RESOURCE_LINK}&lang=${lang}`);
      const resource = await footerSnapshot(page);

      expect(resource.html).toBe(home.html);
      expect(resource.nodes).toEqual(home.nodes);
    });
  }
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

      // 모바일에서는 국기만 보이는 트리거에 44px 터치 영역을 둡니다.
      if (vp.width <= 768) {
        const trigger = await languageTrigger(page).boundingBox();
        expect(trigger!.height).toBeGreaterThanOrEqual(44);
        expect(trigger!.width).toBeGreaterThanOrEqual(44);
      }
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

/*
 * EP02 — 같은 페이지 컴포넌트·같은 레지스트리로 렌더링되는 두 번째 가이드.
 * EP01 문구·이미지·PDF·영상이 섞여 나오지 않는지 확인합니다.
 */
const EP02_SLUG = "ep02-en-study-guide";
const EP02_RESOURCE_LINK = `/download?resource=${EP02_SLUG}`;
const EP02_EN_LINK = `${EP02_RESOURCE_LINK}&lang=en`;
const EP02_PDF_PATH = `/download/files/${EP02_SLUG}.pdf`;
const EP02_DOWNLOAD_FILE_NAME =
  "Hangyul_EP02_100_Everyday_Korean_Sentences_Study_Guide_EN.pdf";
const EP02_SOURCE_PDF = path.join(
  process.cwd(),
  "src/assets/downloads/EP02_EN_Study_Guide.pdf"
);
const EP02_YOUTUBE_URL = "https://youtu.be/eMv0Tsq08SQ";
const ep02Path = (locale: string) => `/${locale}/resources/100-everyday-korean-sentences-ep02`;
/**
 * 자료 자체의 이미지(표지·미리보기)만 모읍니다.
 * 아래쪽 "다른 무료 학습 가이드" 링크의 썸네일은 의도적으로 다른 자료의 표지이므로 제외합니다.
 */
const ownImageMedia = (page: Page) =>
  page.locator("main > section img").evaluateAll((imgs) =>
    imgs.map((img) => {
      const src = (img as HTMLImageElement).currentSrc || img.getAttribute("src") || "";
      return decodeURIComponent(src).match(/\/_next\/static\/media\/[^&?]+/)?.[0] ?? "";
    })
  );
const ep02Copy = (locale: string) => messages(locale).resources.ep02EnStudyGuide;

test.describe("EP02 — /download?resource=ep02-en-study-guide&lang=en", () => {
  test("renders from an external link with EP02 identity", async ({ page }) => {
    const response = await page.goto(EP02_EN_LINK);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(new RegExp(`${ep02Path("en")}$`));

    await expect(h1(page)).toHaveText("100 Everyday Korean Sentences");
    await expect(page.getByTestId("resource-series")).toHaveText("Korean While You Sleep · EP02");
    await expect(page.locator("main > section").getByText("Korean While You Sleep · EP01")).toHaveCount(0);
    await expect(page.getByTestId("edition-badge")).toHaveText("English edition");
    await expect(page.getByText("43 pages · PDF · No sign-up required")).toBeVisible();
    await expect(page.getByText(ep02Copy("en").description)).toBeVisible();
    await expect(page.getByText(ep02Copy("en").topics)).toBeVisible();
    await expect(
      page.getByRole("img", { name: /korean while you sleep ep02, english edition/i })
    ).toBeVisible();
  });

  test("the YouTube button links to the EP02 video", async ({ page }) => {
    await page.goto(EP02_EN_LINK);
    const youtube = page.getByRole("link", { name: /watch ep\.02 on youtube/i });
    await expect(youtube).toHaveAttribute("href", EP02_YOUTUBE_URL);
    await expect(youtube).not.toHaveAttribute("href", YOUTUBE_URL);
    await expect(youtube).toHaveAttribute("target", "_blank");
    await expect(youtube).toHaveAttribute("rel", /noopener/);
    await expect(youtube).not.toContainText("EP.01");
  });

  test("uses EP02 images, not EP01 artwork", async ({ page }) => {
    await page.goto(EN_LINK);
    const ep01Media = await ownImageMedia(page);
    const ep01Og = await page.locator('meta[property="og:image"]').getAttribute("content");

    await page.goto(EP02_EN_LINK);
    const og = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(og).toMatch(/\.jpg$/);
    expect(og).not.toBe(ep01Og);

    const media = await ownImageMedia(page);
    expect(media.length).toBe(3);
    for (const src of media) {
      expect(src).toBeTruthy();
      expect(ep01Media).not.toContain(src);
    }
  });

  test("has EP02 SEO metadata", async ({ page }) => {
    await page.goto(EP02_EN_LINK);
    await expect(page).toHaveTitle(
      "100 Everyday Korean Sentences EP02 – Free Study Guide | Hangyul"
    );
    // EP02는 EP01로 canonical 되지 않고 자기 주소를 가집니다.
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${PROD}${ep02Path("en")}`
    );
  });

  test("the link without lang still works", async ({ page }) => {
    await page.goto(EP02_RESOURCE_LINK);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByTestId("resource-series")).toHaveText("Korean While You Sleep · EP02");
    await expect(heroDownload(page)).toHaveAttribute("href", EP02_PDF_PATH);
  });

  test("Korean UI keeps the English-edition EP02 PDF", async ({ page }) => {
    await page.goto(`${EP02_RESOURCE_LINK}&lang=ko`);
    const m = messages("ko");
    await expect(page.locator("html")).toHaveAttribute("lang", "ko");
    await expect(h1(page)).toHaveText(formatCopy("ko").title);
    await expect(page.getByText(ep02Copy("ko").description)).toBeVisible();
    await expect(page.getByTestId("edition-badge")).toHaveText(m.editionLanguages.en.label);
    await expect(page.getByTestId("edition-notice")).toHaveText(m.editionLanguages.en.notice);
    await expect(page.getByTestId("resource-youtube")).toContainText(ep02Copy("ko").youtubeCta);
    await expect(page.getByTestId("resource-youtube")).toHaveAttribute("href", EP02_YOUTUBE_URL);
    await expect(heroDownload(page)).toHaveAttribute("href", EP02_PDF_PATH);
    await expect(heroDownload(page)).toHaveAttribute("download", EP02_DOWNLOAD_FILE_NAME);
    await expect(page).toHaveTitle(ep02Copy("ko").seoTitle);
  });

  test("every UI language shows its own EP02 YouTube CTA, EP01 keeps EP.01", async ({ page }) => {
    // 32개 화면 언어를 차례로 엽니다 (기존 링크 → 301 → 대표 주소).
    test.slow();
    const locales = fs
      .readdirSync(path.join(process.cwd(), "messages"))
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""));
    expect(locales.length).toBeGreaterThan(1);
    for (const locale of locales) {
      const ep02Cta = ep02Copy(locale).youtubeCta;
      expect(ep02Cta, locale).toContain("EP.02");
      if (locale !== "en") expect(ep02Cta, locale).not.toBe(ep02Copy("en").youtubeCta);
      expect(copy(locale).youtubeCta, locale).toContain("EP.01");

      await page.goto(`${EP02_RESOURCE_LINK}&lang=${locale}`);
      const youtube = page.getByTestId("resource-youtube");
      await expect(youtube, locale).toContainText(ep02Cta);
      await expect(youtube, locale).toHaveAttribute("href", EP02_YOUTUBE_URL);
    }
  });

  test("Japanese UI keeps the English-edition EP02 PDF", async ({ page }) => {
    await page.goto(`${EP02_RESOURCE_LINK}&lang=ja`);
    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
    await expect(page.getByTestId("edition-badge")).toHaveText(messages("ja").editionLanguages.en.label);
    await expect(heroDownload(page)).toHaveAttribute("href", EP02_PDF_PATH);
  });

  test("the PDF endpoint serves the exact EP02 PDF, different from EP01", async ({ page }) => {
    const response = await page.request.get(EP02_PDF_PATH);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("application/pdf");
    expect(response.headers()["content-disposition"]).toContain(
      `filename="${EP02_DOWNLOAD_FILE_NAME}"`
    );
    const body = await response.body();
    expect(body.subarray(0, 5).toString()).toBe("%PDF-");
    expect(body.equals(fs.readFileSync(EP02_SOURCE_PDF))).toBe(true);

    const ep01 = await (await page.request.get(PDF_PATH)).body();
    expect(ep01.equals(body)).toBe(false);
  });

  test("clicking the CTA downloads the EP02 PDF", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "download events are Chromium/Firefox only");
    await page.goto(EP02_EN_LINK);
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      heroDownload(page).click(),
    ]);
    expect(download.suggestedFilename()).toBe(EP02_DOWNLOAD_FILE_NAME);
    expect(fs.readFileSync(await download.path()).equals(fs.readFileSync(EP02_SOURCE_PDF))).toBe(true);
  });

  for (const vp of [
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 1280, height: 800 },
    { width: 1440, height: 900 },
    { width: 1600, height: 900 },
    { width: 1920, height: 1080 },
  ]) {
    test(`${vp.width}×${vp.height}: no overflow, EP number and CTA above the fold`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto(EP02_EN_LINK);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBe(0);
      await expect(page.getByTestId("resource-series")).toBeInViewport();
      const box = await heroDownload(page).boundingBox();
      expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height);
      await expect(page.getByTestId("resource-download-closing")).toHaveAttribute("href", EP02_PDF_PATH);
      await expect(page.getByRole("contentinfo")).toBeVisible();
    });
  }

  test("EP01 and EP02 share the same layout geometry", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const measure = async (url: string) => {
      await page.goto(url);
      return {
        cover: await page.locator("main img").first().boundingBox(),
        title: await h1(page).boundingBox(),
      };
    };
    const a = await measure(EN_LINK);
    const b = await measure(EP02_EN_LINK);
    expect(Math.round(b.cover!.x)).toBe(Math.round(a.cover!.x));
    expect(Math.round(b.cover!.width)).toBe(Math.round(a.cover!.width));
    expect(Math.round(b.title!.x)).toBe(Math.round(a.title!.x));
  });
});

test.describe("EP01 — refreshed source PDF", () => {
  test("the YouTube button names EP.01 and opens the EP01 video", async ({ page }) => {
    await page.goto(EN_LINK);
    const youtube = page.getByTestId("resource-youtube");
    await expect(youtube).toHaveAttribute("href", YOUTUBE_URL);
    await expect(youtube).toContainText("Watch EP.01 on YouTube");
  });

  test("serves the repository EP01 PDF, never the EP02 file", async ({ page }) => {
    const body = await (await page.request.get(PDF_PATH)).body();
    expect(body.equals(fs.readFileSync(SOURCE_PDF))).toBe(true);
    expect(body.equals(fs.readFileSync(EP02_SOURCE_PDF))).toBe(false);
  });

  for (const vp of [
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 1600, height: 900 },
    { width: 1920, height: 1080 },
  ]) {
    test(`${vp.width}×${vp.height}: no overflow, EP01 visible, CTA above the fold`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto(EN_LINK);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBe(0);
      await expect(page.getByTestId("resource-series")).toHaveText("Korean While You Sleep · EP01");
      await expect(page.getByTestId("resource-series")).toBeInViewport();
      const box = await heroDownload(page).boundingBox();
      expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height);
    });
  }
});

test("an unregistered resource (ep04-en-study-guide) is not found and serves no PDF", async ({ page }) => {
  const response = await page.goto("/download?resource=ep04-en-study-guide&lang=en");
  expect(response?.status()).toBe(404);
  await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0);
  expect((await page.request.get("/download/files/ep04-en-study-guide.pdf")).status()).toBe(404);
});

/* ───────────── 500 Essential Korean Words (Korean Vocabulary Mastery EP01) ───────────── */

const WORDS_SLUG = "ep01-en-500-essential-korean-words-study-guide";
const WORDS_RESOURCE_LINK = `/download?resource=${WORDS_SLUG}`;
const WORDS_EN_LINK = `${WORDS_RESOURCE_LINK}&lang=en`;
const WORDS_PDF_PATH = `/download/files/${WORDS_SLUG}.pdf`;
const WORDS_DOWNLOAD_FILE_NAME =
  "Hangyul_EP01_500_Essential_Korean_Words_Study_Guide_EN.pdf";
const WORDS_SOURCE_PDF = path.join(
  process.cwd(),
  "src/assets/downloads/EP01_EN_500_Essential_Korean_Words_Study_Guide.pdf"
);
const wordsCopy = (locale: string) =>
  messages(locale).resources.ep01En500EssentialWords;
const wordsFormat = (locale: string) =>
  (messages(locale).formats as unknown as Record<string, Record<string, string>>)
    .essentialWords;
const WORDS_YOUTUBE_URL = "https://www.youtube.com/watch?v=zl2JdibNnR4";
const wordsPath = (locale: string) => `/${locale}/resources/500-essential-korean-words-ep01`;
const comingSoonDialog = (page: Page) =>
  page.locator('[data-modal="youtube-coming-soon"]');

test.describe("500 Essential Korean Words — /download?resource=ep01-en-500-essential-korean-words-study-guide&lang=en", () => {
  test("renders its own vocabulary identity, not the sentence guides", async ({ page }) => {
    const response = await page.goto(WORDS_EN_LINK);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(new RegExp(`${wordsPath("en")}$`));

    await expect(h1(page)).toHaveText("500 Essential Korean Words");
    await expect(page.getByText("Free Study Guide", { exact: true })).toBeVisible();
    await expect(page.getByTestId("resource-series")).toHaveText("Korean Vocabulary Mastery · EP01");
    await expect(page.getByTestId("edition-badge")).toHaveText("English edition");
    await expect(page.getByTestId("edition-notice")).toHaveCount(0);
    await expect(page.getByText(wordsCopy("en").description)).toBeVisible();

    await expect(page.locator("main dd")).toHaveText(["500", "20", "75"]);
    await expect(page.getByText("essential words", { exact: true })).toBeVisible();
    await expect(page.getByText("topic chapters", { exact: true })).toBeVisible();
    await expect(page.getByText("75 pages · PDF · No sign-up required")).toBeVisible();

    // What's inside: 형식 문구 + 판 문구(topics)
    for (const title of [
      "500 essential Korean words",
      "A real example for every word",
      "Meaning + romanization + usage notes",
      "Reviews + quick reference",
    ]) {
      await expect(page.getByRole("heading", { level: 3, name: title })).toBeVisible();
    }
    await expect(page.getByText(wordsCopy("en").topics)).toBeVisible();
    await expect(page.getByText("A look inside")).toBeVisible();

    // 마무리 영역
    await expect(page.getByRole("heading", { name: "Keep all 500 essential words with you" })).toBeVisible();
    await expect(page.getByText("Download it free and review Korean vocabulary whenever you want.")).toBeVisible();

    // 문장 가이드 문구가 이 자료 본문에 새지 않습니다.
    // (아래쪽 "다른 무료 학습 가이드" 링크는 의도적으로 다른 자료를 가리키므로 제외)
    const own = (await page.locator("main > section").allInnerTexts()).join("\n");
    expect(own).not.toContain("100 Everyday Korean Sentences");
    expect(own).not.toContain("Keep the 100 sentences with you");
    await expect(page.getByText("sentences", { exact: true })).toHaveCount(0);
    expect(own).not.toContain("43 pages");
    expect(own).not.toContain("Korean While You Sleep");
  });

  test("the link without lang falls back to the English UI", async ({ page }) => {
    await page.goto(WORDS_RESOURCE_LINK);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(h1(page)).toHaveText("500 Essential Korean Words");
    await expect(heroDownload(page)).toHaveAttribute("href", WORDS_PDF_PATH);
  });

  test("has its own SEO metadata and social image", async ({ page }) => {
    await page.goto(WORDS_EN_LINK);
    await expect(page).toHaveTitle(
      "500 Essential Korean Words – Free Korean Vocabulary Guide | Hangyul"
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      wordsCopy("en").seoDescription
    );
    // 500단어 가이드는 문장 가이드로 canonical 되지 않고 자기 주소를 가집니다.
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${PROD}${wordsPath("en")}`
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      "500 Essential Korean Words – Free Korean Vocabulary Guide | Hangyul"
    );

    const og = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(og).toMatch(/\.jpg$/);
    for (const other of [EN_LINK, "/download?resource=ep02-en-study-guide&lang=en"]) {
      const html = await (await page.request.get(other)).text();
      expect(html).not.toContain(og!.replace(PROD, ""));
    }
    const image = await page.request.get(og!.replace(PROD, ""));
    expect(image.status()).toBe(200);
  });

  test("uses its own cover and previews, not sentence-guide artwork", async ({ page }) => {
    const others: string[] = [];
    for (const url of [EN_LINK, "/download?resource=ep02-en-study-guide&lang=en"]) {
      await page.goto(url);
      others.push(...(await ownImageMedia(page)));
    }
    await page.goto(WORDS_EN_LINK);
    const media = await ownImageMedia(page);
    expect(media.length).toBe(3);
    for (const src of media) {
      expect(src).toBeTruthy();
      expect(others).not.toContain(src);
    }
    await expect(
      page.getByRole("img", { name: /korean vocabulary mastery ep01, english edition/i })
    ).toBeVisible();
  });

  test("Korean UI keeps the English-edition PDF with a vocabulary-specific notice", async ({ page }) => {
    await page.goto(`${WORDS_RESOURCE_LINK}&lang=ko`);
    const m = messages("ko");
    await expect(page.locator("html")).toHaveAttribute("lang", "ko");
    await expect(h1(page)).toHaveText(wordsFormat("ko").title);
    await expect(page.getByTestId("edition-badge")).toHaveText(m.editionLanguages.en.label);
    await expect(page.getByTestId("edition-notice")).toHaveText(wordsCopy("ko").editionNotice);
    await expect(page.getByTestId("resource-youtube")).toContainText(wordsCopy("ko").youtubeCta);
    await expect(page.getByTestId("resource-youtube")).toHaveAttribute("href", WORDS_YOUTUBE_URL);
    await expect(heroDownload(page)).toHaveAttribute("href", WORDS_PDF_PATH);
    await expect(heroDownload(page)).toHaveAttribute("download", WORDS_DOWNLOAD_FILE_NAME);
    await expect(page).toHaveTitle(wordsCopy("ko").seoTitle);
  });
});

test.describe("500 Essential Korean Words — YouTube", () => {
  test("the CTA links straight to its own EP.01 video in a new tab", async ({ page }) => {
    await page.goto(WORDS_EN_LINK);
    const youtube = page.getByRole("link", { name: /watch ep\.01 on youtube/i });
    await expect(youtube).toBeVisible();
    await expect(youtube).toHaveAttribute("data-testid", "resource-youtube");
    await expect(youtube).toHaveAttribute("href", WORDS_YOUTUBE_URL);
    await expect(youtube).toHaveAttribute("target", "_blank");
    await expect(youtube).toHaveAttribute("rel", /noopener/);
    await expect(youtube).not.toHaveAttribute("href", YOUTUBE_URL);
    await expect(youtube).not.toHaveAttribute("href", EP02_YOUTUBE_URL);
  });

  test("clicking it opens the video and never shows the coming-soon dialog", async ({ page, context }) => {
    await context.route(/https:\/\/www\.youtube\.com\/.*/, (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: "<title>youtube</title>" })
    );
    await page.goto(WORDS_EN_LINK);
    const popup = context.waitForEvent("page");
    await page.getByTestId("resource-youtube").click();
    const newPage = await popup;
    await newPage.waitForLoadState();
    expect(newPage.url()).toBe(WORDS_YOUTUBE_URL);
    await expect(comingSoonDialog(page)).toHaveCount(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("the EP.01 CTA is localized in every UI language and opens the same video", async ({ page }) => {
    test.slow();
    const locales = fs
      .readdirSync(path.join(process.cwd(), "messages"))
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""));
    expect(locales.length).toBeGreaterThan(1);
    for (const locale of locales) {
      const cta = wordsCopy(locale).youtubeCta;
      expect(cta, locale).toContain("EP.01");
      if (locale !== "en") expect(cta, locale).not.toBe(wordsCopy("en").youtubeCta);

      await page.goto(`${WORDS_RESOURCE_LINK}&lang=${locale}`);
      const youtube = page.getByTestId("resource-youtube");
      await expect(youtube, locale).toContainText(cta);
      await expect(youtube, locale).toHaveAttribute("href", WORDS_YOUTUBE_URL);
    }
  });

  test("EP01 and EP02 keep their real YouTube links", async ({ page }) => {
    await page.goto(EN_LINK);
    await expect(page.getByTestId("resource-youtube")).toHaveAttribute("href", YOUTUBE_URL);
    await page.goto("/download?resource=ep02-en-study-guide&lang=en");
    await expect(page.getByTestId("resource-youtube")).toHaveAttribute("href", EP02_YOUTUBE_URL);
  });
});

test.describe("500 Essential Korean Words — PDF download", () => {
  test("the PDF endpoint serves the exact repository vocabulary PDF", async ({ page }) => {
    const response = await page.request.get(WORDS_PDF_PATH);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("application/pdf");
    expect(response.headers()["content-disposition"]).toContain(
      `filename="${WORDS_DOWNLOAD_FILE_NAME}"`
    );
    const body = await response.body();
    expect(body.subarray(0, 5).toString()).toBe("%PDF-");
    expect(body.equals(fs.readFileSync(WORDS_SOURCE_PDF))).toBe(true);

    // 문장 가이드 PDF와는 다른 파일입니다.
    expect(body.equals(fs.readFileSync(SOURCE_PDF))).toBe(false);
    expect(body.equals(fs.readFileSync(EP02_SOURCE_PDF))).toBe(false);
  });

  test("both CTAs point at the vocabulary PDF", async ({ page }) => {
    await page.goto(WORDS_EN_LINK);
    for (const cta of [heroDownload(page), page.getByTestId("resource-download-closing")]) {
      await expect(cta).toHaveText("Download Free PDF");
      await expect(cta).toHaveAttribute("href", WORDS_PDF_PATH);
      await expect(cta).toHaveAttribute("download", WORDS_DOWNLOAD_FILE_NAME);
    }
  });

  test("clicking the CTA downloads the vocabulary PDF", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "download events are Chromium/Firefox only");
    await page.goto(WORDS_EN_LINK);
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      heroDownload(page).click(),
    ]);
    expect(download.suggestedFilename()).toBe(WORDS_DOWNLOAD_FILE_NAME);
    expect(
      fs.readFileSync(await download.path()).equals(fs.readFileSync(WORDS_SOURCE_PDF))
    ).toBe(true);
  });
});

test.describe("500 Essential Korean Words — responsive", () => {
  for (const vp of [
    { width: 360, height: 800 },
    { width: 375, height: 812 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 1280, height: 800 },
    { width: 1440, height: 900 },
    { width: 1600, height: 900 },
    { width: 1920, height: 1080 },
  ]) {
    test(`${vp.width}×${vp.height}: no overflow, CTA above the fold, YouTube link fits`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto(WORDS_EN_LINK);
      const overflow = () =>
        page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
      expect(await overflow()).toBe(0);
      await expect(page.getByTestId("resource-series")).toBeInViewport();
      const box = await heroDownload(page).boundingBox();
      expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height);
      await expect(page.getByRole("contentinfo")).toBeVisible();

      const youtube = page.getByTestId("resource-youtube");
      await expect(youtube).toBeVisible();
      await expect(youtube).toHaveAttribute("href", WORDS_YOUTUBE_URL);
      const y = await youtube.boundingBox();
      expect(y!.x).toBeGreaterThanOrEqual(0);
      expect(y!.x + y!.width).toBeLessThanOrEqual(vp.width);
    });
  }

  test("shares the sentence guides' layout geometry", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const measure = async (url: string) => {
      await page.goto(url);
      return {
        cover: await page.locator("main img").first().boundingBox(),
        title: await h1(page).boundingBox(),
      };
    };
    const a = await measure(EN_LINK);
    const b = await measure(WORDS_EN_LINK);
    expect(Math.round(b.cover!.x)).toBe(Math.round(a.cover!.x));
    expect(Math.round(b.cover!.width)).toBe(Math.round(a.cover!.width));
    expect(Math.round(b.title!.x)).toBe(Math.round(a.title!.x));
  });
});

/* ───────── 새 가이드: EP03 500 Real Korean Sentences · EP02 1,000 Korean Words ─────────
 * EP03은 자기 영상(EP.03)에 연결되어 있고, 1,000단어 EP02는 아직 연결된 영상이 없습니다
 * (youtube.status === "comingSoon"). 자료별 기대값은 NEW_GUIDES의 youtubeUrl로 정합니다.
 * 같은 공유 컴포넌트를 쓰므로 같은 검증을 자료별 기대값으로 반복합니다.
 */

const comingSoon = (locale: string) =>
  (messages(locale).common as unknown as { youtubeComingSoon: Record<string, string> })
    .youtubeComingSoon;
const ALL_LOCALES = fs
  .readdirSync(path.join(process.cwd(), "messages"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""));

const EP03_YOUTUBE_URL = "https://www.youtube.com/watch?v=nzHYfXHrYMo";

const EXISTING_SOURCE_PDFS = [
  SOURCE_PDF,
  EP02_SOURCE_PDF,
  WORDS_SOURCE_PDF,
];

const NEW_GUIDES = [
  {
    name: "EP03 500 Real Korean Sentences",
    slug: "ep03-en-study-guide",
    pagePath: (locale: string) => `/${locale}/resources/500-real-korean-sentences-ep03`,
    messagesKey: "ep03EnStudyGuide",
    format: "realSentences",
    sourcePdf: "src/assets/downloads/EP03_EN_Study_Guide.pdf",
    downloadFileName: "Hangyul_EP03_500_Real_Korean_Sentences_Study_Guide_EN.pdf",
    h1: "500 Real Korean Sentences",
    series: "Korean While You Sleep · EP03",
    stats: ["500", "25", "178"],
    statLabels: ["real Korean sentences", "topic chapters", "pages"],
    microcopy: "178 pages · PDF · No sign-up required",
    features: [
      "500 real Korean sentences",
      "Real conversations",
      "Meaning + romanization + usage notes",
      "Reviews + quick review",
    ],
    closingTitle: "Keep all 500 sentences with you",
    closingBody: "Download the guide free and review real Korean whenever you want.",
    seoTitle: "500 Real Korean Sentences – Free Study Guide | Hangyul",
    coverName: /korean while you sleep ep03, english edition/i,
    youtubeUrl: EP03_YOUTUBE_URL,
    youtubeCta: "Watch EP.03 on YouTube",
    episodeLabel: "EP.03",
    notOwn: ["100 Everyday Korean Sentences", "Keep the 100 sentences with you", "43 pages", "Korean Vocabulary Mastery"],
  },
  {
    name: "EP02 1,000 Korean Words You’ll Actually Use",
    slug: "ep02-en-1000-korean-words-study-guide",
    pagePath: (locale: string) => `/${locale}/resources/1000-korean-words-ep02`,
    messagesKey: "ep02En1000KoreanWords",
    format: "koreanWords1000",
    sourcePdf: "src/assets/downloads/EP02_EN_1000_Korean_Words_Study_Guide.pdf",
    downloadFileName: "Hangyul_EP02_1000_Korean_Words_Study_Guide_EN.pdf",
    h1: "1,000 Korean Words You’ll Actually Use",
    series: "Korean Vocabulary Mastery · EP02",
    stats: ["1,000", "25", "146"],
    statLabels: ["Korean words", "topic chapters", "pages"],
    microcopy: "146 pages · PDF · No sign-up required",
    features: [
      "1,000 useful Korean words",
      "A real example for every word",
      "Meaning + usage guidance",
      "Reviews + quick reference",
    ],
    closingTitle: "Keep all 1,000 Korean words with you",
    closingBody: "Download the guide free and build your Korean vocabulary at your own pace.",
    seoTitle: "1,000 Korean Words You’ll Actually Use – Free Vocabulary Guide | Hangyul",
    coverName: /korean vocabulary mastery ep02, english edition/i,
    youtubeUrl: null,
    youtubeCta: "Watch on YouTube",
    episodeLabel: null,
    notOwn: ["500 Essential Korean Words", "Keep all 500 essential words with you", "75 pages", "Korean While You Sleep"],
  },
] as const;

for (const guide of NEW_GUIDES) {
  const resourceLink = `/download?resource=${guide.slug}`;
  const enLink = `${resourceLink}&lang=en`;
  const pdfPath = `/download/files/${guide.slug}.pdf`;
  const sourcePdf = path.join(process.cwd(), guide.sourcePdf);
  const guideCopy = (locale: string) => messages(locale).resources[guide.messagesKey];
  const guideFormat = (locale: string) =>
    (messages(locale).formats as unknown as Record<string, Record<string, string>>)[guide.format];
  // 연결된 영상이 있으면 에피소드가 들어간 자료별 문구, 없으면 일반 문구를 씁니다.
  const guideYoutubeCta = (locale: string) =>
    (guideCopy(locale) as { youtubeCta?: string }).youtubeCta ?? messages(locale).common.youtubeCta;

  test.describe(`${guide.name} — ${enLink}`, () => {
    test("the public link 301s to its canonical page and renders its own identity", async ({ page }) => {
      const raw = await rawResponse(page, `${enLink}&utm_source=youtube`);
      expect(raw.status()).toBe(301);
      const location = new URL(raw.headers()["location"], PROD);
      expect(location.pathname).toBe(guide.pagePath("en"));
      expect(location.search).toBe("?utm_source=youtube");

      const response = await page.goto(enLink);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveURL(new RegExp(`${guide.pagePath("en")}$`));

      await expect(h1(page)).toHaveText(guide.h1);
      await expect(page.getByText("Free Study Guide", { exact: true })).toBeVisible();
      await expect(page.getByTestId("resource-series")).toHaveText(guide.series);
      await expect(page.getByTestId("edition-badge")).toHaveText("English edition");
      await expect(page.getByTestId("edition-notice")).toHaveCount(0);
      await expect(page.getByText(guideCopy("en").description)).toBeVisible();

      await expect(page.locator("main dd")).toHaveText([...guide.stats]);
      await expect(page.locator("main dt")).toHaveText([...guide.statLabels]);
      await expect(page.getByText(guide.microcopy)).toBeVisible();

      for (const title of guide.features) {
        await expect(page.getByRole("heading", { level: 3, name: title })).toBeVisible();
      }
      await expect(page.getByText(guideCopy("en").topics)).toBeVisible();
      await expect(page.getByText("A look inside")).toBeVisible();

      await expect(page.getByRole("heading", { name: guide.closingTitle })).toBeVisible();
      await expect(page.getByText(guide.closingBody)).toBeVisible();

      // 다른 자료의 문구가 이 자료 본문에 새지 않습니다 ("다른 무료 학습 가이드" 링크 제외).
      const own = (await page.locator("main > section").allInnerTexts()).join("\n");
      for (const text of guide.notOwn) expect(own).not.toContain(text);
    });

    test("has its own SEO metadata and social image", async ({ page }) => {
      await page.goto(enLink);
      await expect(page).toHaveTitle(guide.seoTitle);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        guideCopy("en").seoDescription
      );
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `${PROD}${guide.pagePath("en")}`
      );
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", guide.seoTitle);
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
      const og = await page.locator('meta[property="og:image"]').getAttribute("content");
      expect(og).toMatch(/\.jpg$/);
      expect((await page.request.get(og!.replace(PROD, ""))).status()).toBe(200);
    });

    test("uses its own cover and previews, not another guide's artwork", async ({ page }) => {
      const others: string[] = [];
      for (const url of [
        EN_LINK,
        "/download?resource=ep02-en-study-guide&lang=en",
        WORDS_EN_LINK,
        ...NEW_GUIDES.filter((g) => g.slug !== guide.slug).map(
          (g) => `/download?resource=${g.slug}&lang=en`
        ),
      ]) {
        await page.goto(url);
        others.push(...(await ownImageMedia(page)));
      }
      await page.goto(enLink);
      const media = await ownImageMedia(page);
      expect(media.length).toBe(3);
      for (const src of media) {
        expect(src).toBeTruthy();
        expect(others).not.toContain(src);
      }
      await expect(page.getByRole("img", { name: guide.coverName })).toBeVisible();
    });

    for (const locale of ["ko", "ja"]) {
      test(`${locale} UI keeps the English-edition PDF`, async ({ page }) => {
        await page.goto(`${resourceLink}&lang=${locale}`);
        const m = messages(locale);
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await expect(page).toHaveURL(new RegExp(`${guide.pagePath(locale)}$`));
        await expect(h1(page)).toHaveText(guideFormat(locale).title);
        await expect(page.getByTestId("edition-badge")).toHaveText(m.editionLanguages.en.label);
        await expect(page.getByTestId("edition-notice")).toBeVisible();
        await expect(page.getByTestId("resource-youtube")).toContainText(guideYoutubeCta(locale));
        await expect(heroDownload(page)).toHaveAttribute("href", pdfPath);
        await expect(heroDownload(page)).toHaveAttribute("download", guide.downloadFileName);
        await expect(page).toHaveTitle(guideCopy(locale).seoTitle);
      });
    }
  });

  if (guide.youtubeUrl) {
    const youtubeUrl = guide.youtubeUrl;
    test.describe(`${guide.name} — YouTube`, () => {
      test("the CTA links straight to its own video in a new tab", async ({ page }) => {
        await page.goto(enLink);
        const youtube = page.getByTestId("resource-youtube");
        await expect(youtube).toBeVisible();
        await expect(youtube).toContainText(guide.youtubeCta);
        await expect(youtube).toHaveJSProperty("tagName", "A");
        await expect(youtube).toHaveAttribute("href", youtubeUrl);
        await expect(youtube).toHaveAttribute("target", "_blank");
        await expect(youtube).toHaveAttribute("rel", /noopener/);
        await expect(youtube).not.toHaveAttribute("aria-haspopup", /.*/);
        await expect(youtube).not.toHaveAttribute("data-youtube-status", /.*/);
        // 다른 자료의 영상이 아닙니다.
        for (const other of [YOUTUBE_URL, EP02_YOUTUBE_URL, WORDS_YOUTUBE_URL]) {
          await expect(youtube).not.toHaveAttribute("href", other);
        }
      });

      test("clicking it opens the video and never shows the coming-soon dialog", async ({ page, context }) => {
        await context.route(/https:\/\/www\.youtube\.com\/.*/, (route) =>
          route.fulfill({ status: 200, contentType: "text/html", body: "<title>youtube</title>" })
        );
        page.on("dialog", () => {
          throw new Error("no native dialog may be shown");
        });
        await page.goto(enLink);
        const url = page.url();
        const popup = context.waitForEvent("page");
        await page.getByTestId("resource-youtube").click();
        const newPage = await popup;
        await newPage.waitForLoadState("domcontentloaded");
        expect(newPage.url()).toBe(youtubeUrl);
        expect(page.url()).toBe(url);
        await expect(comingSoonDialog(page)).toHaveCount(0);
        await expect(page.getByRole("dialog")).toHaveCount(0);
      });

      test("the CTA is localized in every UI language and opens the same video", async ({ page }) => {
        test.slow();
        expect(ALL_LOCALES.length).toBe(32);
        for (const locale of ALL_LOCALES) {
          const cta = guideYoutubeCta(locale);
          expect(cta, locale).toContain(guide.episodeLabel!);
          expect(cta, locale).not.toBe(messages(locale).common.youtubeCta);
          if (locale !== "en") expect(cta, locale).not.toBe(guideYoutubeCta("en"));

          await page.goto(`${resourceLink}&lang=${locale}`);
          const youtube = page.getByTestId("resource-youtube");
          await expect(youtube, locale).toContainText(cta);
          await expect(youtube, locale).toHaveAttribute("href", youtubeUrl);
          await expect(youtube, locale).toHaveJSProperty("tagName", "A");
        }
      });
    });
  } else {
  test.describe(`${guide.name} — YouTube is not connected yet`, () => {
    test("the CTA is a visible button, never a link to another video", async ({ page }) => {
      await page.goto(enLink);
      const youtube = page.getByTestId("resource-youtube");
      await expect(youtube).toBeVisible();
      await expect(youtube).toHaveText("Watch on YouTube");
      await expect(youtube).toHaveJSProperty("tagName", "BUTTON");
      await expect(youtube).not.toHaveAttribute("href", /.*/);
      await expect(youtube).toHaveAttribute("aria-haspopup", "dialog");
      await expect(youtube).toHaveAttribute("data-youtube-status", "comingSoon");

      // 다른 에피소드 영상·YouTube 홈으로 대신 연결하지 않습니다.
      const main = await page.locator("main > section").evaluateAll((els) =>
        els.map((el) => el.innerHTML).join("")
      );
      expect(main).not.toContain("youtube.com");
      expect(main).not.toContain("youtu.be");
      await expect(page.locator('main a[href="#"]')).toHaveCount(0);
    });

    test("opens an accessible coming-soon dialog and does not navigate", async ({ page, context }) => {
      await page.goto(enLink);
      const url = page.url();
      let popups = 0;
      context.on("page", () => popups++);
      page.on("dialog", () => {
        throw new Error("window.alert must not be used");
      });

      const trigger = page.getByTestId("resource-youtube");
      await trigger.click();
      const dialog = page.getByRole("dialog", { name: "The video lesson is being prepared" });
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAttribute("aria-modal", "true");
      await expect(dialog).toContainText(/coming soon/i);
      await expect(dialog).toContainText(
        "The YouTube lesson for this study guide isn’t connected yet. You can download the study guide now, and we’ll add the video here when it’s ready."
      );
      await expect(dialog.getByRole("button", { name: "Got it" })).toBeVisible();
      await expect(dialog.getByRole("button", { name: "Close" })).toBeVisible();
      expect(page.url()).toBe(url);
      expect(popups).toBe(0);

      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press("Tab");
        expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
      }
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
    });

    test("closes with Got it, the X button, and a click outside", async ({ page }) => {
      await page.goto(enLink);
      const trigger = page.getByTestId("resource-youtube");
      await trigger.click();
      await comingSoonDialog(page).getByRole("button", { name: "Got it" }).click();
      await expect(comingSoonDialog(page)).toHaveCount(0);

      await trigger.click();
      await comingSoonDialog(page).getByRole("button", { name: "Close" }).click();
      await expect(comingSoonDialog(page)).toHaveCount(0);

      await trigger.click();
      await expect(comingSoonDialog(page)).toBeVisible();
      await page.mouse.click(5, 5);
      await expect(comingSoonDialog(page)).toHaveCount(0);
    });

    test("the CTA and dialog are localized in every UI language", async ({ page }) => {
      test.slow();
      expect(ALL_LOCALES.length).toBe(32);
      for (const locale of ALL_LOCALES) {
        const c = comingSoon(locale);
        if (locale !== "en") {
          expect(c.title, locale).not.toBe(comingSoon("en").title);
          expect(c.body, locale).not.toBe(comingSoon("en").body);
        }
        await page.goto(`${resourceLink}&lang=${locale}`);
        const trigger = page.getByTestId("resource-youtube");
        await expect(trigger, locale).toHaveText(messages(locale).common.youtubeCta);
        await trigger.click();
        const dialog = page.getByRole("dialog", { name: c.title });
        await expect(dialog, locale).toBeVisible();
        await expect(dialog, locale).toContainText(c.body);
        await expect(dialog.getByRole("button", { name: c.confirm }), locale).toBeVisible();
        await expect(dialog.getByRole("button", { name: c.close }), locale).toBeVisible();
      }
    });

    test("has no WCAG A/AA violations with the dialog open", async ({ page }) => {
      await page.goto(enLink);
      await page.getByTestId("resource-youtube").click();
      await expect(comingSoonDialog(page)).toBeVisible();
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      expect(results.violations).toEqual([]);
    });
  });
  }

  test.describe(`${guide.name} — PDF download`, () => {
    test("the endpoint serves exactly the repository PDF", async ({ page }) => {
      const response = await page.request.get(pdfPath);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toBe("application/pdf");
      expect(response.headers()["content-disposition"]).toContain(
        `filename="${guide.downloadFileName}"`
      );
      const body = await response.body();
      const source = fs.readFileSync(sourcePdf);
      expect(Number(response.headers()["content-length"])).toBe(source.byteLength);
      expect(body.equals(source)).toBe(true);
      expect(body.subarray(0, 5).toString()).toBe("%PDF-");

      // 다른 자료의 PDF가 아닙니다.
      for (const other of [
        ...EXISTING_SOURCE_PDFS,
        ...NEW_GUIDES.filter((g) => g.slug !== guide.slug).map((g) =>
          path.join(process.cwd(), g.sourcePdf)
        ),
      ]) {
        expect(body.equals(fs.readFileSync(other))).toBe(false);
      }
    });

    test("both CTAs point at this guide's PDF", async ({ page }) => {
      await page.goto(enLink);
      for (const cta of [heroDownload(page), page.getByTestId("resource-download-closing")]) {
        await expect(cta).toHaveText("Download Free PDF");
        await expect(cta).toHaveAttribute("href", pdfPath);
        await expect(cta).toHaveAttribute("download", guide.downloadFileName);
      }
    });

    test("clicking the CTA downloads this guide's PDF", async ({ page, browserName }) => {
      test.skip(browserName === "webkit", "download events are Chromium/Firefox only");
      await page.goto(enLink);
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        heroDownload(page).click(),
      ]);
      expect(download.suggestedFilename()).toBe(guide.downloadFileName);
      expect(fs.readFileSync(await download.path()).equals(fs.readFileSync(sourcePdf))).toBe(true);
    });
  });

  test.describe(`${guide.name} — responsive`, () => {
    for (const vp of [
      { width: 360, height: 800 },
      { width: 375, height: 812 },
      { width: 390, height: 844 },
      { width: 430, height: 932 },
      { width: 1280, height: 800 },
      { width: 1440, height: 900 },
      { width: 1600, height: 900 },
      { width: 1920, height: 1080 },
    ]) {
      test(`${vp.width}×${vp.height}: no overflow, CTA above the fold, YouTube CTA fits`, async ({ page }) => {
        await page.setViewportSize(vp);
        await page.goto(enLink);
        const overflow = () =>
          page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth
          );
        expect(await overflow()).toBe(0);
        await expect(h1(page)).toBeInViewport();
        await expect(page.getByTestId("edition-badge")).toBeInViewport();
        const box = await heroDownload(page).boundingBox();
        expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height);

        // 통계 3개가 한 줄 안에 들어갑니다.
        const stats = await page.locator("main dl > div").evaluateAll((els) =>
          els.map((el) => el.getBoundingClientRect()).map((r) => ({ left: r.left, right: r.right }))
        );
        expect(stats.length).toBe(3);
        for (const s of stats) {
          expect(s.left).toBeGreaterThanOrEqual(0);
          expect(s.right).toBeLessThanOrEqual(vp.width);
        }

        // 미리보기는 화면 안에 들어갑니다.
        for (const img of await page.locator("main figure img").all()) {
          await img.scrollIntoViewIfNeeded();
          const r = await img.boundingBox();
          expect(r!.x).toBeGreaterThanOrEqual(0);
          expect(r!.x + r!.width).toBeLessThanOrEqual(vp.width);
        }

        await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
        await expect(page.getByRole("contentinfo")).toBeVisible();
        await expect(page.getByRole("contentinfo").locator('a[href="/en/resources"]')).toBeVisible();

        await page.evaluate(() => window.scrollTo(0, 0));
        const youtube = page.getByTestId("resource-youtube");
        if (guide.youtubeUrl) {
          // 연결된 영상: 링크가 화면 안에 들어가고, PDF 버튼 아래의 보조 버튼으로 남습니다.
          await expect(youtube).toHaveAttribute("href", guide.youtubeUrl);
          const y = await youtube.boundingBox();
          expect(y!.x).toBeGreaterThanOrEqual(0);
          expect(y!.x + y!.width).toBeLessThanOrEqual(vp.width);
          expect(await youtube.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
          if (vp.width < 600) {
            // 같은 스크롤 위치에서 한 번에 잽니다: PDF 버튼이 위, YouTube 버튼이 그 아래이고 더 크지 않습니다.
            const [primary, secondary] = await page.evaluate(() =>
              ["resource-download-hero", "resource-youtube"].map((id) => {
                const r = document.querySelector(`[data-testid="${id}"]`)!.getBoundingClientRect();
                return { top: r.top, bottom: r.bottom, height: r.height };
              })
            );
            expect(secondary.top).toBeGreaterThanOrEqual(primary.bottom);
            expect(secondary.height).toBeLessThanOrEqual(primary.height);
          }
          await expect(page.getByRole("dialog")).toHaveCount(0);
          return;
        }
        await youtube.click();
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeInViewport({ ratio: 1 });
        const d = await dialog.boundingBox();
        expect(d!.x).toBeGreaterThanOrEqual(0);
        expect(d!.x + d!.width).toBeLessThanOrEqual(vp.width);
        expect(d!.width).toBeLessThanOrEqual(480);
        expect(await overflow()).toBe(0);
      });
    }

    test("shares the existing guides' layout geometry", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      const measure = async (url: string) => {
        await page.goto(url);
        return {
          cover: await page.locator("main img").first().boundingBox(),
          title: await h1(page).boundingBox(),
          cta: await heroDownload(page).boundingBox(),
        };
      };
      const a = await measure(EN_LINK);
      const b = await measure(enLink);
      expect(Math.round(b.cover!.x)).toBe(Math.round(a.cover!.x));
      expect(Math.round(b.cover!.width)).toBe(Math.round(a.cover!.width));
      expect(Math.round(b.title!.x)).toBe(Math.round(a.title!.x));
      expect(Math.round(b.cta!.height)).toBe(Math.round(a.cta!.height));
    });
  });
}

test.describe("Existing guides are unchanged by the new resources", () => {
  for (const [link, youtube, pdf, source, h1Text, dd] of [
    [EN_LINK, YOUTUBE_URL, PDF_PATH, SOURCE_PDF, "100 Everyday Korean Sentences", ["100", "10", "43"]],
    ["/download?resource=ep02-en-study-guide&lang=en", EP02_YOUTUBE_URL, "/download/files/ep02-en-study-guide.pdf", EP02_SOURCE_PDF, "100 Everyday Korean Sentences", ["100", "10", "43"]],
    [WORDS_EN_LINK, WORDS_YOUTUBE_URL, WORDS_PDF_PATH, WORDS_SOURCE_PDF, "500 Essential Korean Words", ["500", "20", "75"]],
  ] as const) {
    test(`${link} keeps its PDF, video, title and stats`, async ({ page }) => {
      await page.goto(link);
      await expect(h1(page)).toHaveText(h1Text);
      await expect(page.locator("main dd")).toHaveText([...dd]);
      await expect(page.getByTestId("resource-youtube")).toHaveAttribute("href", youtube);
      await expect(heroDownload(page)).toHaveAttribute("href", pdf);
      const body = await (await page.request.get(pdf)).body();
      expect(body.equals(fs.readFileSync(source))).toBe(true);
    });
  }
});
