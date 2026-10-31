import { routing } from "@/i18n/routing";

/**
 * 무료 학습 자료 다운로드 페이지 경로 규칙
 *
 * 공개 마케팅 링크:  /download?resource=<slug>&lang=<UI 언어>
 *   예) https://www.talkhangyul.com/download?resource=ep01-en-study-guide&lang=en
 *
 * - resource: 내려받을 판(edition). PDF 언어는 판이 정합니다.
 * - lang: 페이지 화면 언어(사이트 로케일). 없거나 지원하지 않는 값이면 판 언어로 표시합니다.
 *   (lang 없는 기존 링크도 그대로 동작합니다.)
 *
 * /download 는 한귤 가나다 스마트 링크(?app=ganada)와 같은 진입점을 씁니다.
 * 프록시(src/lib/downloadSmartLink.ts)는 app 파라미터가 없고 resource 파라미터가
 * 있을 때만 내부 경로(/download/<slug>/<lang>)로 rewrite 하므로 주소창 URL은 그대로입니다.
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
 * 형식이 잘못된 slug는 등록될 수 없는 고정 값으로 보내 "자료 없음" 화면을 띄웁니다.
 * (레지스트리에 이 slug를 쓰지 마세요.)
 */
export const UNKNOWN_RESOURCE_SLUG = "unknown";

/** 프록시가 rewrite 하는 내부 렌더링 경로 (src/app/download/[resource]/[lang]/page.tsx) */
export function resourceRenderPath(slug: string, uiLanguage: string): string {
  const safeSlug = isValidResourceSlug(slug) ? slug : UNKNOWN_RESOURCE_SLUG;
  return `/download/${safeSlug}/${uiLanguage}`;
}

/** 공개 랜딩 페이지 경로 (canonical·hreflang·언어 선택기용) */
export function resourcePagePath(slug: string, uiLanguage?: string): string {
  const params = new URLSearchParams({ [DOWNLOAD_RESOURCE_PARAM]: slug });
  if (uiLanguage) params.set(DOWNLOAD_LANG_PARAM, uiLanguage);
  return `/download?${params.toString()}`;
}

/**
 * 실제 PDF 다운로드 경로 (src/app/download/files/[file]/route.ts).
 * 소스 경로(src/assets/downloads/…)는 노출하지 않고, 빌드 시 정적으로 생성됩니다.
 */
export function resourceFilePath(slug: string): string {
  return `/download/files/${slug}.pdf`;
}
