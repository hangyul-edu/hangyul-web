import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { resourceFilePath, resourcePagePath } from "@/constants/downloadResources";
import { getResourceAssets } from "@/content/downloadResourceAssets";
import {
  getSiblingEdition,
  type ResolvedResource,
} from "@/content/downloadResources";
import {
  DocumentIcon,
  DownloadIcon,
  FeatureIcon,
  InfoIcon,
  PlayIcon,
} from "./ResourceIcons";
import { ResourcePageView, TrackedLink } from "./ResourceTracking";
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
  // 화면 언어로 쓰인 판이 같은 가족에 실제로 있을 때만 안내합니다.
  const uiLanguageEdition = languageMismatch
    ? getSiblingEdition(family, uiLanguage)
    : null;
  const tUiEdition = uiLanguageEdition
    ? await getTranslations({
        locale: uiLanguage,
        namespace:
          `ResourceDownload.editionLanguages.${uiLanguage}` as EditionLanguageNamespace,
      })
    : null;

  const fileHref = resourceFilePath(edition.slug);
  // 연결된 영상이 이 에피소드의 영상일 때만 판 문구에 에피소드가 들어간 버튼 문구가 있습니다.
  const youtubeCta = tCopy.has("youtubeCta") ? tCopy("youtubeCta") : t("youtubeCta");
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
    family.sentenceCount != null && {
      value: family.sentenceCount,
      label: t("statSentences", { count: family.sentenceCount }),
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
                <span>{tEdition("notice")}</span>
              </p>
            )}

            <div className={styles.actions}>
              {downloadLink("hero")}

              {family.youtubeUrl && (
                <TrackedLink
                  href={family.youtubeUrl}
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
            </div>

            <p className={styles.microcopy}>{microcopy}</p>

            {uiLanguageEdition && tUiEdition && (
              <a
                className={styles.siblingLink}
                href={resourcePagePath(uiLanguageEdition.slug, uiLanguage)}
                hrefLang={uiLanguage}
              >
                {tUiEdition("switch")}
              </a>
            )}
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
                      {/* 다루는 주제는 에피소드마다 다르므로 판 문구에서 가져옵니다. */}
                      {feature === "sentences"
                        ? tCopy("topics")
                        : tFormat(`features.${feature}.body`)}
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
            <p className={styles.closingBody}>{t("closingBody")}</p>
          </div>
          {downloadLink("closing")}
        </div>
      </section>
    </main>
  );
}
