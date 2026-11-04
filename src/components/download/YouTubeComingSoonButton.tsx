"use client";

import { useCallback, useState } from "react";

import AppModal from "@/components/common/AppModal";
import { PlayIcon } from "./ResourceIcons";
import { pushResourceEvent } from "./ResourceTracking";

/**
 * 연결된 영상이 아직 없는 자료(레지스트리 youtube.status === "comingSoon")의 YouTube 버튼.
 *
 * 버튼은 영상이 있는 자료와 같은 모양으로 보이고, 누르면 다른 영상으로 보내는 대신
 * 사이트 공통 AppModal로 "곧 공개됩니다" 안내를 띄웁니다.
 * (포커스 트랩·배경 스크롤 잠금·Esc·바깥 클릭·우상단 ✕ 닫기는 AppModal이 제공)
 * 문구는 서버에서 화면 언어로 번역해 props로 넘깁니다.
 */
export default function YouTubeComingSoonButton({
  label,
  className,
  slug,
  uiLanguage,
  placement,
  dialog,
}: {
  label: string;
  className?: string;
  slug: string;
  uiLanguage: string;
  placement: string;
  dialog: {
    eyebrow: string;
    title: string;
    body: string;
    confirm: string;
    close: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        className={className}
        aria-haspopup="dialog"
        onClick={() => {
          pushResourceEvent("resource_youtube_click", {
            resource_slug: slug,
            ui_language: uiLanguage,
            placement,
            youtube_status: "coming_soon",
          });
          setOpen(true);
        }}
        data-testid="resource-youtube"
        data-youtube-status="comingSoon"
      >
        <PlayIcon />
        <span>{label}</span>
      </button>

      {open && (
        <AppModal
          name="youtube-coming-soon"
          eyebrow={dialog.eyebrow}
          title={dialog.title}
          description={dialog.body}
          iconCloseLabel={dialog.close}
          actions={[{ label: dialog.confirm, onClick: close, variant: "primary" }]}
          onClose={close}
        />
      )}
    </>
  );
}
