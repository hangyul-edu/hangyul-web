import { NextResponse, type NextRequest } from "next/server";

import {
  DOWNLOAD_APPS,
  DOWNLOAD_APP_PARAM,
  DOWNLOAD_CHOOSER_PARAM,
  DOWNLOAD_PATH,
  isDownloadApp,
} from "@/constants/storeLinks";
import { detectStorePlatformFromHeaders } from "./deviceDetection";

/**
 * /download 스마트 다운로드 링크 (OneLink)
 *
 * 공식 마케팅 링크: https://talkhangyul.com/download?app=ganada
 *
 * 프록시(src/proxy.ts)가 프런트엔드 페이지를 렌더링하기 전에 가로채므로,
 * 모바일 사용자는 React 번들을 내려받지 않고 바로 스토어로 이동합니다.
 *
 * - Android → Google Play로 302
 * - iPhone/iOS → App Store로 302
 * - 데스크톱·봇·판별 불가 → 홈페이지의 기존 기기 선택 모달로 302
 * - app 파라미터가 없거나 모르는 값 → 홈페이지로 302 (루프 없음)
 */

/** Next가 보통 뒤쪽 슬래시를 먼저 정규화하지만, 그대로 들어오는 경우도 받아 둡니다. */
function isDownloadPath(pathname: string): boolean {
  return pathname === DOWNLOAD_PATH || pathname === `${DOWNLOAD_PATH}/`;
}

/**
 * 같은 URL의 응답이 기기마다 달라지므로 절대 공용 캐시에 남으면 안 됩니다.
 * (안드로이드용 302가 캐시되어 아이폰 사용자에게 전달되는 사고 방지)
 */
function withNoStoreHeaders(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-store, must-revalidate");
  response.headers.set("Vary", "User-Agent");
  return response;
}

/**
 * 데스크톱·판별 불가 기기는 홈페이지로 보내고, 홈페이지가 기존 기기 선택 모달을
 * 바로 열도록 ?download=<app>을 붙입니다. utm_* 등 마케팅 파라미터는 그대로 넘겨
 * 기존 분석(GTM) 유입 경로가 끊기지 않게 합니다.
 *
 * 로케일(/en, /ko …) 결정은 기존 next-intl 미들웨어에 맡기므로 "/"로 보냅니다.
 */
function chooserRedirectUrl(request: NextRequest, app: string | null): URL {
  const url = new URL("/", request.url);

  request.nextUrl.searchParams.forEach((value, key) => {
    if (key !== DOWNLOAD_APP_PARAM) url.searchParams.set(key, value);
  });

  if (app) url.searchParams.set(DOWNLOAD_CHOOSER_PARAM, app);

  return url;
}

/**
 * /download 요청이면 응답을 만들어 돌려주고, 아니면 null을 돌려줍니다.
 * (null이면 호출하는 쪽에서 기존 next-intl 로케일 처리를 계속합니다.)
 */
export function handleDownloadSmartLink(
  request: NextRequest
): NextResponse | null {
  if (!isDownloadPath(request.nextUrl.pathname)) return null;

  // 링크에 대소문자가 섞여도(?app=Ganada) 동작하게 맞춰 줍니다.
  const app =
    request.nextUrl.searchParams.get(DOWNLOAD_APP_PARAM)?.trim().toLowerCase() ??
    null;

  // 모르는 app 값(또는 파라미터 없음)에는 스토어를 추측하지 않고 홈페이지로 보냅니다.
  if (!isDownloadApp(app)) {
    return withNoStoreHeaders(
      NextResponse.redirect(chooserRedirectUrl(request, null), 302)
    );
  }

  const platform = detectStorePlatformFromHeaders(request.headers);

  if (platform) {
    // 기기에 따라 목적지가 달라지는 링크이므로 영구(301/308)가 아닌 임시(302)를 씁니다.
    // 스토어 주소에는 utm_* 등을 붙이지 않습니다(스토어가 모르는 파라미터를 거부할 수 있음).
    return withNoStoreHeaders(
      NextResponse.redirect(DOWNLOAD_APPS[app][platform], 302)
    );
  }

  return withNoStoreHeaders(
    NextResponse.redirect(chooserRedirectUrl(request, app), 302)
  );
}
