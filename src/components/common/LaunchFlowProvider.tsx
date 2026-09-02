"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import AppModal from "./AppModal";
import DeviceChoiceList from "./DeviceChoiceList";
import { detectDevice } from "@/hooks/useDeviceType";
import { GANADA_STORE_LINKS, type StorePlatform } from "@/constants/storeLinks";

type ActiveModal = "launch" | "storeSelect" | null;

interface LaunchFlow {
  /** 한귤 앱 "지금 시작하기": 10월 9일(한글날) 오픈 안내 모달 */
  openMainLaunchModal: () => void;
  /** 한귤 가나다: 기기에 맞는 스토어로 이동 (데스크톱은 기기 선택 모달) */
  openHangyulGanada: () => void;
}

const LaunchFlowContext = createContext<LaunchFlow | null>(null);

/** 모바일은 현재 탭에서 스토어(앱)로, 데스크톱은 새 탭으로 연결합니다. */
function goToGanadaStore(platform: StorePlatform, newTab: boolean) {
  const url = GANADA_STORE_LINKS[platform];

  if (newTab) {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    window.location.assign(url);
  }
}

export function LaunchFlowProvider({ children }: { children: React.ReactNode }) {
  const tLaunch = useTranslations("LaunchModal");
  const tStore = useTranslations("StoreSelectModal");
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const close = useCallback(() => setActiveModal(null), []);

  const openMainLaunchModal = useCallback(() => setActiveModal("launch"), []);

  const openHangyulGanada = useCallback(() => {
    const device = detectDevice();

    if (device === "android") {
      setActiveModal(null);
      goToGanadaStore("android", false);
      return;
    }

    if (device === "ios") {
      setActiveModal(null);
      goToGanadaStore("ios", false);
      return;
    }

    // 데스크톱(Mac/Windows/기타): 사용자가 자신의 기기(Android / iPhone)를 직접 선택합니다.
    setActiveModal("storeSelect");
  }, []);

  const selectStore = useCallback(
    (platform: StorePlatform) => {
      setActiveModal(null);
      goToGanadaStore(platform, true);
    },
    []
  );

  const value = useMemo<LaunchFlow>(
    () => ({ openMainLaunchModal, openHangyulGanada }),
    [openMainLaunchModal, openHangyulGanada]
  );

  return (
    <LaunchFlowContext.Provider value={value}>
      {children}

      {activeModal === "launch" && (
        <AppModal
          name="launch"
          eyebrow={tLaunch("eyebrow")}
          title={tLaunch("title")}
          description={[tLaunch("description"), tLaunch("suggestion")]}
          onClose={close}
          iconCloseLabel={tLaunch("close")}
          actions={[
            { label: tLaunch("close"), onClick: close, variant: "secondary" },
            { label: tLaunch("cta"), onClick: openHangyulGanada },
          ]}
        />
      )}

      {activeModal === "storeSelect" && (
        <AppModal
          name="storeSelect"
          title={tStore("title")}
          description={tStore("description")}
          onClose={close}
          iconCloseLabel={tStore("close")}
        >
          {/* 기기가 1차 선택지, 스토어는 보조 정보. 카드 전체가 버튼입니다. */}
          <DeviceChoiceList
            onSelect={selectStore}
            choices={[
              {
                platform: "android",
                label: tStore("androidLabel"),
                store: tStore("androidStore"),
                ariaLabel: tStore("androidAria"),
              },
              {
                platform: "ios",
                label: tStore("appleLabel"),
                store: tStore("appleStore"),
                ariaLabel: tStore("appleAria"),
              },
            ]}
          />
        </AppModal>
      )}
    </LaunchFlowContext.Provider>
  );
}

export function useLaunchFlow(): LaunchFlow {
  const context = useContext(LaunchFlowContext);
  if (!context) {
    throw new Error("useLaunchFlow must be used within <LaunchFlowProvider>");
  }
  return context;
}
