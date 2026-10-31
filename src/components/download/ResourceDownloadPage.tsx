import Image from "next/image";

import {
  getResourceUiCopy,
  type DownloadResource,
} from "@/content/downloadResources";
import { resourceFilePath } from "@/constants/downloadResources";
import { DownloadIcon, FeatureIcon, PlayIcon } from "./ResourceIcons";
import { ResourcePageView, TrackedLink } from "./ResourceTracking";
import styles from "./ResourcePage.module.css";

/**
 * 무료 학습 자료 다운로드 랜딩 페이지 본문.
 * 모든 내용은 src/content/downloadResources.ts의 자료 정의에서만 가져옵니다.
 */
export default function ResourceDownloadPage({
  resource,
}: {
  resource: DownloadResource;
}) {
  const copy = getResourceUiCopy(resource.language);
  const fileHref = resourceFilePath(resource.slug);

  const subline = [resource.series, resource.episode, resource.edition]
    .filter(Boolean)
    .join(" · ");

  const microcopy = [
    resource.pageCount ? `${resource.pageCount} ${copy.pagesUnit}` : null,
    resource.format,
    copy.noSignUp,
  ]
    .filter(Boolean)
    .join(" · ");

  const downloadLink = (placement: string) => (
    <TrackedLink
      href={fileHref}
      download={resource.downloadFileName}
      type="application/pdf"
      className={styles.primaryButton}
      event="resource_download_click"
      slug={resource.slug}
      placement={placement}
      data-testid={`resource-download-${placement}`}
    >
      <DownloadIcon />
      <span>{copy.downloadCta}</span>
    </TrackedLink>
  );

  return (
    <main id="main-content" className={styles.main}>
      <ResourcePageView slug={resource.slug} />

      <section className={styles.hero} aria-labelledby="resource-title">
        <div className={styles.heroInner}>
          <div className={styles.coverColumn}>
            <div className={styles.coverStack}>
              <Image
                className={styles.cover}
                src={resource.cover}
                alt={resource.coverAlt}
                placeholder="blur"
                priority
                sizes="(max-width: 767px) 160px, (max-width: 1023px) 300px, 380px"
              />
            </div>
          </div>

          <div className={styles.info}>
            <p className={styles.eyebrow}>{resource.eyebrow}</p>
            <h1 id="resource-title" className={styles.title}>
              {resource.title}
            </h1>
            {subline && <p className={styles.subline}>{subline}</p>}
            <p className={styles.description}>{resource.description}</p>

            {resource.stats && (
              <dl className={styles.stats}>
                {resource.stats.map((stat) => (
                  <div key={stat.label} className={styles.stat}>
                    <dt className={styles.statLabel}>{stat.label}</dt>
                    <dd className={styles.statValue}>{stat.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className={styles.actions}>
              {downloadLink("hero")}

              {resource.youtube && (
                <TrackedLink
                  href={resource.youtube.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.secondaryButton}
                  event="resource_youtube_click"
                  slug={resource.slug}
                  placement="hero"
                >
                  <PlayIcon />
                  <span>{resource.youtube.label}</span>
                  <span className={styles.srOnly}> (opens in a new tab)</span>
                </TrackedLink>
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
              {copy.whatsInside}
            </h2>
            <p className={styles.sectionIntro}>{copy.whatsInsideIntro}</p>

            <ul className={styles.features}>
              {resource.features.map((feature) => (
                <li key={feature.title} className={styles.feature}>
                  <span className={styles.featureIcon}>
                    <FeatureIcon icon={feature.icon} />
                  </span>
                  <div>
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                    <p className={styles.featureBody}>{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {resource.previews && resource.previews.length > 0 && (
            <figure className={styles.previews}>
              <div className={styles.previewPages}>
                {resource.previews.slice(0, 2).map((preview) => (
                  <div key={preview.image.src} className={styles.previewPage}>
                    <Image
                      src={preview.image}
                      alt={preview.alt}
                      placeholder="blur"
                      loading="lazy"
                      sizes="(max-width: 767px) 44vw, 240px"
                    />
                  </div>
                ))}
              </div>
              <figcaption className={styles.previewCaption}>
                {copy.lookInside}
              </figcaption>
            </figure>
          )}
        </div>
      </section>

      <section className={styles.closing} aria-labelledby="closing-title">
        <div className={styles.closingInner}>
          <div>
            <h2 id="closing-title" className={styles.closingTitle}>
              {copy.closingTitle}
            </h2>
            <p className={styles.closingBody}>{copy.closingBody}</p>
          </div>
          {downloadLink("closing")}
        </div>
      </section>
    </main>
  );
}
