import Image from "next/image";
import Link from "next/link";

import { logoIcon } from "@/assets/icons";
import styles from "./ResourcePage.module.css";

/**
 * 자료 페이지용 최소 헤더: 로고만 두어 자료 자체에 시선이 가도록 합니다.
 * "/"로 보내면 기존 next-intl 로케일 협상이 방문자 언어의 홈페이지를 고릅니다.
 */
export default function ResourceHeader({ homeLabel }: { homeLabel: string }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" prefetch={false} className={styles.logoLink}>
          <Image src={logoIcon} alt={homeLabel} width={114} height={24} priority />
        </Link>
      </div>
    </header>
  );
}
