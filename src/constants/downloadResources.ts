/**
 * 무료 학습 자료 다운로드 페이지 경로 규칙
 *
 * 공개 마케팅 링크:  /download?resource=<slug>
 *   예) https://www.talkhangyul.com/download?resource=ep01-en-study-guide
 *
 * /download 는 한귤 가나다 스마트 링크(?app=ganada)와 같은 진입점을 씁니다.
 * 프록시(src/lib/downloadSmartLink.ts)는 app 파라미터가 없고 resource 파라미터가
 * 있을 때만 아래 내부 경로로 rewrite 하므로, 주소창의 공개 URL은 그대로 유지됩니다.
 *
 * 이 파일은 프록시에서도 import 하므로 이미지·PDF 같은 에셋을 import 하지 않습니다.
 * 실제 자료 목록은 src/content/downloadResources.ts 에 있습니다.
 */

/** 어떤 자료를 보여줄지 고르는 쿼리 파라미터 이름 (?resource=ep01-en-study-guide) */
export const DOWNLOAD_RESOURCE_PARAM = "resource";

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
 * 프록시가 rewrite 하는 내부 렌더링 경로 (src/app/download/[resource]/page.tsx).
 * 형식에 맞지 않는 값은 등록될 수 없는 고정 slug로 보내 "자료 없음" 화면을 띄웁니다.
 */
export const UNKNOWN_RESOURCE_SLUG = "unknown";

export function resourceRenderPath(slug: string): string {
  return `/download/${isValidResourceSlug(slug) ? slug : UNKNOWN_RESOURCE_SLUG}`;
}

/** 공개 랜딩 페이지 경로 (canonical·공유용) */
export function resourcePagePath(slug: string): string {
  return `/download?${DOWNLOAD_RESOURCE_PARAM}=${slug}`;
}

/**
 * 실제 PDF 다운로드 경로 (src/app/download/files/[file]/route.ts).
 * 소스 경로(src/assets/downloads/…)는 노출하지 않고, 빌드 시 정적으로 생성됩니다.
 */
export function resourceFilePath(slug: string): string {
  return `/download/files/${slug}.pdf`;
}
