import styles from "./CtaSection.module.css";
import Image from "next/image";

export default function CtaSection() {
  return (
    <section className={styles.container}>
      <div className={styles.bgDesktop}>
        <Image
          src="/bg-wrap-desktop.svg"
          alt="Background Pattern Desktop"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      <div className={styles.bgMobile}>
        <Image
          src="/bg-wrap-mobile.svg"
          alt="Background Pattern Mobile"
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
      </div>
      <div className={styles.content}>
        <h2 className={styles.title}>
          지금 바로 <br className={styles.mobileBr} />
          한국어 스피킹 실력을
          <br className={styles.desktopBr} />
          향상시켜보세요!
        </h2>
        <p className={styles.description}>
          전 세계 한국어 학습자들과 함께 <br className={styles.mobileBr} />
          스피킹 중심의 새로운 학습 경험을 시작하세요.
          <br /> 무료로 시작할 수 있습니다.
        </p>

        <div className={styles.buttonGroup}>
          <button className={styles.storeBtn}>
            <Image src="/apple-logo.svg" alt="Apple" width={16} height={19} />
            App Store
          </button>
          <button className={styles.storeBtn}>
            <Image
              src="/google-play.svg"
              alt="Google Play"
              width={16}
              height={17}
            />
            Google Play
          </button>
        </div>
      </div>
    </section>
  );
}
