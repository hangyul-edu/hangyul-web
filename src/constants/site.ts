export const BASE_URL = "https://www.talkhangyul.com";

// Bump this (e.g. to today's date) whenever /public/og-image.png changes,
// so social crawlers fetch the new image instead of serving a cached one.
export const OG_IMAGE_VERSION = "20260819";

/** OG 이미지 실제 크기 (public/og-image.png) */
export const OG_IMAGE = {
  path: `/og-image.png?v=${OG_IMAGE_VERSION}`,
  width: 3200,
  height: 1600,
} as const;

/** 구조화 데이터(Organization.logo)용 로고. public/logo.png */
export const LOGO_IMAGE = {
  path: "/logo.png",
  width: 600,
  height: 126,
} as const;

/**
 * 브랜드 표기
 *
 * 검색엔진이 "한귤"과 "Hangyul"을 같은 브랜드로 인식하도록,
 * 메타데이터·구조화 데이터 전반에서 이 값들만 사용합니다.
 */
export const BRAND = {
  /** 글로벌 기본 표기 */
  name: "Hangyul",
  /** 한국어 표기 */
  nameKo: "한귤",
  /** 같은 브랜드를 가리키는 다른 표기들 (구조화 데이터 alternateName) */
  alternateNames: ["한귤", "HANGYUL", "HanGyul", "talkhangyul.com"],
} as const;

/** 사이트에 이미 공개되어 있는 고객 문의 이메일 */
export const SUPPORT_EMAIL = "support@talkhangyul.com";

/** 사이트 푸터에 공개된 사업자등록번호 */
export const BUSINESS_REGISTRATION_NUMBER = "403-87-03380";

/**
 * 로고·이미지 alt 등 UI에서 쓰는 브랜드 문자열.
 * 브랜드명은 번역 대상이 아니므로 한국어만 병기합니다.
 */
export function getBrandName(locale: string): string {
  return locale === "ko" ? `${BRAND.nameKo} ${BRAND.name}` : BRAND.name;
}

/**
 * 프로덕션 배포 여부.
 *
 * Vercel 프리뷰/개발 배포가 프로덕션과 검색 결과에서 경쟁하지 않도록
 * robots.txt와 robots 메타 태그를 분기하는 데 사용합니다.
 * VERCEL_ENV가 없는 로컬 빌드는 프로덕션과 동일하게 동작시켜
 * `npm run dev` / e2e 테스트 흐름을 그대로 유지합니다.
 */
export const IS_PRODUCTION_DEPLOYMENT =
  !process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production";

/**
 * 소유권 확인 토큰.
 *
 * 네이버 토큰은 기존에 커밋되어 있던 값을 기본값으로 유지하고,
 * 두 값 모두 환경 변수로 덮어쓸 수 있게 합니다. 값이 없으면 태그를 넣지 않습니다.
 */
export const NAVER_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION ??
  "24a1793e885cebe60e445152f81f0da70598918b";

export const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "";
