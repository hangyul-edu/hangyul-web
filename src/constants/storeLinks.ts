/**
 * 앱 스토어 링크
 *
 * 한귤 가나다는 이미 출시되어 있어 실제 스토어로 연결합니다.
 * 한귤 앱은 곧 정식 출시 예정이며,
 * 출시 후 여기에 한귤 앱 링크를 추가하면 됩니다.
 *
 * 홈페이지 CTA·출시 안내 모달·/download 스마트 링크가 모두 이 값만 사용합니다.
 */

/** 한귤 가나다 App Store 주소 */
export const GANADA_APP_STORE_URL =
  "https://apps.apple.com/us/app/hangyul-ganada/id6804839101";

/** 한귤 가나다 Google Play 주소 */
export const GANADA_GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.talkhangyul.ganada";

export const GANADA_STORE_LINKS = {
  android: GANADA_GOOGLE_PLAY_URL,
  ios: GANADA_APP_STORE_URL,
} as const;

export type StorePlatform = keyof typeof GANADA_STORE_LINKS;

/**
 * 스마트 다운로드 링크(OneLink) 설정
 *
 * SNS·광고·QR에 쓰는 공식 링크: https://talkhangyul.com/download?app=ganada
 * 프록시(src/lib/downloadSmartLink.ts)가 User-Agent를 보고 스토어로 302 보냅니다.
 */
export const DOWNLOAD_PATH = "/download";

/** 어떤 앱을 받을지 고르는 쿼리 파라미터 이름 (?app=ganada) */
export const DOWNLOAD_APP_PARAM = "app";

/**
 * 스마트 링크가 지원하는 앱 목록.
 * 한귤 앱 출시 후에는 여기에 `hangyul: HANGYUL_STORE_LINKS` 한 줄만 추가하면
 * /download?app=hangyul 이 동작합니다.
 */
export const DOWNLOAD_APPS = {
  ganada: GANADA_STORE_LINKS,
} as const;

export type DownloadApp = keyof typeof DOWNLOAD_APPS;

export function isDownloadApp(value: string | null): value is DownloadApp {
  return value !== null && value in DOWNLOAD_APPS;
}

/**
 * 데스크톱·판별 불가 기기를 홈페이지로 보낼 때 붙이는 파라미터 (?download=ganada).
 * 홈페이지의 기존 기기 선택 모달이 이 값을 보고 바로 열립니다.
 * (src/components/common/LaunchFlowProvider.tsx)
 */
export const DOWNLOAD_CHOOSER_PARAM = "download";
