import Image from "next/image";
import styles from "./ServiceIntro.module.css";
import { useTranslations } from "next-intl";
import { springIcon } from "@/assets/icons";
import { ICONS } from "@/constants/icons";

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
  const featureKeys = Object.keys(FEATURE_CONFIG) as FeatureKey[];

  return (
    <section id={id} className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {t.rich("title", { br: () => <br /> })}
          </h2>
          <p className={styles.subtitle}>
            {t.rich("subtitle", { br: () => <br /> })}
          </p>
        </div>

        <div className={styles.grid}>
          {featureKeys.map((key) => {
            const { icon, decoClass } = FEATURE_CONFIG[key];

            return (
              <div key={key} className={styles.cardWrapper}>
                <div className={styles.card}>
                  <div className={styles.ringPosition}>
                    <Image
                      src={springIcon}
                      alt="spring"
                      width={10}
                      height={161}
                    />
                  </div>
                  <h3 className={styles.cardTitle}>
                    {t.rich(`${key}.title`, { br: () => <br /> })}
                  </h3>
                  <p className={styles.cardDesc}>
                    {t.rich(`${key}.description`, { br: () => <br /> })}
                  </p>
                </div>

                <div className={`${styles.deco} ${styles[decoClass]}`}>
                  <Image
                    src={icon.src}
                    alt=""
                    width={icon.width}
                    height={icon.height}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
