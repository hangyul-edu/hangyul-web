import Link from "next/link";
import styles from "./Footer.module.css";
import Image from "next/image";
import { logoIcon } from "@/assets/icons";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <Image
            className={styles.logo}
            src={logoIcon}
            alt="HanGyul Logo"
            width={133}
            height={28}
          />

          <address className={styles.info}>
            <p>{t("ceo")}</p>
            <p>{t("email")}</p>
            <p>{t("businessNumber")}</p>
            <p>{t("address")}</p>
          </address>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.infoRow}>
            <Link href="">{t("terms")}</Link>
            <span className={styles.divider} aria-hidden="true" />
            <Link href="">{t("privacy")}</Link>
          </div>
          <p className={styles.copyright}>
            Copyright © 2025 HanGyul. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
