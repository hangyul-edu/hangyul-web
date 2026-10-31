"use client";

import { useEffect, type AnchorHTMLAttributes } from "react";

/**
 * 무료 학습 자료 페이지 분석 이벤트.
 *
 * 새 분석 도구를 붙이지 않고, 사이트에 이미 설치된 GTM(dataLayer)에만 push 합니다.
 * push는 동기적이고 기본 동작을 막지 않으므로 다운로드·이동이 지연되지 않습니다.
 */

type ResourceEvent =
  | "resource_download_page_view"
  | "resource_download_click"
  | "resource_youtube_click";

type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

function pushResourceEvent(
  event: ResourceEvent,
  params: Record<string, string>
) {
  try {
    const w = window as DataLayerWindow;
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event, ...params });
  } catch {
    // 분석 실패가 다운로드를 막아서는 안 됩니다.
  }
}

export function ResourcePageView({ slug }: { slug: string }) {
  useEffect(() => {
    pushResourceEvent("resource_download_page_view", { resource_slug: slug });
  }, [slug]);

  return null;
}

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: Exclude<ResourceEvent, "resource_download_page_view">;
  slug: string;
  /** 같은 이벤트가 여러 위치에서 나올 때 구분값 (예: hero, closing) */
  placement: string;
};

/** 일반 <a> 링크에 클릭 이벤트만 더한 컴포넌트 (기본 동작은 그대로) */
export function TrackedLink({
  event,
  slug,
  placement,
  onClick,
  ...anchorProps
}: TrackedLinkProps) {
  return (
    <a
      {...anchorProps}
      onClick={(e) => {
        pushResourceEvent(event, { resource_slug: slug, placement });
        onClick?.(e);
      }}
    />
  );
}
