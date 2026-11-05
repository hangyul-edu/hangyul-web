import Image from "next/image";
import { getTranslations } from "next-intl/server";

import {
  resourceFilePath,
  resourcesIndexPath,
} from "@/constants/downloadResources";
import {
  buildResourceStructuredData,
  serializeJsonLd,
} from "@/constants/structuredData";
import { getResourceAssets } from "@/content/downloadResourceAssets";
import {
  RESOURCE_FAMILIES,
  type ResolvedResource,
} from "@/content/downloadResources";
import {
  DocumentIcon,
  DownloadIcon,
  FeatureIcon,
  InfoIcon,
  PlayIcon,
} from "./ResourceIcons";
import ResourceGuideList from "./ResourceGuideList";
import {
  absolute,
  absoluteFileUrl,
  getGuideSummary,
  getResourceBreadcrumb,
} from "./resourceGuides";
import { ResourcePageView, TrackedLink } from "./ResourceTracking";
import YouTubeComingSoonButton from "./YouTubeComingSoonButton";
import styles from "./ResourcePage.module.css";

/*
 * 판마다 messages의 문구 묶음은 같은 모양이므로, 동적 네임스페이스는
 * 대표 판(EP01 영어판)·대표 형식의 타입으로 맞춰 키 검사를 유지합니다.
 *  - formats.<formatMessagesKey>: 같은 형식의 가이드가 공유하는 문구 (제목, What's inside…)
 *  - resources.<messagesKey>: 판마다 다른 문구 (설명, 다루는 주제, 표지·미리보기 alt, SEO)
 */
type EditionCopyNamespace = "ResourceDownload.resources.ep01EnStudyGuide";
type FormatCopyNamespace = "ResourceDownload.formats.everydaySentences";
type EditionLanguageNamespace = "ResourceDownload.editionLanguages.en";

/**
 * 무료 학습 자료 다운로드 랜딩 페이지 본문.
 *
 * - 사실(문장 수·페이지 수·파일)은 레지스트리(src/content/downloadResources.ts)에서,
 * - 화면 문구는 messages/<화면 언어>.json 의 ResourceDownload 에서 가져옵니다.
 * - PDF 판 언어는 배지로 항상 표시하고, 화면 언어와 다르면 다운로드 버튼 바로 위에
 *   PDF가 어떤 언어로 쓰였는지 안내합니다.
 * - 서버 컴포넌트라 제목·설명·통계·What's inside·구조화 데이터가 모두 초기 HTML에 들어갑니다.
 * - 아래쪽에 다른 무료 학습 가이드로 가는 일반 링크와 자료 목록 링크를 둡니다.
 */
