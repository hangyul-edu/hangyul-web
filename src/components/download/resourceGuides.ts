import type { StaticImageData } from "next/image";
import { getTranslations } from "next-intl/server";

import {
  resourceFilePath,
  resourcePagePath,
  resourcesIndexPath,
} from "@/constants/downloadResources";
import { BASE_URL, getBrandName } from "@/constants/site";
import type { BreadcrumbItem } from "@/constants/structuredData";
import { getResourceAssets } from "@/content/downloadResourceAssets";
import {
  getEditionForLocale,
  RESOURCE_FAMILIES,
  type ResourceEdition,
  type ResourceFamily,
} from "@/content/downloadResources";

/*
 * 판·형식 문구 묶음은 모두 같은 모양이므로 동적 네임스페이스를 대표 키의 타입으로 맞춥니다.
 * (ResourceDownloadPage.tsx와 같은 방식)
 */
type EditionCopyNamespace = "ResourceDownload.resources.ep01EnStudyGuide";
type FormatCopyNamespace = "ResourceDownload.formats.everydaySentences";
type EditionLanguageNamespace = "ResourceDownload.editionLanguages.en";

/** 자료 목록·"다른 무료 학습 가이드"·구조화 데이터가 함께 쓰는 자료 요약 */
export type GuideSummary = {
  family: ResourceFamily;
  edition: ResourceEdition;
  /** 화면 언어의 대표 경로 (/<UI 언어>/resources/<pageSlug>) */
  href: string;
  /** 형식 제목 (예: "100 Everyday Korean Sentences") — 화면 언어 */
  title: string;
  /** 에피소드까지 포함한 자료 이름 (예: "100 Everyday Korean Sentences EP01") */
  name: string;
  /** "Korean While You Sleep · EP01" (고유명사라 번역하지 않음) */
  seriesLine: string;
  description: string;
  /** PDF 판 이름 (예: "English edition") — 화면 언어 */
  editionLabel: string;
  /** "English edition · 43 pages · PDF" */
  metaLine: string;
  coverAlt: string;
  cover: StaticImageData;
};

export const absolute = (path: string) => `${BASE_URL}${path}`;

export async function getGuideSummary(
  family: ResourceFamily,
  uiLanguage: string
): Promise<GuideSummary> {
  const edition = getEditionForLocale(family, uiLanguage);
  const [tCopy, tFormat, tEdition, tCommon] = await Promise.all([
    getTranslations({
      locale: uiLanguage,
      namespace:
        `ResourceDownload.resources.${edition.messagesKey}` as EditionCopyNamespace,
    }),
    getTranslations({
      locale: uiLanguage,
      namespace:
        `ResourceDownload.formats.${family.formatMessagesKey}` as FormatCopyNamespace,
    }),
    getTranslations({
      locale: uiLanguage,
      namespace:
        `ResourceDownload.editionLanguages.${edition.language}` as EditionLanguageNamespace,
    }),
    getTranslations({ locale: uiLanguage, namespace: "ResourceDownload.common" }),
  ]);
  // 자료 페이지와 같이 모든 언어에서 아라비아 숫자를 씁니다.
  const numberFormat = new Intl.NumberFormat(uiLanguage, { numberingSystem: "latn" });
  const title = tFormat("title");

  return {
    family,
    edition,
    href: resourcePagePath(family.pageSlug, uiLanguage),
    title,
    name: [title, family.episode].filter(Boolean).join(" "),
    seriesLine: [family.series, family.episode].filter(Boolean).join(" · "),
    description: tCopy("description"),
    editionLabel: tEdition("label"),
    metaLine: [
      tEdition("label"),
      tCommon("pageCount", {
        count: edition.pageCount,
        formattedCount: numberFormat.format(edition.pageCount),
      }),
      family.format,
    ].join(" · "),
    coverAlt: tCopy("coverAlt"),
    cover: getResourceAssets(edition.slug).cover,
  };
}

/** 레지스트리 순서의 모든 자료 요약 */
export function getAllGuideSummaries(uiLanguage: string) {
  return Promise.all(
    RESOURCE_FAMILIES.map((family) => getGuideSummary(family, uiLanguage))
  );
}

/** Hangyul › Free Study Guides (› 자료) 이동 경로 */
export async function getResourceBreadcrumb(
  uiLanguage: string,
  guide?: GuideSummary
): Promise<BreadcrumbItem[]> {
  const t = await getTranslations({
    locale: uiLanguage,
    namespace: "ResourceDownload.index",
  });
  return [
    { name: getBrandName(uiLanguage), url: absolute(`/${uiLanguage}`) },
    { name: t("breadcrumb"), url: absolute(resourcesIndexPath(uiLanguage)) },
    ...(guide ? [{ name: guide.name, url: absolute(guide.href) }] : []),
  ];
}

export const absoluteFileUrl = (edition: ResourceEdition) =>
  absolute(resourceFilePath(edition.slug));
