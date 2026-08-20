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

export default function MainSection() {
  const t = useTranslations("MainSection");
  const locale = useLocale();
  const mockupImg = getLocaleImages(locale).mockup;

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
            <div className={styles.sloganDesktop}>
              <Image
                src={sloganDesktopIcon}
                alt="HanGyul Slogan Desktop"
                width={594}
                height={240}
                style={{ width: "100%", height: "auto" }}
              />
            </div>

            <div className={styles.sloganMobile}>
              <Image
                src={sloganMobileIcon}
                alt="HanGyul Slogan Mobile"
                width={262}
                height={105}
                style={{ width: "100%", height: "auto" }}
              />
            </div>

            <p className={styles.description}>{t("description")}</p>
          </div>

          <div>
            <StoreButton className={styles.storeBtn}>
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
          <Image
            src={mockupImg}
            alt=""
            width={522}
            height={628}
            sizes="(max-width: 768px) 320px, 522px"
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      </div>
    </section>
  );
}
