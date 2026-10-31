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
 *        npx tsx scripts/generate-resource-previews.ts <PDF> <slug> 3 5
 *   3. 아래 가족의 editions에 판을 추가하고, downloadResourceAssets.ts에 이미지를 등록합니다.
 *   4. messages/*.json 의 ResourceDownload.resources.<messagesKey> 에 판 문구를,
 *      (처음 쓰는 판 언어라면) ResourceDownload.editionLanguages.<언어> 에 판 이름을 추가합니다.
 *      npm run validate:i18n 이 32개 로케일 누락을 잡아 줍니다.
 *   페이지·PDF 경로·언어 선택기·메타데이터·hreflang은 자동으로 생깁니다.
 * ─ 새 가족 추가 (예: EP02) ─ 위와 같고, DOWNLOAD_RESOURCE_FAMILIES에 가족을 추가합니다.
 */

export type ResourceFeatureIcon =
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
  /** 고유명사라 번역하지 않습니다. */
  series?: string;
  episode?: string;
  youtubeUrl?: string;
  /** 모든 판에 공통인 사실 (판마다 다른 페이지 수는 판에 둡니다) */
  sentenceCount?: number;
  chapterCount?: number;
  /** "What's inside" 항목 (아이콘 + messages의 features.<icon>) */
  features: ResourceFeatureIcon[];
  format: "PDF";
  /** 판 언어 → 판. 실제로 존재하는 PDF만 등록합니다. */
  editions: Record<string, ResourceEdition>;
};

export const DOWNLOAD_RESOURCE_FAMILIES = [
  {
    id: "ep01-study-guide",
    series: "Korean While You Sleep",
    episode: "EP01",
    youtubeUrl: "https://www.youtube.com/watch?v=HGa7xurxL5c",
    sentenceCount: 100,
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
        pageCount: 40,
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
