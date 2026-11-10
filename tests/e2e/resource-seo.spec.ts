import { test, expect, type Page } from "@playwright/test";
import fs from "fs";
import path from "path";

/**
 * 무료 학습 자료 페이지의 검색엔진 신호 (Google · Naver · Bing)
 *
 * 대표 주소 /<UI 언어>/resources/<pageSlug> 와 목록 /<UI 언어>/resources 가
 * 서버가 내려준 HTML만으로 이해되는지 확인합니다:
 * 상태 코드, 고유한 title·description, self-canonical, hreflang(32 + x-default),
 * H1 하나, OG·Twitter, JSON-LD(LearningResource·BreadcrumbList), index/follow,
 * 내부 링크, sitemap.xml, robots.txt, PDF의 X-Robots-Tag.
 */

const PROD = "https://www.talkhangyul.com";
const LOCALES = fs
  .readdirSync(path.join(process.cwd(), "messages"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""));

const GUIDES = [
  {
    page: "100-everyday-korean-sentences-ep01",
    messagesKey: "ep01EnStudyGuide",
    format: "everydaySentences",
    episode: "EP01",
    pdf: "/download/files/ep01-en-study-guide.pdf",
    legacy: "/download?resource=ep01-en-study-guide&lang=en",
    enTitle: "100 Everyday Korean Sentences EP01 – Free Study Guide | Hangyul",
  },
  {
    page: "100-everyday-korean-sentences-ep02",
    messagesKey: "ep02EnStudyGuide",
    format: "everydaySentences",
    episode: "EP02",
    pdf: "/download/files/ep02-en-study-guide.pdf",
    legacy: "/download?resource=ep02-en-study-guide&lang=en",
    enTitle: "100 Everyday Korean Sentences EP02 – Free Study Guide | Hangyul",
  },
  {
    page: "500-real-korean-sentences-ep03",
    messagesKey: "ep03EnStudyGuide",
    format: "realSentences",
    episode: "EP03",
    pdf: "/download/files/ep03-en-study-guide.pdf",
    legacy: "/download?resource=ep03-en-study-guide&lang=en",
    enTitle: "500 Real Korean Sentences – Free Study Guide | Hangyul",
  },
  {
    page: "500-essential-korean-words-ep01",
    messagesKey: "ep01En500EssentialWords",
    format: "essentialWords",
    episode: "EP01",
    pdf: "/download/files/ep01-en-500-essential-korean-words-study-guide.pdf",
    legacy: "/download?resource=ep01-en-500-essential-korean-words-study-guide&lang=en",
    enTitle: "500 Essential Korean Words – Free Korean Vocabulary Guide | Hangyul",
  },
  {
    page: "1000-korean-words-ep02",
    messagesKey: "ep02En1000KoreanWords",
    format: "koreanWords1000",
    episode: "EP02",
    pdf: "/download/files/ep02-en-1000-korean-words-study-guide.pdf",
    legacy: "/download?resource=ep02-en-1000-korean-words-study-guide&lang=en",
    enTitle: "1,000 Korean Words You’ll Actually Use – Free Vocabulary Guide | Hangyul",
  },
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;
const messages = (locale: string): Json =>
  JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "messages", `${locale}.json`), "utf8")
  );

const guidePath = (page: string, locale: string) => `/${locale}/resources/${page}`;

/** 서버가 내려준 HTML (JS 실행 전) */
async function serverHtml(page: Page, url: string) {
  const response = await page.request.get(url, { maxRedirects: 0 });
  return { status: response.status(), html: await response.text() };
}

function meta(html: string, attr: "name" | "property", key: string) {
  const tag = html.match(
    new RegExp(`<meta[^>]*${attr}="${key.replace(/[:]/g, "\\$&")}"[^>]*>`, "i")
  )?.[0];
  return tag?.match(/content="([^"]*)"/)?.[1] ?? null;
}

const decode = (value: string | null | undefined) =>
  value
    ?.replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"') ?? null;

function title(html: string) {
  return decode(html.match(/<title>([^<]*)<\/title>/)?.[1]);
}

function canonical(html: string) {
  return html.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? null;
}

function hreflangs(html: string) {
  return new Map(
    [...html.matchAll(/<link rel="alternate" hrefLang="([^"]*)" href="([^"]*)"/g)].map(
      (m) => [m[1], m[2]] as const
    )
  );
}

function jsonLd(html: string): Json[] {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (m) => JSON.parse(m[1])
  );
}

function h1s(html: string) {
  return [...html.matchAll(/<h1[^>]*>(.*?)<\/h1>/g)].map((m) => decode(m[1]));
}

