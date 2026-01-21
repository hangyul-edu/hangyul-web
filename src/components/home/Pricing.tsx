import Image from "next/image";
import styles from "./Pricing.module.css";

interface Props {
  id: string;
}

export default function Pricing({ id }: Props) {
  return (
    <section id={id} className={styles.container}>
      <div className={styles.content}>
        <div className={styles.featureList}>
          <div className={styles.featureRow}>
            <Image src="/prcing.png" alt="구독 관리" width={640} height={480} />
            <div className={styles.textGroup}>
              <span className={styles.category}>구독 관리</span>
              <h3 className={styles.featureTitle}>
                학습은 꾸준히,
                <br />
                구독은 간편하게
              </h3>
              <p className={styles.description}>
                프리미엄 멤버십으로 더 많은 기능을 이용하세요.
                <br />
                구독 플랜을 쉽게 선택하고 관리할 수 있으며,
                <br />
                언제든지 변경이 가능합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
