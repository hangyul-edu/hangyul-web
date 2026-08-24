/**
 * SEO 검증 스크립트
 *
 * 사용법:
 *   npm run build && npm run start   # 다른 터미널에서 서버 실행
 *   npm run seo:check                # 기본 http://localhost:3000
 *   BASE_URL=http://localhost:3100 npm run seo:check
 *
 * 실행 중인 서버가 실제로 내려주는 HTML을 받아서 로케일별로 검사합니다:
 * - title / meta description 존재 및 로케일별 고유성
 * - <html lang> / dir
 * - self-canonical (절대 URL, 프로덕션 호스트)
 * - hreflang 전체 상호 참조 + self + x-default
 * - og:title / og:description / og:url / og:image / og:locale / og:site_name
 * - twitter:card
 * - JSON-LD 파싱 및 WebSite/Organization 노드, alternateName
 * - 의도치 않은 noindex
 * - robots.txt / sitemap.xml
 */
import { routing } from "../src/i18n/routing";
import { BASE_URL } from "../src/constants/site";

const ORIGIN = process.env.BASE_URL ?? "http://localhost:3000";

type Problem = { locale: string; message: string };

const problems: Problem[] = [];
const warnings: Problem[] = [];

function fail(locale: string, message: string) {
  problems.push({ locale, message });
}
function warn(locale: string, message: string) {
  warnings.push({ locale, message });
}

