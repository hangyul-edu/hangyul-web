import { useEffect } from "react";

export function useScrollLock() {
  useEffect(() => {
    const html = document.documentElement;
    const original = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = original;
    };
  }, []);
}
