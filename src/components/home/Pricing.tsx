"use client";

import Image from "next/image";
import styles from "./Pricing.module.css";
import { useLocale, useTranslations } from "next-intl";
import { IMAGES } from "@/constants/images";
import { motion } from "framer-motion";
import {
  fadeInLeftVariants,
  fadeInRightVariants,
} from "@/constants/animations";
import { useAnimateInView } from "@/hooks/useAnimateInView";

interface Props {
  id: string;
}

export default function Pricing({ id }: Props) {
  const t = useTranslations("Pricing");
  const locale = useLocale() as "en" | "ko";
  const priceImg = IMAGES[locale].pricing;

  const { ref: imageRef, isInView: imageInView } = useAnimateInView();
  const { ref: textRef, isInView: textInView } = useAnimateInView();

  return (
    <section id={id} className={styles.container}>
      <div key={locale} className={styles.content}>
        <div className={styles.featureList}>
          <div className={styles.featureRow}>
            <motion.div
              ref={imageRef}
              className={styles.imageWrapper}
              variants={fadeInLeftVariants}
              initial="hidden"
              animate={imageInView ? "visible" : "hidden"}
            >
              <Image
                src={priceImg}
                alt=""
                width={640}
                height={480}
                style={{ width: "100%", height: "auto" }}
              />
            </motion.div>

            <motion.div
              ref={textRef}
              className={styles.textGroup}
              variants={fadeInRightVariants}
              initial="hidden"
              animate={textInView ? "visible" : "hidden"}
            >
              <span className={styles.category}>{t("category")}</span>
              <h3 className={styles.featureTitle}>{t("title")}</h3>
              <p className={styles.description}>
                {t.rich("description", {
                  mobileBr: () => <br className={styles.mobileBr} />,
                })}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
