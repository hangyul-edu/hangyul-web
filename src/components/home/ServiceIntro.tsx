import Image from "next/image";
import styles from "./ServiceIntro.module.css";

interface Props {
  id: string;
}

const FEATURES = [
  {
    title: "전 세계 1,000만 학습자",
    desc: "한국어에 대한 전 세계 관심\n증가에 발맞춘 글로벌 플랫폼",
    decoImg: "/eraser.svg",
    decoAlt: "지우개",
    decoClass: "eraser",
    decoWidth: 48,
    decoHeight: 50,
  },
  {
    title: "스피킹 중심 학습",
    desc: "실제 회화 능력 향상에 집중한\n실용적인 학습 방식",
    decoImg: "/pencil.svg",
    decoAlt: "연필",
    decoClass: "pencil",
    decoWidth: 46,
    decoHeight: 51,
  },
  {
    title: "AI 기반 발음 교정",
    desc: "실시간 음성 분석으로\n정확한 발음 피드백 제공",
    decoImg: "/paper.svg",
    decoAlt: "종이",
    decoClass: "paper",
    decoWidth: 48,
    decoHeight: 62,
  },
  {
    title: "K-콘텐츠 연계",
    desc: "드라마, 영화 등\n한국 문화 콘텐츠와 연결된 학습 경험",
    decoImg: "/note.svg",
    decoAlt: "노트",
    decoClass: "note",
    decoWidth: 45,
    decoHeight: 48,
  },
];

export default function ServiceIntro({ id }: Props) {
  return (
    <section id={id} className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>왜 한귤인가요?</h2>
          <p className={styles.subtitle}>
            기존 한국어 교육의 한계를 뛰어넘어 스피킹 중심의 혁신적인 학습
            경험을 제공합니다
          </p>
        </div>

        <div className={styles.grid}>
          {FEATURES.map((feature, index) => (
            <div key={index} className={styles.cardWrapper}>
              <div className={styles.card}>
                <div className={styles.ringPosition}>
                  <Image
                    src="/spring.svg"
                    alt="spring"
                    width={10}
                    height={161}
                  />
                </div>
                <h3 className={styles.cardTitle}>{feature.title}</h3>
                <p className={styles.cardDesc}>{feature.desc}</p>
              </div>

              <div className={`${styles.deco} ${styles[feature.decoClass]}`}>
                <Image
                  src={feature.decoImg}
                  alt={feature.decoAlt}
                  width={feature.decoWidth}
                  height={feature.decoHeight}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
