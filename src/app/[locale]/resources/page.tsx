import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import ResourceGuideList from "@/components/download/ResourceGuideList";
import styles from "@/components/download/ResourcePage.module.css";
import {
  absolute,
  getAllGuideSummaries,
  getResourceBreadcrumb,
} from "@/components/download/resourceGuides";
import { resourcesIndexPath } from "@/constants/downloadResources";
import { LOCALE_META } from "@/constants/metadata";
import { BASE_URL, BRAND, IS_PRODUCTION_DEPLOYMENT, OG_IMAGE } from "@/constants/site";
import {
  buildResourceIndexStructuredData,
  serializeJsonLd,
} from "@/constants/structuredData";
import { routing } from "@/i18n/routing";

/**
 * 무료 학습 가이드 목록 — /<UI 언어>/resources
 *
 * 학습자가 다른 자료를 찾을 수 있게 하고, 검색엔진이 sitemap 없이도 모든 자료 페이지를
 * 일반 링크로 찾을 수 있게 하는 가벼운 목록입니다. 자료는 레지스트리에서 자동으로 나옵니다.
 */

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = hasLocale(routing.locales, rawLocale)
    ? rawLocale
    : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "ResourceDownload.index" });
  const title = t("seoTitle");
  const description = t("seoDescription");
  const url = absolute(resourcesIndexPath(locale));
  // 목록 페이지는 자료 하나를 대표하지 않으므로 사이트 공유 이미지를 씁니다.
  const image = {
    url: OG_IMAGE.path,
    width: OG_IMAGE.width,
    height: OG_IMAGE.height,
    alt: `${BRAND.name} (${BRAND.nameKo})`,
  };

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    applicationName: BRAND.name,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, absolute(resourcesIndexPath(l))])
        ),
        "x-default": absolute(resourcesIndexPath(routing.defaultLocale)),
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

export default async function ResourcesIndexPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "ResourceDownload.index" });
  const guides = await getAllGuideSummaries(locale);
  const url = absolute(resourcesIndexPath(locale));

  const structuredData = buildResourceIndexStructuredData({
    url,
    locale,
    pageTitle: t("seoTitle"),
    description: t("seoDescription"),
    items: guides.map((guide) => ({ name: guide.name, url: absolute(guide.href) })),
    breadcrumb: await getResourceBreadcrumb(locale),
  });

  return (
    <main id="main-content" className={styles.main}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
      <section className={styles.indexHero} aria-labelledby="index-title">
        <div className={styles.indexInner}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h1 id="index-title" className={styles.title}>
            {t("title")}
          </h1>
          <p className={styles.description}>{t("intro")}</p>
        </div>
      </section>

      <div className={styles.indexList}>
        <div className={styles.indexInner}>
          <ResourceGuideList
            guides={guides}
            variant="full"
            headingLevel={2}
            viewLabel={t("viewGuide")}
          />
        </div>
      </div>
    </main>
  );
}
