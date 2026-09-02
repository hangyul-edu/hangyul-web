"use client";

import { useLaunchFlow } from "./LaunchFlowProvider";

interface Props {
  /**
   * - "hangyul": 한귤 앱 CTA. 2026-10-09(한글날) 오픈 안내 모달을 띄웁니다.
   * - "ganada": 이미 출시된 한귤 가나다 CTA. 기기에 맞는 스토어로 바로 연결합니다.
   */
  app: "hangyul" | "ganada";
  className?: string;
  children: React.ReactNode;
}

export default function StoreButton({ app, className, children }: Props) {
  const { openMainLaunchModal, openHangyulGanada } = useLaunchFlow();

  const handleClick = app === "ganada" ? openHangyulGanada : openMainLaunchModal;

  return (
    <button type="button" className={className} onClick={handleClick}>
      {children}
    </button>
  );
}
