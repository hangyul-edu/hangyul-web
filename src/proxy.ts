import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

import { routing } from "./i18n/routing";
import { handleDownloadSmartLink } from "./lib/downloadSmartLink";

const intlProxy = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  /*
   * /download?app=... 스마트 다운로드 링크는 로케일 라우팅 대상이 아니고,
   * 페이지가 렌더링되기 전에 스토어로 302를 보내야 하므로 가장 먼저 처리합니다.
   */
  const downloadResponse = handleDownloadSmartLink(request);
  if (downloadResponse) return downloadResponse;

  return intlProxy(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
