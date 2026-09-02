"use client";

import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import styles from "./AppModal.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export interface AppModalAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

interface Props {
  /** 제목 위의 작은 라벨 (선택) */
  eyebrow?: string;
  title: string;
  /** 문단 배열은 문단 간 간격을 두고 렌더링됩니다. */
  description: string | string[];
  /** 하단 버튼 (선택). children으로 자체 선택 UI를 넣는 모달은 생략할 수 있습니다. */
  actions?: AppModalAction[];
  /** 본문과 하단 버튼 사이에 들어가는 커스텀 콘텐츠 (예: 기기 선택 카드) */
  children?: React.ReactNode;
  onClose: () => void;
  /**
   * 우상단 ✕ 아이콘 닫기 버튼의 접근성 라벨.
   * 하단 버튼에 "닫기"가 없는 모달에서 사용합니다.
   */
  iconCloseLabel?: string;
  /** e2e/스타일 훅용 식별자 */
  name?: string;
}

/**
 * Figma cp_G_01_modals 디자인을 따르는 공통 확인 모달.
 * 포커스 트랩, 배경 스크롤 잠금, Escape/오버레이 클릭 닫기를 제공합니다.
 */
export default function AppModal({
  eyebrow,
  title,
  description,
  actions = [],
  children,
  onClose,
  iconCloseLabel,
  name,
}: Props) {
  const modalRef = useFocusTrap<HTMLDivElement>();
  const titleId = useId();
  const descriptionId = useId();
  useScrollLock();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const paragraphs = Array.isArray(description) ? description : [description];

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        data-modal={name}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {iconCloseLabel && (
          <button
            type="button"
            className={styles.iconClose}
            onClick={onClose}
            aria-label={iconCloseLabel}
          >
            ✕
          </button>
        )}

        <div className={styles.textGroup}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <div id={descriptionId}>
            {paragraphs.map((text) => (
              <p key={text} className={styles.description}>
                {text}
              </p>
            ))}
          </div>
        </div>

        {children}

        {actions.length > 0 && (
          <div className={styles.actions}>
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                className={`${styles.button} ${
                  action.variant === "secondary" ? styles.secondary : styles.primary
                }`}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
