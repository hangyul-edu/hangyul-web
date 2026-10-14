import type { StorePlatform } from "@/constants/storeLinks";

/**
 * 요청 User-Agent로 운영체제를 판별합니다. (서버/엣지 전용)
 *
 * /download 스마트 링크가 페이지를 렌더링하기 전에 302를 내보내야 하므로
 * 브라우저 API(navigator, 터치 지원 등) 없이 요청 헤더만으로 판단합니다.
 * 브라우저에서의 판별은 src/hooks/useDeviceType.ts가 담당합니다.
 *
 * Instagram·Facebook·TikTok·KakaoTalk 같은 인앱 브라우저도 결국 모바일 OS의
 * UA를 보내므로, 브라우저 이름이 아니라 OS만 봅니다.
 */

/**
 * 검색엔진·SNS 링크 미리보기 봇.
 *
 * 스토어로 보내지 않고 기기 선택 화면으로 보냅니다.
 * (예: 스마트폰 Googlebot UA에는 "Android"가 들어 있고,
 *  facebookexternalhit는 링크 미리보기를 만들려고 접근합니다.)
 * 사용자 브라우저 UA에 우연히 걸리지 않도록 봇 고유 토큰만 나열합니다.
 */
const BOT_PATTERN =
  /bot\b|bot\/|crawler|crawling|spider|slurp|mediapartners|facebookexternalhit|facebookcatalog|bingpreview|yeti\/|daumoa|applebot|whatsapp|telegram|skypeuripreview|embedly|pinterest\/|tumblr|lighthouse|headlesschrome|pingdom|ahrefs|semrush|ia_archiver|archive\.org|python-requests|curl\/|wget\/|libwww-perl|okhttp|java\/|go-http-client|node-fetch/i;

/** 안드로이드 (Chrome, Samsung Internet, 인앱 브라우저, WebView 모두 UA에 "Android"가 들어갑니다) */
const ANDROID_PATTERN = /android/i;

/**
 * iOS 기기.
 *
 * iPhone·iPod 외에 iPad도 포함합니다. 한귤 가나다는 iPhone 앱으로 안내하지만,
 * iPad에서 이 링크를 눌러도 막다른 화면 대신 App Store로 가도록 하는 기술적 처리이며
 * 제품 문구에서 iPad 지원을 새로 말하지는 않습니다.
 * (iPadOS 13+ 데스크톱 모드는 UA가 데스크톱 Safari와 같아 서버에서 구분할 수 없고,
 *  이 경우 홈페이지의 기존 기기 선택 흐름으로 안전하게 처리됩니다.)
 */
const IOS_PATTERN = /iphone|ipod|ipad/i;

/**
 * 보낼 스토어를 결정합니다. 확신할 수 없으면(데스크톱·봇·빈 UA) null을 돌려주고,
 * 호출하는 쪽에서 기기 선택 화면으로 보냅니다.
 */
export function detectStorePlatformFromUserAgent(
  userAgent: string | null | undefined,
  platformHintHeader?: string | null
): StorePlatform | null {
  const ua = userAgent ?? "";
  if (!ua.trim()) return null;
  if (BOT_PATTERN.test(ua)) return null;

  // Chromium 계열이 보내는 힌트. `"Android"`처럼 따옴표가 붙어서 옵니다.
  const platformHint = (platformHintHeader ?? "").replace(/"/g, "").trim().toLowerCase();

  if (platformHint === "android" || ANDROID_PATTERN.test(ua)) return "android";
  if (IOS_PATTERN.test(ua)) return "ios";

  return null;
}

/** 요청 헤더에서 바로 판별합니다. */
export function detectStorePlatformFromHeaders(
  headers: Headers
): StorePlatform | null {
  return detectStorePlatformFromUserAgent(
    headers.get("user-agent"),
    headers.get("sec-ch-ua-platform")
  );
}
