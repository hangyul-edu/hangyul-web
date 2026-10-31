import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { logoIcon } from "@/assets/icons";
import ResourceLanguageSelector from "./ResourceLanguageSelector";
import styles from "./ResourcePage.module.css";

/**
 * 자료 페이지용 최소 헤더: 로고 + 언어 선택기만 둡니다.
 * 로고는 같은 화면 언어의 한귤 홈페이지(/<lang>)로 연결합니다.
 */
export default async function ResourceHeader({
  uiLanguage,
  resourceSlug,
  siblingEditions,
}: {
  uiLanguage: string;
  resourceSlug: string | null;
  siblingEditions: Record<string, string>;
}) {
  const t = await getTranslations({
    locale: uiLanguage,
    namespace: "ResourceDownload.common",
  });

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href={`/${uiLanguage}`} prefetch={false} className={styles.logoLink}>
          <Image src={logoIcon} alt={t("homeLink")} width={114} height={24} priority />
        </Link>

        <ResourceLanguageSelector
          uiLanguage={uiLanguage}
          resourceSlug={resourceSlug}
          siblingEditions={siblingEditions}
        />
      </div>
    </header>
  );
}
