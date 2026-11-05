import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // 언어 추가 시 messages/<locale>.json, LOCALE_CONFIG, LOCALE_META도 함께 추가해야 합니다.
  locales: [
    "en",
    "ko",
    "ar",
    "bn",
    "zh",
    "cs",
    "nl",
    "fr",
    "de",
    "el",
    "hi",
    "hu",
    "id",
    "it",
    "ja",
    "pl",
    "pt",
    "ro",
    "ru",
    "es",
    "sv",
    "fil",
    "ta",
    "te",
    "th",
    "tr",
    "uk",
    "vi",
    "uz",
    "kk",
    "ky",
    "mn",
  ],
  defaultLocale: "en",
  /*
   * hreflang은 페이지 HTML(<link rel="alternate">)과 sitemap.xml에서만 내보냅니다.
   * 미들웨어의 HTTP Link 헤더는 x-default를 접두사 없는 주소("/")로 내보내
   * HTML의 x-default(/en)와 어긋나므로 끕니다.
   */
  alternateLinks: false,
});
