import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import ResourceDownloadPage from "@/components/download/ResourceDownloadPage";
import { resourcePagePath } from "@/constants/downloadResources";
import { LOCALE_META } from "@/constants/metadata";
import {
  BASE_URL,
  BRAND,
  IS_PRODUCTION_DEPLOYMENT,
} from "@/constants/site";
import { getResourceAssets } from "@/content/downloadResourceAssets";
import {
  getEditionForLocale,
  getResourceFamilyByPageSlug,
  RESOURCE_PAGE_SLUGS,
} from "@/content/downloadResources";
import { routing } from "@/i18n/routing";

/**
 * 무료 학습 자료 페이지 — 대표(canonical) 주소
 *
 *   /<UI 언어>/resources/<pageSlug>
 *   예) /en/resources/100-everyday-korean-sentences-ep01
 *
 * 등록된 자료 × 32개 화면 언어가 빌드 시 정적으로 생성됩니다 (초기 HTML에 본문·메타데이터 포함).
 * 기존 링크 /download?resource=<edition slug>&lang=<UI 언어> 는 프록시가 이 주소로 301 합니다.
 * 모르는 pageSlug는 not-found.tsx(404)를 그 화면 언어로 보여줍니다.
 */

export function generateStaticParams() {
  return RESOURCE_PAGE_SLUGS.flatMap((guide) =>
    routing.locales.map((locale) => ({ locale, guide }))
  );
}

type PageProps = { params: Promise<{ locale: string; guide: string }> };

const absoluteUrl = (pageSlug: string, locale: string) =>
  `${BASE_URL}${resourcePagePath(pageSlug, locale)}`;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, guide } = await params;
  const family = getResourceFamilyByPageSlug(guide);
  const locale = hasLocale(routing.locales, rawLocale)
    ? rawLocale
    : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "ResourceDownload" });

  if (!family) {
    return {
      title: t("notFound.metaTitle"),
      robots: { index: false, follow: true },
    };
  }

  const edition = getEditionForLocale(family, locale);
  const copyKey = `resources.${edition.messagesKey}` as const;
  const title = t(`${copyKey}.seoTitle`);
  const description = t(`${copyKey}.seoDescription`);
  const assets = getResourceAssets(edition.slug);
  const image = {
    url: assets.ogImage.src,
    width: assets.ogImage.width,
    height: assets.ogImage.height,
    alt: t(`${copyKey}.coverAlt`),
  };

  /*
   * 화면 언어마다 자기 주소를 canonical로 두고 hreflang으로 서로 연결합니다.
   * utm_* 등 쿼리가 붙은 주소도 모두 이 대표 주소로 모입니다.
   * x-default는 기본 판(PDF) 언어의 화면입니다.
   */
  const url = absoluteUrl(family.pageSlug, locale);
  const defaultLocale = hasLocale(routing.locales, family.defaultEdition)
    ? family.defaultEdition
    : routing.defaultLocale;

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    applicationName: BRAND.name,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, absoluteUrl(family.pageSlug, l)])
        ),
        "x-default": absoluteUrl(family.pageSlug, defaultLocale),
      },
    },
    openGraph: {
      type: "website",
      url,
      siteName: BRAND.name,
      title,
      description,
      locale: (LOCALE_META[locale] ?? LOCALE_META.en).ogLocale,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: IS_PRODUCTION_DEPLOYMENT
      ? {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large" },
        }
      : { index: false, follow: false },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale, guide } = await params;
  const family = getResourceFamilyByPageSlug(guide);

  if (!family || !hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <ResourceDownloadPage
      resource={{ family, edition: getEditionForLocale(family, locale) }}
      uiLanguage={locale}
    />
  );
}
