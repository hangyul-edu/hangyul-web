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

export default function MainSection() {
  const t = useTranslations("MainSection");
  const locale = useLocale() as "en" | "ko";

  const mockupImg = IMAGES[locale].mockup;

  // 아래에서 위로 부드럽게 올라오는 설정 (타입 오류 해결)
  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: {
      duration: 0.8,
      ease: "easeOut",
    } as const, // transition 속성에 as const를 붙여 타입을 고정합니다.
  };

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
      <div className={styles.content}>
        <div className={styles.leftSection}>
          <div className={styles.textGroup}>
            {/* 데스크탑 슬로건 */}
            <motion.div
              className={styles.sloganDesktop}
              initial={fadeInUp.initial}
              whileInView={fadeInUp.whileInView}
              viewport={fadeInUp.viewport}
              transition={fadeInUp.transition}
            >
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
            <motion.div className={styles.sloganMobile} {...fadeInUp}>
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
            <motion.p
              className={styles.description}
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.3 }}
            >
              {t.rich("description", { br: () => <br /> })}
            </motion.p>
          </div>

          {/* 버튼 */}
          <motion.button
            className={styles.storeBtn}
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.6 }}
          >
            {t("button")}
            <Image src={chevronRightIcon} alt="arrow" width={16} height={16} />
          </motion.button>
        </div>

        {/* 오른쪽 목업 이미지 */}
        <motion.div
          className={styles.mockupWrapper}
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.8 }}
        >
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
