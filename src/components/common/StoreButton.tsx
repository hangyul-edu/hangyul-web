"use client";

import { useTranslations } from "next-intl";

// TODO: 앱 런칭(2026.05.18) 후 아래 주석을 해제하고 comingSoon alert를 제거하세요
// import { useState } from "react";
// import { useDeviceType } from "@/hooks/useDeviceType";
// import { STORE_LINKS } from "@/constants/storeLinks";
// import QrModal from "./QrModal";

interface Props {
  className?: string;
  children: React.ReactNode;
}

export default function StoreButton({ className, children }: Props) {
  const t = useTranslations("StoreButton");

  const handleClick = () => {
    alert(t("comingSoon"));
  };

  // TODO: 앱 런칭(2026.05.18) 후 아래 코드로 교체하세요
  // const device = useDeviceType();
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const handleClick = () => {
  //   if (device === "android") {
  //     window.open(STORE_LINKS.android, "_blank");
  //   } else if (device === "ios" || device === "mac") {
  //     window.open(STORE_LINKS.ios, "_blank");
  //   } else {
  //     setIsModalOpen(true);
  //   }
  // };

  return (
    <>
      <button className={className} onClick={handleClick}>
        {children}
      </button>
      {/* TODO: 앱 런칭(2026.05.18) 후 추가 */}
      {/* {isModalOpen && <QrModal onClose={() => setIsModalOpen(false)} />} */}
    </>
  );
}
