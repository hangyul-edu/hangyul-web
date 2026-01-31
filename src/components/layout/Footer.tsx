import Link from "next/link";
import styles from "./Footer.module.css";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <Image
            className={styles.logo}
            src="/icons/logo.svg"
            alt="HanGyul Logo"
            width={133}
            height={28}
          />

          <address className={styles.info}>
            <p>대표이사: OOO</p>
            <p className={styles.infoRow}>
              <span>TEL: 010-0000-0000</span>
              <span className={styles.divider} aria-hidden="true" />
              <span>E-mail: example@gmail.com</span>
            </p>
            <p className={`${styles.infoRow} ${styles.mobileCol}`}>
              <span>통신판매업신고: 0000-0000-0000</span>
              <span className={styles.desktopDivider} aria-hidden="true" />
              <span>사업자등록번호: 000-00-00000</span>
            </p>
            <p>서울특별시 강남구 강남대로 333길 강남빌딩 3층</p>
          </address>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.infoRow}>
            <Link href="#">이용약관</Link>
            <span className={styles.divider} aria-hidden="true" />
            <Link href="#">개인정보취급방침</Link>
          </div>
          <p className={styles.copyright}>
            Copyright © 2025 HanGyul. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
