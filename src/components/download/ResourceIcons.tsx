import type { DownloadResourceFeature } from "@/content/downloadResources";

/**
 * 다운로드 페이지 전용 라인 아이콘 (장식용, 스크린리더에서는 숨김).
 * 외부 아이콘 라이브러리 없이 24 뷰박스·1.75 선 굵기로 통일합니다.
 */

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

export function DownloadIcon({ size = 20 }: { size?: number }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2}>
      <path d="M12 4v11" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  );
}

export function PlayIcon({ size = 20 }: { size?: number }) {
  return (
    <svg {...base} width={size} height={size}>
      <rect x="2.5" y="5" width="19" height="14" rx="4" />
      <path d="m10 9.25 4.5 2.75-4.5 2.75z" fill="currentColor" />
    </svg>
  );
}

export function FeatureIcon({
  icon,
}: {
  icon: DownloadResourceFeature["icon"];
}) {
  switch (icon) {
    case "sentences":
      return (
        <svg {...base} width={22} height={22}>
          <path d="M8 6h12M8 12h12M8 18h12" />
          <path d="M4 6h.01M4 12h.01M4 18h.01" strokeWidth={2.5} />
        </svg>
      );
    case "conversation":
      return (
        <svg {...base} width={22} height={22}>
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h9A1.5 1.5 0 0 1 16 5.5v6a1.5 1.5 0 0 1-1.5 1.5H9l-3.5 3v-3h0A1.5 1.5 0 0 1 4 11.5z" />
          <path d="M19 9h.5a.5.5 0 0 1 .5.5V16a1 1 0 0 1-1 1h-1v2.5L15 17h-3.5a1 1 0 0 1-1-1v-.5" />
        </svg>
      );
    case "romanization":
      // 한글 "가" 글자로 한국어 + 로마자 표기를 표현합니다.
      return (
        <svg
          viewBox="0 0 24 24"
          width={22}
          height={22}
          aria-hidden
          focusable={false}
        >
          <text
            x="12"
            y="17"
            textAnchor="middle"
            fontSize="15"
            fontWeight="700"
            fill="currentColor"
          >
            가
          </text>
        </svg>
      );
    case "review":
      return (
        <svg {...base} width={22} height={22}>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <path d="m8.5 12 2.5 2.5 4.5-5" />
        </svg>
      );
  }
}
