import Image from "next/image";
import styles from "./Pricing.module.css";
import { useLocale, useTranslations } from "next-intl";
import { IMAGES } from "@/constants/images";

interface Props {
  id: string;
}

export default function Pricing({ id }: Props) {
  const t = useTranslations("Pricing");
  const locale = useLocale() as "en" | "ko";

  const priceImg = IMAGES[locale].pricing;

  return (
    <section id={id} className={styles.container}>
      <div className={styles.content}>
        <div className={styles.featureList}>
          <div className={styles.featureRow}>
            <div className={styles.imageWrapper}>
              <Image
                src={priceImg}
                alt=""
                width={640}
                height={480}
                style={{ width: "100%", height: "auto" }}
              />
            </div>

            <div className={styles.textGroup}>
              <span className={styles.category}>{t("category")}</span>
              <h3 className={styles.featureTitle}>
                {t.rich("title", { br: () => <br /> })}
              </h3>
              <p className={styles.description}>
                {t.rich("description", { br: () => <br /> })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
