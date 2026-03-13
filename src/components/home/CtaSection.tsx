import { bgWrapDesktopImg, bgWrapMobileImg } from "@/assets/images";
import styles from "./CtaSection.module.css";
import Image from "next/image";
import { chevronRightIcon } from "@/assets/icons";
import { useTranslations } from "next-intl";

export default function CtaSection() {
  const t = useTranslations("CtaSection");

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
      <div className={styles.content}>
        <h2 className={styles.title}>
          {t.rich("title", { br: () => <br /> })}
        </h2>
        <p className={styles.description}>
          {t.rich("description", { br: () => <br /> })}
        </p>

        <button className={styles.storeBtn}>
          {t("button")}
          <Image src={chevronRightIcon} alt="arrow" width={16} height={16} />
        </button>
      </div>
    </section>
  );
}
