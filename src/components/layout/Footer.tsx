"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./Footer.module.css";
import Image from "next/image";
import { logoIcon } from "@/assets/icons";
import { useLocale, useTranslations } from "next-intl";
import LegalModal from "@/components/common/LegalModal";
import { getBrandName } from "@/constants/site";
import {
  loadLegalDocument,
  type LegalDocument,
  type LegalDocumentType,
} from "@/content/legal";

type ModalType = LegalDocumentType | null;

function getLegalModalType(value: string | null): ModalType {
  if (value === "terms" || value === "privacy") return value;
  return null;
}

export default function Footer() {
  const t = useTranslations("Footer");
  const locale = useLocale();
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [loadedLegal, setLoadedLegal] = useState<{
    type: LegalDocumentType;
    locale: string;
    document: LegalDocument;
  } | null>(null);

  const getModalTypeFromUrl = useCallback(() => {
    return getLegalModalType(
      new URLSearchParams(window.location.search).get("legal")
    );
  }, []);

  const updateLegalParam = useCallback(
    (modalType: ModalType, mode: "push" | "replace" = "push") => {
      const url = new URL(window.location.href);

      if (modalType) {
        url.searchParams.set("legal", modalType);
      } else {
        url.searchParams.delete("legal");
      }

      const nextUrl = `${url.pathname}${url.search}${url.hash}`;
      window.history[mode === "push" ? "pushState" : "replaceState"](
        window.history.state,
        "",
        nextUrl
      );
      setOpenModal(modalType);
    },
    []
  );

  useEffect(() => {
    const syncModalWithUrl = () => {
      setOpenModal(getModalTypeFromUrl());
    };

    syncModalWithUrl();
    window.addEventListener("popstate", syncModalWithUrl);

    return () => window.removeEventListener("popstate", syncModalWithUrl);
  }, [getModalTypeFromUrl]);

  // 모달을 열 때 현재 locale의 약관 문서만 동적으로 불러온다.
  useEffect(() => {
    if (!openModal) return;

    let cancelled = false;

    loadLegalDocument(openModal, locale).then((document) => {
      if (!cancelled) setLoadedLegal({ type: openModal, locale, document });
    });

    return () => {
      cancelled = true;
    };
  }, [openModal, locale]);

  const prefetchLegal = useCallback(
    (type: LegalDocumentType) => {
      void loadLegalDocument(type, locale);
    },
    [locale]
  );

  // 다른 문서나 다른 언어를 불러오는 중에는 이전 내용을 보여주지 않는다.
  const activeContent =
    loadedLegal && loadedLegal.type === openModal && loadedLegal.locale === locale
      ? loadedLegal.document
      : null;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <Image
            className={styles.logo}
            src={logoIcon}
            alt={getBrandName(locale)}
            width={133}
            height={28}
          />

          <address className={styles.info}>
            <p>{t("ceo")}</p>
            <p>{t("businessDivision")}</p>
            <p>{t("email")}</p>
            <p>{t("businessNumber")}</p>
            <p>{t("mailOrderNumber")}</p>
          </address>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.infoRow}>
            <button
              className={styles.legalLink}
              aria-haspopup="dialog"
              onClick={() => updateLegalParam("terms")}
              onMouseEnter={() => prefetchLegal("terms")}
              onFocus={() => prefetchLegal("terms")}
            >
              {t("terms")}
            </button>
            <span className={styles.divider} aria-hidden="true" />
            <button
              className={styles.legalLink}
              aria-haspopup="dialog"
              onClick={() => updateLegalParam("privacy")}
              onMouseEnter={() => prefetchLegal("privacy")}
              onFocus={() => prefetchLegal("privacy")}
            >
              {t("privacy")}
            </button>
          </div>
          <p className={styles.copyright}>
            {/* 영문 고정 문구이므로 RTL 페이지에서도 LTR 순서로 표기 */}
            <span dir="ltr">Copyright © 2025 HanGyul. All Rights Reserved.</span>
          </p>
        </div>
      </div>

      {openModal && (
        <LegalModal
          /* 제목은 번역 메시지로 즉시 표시하고, 본문은 로드되는 대로 채운다. */
          title={t(openModal)}
          lastUpdated={activeContent?.lastUpdated ?? ""}
          body={activeContent?.body ?? ""}
          onClose={() => updateLegalParam(null, "replace")}
        />
      )}
    </footer>
  );
}
