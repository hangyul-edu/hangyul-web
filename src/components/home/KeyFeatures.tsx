import Image from "next/image";
import styles from "./KeyFeatures.module.css";
import { hangyulIcon } from "@/assets/icons";
import { IMAGES } from "@/constants/images";
import { useLocale, useTranslations } from "next-intl";

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

  return (
    <section id={id} className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Image src={hangyulIcon} alt="Hangyul Icon" width={28} height={28} />
          <h2 className={styles.title}>
            {t.rich("title", { br: () => <br /> })}
          </h2>
          <p className={styles.subtitle}>
            {t.rich("subtitle", { br: () => <br /> })}
          </p>
        </div>

        <div className={styles.featureList}>
          {featureKeys.map((key, index) => (
            <div
              key={key}
              className={`${styles.featureRow} ${index % 2 === 1 ? styles.reverse : ""}`}
            >
              <div className={styles.textGroup}>
                <span className={styles.category}>{t(`${key}.category`)}</span>
                <h3 className={styles.featureTitle}>
                  {t.rich(`${key}.title`, { br: () => <br /> })}
                </h3>
                <p className={styles.description}>
                  {t.rich(`${key}.description`, { br: () => <br /> })}
                </p>
              </div>
              <div className={styles.imageWrapper}>
                <Image
                  src={featureImages[index]}
                  alt={t(`${key}.category`)}
                  width={640}
                  height={480}
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