test.describe("Canonical resource pages — server-rendered SEO", () => {
  for (const guide of GUIDES) {
    test(`${guide.page}: English page is complete in the initial HTML`, async ({ page }) => {
      const url = guidePath(guide.page, "en");
      const { status, html } = await serverHtml(page, url);
      expect(status).toBe(200);

      expect(title(html)).toBe(guide.enTitle);
      expect(decode(meta(html, "name", "description"))).toBe(
        messages("en").ResourceDownload.resources[guide.messagesKey].seoDescription
      );
      expect(meta(html, "name", "robots")).toBe("index, follow");
      expect(meta(html, "name", "keywords")).toBeNull();
      expect(canonical(html)).toBe(`${PROD}${url}`);

      // 한 자료의 hreflang: 모든 화면 언어 + x-default, 자기 자신 포함
      const alternates = hreflangs(html);
      expect(alternates.size).toBe(LOCALES.length + 1);
      for (const locale of LOCALES) {
        expect(alternates.get(locale)).toBe(`${PROD}${guidePath(guide.page, locale)}`);
      }
      expect(alternates.get("x-default")).toBe(`${PROD}${url}`);

      // H1은 하나, 자료 이름
      expect(h1s(html)).toEqual([
        messages("en").ResourceDownload.formats[guide.format].title,
      ]);
      // 주요 본문이 JS 없이 초기 HTML에 있습니다.
      expect(html).toContain(guide.episode);
      expect(html).toContain(
        messages("en").ResourceDownload.resources[guide.messagesKey].description
      );

      // Open Graph / Twitter
      expect(decode(meta(html, "property", "og:title"))).toBe(guide.enTitle);
      expect(meta(html, "property", "og:url")).toBe(`${PROD}${url}`);
      expect(meta(html, "property", "og:type")).toBe("website");
      expect(meta(html, "property", "og:site_name")).toBe("Hangyul");
      expect(meta(html, "property", "og:image")).toMatch(/^https:\/\/www\.talkhangyul\.com\/.+\.jpg$/);
      expect(meta(html, "property", "og:image:width")).toBe("1200");
      expect(meta(html, "property", "og:image:height")).toBe("630");
      expect(meta(html, "name", "twitter:card")).toBe("summary_large_image");
      expect(meta(html, "name", "twitter:image")).toBe(meta(html, "property", "og:image"));
    });

    test(`${guide.page}: JSON-LD describes this resource truthfully`, async ({ page }) => {
      const url = guidePath(guide.page, "ja");
      const { html } = await serverHtml(page, url);
      const blocks = jsonLd(html);
      expect(blocks).toHaveLength(1);
      const graph: Json[] = blocks[0]["@graph"];
      const byType = (type: string) => graph.filter((n) => n["@type"] === type);

      expect(byType("Organization")).toHaveLength(1);
      expect(byType("WebPage")).toHaveLength(1);
      expect(byType("LearningResource")).toHaveLength(1);
      expect(byType("BreadcrumbList")).toHaveLength(1);

      const resource = byType("LearningResource")[0];
      expect(resource.url).toBe(`${PROD}${url}`);
      expect(resource.name).toContain(guide.episode);
      // 화면은 일본어지만 PDF는 영어판입니다.
      expect(byType("WebPage")[0].inLanguage).toBe("ja");
      expect(resource.inLanguage).toBe("en");
      expect(resource.isAccessibleForFree).toBe(true);
      expect(resource.encodingFormat).toBe("application/pdf");
      expect(resource.encoding.contentUrl).toBe(`${PROD}${guide.pdf}`);
      expect(resource.thumbnailUrl).toMatch(/^https:\/\/www\.talkhangyul\.com\/.+\.webp$/);
      expect(resource.provider["@id"]).toBe(`${PROD}/#organization`);
      expect(resource.publisher["@id"]).toBe(`${PROD}/#organization`);
      // 근거 없는 값은 넣지 않습니다.
      for (const key of ["aggregateRating", "review", "author", "offers", "datePublished", "timeRequired"]) {
        expect(resource[key], key).toBeUndefined();
      }

      const crumbs = byType("BreadcrumbList")[0].itemListElement;
      expect(crumbs.map((c: Json) => c.item)).toEqual([
        `${PROD}/ja`,
        `${PROD}/ja/resources`,
        `${PROD}${url}`,
      ]);
    });

    test(`${guide.page}: legacy link 301s here and tracking variants canonicalize`, async ({ page }) => {
      const response = await page.request.get(`${guide.legacy}&utm_source=youtube`, {
        maxRedirects: 0,
      });
      expect(response.status()).toBe(301);
      // Location은 같은 호스트의 상대 경로로 내려옵니다 (RFC 9110 허용).
      const location = new URL(response.headers()["location"], PROD);
      expect(location.pathname).toBe(guidePath(guide.page, "en"));
      expect(location.search).toBe("?utm_source=youtube");

      const { status, html } = await serverHtml(page, `${location.pathname}${location.search}`);
      expect(status).toBe(200);
      expect(canonical(html)).toBe(`${PROD}${guidePath(guide.page, "en")}`);
    });

    test(`${guide.page}: links to the other guides and the guide index`, async ({ page }) => {
      const { html } = await serverHtml(page, guidePath(guide.page, "en"));
      const related = html.split('id="related-title"')[1] ?? "";
      for (const other of GUIDES) {
        const href = `href="${guidePath(other.page, "en")}"`;
        if (other.page === guide.page) expect(related).not.toContain(href);
        else expect(related).toContain(href);
      }
      expect(related).toContain('href="/en/resources"');
    });

    test(`${guide.page}: the PDF itself is noindex and still downloads`, async ({ page }) => {
      const response = await page.request.get(guide.pdf);
      expect(response.status()).toBe(200);
      expect(response.headers()["x-robots-tag"]).toBe("noindex");
      expect(response.headers()["content-type"]).toBe("application/pdf");
      expect((await response.body()).subarray(0, 5).toString()).toBe("%PDF-");
    });
  }

  test("titles and descriptions are unique across all resources in every language", async ({ page }) => {
    for (const locale of LOCALE_SAMPLE) {
      const titles = new Set<string | null>();
      const descriptions = new Set<string | null>();
      for (const guide of GUIDES) {
        const { html } = await serverHtml(page, guidePath(guide.page, locale));
        titles.add(title(html));
        descriptions.add(meta(html, "name", "description"));
      }
      expect(titles.size, locale).toBe(GUIDES.length);
      expect(descriptions.size, locale).toBe(GUIDES.length);
    }
  });
});

