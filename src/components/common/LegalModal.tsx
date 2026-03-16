"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./LegalModal.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";

interface Props {
  title: string;
  lastUpdated: string;
  body: string;
  onClose: () => void;
}

export default function LegalModal({ title, lastUpdated, body, onClose }: Props) {
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
        <div className={styles.header}>
          <div>
            <p className={styles.title}>{title}</p>
            <p className={styles.lastUpdated}>{lastUpdated}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <div className={styles.body}>{body}</div>
      </div>
    </div>,
    document.body
  );
}
