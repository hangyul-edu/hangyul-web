/**
 * 무료 학습 자료(PDF) 레지스트리 — 순수 데이터
 *
 * 공개 링크: https://www.talkhangyul.com/download?resource=<edition slug>&lang=<UI 언어>
 *
 * 두 가지 언어 개념을 구분합니다.
 *  - 판(edition) 언어: PDF 자체가 쓰인 언어. 판마다 slug·PDF·미리보기가 따로 있습니다.
 *  - UI 언어(lang): 다운로드 페이지 화면 언어. 사이트 32개 로케일 어느 것이든 됩니다.
 *    UI 언어를 바꿔도 PDF 언어는 바뀌지 않으며, 같은 가족(family)에 그 언어의 판이
 *    실제로 있을 때만 언어 선택기가 그 판으로 전환합니다.
 *
 * 이 파일은 프록시(src/lib/downloadSmartLink.ts)에서도 import 하므로 이미지 등
 * 에셋을 import 하지 않습니다. 이미지는 src/content/downloadResourceAssets.ts에 있습니다.
 *
 * ─ 새 판 추가 (예: EP01 일본어판) ─────────────────────────────────────────
 *   1. PDF를 src/assets/downloads/ 에 넣습니다.
 *   2. 미리보기 이미지 생성:
 *        npx tsx scripts/generate-resource-previews.ts <PDF> <slug> <본문 페이지> <복습 페이지>
 *      (EP01: 3 21, EP02: 3 10 — 1장 본문 + A–D 네 문제가 다 보이는 챕터 복습,
 *       500단어 EP01: 4 65 — 1장 단어 본문 + 빠른 참고표·체크리스트)
 *   3. 아래 가족의 editions에 판을 추가하고, downloadResourceAssets.ts에 이미지를 등록합니다.
 *   4. messages/*.json 의 ResourceDownload.resources.<messagesKey> 에 판 문구를,
 *      (description, topics, coverAlt, previews, seoTitle, seoDescription,
 *       선택: youtubeCta, editionNotice — 판 언어 안내를 이 자료에 맞게 바꿀 때)
 *      (처음 쓰는 판 언어라면) ResourceDownload.editionLanguages.<언어> 에 판 이름을 추가합니다.
 *      제목·What's inside 등 형식 공통 문구는 ResourceDownload.formats.<formatMessagesKey> 에 있습니다.
 *      npm run validate:i18n 이 32개 로케일 누락을 잡아 줍니다.
 *   페이지·PDF 경로·언어 선택기·메타데이터·hreflang은 자동으로 생깁니다.
 * ─ 새 가족 추가 (예: EP03) ─ 위와 같고, DOWNLOAD_RESOURCE_FAMILIES에 가족을 추가합니다.
 *   같은 형식의 가이드라면 formatMessagesKey를 재사용해 공통 문구를 다시 번역하지 않습니다.
 *
 * pageCount는 실제 내려받는 PDF의 물리 페이지 수(pdfinfo의 Pages)입니다.
 * 본문에 인쇄된 쪽 번호(2–42)가 아니라 표지·뒷표지까지 포함한 값을 모든 판에 똑같이 씁니다.
 */

export type ResourceFeatureIcon =
  | "words"
  | "sentences"
  | "conversation"
  | "romanization"
  | "review";

export type ResourceEdition = {
  /** URL slug (?resource=<slug>). 소문자·숫자·하이픈만 사용합니다. */
  slug: string;
  /** PDF가 쓰인 언어 (사이트 로케일 코드, 예: "en") */
  language: string;
  /** messages/*.json 의 ResourceDownload.resources.<messagesKey> */
  messagesKey: string;
  /** src/assets/downloads/ 아래 원본 파일 이름 */
  file: string;
  /** 사용자가 받게 되는 파일 이름 */
  downloadFileName: string;
  pageCount: number;
};

export type ResourceFamily = {
  id: string;
  /**
   * messages/*.json 의 ResourceDownload.formats.<formatMessagesKey>
   * 같은 구성(형식)의 학습 가이드가 함께 쓰는 화면 문구(제목·What's inside 등).
   * 에피소드마다 다른 문구는 판의 messagesKey 쪽에 둡니다.
   */
  formatMessagesKey: string;
  /** 고유명사라 번역하지 않습니다. */
  series?: string;
  episode?: string;
  /**
   * YouTube 버튼 상태. 공유 컴포넌트에 하드코딩하지 않고 여기서만 정합니다.
   *  - available: 버튼이 영상(url)을 새 탭으로 엽니다.
   *  - comingSoon: 아직 연결된 영상이 없습니다. 버튼은 그대로 보이고, 누르면
   *    "곧 공개됩니다" 안내 모달(common.youtubeComingSoon)을 엽니다. 다른 영상으로 대신 연결하지 않습니다.
   * 버튼 문구는 판 문구에 youtubeCta가 있으면 그것(예: "Watch EP.01 on YouTube"),
   * 없으면 일반 문구(common.youtubeCta, "Watch on YouTube")를 씁니다.
   */
  youtube: { status: "available"; url: string } | { status: "comingSoon" };
  /**
   * 모든 판에 공통인 사실 (판마다 다른 페이지 수는 판에 둡니다).
   * itemCount는 가이드의 학습 단위 수(문장 100개, 단어 500개…)이고,
   * 그 단위의 이름은 형식 문구 formats.<formatMessagesKey>.statItems 에 있습니다.
   */
  itemCount?: number;
  chapterCount?: number;
  /**
   * "What's inside" 항목 (아이콘 + formats.<formatMessagesKey>.features.<icon>).
   * 형식 문구에 body가 없는 항목은 판 문구의 topics(에피소드마다 다른 주제)를 본문으로 씁니다.
   */
  features: ResourceFeatureIcon[];
  format: "PDF";
  /** 판 언어 → 판. 실제로 존재하는 PDF만 등록합니다. */
  editions: Record<string, ResourceEdition>;
};

