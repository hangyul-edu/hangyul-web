import { useState } from "react";

export type DeviceType = "android" | "ios" | "mac" | "windows" | "other";

function detectDevice(): DeviceType {
  if (typeof window === "undefined") return "other";

  const ua = navigator.userAgent;

  if (/Android/i.test(ua)) return "android";
  if (/iPhone|iPad/i.test(ua)) return "ios";
  // iPadOS 13+는 userAgent가 Macintosh로 나오므로 터치포인트로 구분
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return "ios";
  if (/Macintosh|Mac OS X/i.test(ua)) return "mac";
  if (/Windows/i.test(ua)) return "windows";

  return "other";
}

export function useDeviceType(): DeviceType {
  const [device] = useState<DeviceType>(detectDevice);

  return device;
}
