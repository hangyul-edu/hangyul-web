"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { SOCIAL_LINKS } from "@/constants/socialLinks";
import styles from "./ResourcePage.module.css";

/** 자료 없음 화면 (화면 언어로 표시, 다른 자료를 대신 내려주지 않음) */
export default function ResourceNotFound() {
  const t = useTranslations("ResourceDownload.notFound");
  const tCommon = useTranslations("ResourceDownload.common");
  const locale = useLocale();
  const youtube = SOCIAL_LINKS.find((link) => link.platform === "YouTube");

  return (
    <main id="main-content" className={styles.main}>
      <section className={styles.notFound} aria-labelledby="not-found-title">
        <div className={styles.notFoundInner}>
          <h1 id="not-found-title" className={styles.notFoundTitle}>
            {t("title")}
          </h1>
          <p className={styles.notFoundBody}>{t("body")}</p>
          <div className={styles.notFoundActions}>
            <Link
              href={`/${locale}`}
              prefetch={false}
              className={styles.primaryButton}
            >
              {t("cta")}
            </Link>
            {youtube && (
              <a
                href={youtube.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryButton}
              >
                {t("youtube")}
                <span className={styles.srOnly}> {tCommon("opensInNewTab")}</span>
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
