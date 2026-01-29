import Image from "next/image";
import styles from "./KeyFeatures.module.css";

interface Props {
  id: string;
}

const FEATURES = [
  {
    category: "한국어 회화 강의 및 말해보기",
    title: "듣는 것에서 끝나지 마세요\n지금 바로 말해보세요!",
    description:
      "다양한 레벨의 회화 강의를 시청하며\n실시간으로 따라 말하기 연습을 할 수 있습니다.\n\nAI 기반 음성 분석으로 발음을 즉시 교정받고,\n궁금한 점은 생성형 AI에게 바로 질문하세요.",
    imgSrc: "/feature-speaking.png",
    imgAlt: "AI 회화 연습 화면",
    isReverse: false,
  },
  {
    category: "맞춤형 문장 추천",
    title: "복습은 저장한 문장으로\n성장은 맞춤형 문장으로\n",
    description:
      "학습자의 실력과 목표에 맞는 문장을 AI가 추천하고,\n일별 목표에 따라 진도를 관리합니다.\n\n마음에 드는 문장은 저장하여 복습하고,\n틀린 문장은 개인 학습 노트로 만들어보세요.",
    imgSrc: "/feature-matching.png",
    imgAlt: "맞춤형 문장 추천 화면",
    isReverse: true,
  },
  {
    category: "랭킹 시스템",
    title: "혼자가 아닌 경쟁!\n한국어 학습이 더 재밌어요",
    description:
      "다른 학습자들과의 랭킹 경쟁을 통해 학습 동기를 높이고,\n친구들과 비교하며 더욱 재미있게 한국어를 배울 수 있습니다.\n소셜 학습으로 지속적인 참여를 유도합니다.",
    imgSrc: "/feature-ranking.png",
    imgAlt: "랭킹 시스템 화면",
    isReverse: false,
  },
];

export default function KeyFeatures({ id }: Props) {
  return (
    <section id={id} className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Image
            src="/hangyul-icon.svg"
            alt="Hangyul Icon"
            width={28}
            height={28}
            // style={{ width: "100%", height: "auto" }}
          />
          <h2 className={styles.title}>주요 기능</h2>
          <p className={styles.subtitle}>
            한귤만의 특별한 기능으로 <br className={styles.mobileBr} />
            효과적인 한국어 학습을 경험하세요
          </p>
        </div>

        <div className={styles.featureList}>
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className={`${styles.featureRow} ${feature.isReverse ? styles.reverse : ""}`}
            >
              <div className={styles.textGroup}>
                <span className={styles.category}>{feature.category}</span>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.description}>{feature.description}</p>
              </div>
              <div className={styles.imageWrapper}>
                <Image
                  src={feature.imgSrc}
                  alt={feature.imgAlt}
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
