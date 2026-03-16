"use client";

import Image from "next/image";
import styles from "./MainSection.module.css";
import { motion } from "framer-motion";
import {
  chevronRightIcon,
  sloganDesktopIcon,
  sloganMobileIcon,
} from "@/assets/icons";
import { backgroundImg } from "@/assets/images";
import { useLocale, useTranslations } from "next-intl";
import { IMAGES } from "@/constants/images";
import StoreButton from "@/components/common/StoreButton";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: "easeOut" as const, delay },
});

export default function MainSection() {
  const t = useTranslations("MainSection");
  const locale = useLocale() as "en" | "ko";
  const mockupImg = IMAGES[locale].mockup;

  return (
    <section className={styles.container}>
      <Image
        src={backgroundImg}
        alt=""
        fill
        priority
        className={styles.background}
      />
      <div className={styles.overlay} />
      <div key={locale} className={styles.content}>
        <div className={styles.leftSection}>
          <div className={styles.textGroup}>
            {/* 데스크탑 슬로건 */}
            <motion.div className={styles.sloganDesktop} {...fadeUp(0)}>
              <Image
                src={sloganDesktopIcon}
                alt="HanGyul Slogan Desktop"
                width={594}
                height={240}
                priority
                style={{ width: "100%", height: "auto" }}
              />
            </motion.div>

            {/* 모바일 슬로건 */}
            <motion.div className={styles.sloganMobile} {...fadeUp(0)}>
              <Image
                src={sloganMobileIcon}
                alt="HanGyul Slogan Mobile"
                width={262}
                height={105}
                priority
                style={{ width: "100%", height: "auto" }}
              />
            </motion.div>

            {/* 설명 텍스트 */}
            <motion.p className={styles.description} {...fadeUp(0.3)}>
              {t("description")}
            </motion.p>
          </div>

          {/* 버튼 */}
          <motion.div {...fadeUp(0.6)}>
            <StoreButton className={styles.storeBtn}>
              {t("button")}
              <Image src={chevronRightIcon} alt="arrow" width={16} height={16} />
            </StoreButton>
          </motion.div>
        </div>

        {/* 오른쪽 목업 이미지 */}
        <motion.div className={styles.mockupWrapper} {...fadeUp(0.8)}>
          <Image
            src={mockupImg}
            alt="Mockup"
            width={522}
            height={628}
            priority
            style={{ width: "100%", height: "auto" }}
          />
        </motion.div>
      </div>
    </section>
  );
}
