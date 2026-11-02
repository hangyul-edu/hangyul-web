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

    await expect(page).toHaveTitle(
      "100 Everyday Korean Sentences — EP01 Free Study Guide | Hangyul"
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
      await expect(h1(page)).toHaveText(formatCopy(locale).title);
      await expect(page.getByText(formatCopy(locale).eyebrow, { exact: true })).toBeVisible();
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
    await expect(h1(page)).toHaveText(formatCopy("ja").title);
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
 * EP01 문구·이미지·PDF가 섞여 나오지 않는지, 링크된 영상이 EP01인 동안에는
 * 버튼이 EP02 영상인 척하지 않는지를 확인합니다.
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
const ep02Copy = (locale: string) => messages(locale).resources.ep02EnStudyGuide;

test.describe("EP02 — /download?resource=ep02-en-study-guide&lang=en", () => {
  test("renders directly from an external link with EP02 identity", async ({ page }) => {
    const response = await page.goto(EP02_EN_LINK);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(new RegExp(`/download\\?resource=${EP02_SLUG}&lang=en$`));

    await expect(h1(page)).toHaveText("100 Everyday Korean Sentences");
    await expect(page.getByTestId("resource-series")).toHaveText("Korean While You Sleep · EP02");
    await expect(page.getByText("Korean While You Sleep · EP01")).toHaveCount(0);
    await expect(page.getByTestId("edition-badge")).toHaveText("English edition");
    await expect(page.getByText("43 pages · PDF · No sign-up required")).toBeVisible();
    await expect(page.getByText(ep02Copy("en").description)).toBeVisible();
    await expect(page.getByText(ep02Copy("en").topics)).toBeVisible();
    await expect(
      page.getByRole("img", { name: /korean while you sleep ep02, english edition/i })
    ).toBeVisible();
  });

  test("the YouTube button is generic and temporarily links to the EP01 video", async ({ page }) => {
    await page.goto(EP02_EN_LINK);
    const youtube = page.getByTestId("resource-youtube");
    await expect(youtube).toHaveAttribute("href", YOUTUBE_URL);
    await expect(youtube).toHaveAttribute("target", "_blank");
    await expect(youtube).toContainText("Watch on YouTube");
    await expect(youtube).not.toContainText(/EP\.?0\d/);
  });

  test("uses EP02 images, not EP01 artwork", async ({ page }) => {
    await page.goto(EP02_EN_LINK);
    const ep01 = await (await page.request.get(EN_LINK)).text();
    const og = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(og).toMatch(/\.jpg$/);
    expect(ep01).not.toContain(og!.replace(PROD, ""));

    const srcs = await page.locator("main img").evaluateAll((imgs) =>
      imgs.map((img) => (img as HTMLImageElement).currentSrc || img.getAttribute("src"))
    );
    expect(srcs.length).toBe(3);
    for (const src of srcs) {
      const media = decodeURIComponent(src!).match(/\/_next\/static\/media\/[^&?]+/)?.[0];
      expect(media).toBeTruthy();
      expect(ep01).not.toContain(media!);
    }
  });

  test("has EP02 SEO metadata", async ({ page }) => {
    await page.goto(EP02_EN_LINK);
    await expect(page).toHaveTitle(
      "100 Everyday Korean Sentences — EP02 Free Study Guide | Hangyul"
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${PROD}${EP02_EN_LINK}`
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
    await expect(page.getByTestId("resource-youtube")).toContainText(m.common.youtubeCta);
    await expect(heroDownload(page)).toHaveAttribute("href", EP02_PDF_PATH);
    await expect(heroDownload(page)).toHaveAttribute("download", EP02_DOWNLOAD_FILE_NAME);
    await expect(page).toHaveTitle(ep02Copy("ko").seoTitle);
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

test("resource=ep03-en-study-guide is not found and serves no PDF", async ({ page }) => {
  const response = await page.goto("/download?resource=ep03-en-study-guide&lang=en");
  expect(response?.status()).toBe(404);
  await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0);
  expect((await page.request.get("/download/files/ep03-en-study-guide.pdf")).status()).toBe(404);
});
