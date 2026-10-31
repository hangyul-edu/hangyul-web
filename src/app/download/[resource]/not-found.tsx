import Link from "next/link";

import styles from "@/components/download/ResourcePage.module.css";
import { SOCIAL_LINKS } from "@/constants/socialLinks";
import { getResourceUiCopy } from "@/content/downloadResources";

/**
 * /download?resource=<모르는 값> — 다른 자료를 내려주지 않고 안내만 합니다. (404)
 */
export default function ResourceNotFound() {
  const copy = getResourceUiCopy("en");
  const youtube = SOCIAL_LINKS.find((link) => link.platform === "YouTube");

  return (
    <main id="main-content" className={styles.main}>
      <section className={styles.notFound} aria-labelledby="not-found-title">
        <div className={styles.notFoundInner}>
          <h1 id="not-found-title" className={styles.notFoundTitle}>
            {copy.notFoundTitle}
          </h1>
          <p className={styles.notFoundBody}>{copy.notFoundBody}</p>
          <div className={styles.notFoundActions}>
            <Link href="/" prefetch={false} className={styles.primaryButton}>
              {copy.notFoundCta}
            </Link>
            {youtube && (
              <a
                href={youtube.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryButton}
              >
                {copy.notFoundSecondary}
                <span className={styles.srOnly}> (opens in a new tab)</span>
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
