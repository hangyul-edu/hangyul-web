import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { logoIcon } from "@/assets/icons";
import headerStyles from "@/components/layout/Header.module.css";
import ResourceLanguageSelector from "./ResourceLanguageSelector";
import styles from "./ResourcePage.module.css";

/**
 * 자료 페이지용 최소 헤더: 로고 + 언어 선택기만 둡니다. (내비게이션·햄버거 메뉴 없음)
 * 컨테이너·로고 크기(151×32, 모바일 76px)는 홈페이지 헤더(Header.module.css)와 같은
 * 클래스를 그대로 씁니다. 로고는 같은 화면 언어의 한귤 홈페이지(/<lang>)로 연결합니다.
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
      <div className={headerStyles.container}>
        <Link href={`/${uiLanguage}`} prefetch={false} className={styles.logoLink}>
          <Image
            src={logoIcon}
            alt={t("homeLink")}
            width={151}
            height={32}
            className={headerStyles.logo}
            priority
          />
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