export const DOWNLOAD_RESOURCE_FAMILIES = [
  {
    id: "ep01-study-guide",
    formatMessagesKey: "everydaySentences",
    series: "Korean While You Sleep",
    episode: "EP01",
    youtube: {
      status: "available",
      url: "https://www.youtube.com/watch?v=HGa7xurxL5c",
    },
    itemCount: 100,
    chapterCount: 10,
    features: ["sentences", "conversation", "romanization", "review"],
    format: "PDF",
    editions: {
      en: {
        slug: "ep01-en-study-guide",
        language: "en",
        messagesKey: "ep01EnStudyGuide",
        file: "EP01_EN_Study_Guide.pdf",
        downloadFileName:
          "Hangyul_EP01_100_Everyday_Korean_Sentences_Study_Guide_EN.pdf",
        // 실제 PDF 페이지 수 (표지·뒷표지 포함, pdfinfo 기준)
        pageCount: 43,
      },
    },
  },
  {
    id: "ep02-study-guide",
    formatMessagesKey: "everydaySentences",
    series: "Korean While You Sleep",
    episode: "EP02",
    youtube: { status: "available", url: "https://youtu.be/eMv0Tsq08SQ" },
    itemCount: 100,
    chapterCount: 10,
    features: ["sentences", "conversation", "romanization", "review"],
    format: "PDF",
    editions: {
      en: {
        slug: "ep02-en-study-guide",
        language: "en",
        messagesKey: "ep02EnStudyGuide",
        file: "EP02_EN_Study_Guide.pdf",
        downloadFileName:
          "Hangyul_EP02_100_Everyday_Korean_Sentences_Study_Guide_EN.pdf",
        pageCount: 43,
      },
    },
  },
  {
    id: "vocabulary-mastery-ep01",
    formatMessagesKey: "essentialWords",
    series: "Korean Vocabulary Mastery",
    episode: "EP01",
    youtube: {
      status: "available",
      url: "https://www.youtube.com/watch?v=zl2JdibNnR4",
    },
    // 001–500, 20개 챕터 × 25단어 (PDF 목차·빠른 참고표 기준)
    itemCount: 500,
    chapterCount: 20,
    features: ["words", "sentences", "romanization", "review"],
    format: "PDF",
    editions: {
      en: {
        slug: "ep01-en-500-essential-korean-words-study-guide",
        language: "en",
        messagesKey: "ep01En500EssentialWords",
        file: "EP01_EN_500_Essential_Korean_Words_Study_Guide.pdf",
        downloadFileName:
          "Hangyul_EP01_500_Essential_Korean_Words_Study_Guide_EN.pdf",
        // 실제 PDF 페이지 수 (표지·뒷표지 포함, pdfinfo 기준)
        pageCount: 75,
      },
    },
  },
] as const satisfies readonly ResourceFamily[];

type Families = (typeof DOWNLOAD_RESOURCE_FAMILIES)[number];
export type DownloadResourceSlug =
  Families["editions"][keyof Families["editions"]]["slug"];

export type ResolvedResource = {
  family: ResourceFamily;
  edition: ResourceEdition;
};

const BY_SLUG = new Map<string, ResolvedResource>();
for (const family of DOWNLOAD_RESOURCE_FAMILIES as readonly ResourceFamily[]) {
  for (const edition of Object.values(family.editions)) {
    if (BY_SLUG.has(edition.slug)) {
      throw new Error(`Duplicate download resource slug: ${edition.slug}`);
    }
    BY_SLUG.set(edition.slug, { family, edition });
  }
}

export const DOWNLOAD_RESOURCE_SLUGS = [...BY_SLUG.keys()] as DownloadResourceSlug[];

/** 등록된 판만 돌려줍니다. */
export function getDownloadResource(
  slug: string | null | undefined
): ResolvedResource | null {
  return (slug && BY_SLUG.get(slug)) || null;
}

/** 같은 가족 안에서 해당 언어로 쓰인 판 (없으면 null — 판을 지어내지 않습니다) */
export function getSiblingEdition(
  family: ResourceFamily,
  language: string
): ResourceEdition | null {
  return Object.hasOwn(family.editions, language)
    ? family.editions[language]
    : null;
}
