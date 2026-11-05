import { routing } from "@/i18n/routing";

/**
 * 무료 학습 자료 페이지 경로 규칙
 *
 * 대표(canonical) 주소:  /<UI 언어>/resources/<pageSlug>
 *   예) https://www.talkhangyul.com/en/resources/100-everyday-korean-sentences-ep01
 * 자료 목록:            /<UI 언어>/resources
 *
 * 기존 마케팅 링크:      /download?resource=<edition slug>&lang=<UI 언어>
 *   예) https://www.talkhangyul.com/download?resource=ep01-en-study-guide&lang=en
 *   YouTube 고정 댓글·SNS에 이미 쓰이고 있으므로 계속 동작해야 합니다.
 *   프록시(src/lib/downloadSmartLink.ts)가 app 파라미터 없이 resource만 있는 요청을
 *   대표 주소로 301 리다이렉트합니다. resource·lang을 뺀 나머지 쿼리(utm_* 등)는 유지합니다.
 *   - resource: 판(edition) slug. 대소문자·공백은 너그럽게 받습니다.
 *   - lang: 화면 언어. 없거나 지원하지 않는 값이면 판 언어로 보냅니다.
 *   - 등록되지 않은 resource는 리다이렉트하지 않고 그 자리에서 404를 보여줍니다.
 *
 * /download?app=ganada 스마트 링크는 이 규칙과 무관하게 그대로 동작합니다.
 *
 * 이 파일은 프록시에서도 import 하므로 이미지·PDF 같은 에셋을 import 하지 않습니다.
 */

/** 어떤 자료를 보여줄지 고르는 쿼리 파라미터 (?resource=ep01-en-study-guide) */
export const DOWNLOAD_RESOURCE_PARAM = "resource";

/** 페이지 화면 언어 쿼리 파라미터 (?lang=ja) */
export const DOWNLOAD_LANG_PARAM = "lang";

/** slug는 소문자·숫자·하이픈만 씁니다 (예: ep02-en-study-guide). */
const RESOURCE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESOURCE_SLUG_MAX_LENGTH = 80;

/** 링크에 대소문자·공백이 섞여 들어와도 같은 자료로 연결합니다. */
export function normalizeResourceSlug(value: string | null): string | null {
  const slug = value?.trim().toLowerCase();
  if (!slug) return null;
  return slug;
}

export function isValidResourceSlug(slug: string): boolean {
  return (
    slug.length <= RESOURCE_SLUG_MAX_LENGTH && RESOURCE_SLUG_PATTERN.test(slug)
  );
}

/**
 * lang 값을 사이트 로케일로 맞춥니다. 대소문자·지역 코드는 너그럽게 받습니다.
 *   "JA" → "ja", "pt-BR" → "pt", "zh_CN" → "zh", "xx" → null
 */
export function normalizeUiLanguage(value: string | null | undefined): string | null {
  const raw = value?.trim().toLowerCase().replace(/_/g, "-");
  if (!raw) return null;

  const locales = routing.locales as readonly string[];
  if (locales.includes(raw)) return raw;

  const primary = raw.split("-")[0];
  return locales.includes(primary) ? primary : null;
}

/**
 * 등록되지 않은 자료 링크는 이 고정 slug의 대표 경로로 rewrite 해 "자료 없음"(404) 화면을
 * 그 화면 언어로 보여줍니다. (레지스트리의 pageSlug로 쓰지 마세요.)
 */
export const UNKNOWN_RESOURCE_SLUG = "unknown";

/** 자료 목록 경로: /<UI 언어>/resources */
export function resourcesIndexPath(uiLanguage: string): string {
  return `/${uiLanguage}/resources`;
}

/** 자료 대표 경로 (canonical·hreflang·sitemap·내부 링크): /<UI 언어>/resources/<pageSlug> */
export function resourcePagePath(pageSlug: string, uiLanguage: string): string {
  return `${resourcesIndexPath(uiLanguage)}/${pageSlug}`;
}

/**
 * 실제 PDF 다운로드 경로 (src/app/download/files/[file]/route.ts).
 * 소스 경로(src/assets/downloads/…)는 노출하지 않고, 빌드 시 정적으로 생성됩니다.
 */
export function resourceFilePath(slug: string): string {
  return `/download/files/${slug}.pdf`;
}