export default async function ResourceDownloadPage({
  resource,
  uiLanguage,
}: {
  resource: ResolvedResource;
  uiLanguage: string;
}) {
  const { family, edition } = resource;
  const assets = getResourceAssets(edition.slug);

  const t = await getTranslations({
    locale: uiLanguage,
    namespace: "ResourceDownload.common",
  });
  const tCopy = await getTranslations({
    locale: uiLanguage,
    namespace:
      `ResourceDownload.resources.${edition.messagesKey}` as EditionCopyNamespace,
  });
  const tFormat = await getTranslations({
    locale: uiLanguage,
    namespace:
      `ResourceDownload.formats.${family.formatMessagesKey}` as FormatCopyNamespace,
  });
  const tEdition = await getTranslations({
    locale: uiLanguage,
    namespace:
      `ResourceDownload.editionLanguages.${edition.language}` as EditionLanguageNamespace,
  });

  const languageMismatch = uiLanguage !== edition.language;
  const tIndex = await getTranslations({
    locale: uiLanguage,
    namespace: "ResourceDownload.index",
  });

  const current = await getGuideSummary(family, uiLanguage);
  const otherGuides = await Promise.all(
    RESOURCE_FAMILIES.filter((other) => other.id !== family.id).map((other) =>
      getGuideSummary(other, uiLanguage)
    )
  );
  const pageUrl = absolute(current.href);
  const structuredData = buildResourceStructuredData({
    url: pageUrl,
    locale: uiLanguage,
    pageTitle: tCopy("seoTitle"),
    name: current.name,
    description: tCopy("seoDescription"),
    editionLanguage: edition.language,
    fileUrl: absoluteFileUrl(edition),
    thumbnailUrl: absolute(assets.cover.src),
    imageUrl: absolute(assets.ogImage.src),
    series: family.series,
    breadcrumb: await getResourceBreadcrumb(uiLanguage, current),
  });

  const fileHref = resourceFilePath(edition.slug);
  // 연결된 영상이 이 에피소드의 영상일 때만 판 문구에 에피소드가 들어간 버튼 문구가 있습니다.
  const youtubeCta = tCopy.has("youtubeCta") ? tCopy("youtubeCta") : t("youtubeCta");
  // 판 언어 안내·마무리 문구는 기본값을 쓰되, 자료에 맞는 문구가 있으면 그것을 씁니다.
  const editionNotice = tCopy.has("editionNotice")
    ? tCopy("editionNotice")
    : tEdition("notice");
  const closingBody = tFormat.has("closingBody")
    ? tFormat("closingBody")
    : t("closingBody");
  const seriesLine = [family.series, family.episode].filter(Boolean).join(" · ");

  /*
   * 사이트 문구는 모든 언어에서 아라비아 숫자(0–9)를 씁니다. 벵골어 등 기본 숫자 체계가
   * 다른 로케일에서도 같은 숫자가 보이도록 latn으로 고정합니다.
   * (pageCount의 #은 로케일 숫자로 바뀌므로, 필요한 번역은 {formattedCount}를 씁니다.)
   */
  const numberFormat = new Intl.NumberFormat(uiLanguage, { numberingSystem: "latn" });

  const microcopy = [
    t("pageCount", {
      count: edition.pageCount,
      formattedCount: numberFormat.format(edition.pageCount),
    }),
    family.format,
    t("noSignUp"),
  ].join(" · ");

  const stats = [
    family.itemCount != null && {
      value: family.itemCount,
      // 학습 단위 이름(문장, 단어…)은 형식마다 다릅니다.
      label: tFormat("statItems", { count: family.itemCount }),
    },
    family.chapterCount != null && {
      value: family.chapterCount,
      label: t("statChapters", { count: family.chapterCount }),
    },
    { value: edition.pageCount, label: t("statPages", { count: edition.pageCount }) },
  ].filter(Boolean) as { value: number; label: string }[];

  const newTab = <span className={styles.srOnly}> {t("opensInNewTab")}</span>;

  const downloadLink = (placement: string) => (
    <TrackedLink
      href={fileHref}
      download={edition.downloadFileName}
      type="application/pdf"
      className={styles.primaryButton}
      event="resource_download_click"
      slug={edition.slug}
      uiLanguage={uiLanguage}
      placement={placement}
      data-testid={`resource-download-${placement}`}
    >
      <DownloadIcon />
      <span>{t("downloadCta")}</span>
    </TrackedLink>
  );

  return (
    <main id="main-content" className={styles.main}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
      <ResourcePageView slug={edition.slug} uiLanguage={uiLanguage} />

      <section className={styles.hero} aria-labelledby="resource-title">
        <div className={styles.heroInner}>
          <div className={styles.coverColumn} data-testid="cover-surface">
            <div className={styles.coverStack}>
              <Image
                className={styles.cover}
                src={assets.cover}
                alt={tCopy("coverAlt")}
                placeholder="blur"
                priority
                sizes="(max-width: 767px) 160px, (max-width: 1023px) 280px, 360px"
              />
            </div>
          </div>

          <div className={styles.info}>
            <p className={styles.eyebrow}>{tFormat("eyebrow")}</p>
            <h1 id="resource-title" className={styles.title}>
              {tFormat("title")}
            </h1>

            <div className={styles.meta}>
              {seriesLine && (
                <span
                  className={styles.series}
                  lang="en"
                  dir="ltr"
                  data-testid="resource-series"
                >
                  {seriesLine}
                </span>
              )}
              <span className={styles.editionBadge} data-testid="edition-badge">
                <DocumentIcon />
                {tEdition("label")}
              </span>
            </div>

            <p className={styles.description}>{tCopy("description")}</p>

            {stats.length > 0 && (
              <dl className={styles.stats} aria-label={t("statsLabel")}>
                {stats.map((stat) => (
                  <div key={stat.label} className={styles.stat}>
                    <dt className={styles.statLabel}>{stat.label}</dt>
                    <dd className={styles.statValue}>
                      {numberFormat.format(stat.value)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {languageMismatch && (
              <p className={styles.editionNotice} data-testid="edition-notice">
                <InfoIcon />
                <span>{editionNotice}</span>
              </p>
            )}

            <div className={styles.actions}>
              {downloadLink("hero")}

              {family.youtube.status === "available" && (
                <TrackedLink
                  href={family.youtube.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.secondaryButton}
                  event="resource_youtube_click"
                  slug={edition.slug}
                  uiLanguage={uiLanguage}
                  placement="hero"
                  data-testid="resource-youtube"
                >
                  <PlayIcon />
                  <span>{youtubeCta}</span>
                  {newTab}
                </TrackedLink>
              )}

              {family.youtube.status === "comingSoon" && (
                <YouTubeComingSoonButton
                  label={youtubeCta}
                  className={styles.secondaryButton}
                  slug={edition.slug}
                  uiLanguage={uiLanguage}
                  placement="hero"
                  dialog={{
                    eyebrow: t("youtubeComingSoon.eyebrow"),
                    title: t("youtubeComingSoon.title"),
                    body: t("youtubeComingSoon.body"),
                    confirm: t("youtubeComingSoon.confirm"),
                    close: t("youtubeComingSoon.close"),
                  }}
                />
              )}
            </div>

            <p className={styles.microcopy}>{microcopy}</p>
          </div>
        </div>
      </section>

      <section className={styles.inside} aria-labelledby="inside-title">
        <div className={styles.insideInner}>
          <div className={styles.insideText}>
            <h2 id="inside-title" className={styles.sectionTitle}>
              {t("whatsInside")}
            </h2>
            <p className={styles.sectionIntro}>{t("whatsInsideIntro")}</p>

            <ul className={styles.features}>
              {family.features.map((feature) => (
                <li key={feature} className={styles.feature}>
                  <span className={styles.featureIcon}>
                    <FeatureIcon icon={feature} />
                  </span>
                  <div>
                    <h3 className={styles.featureTitle}>
                      {tFormat(`features.${feature}.title`)}
                    </h3>
                    <p className={styles.featureBody}>
                      {/*
                       * 형식 문구에 본문이 없는 항목은 에피소드마다 다른 "다루는 주제"이므로
                       * 판 문구(topics)에서 가져옵니다.
                       */}
                      {tFormat.has(`features.${feature}.body`)
                        ? tFormat(`features.${feature}.body`)
                        : tCopy("topics")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {assets.previews.length > 0 && (
            <figure className={styles.previews}>
              <div className={styles.previewPages}>
                {assets.previews.slice(0, 2).map((preview) => (
                  <div key={preview.image.src} className={styles.previewPage}>
                    <Image
                      src={preview.image}
                      alt={tCopy(`previews.${preview.altKey}`)}
                      placeholder="blur"
                      loading="lazy"
                      sizes="(max-width: 767px) 46vw, 240px"
                    />
                  </div>
                ))}
              </div>
              <figcaption className={styles.previewCaption}>
                {t("lookInside")}
              </figcaption>
            </figure>
          )}
        </div>
      </section>

      <section className={styles.closing} aria-labelledby="closing-title">
        <div className={styles.closingInner}>
          <div className={styles.closingText}>
            <h2 id="closing-title" className={styles.closingTitle}>
              {tFormat("closingTitle")}
            </h2>
            <p className={styles.closingBody}>{closingBody}</p>
          </div>
          {downloadLink("closing")}
        </div>
      </section>

      {otherGuides.length > 0 && (
        <nav className={styles.related} aria-labelledby="related-title">
          <div className={styles.relatedInner}>
            <h2 id="related-title" className={styles.relatedTitle}>
              {t("moreGuides")}
            </h2>
            <ResourceGuideList guides={otherGuides} variant="compact" />
            <a
              className={styles.relatedAll}
              href={resourcesIndexPath(uiLanguage)}
              data-testid="all-guides-link"
            >
              {tIndex("viewAll")}
            </a>
          </div>
        </nav>
      )}
    </main>
  );
}
