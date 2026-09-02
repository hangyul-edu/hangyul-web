"use client";

import styles from "./DeviceChoiceList.module.css";
import type { StorePlatform } from "@/constants/storeLinks";

export interface DeviceChoice {
  platform: StorePlatform;
  /** 1차 정보: 기기 이름 (예: "Android", "iPhone") */
  label: string;
  /** 2차 정보: 이동할 스토어 (예: "Google Play에서 다운로드") */
  store: string;
  /** 스크린리더용 전체 문장 (예: "Android용 한귤 가나다를 Google Play에서 다운로드") */
  ariaLabel: string;
}

interface Props {
  choices: DeviceChoice[];
  onSelect: (platform: StorePlatform) => void;
}

/**
 * Android 로봇 머리 (Material Design "android" 글리프, Apache-2.0 / Android 로봇 CC BY 3.0 Google).
 * currentColor를 쓰므로 hover/focus 시 카드 색과 함께 바뀝니다.
 */
function AndroidIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
      <path d="M17.6 9.48l1.84-3.18a.63.63 0 0 0-.26-.85.637.637 0 0 0-.83.22l-1.88 3.24a11.43 11.43 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2.62.62 0 0 0-.22.83L6.4 9.48A10.81 10.81 0 0 0 1 18h22a10.81 10.81 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" />
    </svg>
  );
}

/**
 * 스마트폰 실루엣 (Material Design "smartphone" 글리프, Apache-2.0).
 * 한귤 가나다는 iPhone만 지원하므로 태블릿 없이 단일 휴대폰 모양만 사용합니다.
 * Android 아이콘과 같은 채움(fill) 스타일·currentColor로 hover/focus 색이 함께 바뀝니다.
 */
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
      <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      className={styles.chevron}
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.64645 14.3536C4.45119 14.1583 4.45119 13.8417 4.64645 13.6464L10.2929 8L4.64645 2.35355C4.45118 2.15829 4.45118 1.84171 4.64645 1.64645C4.84171 1.45118 5.15829 1.45118 5.35355 1.64645L11.3536 7.64645C11.5488 7.84171 11.5488 8.15829 11.3536 8.35355L5.35355 14.3536C5.15829 14.5488 4.84171 14.5488 4.64645 14.3536Z"
      />
    </svg>
  );
}

const ICON_BY_PLATFORM: Record<StorePlatform, () => React.JSX.Element> = {
  android: AndroidIcon,
  ios: PhoneIcon,
};

/**
 * 데스크톱 기기 선택 모달의 선택지.
 * 사용자는 "어떤 스토어"가 아니라 "어떤 기기"를 고르며, 스토어 이름은 보조 정보로만 보여줍니다.
 * 카드 전체가 버튼이라 아이콘·본문·스토어 문구 어디를 눌러도 동일하게 동작합니다.
 */
export default function DeviceChoiceList({ choices, onSelect }: Props) {
  return (
    <div className={styles.list}>
      {choices.map((choice) => {
        const Icon = ICON_BY_PLATFORM[choice.platform];
        return (
          <button
            key={choice.platform}
            type="button"
            className={styles.card}
            aria-label={choice.ariaLabel}
            data-platform={choice.platform}
            onClick={() => onSelect(choice.platform)}
          >
            <span className={styles.icon}>
              <Icon />
            </span>
            <span className={styles.text}>
              <span className={styles.label}>{choice.label}</span>
              <span className={styles.store}>{choice.store}</span>
            </span>
            <ChevronIcon />
          </button>
        );
      })}
    </div>
  );
}
