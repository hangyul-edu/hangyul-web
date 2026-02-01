import Image from "next/image";
import styles from "./MainSection.module.css";

export default function MainSection() {
  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <div className={styles.leftSection}>
          <div className={styles.textGroup}>
            <div className={styles.sloganDesktop}>
              <Image
                src="/icons/slogan-desktop.svg"
                alt="HanGyul Slogan Desktop"
                width={594}
                height={240}
                priority
                style={{ width: "100%", height: "auto" }}
              />
            </div>

            <div className={styles.sloganMobile}>
              <Image
                src="/icons/slogan-mobile.svg"
                alt="HanGyul Slogan Mobile"
                width={262}
                height={105}
                priority
                style={{ width: "100%", height: "auto" }}
              />
            </div>

            <p className={styles.description}>
              스피킹 중심의 한국어 학습 플랫폼으로
              <br />전 세계 1,000만 한국어 학습자와 함께하세요
            </p>
          </div>

          <div className={styles.buttonGroup}>
            <button className={styles.storeBtn}>
              <Image
                src="/icons/apple-logo.svg"
                alt="Apple"
                width={16}
                height={19}
              />
              App Store
            </button>
            <button className={styles.storeBtn}>
              <Image
                src="/icons/google-play.svg"
                alt="Google Play"
                width={16}
                height={17}
              />
              Google Play
            </button>
          </div>
        </div>

        <div className={styles.mockupWrapper}>
          <Image
            src="/images/mockup.png"
            alt="Mockup"
            width={522}
            height={628}
            priority
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      </div>
    </section>
  );
}
