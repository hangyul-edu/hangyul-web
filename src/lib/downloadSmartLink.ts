import { NextResponse, type NextRequest } from "next/server";

import {
  DOWNLOAD_APPS,
  DOWNLOAD_APP_PARAM,
  DOWNLOAD_CHOOSER_PARAM,
  DOWNLOAD_PATH,
  isDownloadApp,
} from "@/constants/storeLinks";
import {
  DOWNLOAD_LANG_PARAM,
  DOWNLOAD_RESOURCE_PARAM,
  normalizeResourceSlug,
  normalizeUiLanguage,
  resourcePagePath,
  UNKNOWN_RESOURCE_SLUG,
} from "@/constants/downloadResources";
import { getDownloadResource } from "@/content/downloadResources";
import { routing } from "@/i18n/routing";
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
 *
 * 예외: app 없이 ?resource=<slug>(&lang=<UI 언어>)가 있으면 기존 무료 학습 자료 링크입니다.
 * 등록된 자료는 대표 주소(/<UI 언어>/resources/<pageSlug>)로 301 리다이렉트하고,
 * 모르는 자료는 그 화면 언어의 404를 보여줍니다.
 * (src/constants/downloadResources.ts, src/app/[locale]/resources/[guide]/page.tsx)
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

  /*
   * /download?resource=<slug> — 이미 YouTube·SNS에 공유된 무료 학습 자료 링크.
   * app 파라미터가 있으면 항상 기존 스마트 링크가 우선하고, 이 분기는
   * app 없이 resource만 있는 요청에만 해당합니다.
   */
  const resource = normalizeResourceSlug(
    request.nextUrl.searchParams.get(DOWNLOAD_RESOURCE_PARAM)
  );
  if (resource && !request.nextUrl.searchParams.has(DOWNLOAD_APP_PARAM)) {
    const resolved = getDownloadResource(resource);
    // 화면 언어: 유효한 ?lang → 그 언어, 없거나 잘못되면 PDF 판의 언어 → 기본 로케일.
    // (Accept-Language 같은 추측 없이 링크만 보고 결정적으로 정합니다.)
    const uiLanguage =
      normalizeUiLanguage(request.nextUrl.searchParams.get(DOWNLOAD_LANG_PARAM)) ??
      normalizeUiLanguage(resolved?.edition.language) ??
      routing.defaultLocale;

    if (!resolved) {
      // 다른 자료로 보내지 않고, 주소는 그대로 둔 채 그 화면 언어의 404를 보여줍니다.
      const url = request.nextUrl.clone();
      url.pathname = resourcePagePath(UNKNOWN_RESOURCE_SLUG, uiLanguage);
      url.search = "";
      return NextResponse.rewrite(url);
    }

    /*
     * 등록된 자료는 검색엔진용 대표 주소로 영구(301) 리다이렉트합니다.
     * 어느 기기에서나 목적지가 같으므로 스마트 링크와 달리 영구 리다이렉트가 맞고,
     * 링크가 가진 신호도 대표 주소로 모입니다. resource·lang 외의 쿼리(utm_* 등)는
     * 그대로 넘겨 기존 유입 분석이 끊기지 않게 합니다.
     */
    const url = new URL(
      resourcePagePath(resolved.family.pageSlug, uiLanguage),
      request.url
    );
    request.nextUrl.searchParams.forEach((value, key) => {
      if (key !== DOWNLOAD_RESOURCE_PARAM && key !== DOWNLOAD_LANG_PARAM) {
        url.searchParams.append(key, value);
      }
    });
    return NextResponse.redirect(url, 301);
  }

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
