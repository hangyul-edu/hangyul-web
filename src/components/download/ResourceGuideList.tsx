import Image from "next/image";

import type { GuideSummary } from "./resourceGuides";
import styles from "./ResourcePage.module.css";

/**
 * 무료 학습 가이드 카드 목록 (자료 목록 페이지와 각 자료 페이지 아래 "다른 무료 학습 가이드").
 *
 * 카드 전체가 하나의 일반 <a href> 링크라 JS 없이도, 크롤러도 따라갈 수 있습니다.
 * 표지는 화면 아래쪽에 있으므로 지연 로딩합니다 (자료 페이지의 LCP인 큰 표지와 별개).
 * - variant="full": 설명·판 언어까지 보여주는 목록 페이지용
 * - variant="compact": 표지 썸네일·시리즈·제목만 보여주는 자료 페이지 하단용
 */
export default function ResourceGuideList({
  guides,
  variant,
  headingLevel = 3,
  viewLabel,
}: {
  guides: GuideSummary[];
  variant: "full" | "compact";
  headingLevel?: 2 | 3;
  /** variant="full"의 링크 안내 문구 (예: "View study guide") */
  viewLabel?: string;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <ul
      className={variant === "full" ? styles.guideGrid : styles.guideList}
      data-testid={`guide-list-${variant}`}
    >
      {guides.map((guide) => (
        <li key={guide.family.id} className={styles.guideItem}>
          <a
            href={guide.href}
            className={
              variant === "full" ? styles.guideCard : styles.guideCardCompact
            }
          >
            <span className={styles.guideCover}>
              <Image
                src={guide.cover}
                alt={variant === "full" ? guide.coverAlt : ""}
                loading="lazy"
                sizes={variant === "full" ? "120px" : "56px"}
              />
            </span>
            <div className={styles.guideText}>
              {guide.family.series && (
                <span className={styles.guideSeries} lang="en" dir="ltr">
                  {guide.family.series}
                </span>
              )}
              {/* 같은 형식의 가이드(EP01·EP02)가 구분되도록 에피소드까지 제목에 넣습니다. */}
              <Heading className={styles.guideTitle}>{guide.name}</Heading>
              {variant === "full" && (
                <>
                  <p className={styles.guideDescription}>{guide.description}</p>
                  <p className={styles.guideMeta}>{guide.metaLine}</p>
                  {viewLabel && (
                    <span className={styles.guideView} aria-hidden="true">
                      {viewLabel}
                    </span>
                  )}
                </>
              )}
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