/** 태그 하나의 속성 값을 뽑아낸다. */
function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`, "i"));
  return m ? m[1] : null;
}

function metaContent(html: string, selector: RegExp): string | null {
  const m = html.match(selector);
  if (!m) return null;
  return attr(m[0], "content");
}

function collectHreflangs(html: string): Map<string, string> {
  const out = new Map<string, string>();
  const tags = html.match(/<link[^>]*rel="alternate"[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const lang = attr(tag, "hreflang");
    const href = attr(tag, "href");
    if (lang && href) out.set(lang, href);
  }
  return out;
}

async function checkLocale(locale: string, seenTitles: Map<string, string>) {
  const url = `${ORIGIN}/${locale}`;
  const res = await fetch(url, { redirect: "manual" });

  if (res.status !== 200) {
    fail(locale, `HTTP ${res.status} (기대: 200)`);
    return;
  }

  const html = await res.text();
  const canonicalUrl = `${BASE_URL}/${locale}`;

  // --- title / description ---
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim();
  if (!title) fail(locale, "<title> 없음");
  else if (seenTitles.has(title))
    fail(locale, `title이 ${seenTitles.get(title)}와 중복: "${title}"`);
  else seenTitles.set(title, locale);

  if (title && !/hangyul/i.test(title) && !title.includes("한귤"))
    fail(locale, `title에 브랜드명(Hangyul/한귤) 없음: "${title}"`);

  const description = metaContent(
    html,
    /<meta[^>]*name="description"[^>]*>/i
  );
  if (!description) fail(locale, "meta description 없음");
  else {
    // CJK는 한 글자의 정보량이 커서 라틴 문자 2자 폭으로 환산해 비교한다.
    const weighted = [...description].reduce(
      (sum, ch) => sum + (/[\u3000-\u9fff\uac00-\ud7af]/.test(ch) ? 2 : 1),
      0
    );
    if (weighted < 60)
      warn(locale, `meta description이 너무 짧음(환산 ${weighted}자)`);
  }

  // --- html lang / dir ---
  const htmlTag = html.match(/<html[^>]*>/i)?.[0] ?? "";
  if (attr(htmlTag, "lang") !== locale)
    fail(locale, `<html lang>이 "${attr(htmlTag, "lang")}" (기대: "${locale}")`);
  const expectedDir = locale === "ar" ? "rtl" : "ltr";
  if (attr(htmlTag, "dir") !== expectedDir)
    fail(locale, `<html dir>이 "${attr(htmlTag, "dir")}" (기대: "${expectedDir}")`);

  // --- canonical ---
  const canonicalTag = html.match(/<link[^>]*rel="canonical"[^>]*>/i)?.[0];
  const canonical = canonicalTag ? attr(canonicalTag, "href") : null;
  if (canonical !== canonicalUrl)
    fail(locale, `canonical이 "${canonical}" (기대: "${canonicalUrl}")`);

  // --- hreflang ---
  const hreflangs = collectHreflangs(html);
  for (const l of routing.locales) {
    const expected = `${BASE_URL}/${l}`;
    if (hreflangs.get(l) !== expected)
      fail(locale, `hreflang="${l}"이 "${hreflangs.get(l)}" (기대: "${expected}")`);
  }
  if (hreflangs.get(locale) !== canonicalUrl)
    fail(locale, "self hreflang 없음");
  if (hreflangs.get("x-default") !== `${BASE_URL}/${routing.defaultLocale}`)
    fail(locale, `x-default hreflang이 "${hreflangs.get("x-default")}"`);

  // --- Open Graph / Twitter ---
  const og = (prop: string) =>
    metaContent(html, new RegExp(`<meta[^>]*property="og:${prop}"[^>]*>`, "i"));

  for (const prop of ["title", "description", "url", "image", "locale", "site_name", "type"]) {
    if (!og(prop)) fail(locale, `og:${prop} 없음`);
  }
  if (og("url") !== canonicalUrl)
    fail(locale, `og:url이 "${og("url")}" (기대: "${canonicalUrl}")`);
  if (og("image") && !og("image")!.startsWith(BASE_URL))
    fail(locale, `og:image가 절대 프로덕션 URL이 아님: "${og("image")}"`);
  if (og("site_name") !== "Hangyul")
    fail(locale, `og:site_name이 "${og("site_name")}" (기대: "Hangyul")`);

  const twitterCard = metaContent(
    html,
    /<meta[^>]*name="twitter:card"[^>]*>/i
  );
  if (twitterCard !== "summary_large_image")
    fail(locale, `twitter:card이 "${twitterCard}"`);

  // --- robots ---
  const robotsMeta = metaContent(html, /<meta[^>]*name="robots"[^>]*>/i) ?? "";
  if (/noindex/i.test(robotsMeta))
    fail(locale, `robots 메타에 noindex: "${robotsMeta}"`);

  // --- JSON-LD ---
  const ldBlocks =
    html.match(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
    ) ?? [];
  if (ldBlocks.length === 0) {
    fail(locale, "JSON-LD 없음");
  } else {
    const nodes: Record<string, unknown>[] = [];
    for (const block of ldBlocks) {
      const json = block.replace(/^[\s\S]*?>/, "").replace(/<\/script>$/i, "");
      try {
        const parsed = JSON.parse(json);
        const graph = Array.isArray(parsed["@graph"]) ? parsed["@graph"] : [parsed];
        nodes.push(...graph);
      } catch {
        fail(locale, "JSON-LD 파싱 실패");
      }
    }
    const byType = (type: string) =>
      nodes.find((n) => n["@type"] === type) as Record<string, unknown> | undefined;

    const website = byType("WebSite");
    if (!website) fail(locale, "WebSite JSON-LD 없음");
    else {
      if (website.name !== "Hangyul")
        fail(locale, `WebSite.name이 "${website.name}"`);
      const alt = (website.alternateName as string[]) ?? [];
      for (const expected of ["한귤", "HANGYUL", "HanGyul", "talkhangyul.com"]) {
        if (!alt.includes(expected))
          fail(locale, `WebSite.alternateName에 "${expected}" 없음`);
      }
      if (website.url !== `${BASE_URL}/`)
        fail(locale, `WebSite.url이 "${website.url}"`);
    }

    const org = byType("Organization");
    if (!org) fail(locale, "Organization JSON-LD 없음");
    else if (org.name !== "Hangyul")
      fail(locale, `Organization.name이 "${org.name}"`);

    const page = byType("WebPage");
    if (page && page.url !== canonicalUrl)
      fail(locale, `WebPage.url이 "${page.url}"`);
  }

  // --- 본문이 크롤러가 보는 HTML에 있는지 ---
  if (!/<h1[\s>]/i.test(html)) fail(locale, "<h1> 없음");
  if (!/talkhangyul\.com/.test(html))
    fail(locale, "HTML에 프로덕션 도메인이 없음");
  if (/localhost/.test(html.replace(/<script[\s\S]*?<\/script>/gi, "")))
    fail(locale, "HTML(스크립트 제외)에 localhost 문자열이 있음");
}

async function checkRobotsAndSitemap() {
  const robotsRes = await fetch(`${ORIGIN}/robots.txt`);
  if (!robotsRes.ok) fail("robots.txt", `HTTP ${robotsRes.status}`);
  else {
    const body = await robotsRes.text();
    if (!body.includes(`${BASE_URL}/sitemap.xml`))
      fail("robots.txt", "Sitemap 항목 없음");
    if (/^\s*Disallow:\s*\/\s*$/m.test(body))
      fail("robots.txt", "사이트 전체가 Disallow 되어 있음");
  }

  const sitemapRes = await fetch(`${ORIGIN}/sitemap.xml`);
  if (!sitemapRes.ok) fail("sitemap.xml", `HTTP ${sitemapRes.status}`);
  else {
    const body = await sitemapRes.text();
    if (/localhost/.test(body)) fail("sitemap.xml", "localhost URL 포함");
    for (const locale of routing.locales) {
      if (!body.includes(`<loc>${BASE_URL}/${locale}</loc>`))
        fail("sitemap.xml", `${BASE_URL}/${locale} 없음`);
    }
    const locCount = (body.match(/<loc>/g) ?? []).length;
    if (locCount !== routing.locales.length)
      warn(
        "sitemap.xml",
        `<loc> 개수 ${locCount} (로케일 ${routing.locales.length}개)`
      );
  }
}

async function main() {
  console.log(`SEO 검사 대상: ${ORIGIN} (정규 도메인: ${BASE_URL})\n`);

  const seenTitles = new Map<string, string>();
  for (const locale of routing.locales) {
    await checkLocale(locale, seenTitles);
  }
  await checkRobotsAndSitemap();

  for (const { locale, message } of warnings) {
    console.warn(`  ? [${locale}] ${message}`);
  }

  if (problems.length > 0) {
    console.error(`\n${problems.length}건의 SEO 문제:`);
    for (const { locale, message } of problems) {
      console.error(`  ✗ [${locale}] ${message}`);
    }
    process.exit(1);
  }

  console.log(
    `\n✓ 로케일 ${routing.locales.length}개 + robots.txt + sitemap.xml SEO 검사 통과`
  );
}

main();
