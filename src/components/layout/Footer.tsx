"use client";

import { useState } from "react";
import styles from "./Footer.module.css";
import Image from "next/image";
import { logoIcon } from "@/assets/icons";
import { useLocale, useTranslations } from "next-intl";
import LegalModal from "@/components/common/LegalModal";
import { termsKo } from "@/content/terms/ko";
import { termsEn } from "@/content/terms/en";
import { privacyKo } from "@/content/privacy/ko";
import { privacyEn } from "@/content/privacy/en";

type ModalType = "terms" | "privacy" | null;

export default function Footer() {
  const t = useTranslations("Footer");
  const locale = useLocale();
  const [openModal, setOpenModal] = useState<ModalType>(null);

  const terms = locale === "ko" ? termsKo : termsEn;
  const privacy = locale === "ko" ? privacyKo : privacyEn;

  const activeContent = openModal === "terms" ? terms : privacy;

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
            <button className={styles.legalLink} aria-haspopup="dialog" onClick={() => setOpenModal("terms")}>
              {t("terms")}
            </button>
            <span className={styles.divider} aria-hidden="true" />
            <button className={styles.legalLink} aria-haspopup="dialog" onClick={() => setOpenModal("privacy")}>
              {t("privacy")}
            </button>
          </div>
          <p className={styles.copyright}>
            Copyright © 2025 HanGyul. All Rights Reserved.
          </p>
        </div>
      </div>

      {openModal && (
        <LegalModal
          title={activeContent.title}
          lastUpdated={activeContent.lastUpdated}
          body={activeContent.body}
          onClose={() => setOpenModal(null)}
        />
      )}
    </footer>
  );
}
