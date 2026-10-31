import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";

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
  DOWNLOAD_RESOURCE_SLUGS,
  getDownloadResource,
} from "@/content/downloadResources";
import { routing } from "@/i18n/routing";

/**
 * 무료 학습 자료 다운로드 페이지
 *
 * 공개 URL: /download?resource=<slug>&lang=<UI 언어>
 * 프록시(src/lib/downloadSmartLink.ts)가 이 내부 경로(/download/<slug>/<lang>)로 rewrite 합니다.
 * 등록된 판 × 32개 화면 언어가 빌드 시 정적으로 생성되고,
 * 모르는 slug는 not-found.tsx(404)를 그 화면 언어로 보여줍니다.
 */

export function generateStaticParams() {
  return DOWNLOAD_RESOURCE_SLUGS.flatMap((resource) =>
    routing.locales.map((lang) => ({ resource, lang }))
  );
}

type PageProps = { params: Promise<{ resource: string; lang: string }> };

const absoluteUrl = (slug: string, lang?: string) =>
  `${BASE_URL}${resourcePagePath(slug, lang)}`;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { resource: slug, lang } = await params;
  const resolved = getDownloadResource(slug);
  const locale = hasLocale(routing.locales, lang) ? lang : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "ResourceDownload" });

  if (!resolved) {
    return {
      title: t("notFound.metaTitle"),
      robots: { index: false, follow: true },
    };
  }

  const { edition } = resolved;
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
   * 화면 언어별 페이지는 각자의 주소(&lang=)를 canonical로 두고 hreflang으로 서로 연결합니다.
   * utm_* 등 다른 파라미터나 lang 없는 링크는 모두 이 대표 주소로 모입니다.
   * x-default는 PDF 판 언어의 화면입니다.
   */
  const url = absoluteUrl(edition.slug, locale);

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    applicationName: BRAND.name,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, absoluteUrl(edition.slug, l)])
        ),
        "x-default": absoluteUrl(
          edition.slug,
          hasLocale(routing.locales, edition.language)
            ? edition.language
            : routing.defaultLocale
        ),
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
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export default async function Page({ params }: PageProps) {
  const { resource: slug, lang } = await params;
  const resolved = getDownloadResource(slug);

  if (!resolved || !hasLocale(routing.locales, lang)) notFound();

  return <ResourceDownloadPage resource={resolved} uiLanguage={lang} />;
}
