"use client";

import Image from "next/image";
import styles from "./KeyFeatures.module.css";
import { hangyulIcon } from "@/assets/icons";
import { IMAGES } from "@/constants/images";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  fadeInUpVariants,
  fadeInLeftVariants,
  fadeInRightVariants,
} from "@/constants/animations";
import { useAnimateInView } from "@/hooks/useAnimateInView";

interface Props {
  id: string;
}

export default function KeyFeatures({ id }: Props) {
  const t = useTranslations("KeyFeatures");
  const locale = useLocale() as "en" | "ko";

  const feature1Img = IMAGES[locale].feature1;
  const feature2Img = IMAGES[locale].feature2;
  const feature3Img = IMAGES[locale].feature3;

  const featureImages = [feature1Img, feature2Img, feature3Img];
  const featureKeys = ["feature1", "feature2", "feature3"];

  const { ref: headerRef, isInView: headerInView } = useAnimateInView();
  const { ref: r0tRef, isInView: r0tInView } = useAnimateInView();
  const { ref: r0iRef, isInView: r0iInView } = useAnimateInView();
  const { ref: r1tRef, isInView: r1tInView } = useAnimateInView();
  const { ref: r1iRef, isInView: r1iInView } = useAnimateInView();
  const { ref: r2tRef, isInView: r2tInView } = useAnimateInView();
  const { ref: r2iRef, isInView: r2iInView } = useAnimateInView();

  const rowAnims = [
    {
      textRef: r0tRef,
      textInView: r0tInView,
      imageRef: r0iRef,
      imageInView: r0iInView,
    },
    {
      textRef: r1tRef,
      textInView: r1tInView,
      imageRef: r1iRef,
      imageInView: r1iInView,
    },
    {
      textRef: r2tRef,
      textInView: r2tInView,
      imageRef: r2iRef,
      imageInView: r2iInView,
    },
  ];

  return (
    <section id={id} className={styles.container}>
      <div className={styles.content}>
        <motion.div
          ref={headerRef}
          className={styles.header}
          variants={fadeInUpVariants}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
        >
          <Image src={hangyulIcon} alt="Hangyul Icon" width={28} height={28} />
          <h2 className={styles.title}>{t("title")}</h2>
          <p className={styles.subtitle}>
            {t.rich("subtitle", {
              mobileBr: () => <br className={styles.mobileBr} />,
            })}
          </p>
        </motion.div>

        <div className={styles.featureList}>
          {featureKeys.map((key, index) => {
            const isReverse = index % 2 === 1;
            const { textRef, textInView, imageRef, imageInView } =
              rowAnims[index];
            const textVariants = isReverse
              ? fadeInRightVariants
              : fadeInLeftVariants;
            const imageVariants = isReverse
              ? fadeInLeftVariants
              : fadeInRightVariants;

            return (
              <div
                key={key}
                className={`${styles.featureRow} ${isReverse ? styles.reverse : ""}`}
              >
                <motion.div
                  ref={textRef}
                  className={styles.textGroup}
                  variants={textVariants}
                  initial="hidden"
                  animate={textInView ? "visible" : "hidden"}
                >
                  <span className={styles.category}>
                    {t(`${key}.category`)}
                  </span>
                  <h3 className={styles.featureTitle}>{t(`${key}.title`)}</h3>
                  <p className={styles.description}>
                    {t.rich(`${key}.description`, {
                      mobileBr: () => <br className={styles.mobileBr} />,
                    })}
                  </p>
                </motion.div>
                <motion.div
                  ref={imageRef}
                  className={styles.imageWrapper}
                  variants={imageVariants}
                  initial="hidden"
                  animate={imageInView ? "visible" : "hidden"}
                >
                  <Image
                    src={featureImages[index]}
                    alt={t(`${key}.category`)}
                    width={640}
                    height={480}
                    style={{ width: "100%", height: "auto" }}
                  />
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
