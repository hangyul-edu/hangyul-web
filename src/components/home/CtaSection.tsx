"use client";

import { bgWrapDesktopImg, bgWrapMobileImg } from "@/assets/images";
import styles from "./CtaSection.module.css";
import Image from "next/image";
import { chevronRightIcon } from "@/assets/icons";
import { useLocale, useTranslations } from "next-intl";
import StoreButton from "@/components/common/StoreButton";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/constants/animations";
import { useAnimateInView } from "@/hooks/useAnimateInView";

export default function CtaSection() {
  const t = useTranslations("CtaSection");
  const locale = useLocale();
  const { ref: contentRef, isInView: contentInView } = useAnimateInView();

  return (
    <section className={styles.container}>
      <div className={styles.bgDesktop}>
        <Image
          src={bgWrapDesktopImg}
          alt="Background Pattern Desktop"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      <div className={styles.bgMobile}>
        <Image
          src={bgWrapMobileImg}
          alt="Background Pattern Mobile"
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
      </div>

      <motion.div
        key={locale}
        ref={contentRef}
        className={styles.content}
        variants={staggerContainer}
        initial="hidden"
        animate={contentInView ? "visible" : "hidden"}
      >
        <motion.h2 className={styles.title} variants={staggerItem}>
          {t("title")}
        </motion.h2>
        <motion.p className={styles.description} variants={staggerItem}>
          {t("description")}
        </motion.p>
        <motion.div variants={staggerItem}>
          <StoreButton className={styles.storeBtn}>
            {t("button")}
            <Image src={chevronRightIcon} alt="arrow" width={16} height={16} />
          </StoreButton>
        </motion.div>
      </motion.div>
    </section>
  );
}
