"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import styles from "./QrModal.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";

interface Props {
  onClose: () => void;
}

export default function QrModal({ onClose }: Props) {
  const t = useTranslations("QrModal");
  useScrollLock();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <p className={styles.title}>{t("title")}</p>

        {/* TODO: QR 코드 이미지로 교체하기 */}
        <div className={styles.qrPlaceholder}>QR Code</div>

        <p className={styles.description}>{t("description")}</p>
        <button className={styles.closeBtn} onClick={onClose}>
          {t("close")}
        </button>
      </div>
    </div>,
    document.body
  );
}
