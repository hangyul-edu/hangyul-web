"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./LegalModal.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface Props {
  title: string;
  lastUpdated: string;
  body: string;
  onClose: () => void;
}

export default function LegalModal({ title, lastUpdated, body, onClose }: Props) {
  const modalRef = useFocusTrap<HTMLElement>();
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
      <article ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="legal-modal-title" className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <p id="legal-modal-title" className={styles.title}>{title}</p>
            <p className={styles.lastUpdated}>{lastUpdated}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <div className={styles.body} tabIndex={0}>{body}</div>
      </article>
    </div>,
    document.body
  );
}