/** 요청받은 최소 현지화 검증 언어 */
const LOCALE_SAMPLE = ["en", "ko", "ja", "zh", "ru", "de", "ar", "vi"] as const;

test.describe("Localized SEO", () => {
  for (const locale of LOCALE_SAMPLE) {
    test(`${locale}: localized metadata, canonical, dir and the English-edition label`, async ({ page }) => {
      const m = messages(locale).ResourceDownload;
      for (const guide of GUIDES) {
        const url = guidePath(guide.page, locale);
        const { status, html } = await serverHtml(page, url);
        expect(status, url).toBe(200);
        expect(title(html), url).toBe(m.resources[guide.messagesKey].seoTitle);
        expect(decode(meta(html, "name", "description")), url).toBe(
          m.resources[guide.messagesKey].seoDescription
        );
        expect(canonical(html), url).toBe(`${PROD}${url}`);
        expect(hreflangs(html).get(locale), url).toBe(`${PROD}${url}`);
        expect(html, url).toMatch(
          new RegExp(`<html lang="${locale}" dir="${locale === "ar" ? "rtl" : "ltr"}"`)
        );
        expect(h1s(html), url).toEqual([m.formats[guide.format].title]);
        // 화면 언어와 관계없이 PDF는 영어판이라고 밝힙니다.
        expect(html, url).toContain(m.editionLanguages.en.label);
        // 다른 자료로 가는 내부 링크도 같은 화면 언어를 유지합니다.
        expect(html, url).toContain(`href="/${locale}/resources"`);
      }
      if (locale !== "en") {
        expect(m.index.seoTitle).not.toBe(messages("en").ResourceDownload.index.seoTitle);
      }
    });
  }

  test("every hreflang target on every resource page answers 200", async ({ page }) => {
    test.slow();
    const { html } = await serverHtml(page, guidePath(GUIDES[0].page, "en"));
    for (const href of hreflangs(html).values()) {
      const { status } = await serverHtml(page, href.replace(PROD, ""));
      expect(status, href).toBe(200);
    }
  });
});

