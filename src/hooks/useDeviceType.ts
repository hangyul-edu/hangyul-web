import { useState } from "react";

export type DeviceType = "android" | "ios" | "mac" | "windows" | "other";

type NavigatorWithUAData = Navigator & {
  userAgentData?: { platform?: string; mobile?: boolean };
};

/**
 * 현재 기기 종류를 판별합니다.
 *
 * - iPadOS 13+는 Safari가 데스크톱 Safari와 동일한 "Macintosh" userAgent를 보내므로
 *   터치 포인트(maxTouchPoints)로 iPad와 실제 Mac을 구분합니다.
 *   일반 Mac은 터치 포인트가 0이라 iOS로 오판되지 않습니다.
 * - Chromium 계열은 userAgentData.platform을 우선 신뢰합니다.
 */
export function detectDevice(): DeviceType {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "other";
  }

  const ua = navigator.userAgent ?? "";
  const platform = (
    (navigator as NavigatorWithUAData).userAgentData?.platform ?? ""
  ).toLowerCase();
  // 실제 Mac(Safari/Chrome)은 터치 API를 노출하지 않으므로 iPad와 구분하는 기준이 됩니다.
  const hasTouch = (navigator.maxTouchPoints ?? 0) > 0 || "ontouchstart" in window;

  if (platform === "android" || /Android/i.test(ua)) return "android";

  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";

  const isMacLike = platform === "macos" || /Macintosh|Mac OS X/i.test(ua);
  // iPadOS(데스크톱 모드): Mac처럼 보이지만 터치를 지원합니다.
  if (isMacLike && hasTouch) return "ios";
  if (isMacLike) return "mac";

  if (platform === "windows" || /Windows/i.test(ua)) return "windows";

  return "other";
}

export function useDeviceType(): DeviceType {
  const [device] = useState<DeviceType>(detectDevice);

  return device;
}
