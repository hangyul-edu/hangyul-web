import { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { BASE_URL } from "@/constants/site";
import {
  resourcePagePath,
  resourcesIndexPath,
} from "@/constants/downloadResources";
import { RESOURCE_FAMILIES } from "@/content/downloadResources";

/**
 * sitemap.xml
 *
 * 대표(canonical) 주소만 넣습니다. utm_* 등 쿼리 변형, 기존 /download?resource= 링크(301),
 * /download?app=ganada 스마트 링크, PDF 파일은 넣지 않습니다.
 * 각 항목에는 페이지 HTML과 같은 hreflang(32개 언어 + x-default)을 함께 적습니다.
 *
 * lastmod는 실제로 내용이 바뀐 날짜를 알 수 있을 때만 넣습니다.
 * (빌드할 때마다 오늘 날짜를 넣으면 검색엔진이 lastmod를 신뢰하지 않게 됩니다.)
 */

type Entry = MetadataRoute.Sitemap[number];

/** 한 페이지의 모든 화면 언어 주소를 hreflang과 함께 항목으로 만듭니다. */
function localizedEntries(
  pathFor: (locale: string) => string,
  extra: Omit<Entry, "url" | "alternates"> = {}
): MetadataRoute.Sitemap {
  const languages = {
    ...Object.fromEntries(
      routing.locales.map((l) => [l, `${BASE_URL}${pathFor(l)}`])
    ),
    "x-default": `${BASE_URL}${pathFor(routing.defaultLocale)}`,
  };

  return routing.locales.map((locale) => ({
    url: `${BASE_URL}${pathFor(locale)}`,
    ...extra,
    alternates: { languages },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  // 자료 목록은 가장 최근에 바뀐 자료의 날짜를 따릅니다.
  const latestResourceUpdate = RESOURCE_FAMILIES.map((f) => f.contentUpdatedAt)
    .sort()
    .at(-1);

  return [
    ...localizedEntries((locale) => `/${locale}`, {
      changeFrequency: "weekly",
      priority: 1.0,
    }),
    ...localizedEntries(resourcesIndexPath, {
      ...(latestResourceUpdate ? { lastModified: latestResourceUpdate } : {}),
    }),
    ...RESOURCE_FAMILIES.flatMap((family) =>
      localizedEntries((locale) => resourcePagePath(family.pageSlug, locale), {
        lastModified: family.contentUpdatedAt,
      })
    ),
  ];
}