test.describe("Resource index — /<locale>/resources", () => {
  test("lists all five guides with crawlable links and its own SEO", async ({ page }) => {
    const { status, html } = await serverHtml(page, "/en/resources");
    expect(status).toBe(200);
    expect(title(html)).toBe("Free Korean Study Guides & Learning Resources | Hangyul");
    expect(canonical(html)).toBe(`${PROD}/en/resources`);
    expect(hreflangs(html).get("x-default")).toBe(`${PROD}/en/resources`);
    expect(meta(html, "name", "robots")).toBe("index, follow");
    expect(h1s(html)).toEqual(["Free Korean Study Guides"]);
    for (const guide of GUIDES) {
      expect(html).toContain(`href="${guidePath(guide.page, "en")}"`);
    }
    // EP01과 EP02가 같은 제목으로 보이지 않도록 카드 제목에 에피소드가 들어갑니다.
    const h2s = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((m) => m[1]);
    expect(h2s).toEqual(
      expect.arrayContaining([
        "100 Everyday Korean Sentences EP01",
        "100 Everyday Korean Sentences EP02",
        "500 Essential Korean Words EP01",
        "500 Real Korean Sentences EP03",
        "1,000 Korean Words You’ll Actually Use EP02",
      ])
    );

    const graph: Json[] = jsonLd(html)[0]["@graph"];
    const collection = graph.find((n) => n["@type"] === "CollectionPage");
    expect(collection.mainEntity.itemListElement.map((i: Json) => i.url)).toEqual(
      GUIDES.map((g) => `${PROD}${guidePath(g.page, "en")}`)
    );
  });

  test("is localized (Korean)", async ({ page }) => {
    const { status, html } = await serverHtml(page, "/ko/resources");
    expect(status).toBe(200);
    expect(title(html)).toBe(messages("ko").ResourceDownload.index.seoTitle);
    expect(h1s(html)).toEqual([messages("ko").ResourceDownload.index.title]);
    expect(html).toContain('href="/ko/resources/500-essential-korean-words-ep01"');
    expect(html).toContain('href="/ko/resources/500-real-korean-sentences-ep03"');
    expect(html).toContain('href="/ko/resources/1000-korean-words-ep02"');
  });

  test("the homepage footer links to the guide index", async ({ page }) => {
    for (const locale of ["en", "ko"]) {
      const { html } = await serverHtml(page, `/${locale}`);
      expect(html).toContain(`href="/${locale}/resources"`);
    }
  });

  test("cards open the guide pages", async ({ page }) => {
    await page.goto("/en/resources");
    await page
      .getByRole("link", { name: /500 Essential Korean Words EP01/ })
      .click();
    await expect(page).toHaveURL(/\/en\/resources\/500-essential-korean-words-ep01$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "500 Essential Korean Words"
    );
  });
});

test.describe("Status codes", () => {
  test("unknown resources are real 404s with noindex, never soft 404s", async ({ page }) => {
    for (const url of [
      "/en/resources/100-everyday-korean-sentences-ep03",
      "/ja/resources/unknown",
      "/download?resource=ep04-en-study-guide&lang=en",
    ]) {
      const { status, html } = await serverHtml(page, url);
      expect(status, url).toBe(404);
      expect(html, url).toMatch(/<meta name="robots" content="noindex/);
      expect(html, url).not.toContain('href="/download/files/');
    }
  });

  test("the Ganada smart link is untouched", async ({ page }) => {
    const response = await page.request.get("/download?app=ganada", {
      maxRedirects: 0,
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      },
    });
    expect(response.status()).toBe(302);
    expect(response.headers()["location"]).toBe("/?download=ganada");
  });

  test("no competing hreflang Link header is sent", async ({ page }) => {
    for (const url of ["/en", "/en/resources", guidePath(GUIDES[0].page, "ko")]) {
      const response = await page.request.get(url, { maxRedirects: 0 });
      expect(response.headers()["link"], url).toBeUndefined();
    }
  });
});

test.describe("sitemap.xml and robots.txt", () => {
  test("the sitemap lists every canonical resource URL with hreflang, and nothing else", async ({ page }) => {
    const xml = await (await page.request.get("/sitemap.xml")).text();
    const locs = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);

    for (const locale of LOCALES) {
      expect(locs).toContain(`${PROD}/${locale}/resources`);
      for (const guide of GUIDES) {
        expect(locs).toContain(`${PROD}${guidePath(guide.page, locale)}`);
      }
    }
    expect(locs.length).toBe(LOCALES.length * (2 + GUIDES.length));
    for (const loc of locs) {
      expect(loc).not.toContain("?");
      expect(loc).not.toContain("/download");
    }

    // 자료 항목에는 실제 변경 날짜만 들어가고, hreflang이 함께 있습니다.
    const entry = xml
      .split("<url>")
      .find((u) => u.includes(`<loc>${PROD}${guidePath(GUIDES[1].page, "en")}</loc>`))!;
    expect(entry).toMatch(/<lastmod>2026-11-03/);
    expect(entry).toContain(
      `hreflang="x-default" href="${PROD}${guidePath(GUIDES[1].page, "en")}"`
    );
  });

  test("robots.txt allows crawling and points to the production sitemap", async ({ page }) => {
    const robots = await (await page.request.get("/robots.txt")).text();
    expect(robots).toContain("Allow: /");
    expect(robots).not.toMatch(/Disallow: \/(resources|_next)?\s*$/m);
    expect(robots).toContain(`Sitemap: ${PROD}/sitemap.xml`);
  });
});
