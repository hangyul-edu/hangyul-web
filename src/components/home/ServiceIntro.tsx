"use client";

import Image from "next/image";
import styles from "./ServiceIntro.module.css";
import { useLocale, useTranslations } from "next-intl";
import { springIcon } from "@/assets/icons";
import { ICONS } from "@/constants/icons";
import { motion } from "framer-motion";
import { fadeInUpVariants, staggerContainer, staggerItem } from "@/constants/animations";
import { useAnimateInView } from "@/hooks/useAnimateInView";

interface Props {
  id: string;
}

const FEATURE_CONFIG = {
  feature1: { icon: ICONS.eraser, decoClass: "eraser" },
  feature2: { icon: ICONS.pencil, decoClass: "pencil" },
  feature3: { icon: ICONS.paper, decoClass: "paper" },
  feature4: { icon: ICONS.note, decoClass: "note" },
} as const;

type FeatureKey = keyof typeof FEATURE_CONFIG;

export default function ServiceIntro({ id }: Props) {
  const t = useTranslations("ServiceIntro");
  const locale = useLocale();
  const featureKeys = Object.keys(FEATURE_CONFIG) as FeatureKey[];

  const { ref: headerRef, isInView: headerInView } = useAnimateInView();
  const { ref: gridRef, isInView: gridInView } = useAnimateInView();

  return (
    <section id={id} className={styles.container}>
      <div key={locale} className={styles.content}>
        <motion.div
          ref={headerRef}
          className={styles.header}
          variants={fadeInUpVariants}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
        >
          <h2 className={styles.title}>{t("title")}</h2>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </motion.div>

        <motion.div
          ref={gridRef}
          className={styles.grid}
          variants={staggerContainer}
          initial="hidden"
          animate={gridInView ? "visible" : "hidden"}
        >
          {featureKeys.map((key) => {
            const { icon, decoClass } = FEATURE_CONFIG[key];

            return (
              <motion.div key={key} className={styles.cardWrapper} variants={staggerItem}>
                <div className={styles.card}>
                  <div className={styles.ringPosition}>
                    <Image src={springIcon} alt="spring" width={10} height={161} />
                  </div>
                  <h3 className={styles.cardTitle}>{t(`${key}.title`)}</h3>
                  <p className={styles.cardDesc}>{t(`${key}.description`)}</p>
                </div>
                <div className={`${styles.deco} ${styles[decoClass]}`}>
                  <Image src={icon.src} alt="" width={icon.width} height={icon.height} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
