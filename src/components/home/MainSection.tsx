"use client";

import Image from "next/image";
import styles from "./MainSection.module.css";
import {
  chevronRightIcon,
  sloganDesktopIcon,
  sloganMobileIcon,
} from "@/assets/icons";
import { backgroundHeroImg } from "@/assets/images";
import { useLocale, useTranslations } from "next-intl";
import { getLocaleImages } from "@/constants/images";
import StoreButton from "@/components/common/StoreButton";

/** 슬로건 이미지에 실제로 쓰여 있는 문구 (모든 로케일 공통 영문 그래픽) */
const HERO_SLOGAN = "When life gives you a tangerine, Talk Hangyul.";

export default function MainSection() {
  const t = useTranslations("MainSection");
  const tAlt = useTranslations("Alt");
  const locale = useLocale();
  const images = getLocaleImages(locale);

  return (
    <section className={styles.container}>
      <Image
        src={backgroundHeroImg}
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className={styles.background}
      />
      <div className={styles.overlay} />
      <div className={styles.content}>
        <div className={styles.leftSection}>
          <div className={styles.textGroup}>
            {/*
              히어로 슬로건 이미지가 페이지의 대표 제목이므로 h1으로 감쌉니다.
              alt에는 이미지에 실제로 적혀 있는 문구를 그대로 넣습니다.
              (데스크탑/모바일 중 한 쪽만 렌더링되므로 alt는 동일합니다.)
            */}
            <h1 className={styles.slogan}>
              <Image
                src={sloganDesktopIcon}
                alt={HERO_SLOGAN}
                width={594}
                height={240}
                className={styles.sloganDesktop}
              />
              <Image
                src={sloganMobileIcon}
                alt={HERO_SLOGAN}
                width={262}
                height={105}
                className={styles.sloganMobile}
              />
            </h1>

            <p className={styles.description}>{t("description")}</p>
          </div>

          <div>
            <StoreButton app="hangyul" className={styles.storeBtn}>
              {t("button")}
              <Image
              src={chevronRightIcon}
              alt=""
              width={16}
              height={16}
              className="rtl-flip"
            />
            </StoreButton>
          </div>
        </div>

        <div className={styles.mockupWrapper}>
          {/* 데스크탑/모바일 목업은 CSS로 하나만 노출합니다. 숨겨진 쪽은 sizes를 1px로 두어 큰 이미지를 받지 않습니다. */}
          <Image
            src={images.mockupDesktop}
            alt={tAlt("appPreview")}
            priority
            sizes="(max-width: 768px) 1px, 522px"
            className={styles.mockupDesktop}
          />
          <Image
            src={images.mockupMobile}
            alt={tAlt("appPreview")}
            priority
            sizes="(max-width: 768px) 320px, 1px"
            className={styles.mockupMobile}
          />
        </div>
      </div>
    </section>
  );
}
