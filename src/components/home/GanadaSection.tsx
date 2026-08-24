"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

import styles from "./GanadaSection.module.css";
import { chevronRightIcon } from "@/assets/icons";
import { ganadaMockupDesktopImg, ganadaMockupMobileImg } from "@/assets/images";
import StoreButton from "@/components/common/StoreButton";
import {
  fadeInLeftVariants,
  fadeInRightVariants,
} from "@/constants/animations";
import { useAnimateInView } from "@/hooks/useAnimateInView";

export default function GanadaSection() {
  const t = useTranslations("GanadaSection");
  const tAlt = useTranslations("Alt");

  const { ref: textRef, isInView: textInView } = useAnimateInView();
  const { ref: imageRef, isInView: imageInView } = useAnimateInView();

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <motion.div
          ref={textRef}
          className={styles.textGroup}
          variants={fadeInLeftVariants}
          initial="hidden"
          animate={textInView ? "visible" : "hidden"}
        >
          <div className={styles.headingGroup}>
            <span className={styles.category}>{t("category")}</span>
            <h2 className={styles.title}>
              {t.rich("title", {
                highlight: (chunks) => (
                  <span className={styles.highlight}>{chunks}</span>
                ),
              })}
            </h2>
          </div>

          <p className={styles.description}>{t("description")}</p>

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
        </motion.div>

        <motion.div
          ref={imageRef}
          className={styles.mockup}
          variants={fadeInRightVariants}
          initial="hidden"
          animate={imageInView ? "visible" : "hidden"}
        >
          <Image
            src={ganadaMockupDesktopImg}
            alt={tAlt("ganadaPreview")}
            sizes="(max-width: 768px) 1px, 545px"
            className={styles.mockupDesktop}
          />
          <Image
            src={ganadaMockupMobileImg}
            alt={tAlt("ganadaPreview")}
            sizes="(max-width: 768px) 100vw, 1px"
            className={styles.mockupMobile}
          />
        </motion.div>
      </div>
    </section>
  );
}
