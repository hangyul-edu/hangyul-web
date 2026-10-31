import type { StaticImageData } from "next/image";

import ep01EnCover from "@/assets/images/resources/ep01-en-study-guide/cover.webp";
import ep01EnPage3 from "@/assets/images/resources/ep01-en-study-guide/page-3.webp";
import ep01EnPage5 from "@/assets/images/resources/ep01-en-study-guide/page-5.webp";
import ep01EnOg from "@/assets/images/resources/ep01-en-study-guide/og.jpg";

/**
 * 무료 학습 자료(PDF) 레지스트리
 *
 * 공개 링크: https://www.talkhangyul.com/download?resource=<slug>
 *
 * 새 자료(EP02, 다른 언어판, 워크시트 등)를 추가하는 방법:
 *   1. PDF를 src/assets/downloads/ 에 넣습니다.
 *   2. 미리보기 이미지를 생성합니다.
 *        npx tsx scripts/generate-resource-previews.ts <PDF 파일명> <slug> [미리보기 페이지...]
 *   3. 아래 DOWNLOAD_RESOURCES에 항목을 하나 추가합니다. (문구는 실제 PDF 내용만 사용)
 *   페이지·PDF 다운로드 경로·메타데이터·테스트 대상 목록은 자동으로 생깁니다.
 */

export type DownloadResourceFeature = {
  title: string;
  description: string;
  /** 아이콘 종류 (src/components/download/FeatureIcon.tsx) */
  icon: "sentences" | "conversation" | "romanization" | "review";
};

export type DownloadResourcePreview = {
  image: StaticImageData;
  alt: string;
};

export type DownloadResource = {
  /** URL slug (?resource=<slug>). 소문자·숫자·하이픈만 사용합니다. */
  slug: string;
  /** 페이지 html lang 및 UI 문구 언어 (BCP 47, 예: "en") */
  language: string;

  /** 시리즈명 (예: Korean While You Sleep) */
  series?: string;
  /** 회차 (예: EP01) */
  episode?: string;
  /** 판 (예: English Edition) */
  edition?: string;

  /** 제목 위 작은 라벨 (예: Free Study Guide) */
  eyebrow: string;
  title: string;
  description: string;

  /** src/assets/downloads/ 아래의 원본 파일 이름 */
  file: string;
  /** 사용자가 받게 되는 파일 이름 */
  downloadFileName: string;
  format: "PDF";
  pageCount?: number;

  /** 히어로 옆 요약 수치 (예: 100 sentences) */
  stats?: { value: string; label: string }[];
  features: DownloadResourceFeature[];

  cover: StaticImageData;
  coverAlt: string;
  /** "Look inside" 썸네일 (최대 2장 권장) */
  previews?: DownloadResourcePreview[];

  youtube?: { url: string; label: string };

  seo: {
    title: string;
    description: string;
    /** 1200×630 공유 이미지. 없으면 표지를 사용합니다. */
    ogImage?: StaticImageData;
  };

  /** 공개일 (YYYY-MM-DD). 구조화 데이터 등에 사용합니다. */
  publishedAt?: string;
};

/**
 * slug → 자료. 키와 slug 값은 반드시 같아야 합니다.
 * "unknown"은 형식이 잘못된 링크용으로 예약된 값이라 쓰지 않습니다.
 */
export const DOWNLOAD_RESOURCES = {
  "ep01-en-study-guide": {
    slug: "ep01-en-study-guide",
    language: "en",
    series: "Korean While You Sleep",
    episode: "EP01",
    edition: "English Edition",

    eyebrow: "Free Study Guide",
    title: "100 Everyday Korean Sentences",
    description:
      "Practice all 100 sentences from EP.01 with Korean, romanization, natural English meanings, real-life examples, chapter reviews, and a learning checklist.",

    file: "EP01_EN_Study_Guide.pdf",
    downloadFileName:
      "Hangyul_EP01_100_Everyday_Korean_Sentences_Study_Guide_EN.pdf",
    format: "PDF",
    pageCount: 40,

    stats: [
      { value: "100", label: "sentences" },
      { value: "10", label: "topic chapters" },
      { value: "40", label: "pages" },
    ],

    features: [
      {
        icon: "sentences",
        title: "100 everyday sentences",
        description:
          "Useful Korean from greetings and meeting people to food, shopping, plans and natural reactions.",
      },
      {
        icon: "conversation",
        title: "Real-life context",
        description:
          "Every sentence comes with a short conversation that shows how it's actually used.",
      },
      {
        icon: "romanization",
        title: "Meaning + romanization",
        description:
          "Follow the Korean with beginner-friendly romanization, a natural English meaning and a short usage note.",
      },
      {
        icon: "review",
        title: "Review and practice",
        description:
          "Chapter reviews with answers, a quick review of all 100 sentences and a final learning checklist.",
      },
    ],

    cover: ep01EnCover,
    coverAlt:
      "Cover of the Hangyul study guide “100 Everyday Korean Sentences” (일상 한국어 100문장), Korean While You Sleep EP01, English edition",
    previews: [
      {
        image: ep01EnPage3,
        alt: "Sample page from Chapter 1, Greetings and Essential Responses: each sentence shows Korean, romanization, the English meaning, a usage note and a short conversation",
      },
      {
        image: ep01EnPage5,
        alt: "Sample chapter review page with four exercises: what does it mean, how do you say it in Korean, complete the conversation, and what would you say",
      },
    ],

    youtube: {
      url: "https://www.youtube.com/watch?v=HGa7xurxL5c",
      label: "Watch EP.01 on YouTube",
    },

    seo: {
      title: "100 Everyday Korean Sentences — Free Study Guide | Hangyul",
      description:
        "Download the free Hangyul EP01 study guide with 100 everyday Korean sentences, romanization, English meanings, conversations, reviews, and practice.",
      ogImage: ep01EnOg,
    },
  },
} satisfies Record<string, DownloadResource>;

export type DownloadResourceSlug = keyof typeof DOWNLOAD_RESOURCES;

export const DOWNLOAD_RESOURCE_SLUGS = Object.keys(
  DOWNLOAD_RESOURCES
) as DownloadResourceSlug[];

/** 등록된 자료만 돌려줍니다. ("constructor" 같은 프로토타입 키는 무시) */
export function getDownloadResource(
  slug: string | null | undefined
): DownloadResource | null {
  if (!slug || !Object.hasOwn(DOWNLOAD_RESOURCES, slug)) return null;
  return DOWNLOAD_RESOURCES[slug as DownloadResourceSlug];
}

/**
 * 페이지 공통 UI 문구 (자료 언어별).
 * 사이트 전체 번역(messages/*.json)과 분리해 두어, 자료가 추가되어도
 * 32개 로케일 번역 파일을 건드리지 않습니다. 없는 언어는 영어로 표시합니다.
 */
const RESOURCE_UI_COPY = {
  en: {
    downloadCta: "Download Free PDF",
    noSignUp: "No sign-up required",
    pagesUnit: "pages",
    whatsInside: "What’s inside",
    whatsInsideIntro: "Everything you need to review the episode at your own pace.",
    lookInside: "A look inside",
    closingTitle: "Keep the 100 sentences with you",
    closingBody: "Free to download. Print it or study on your phone.",
    homeLink: "Hangyul home",
    notFoundTitle: "We couldn’t find this resource",
    notFoundBody:
      "The link may be mistyped, or this resource is no longer available.",
    notFoundCta: "Go to Hangyul",
    notFoundSecondary: "Visit our YouTube channel",
  },
} as const;

export type ResourceUiCopy = (typeof RESOURCE_UI_COPY)["en"];

export function getResourceUiCopy(language: string | undefined): ResourceUiCopy {
  return language && Object.hasOwn(RESOURCE_UI_COPY, language)
    ? RESOURCE_UI_COPY[language as keyof typeof RESOURCE_UI_COPY]
    : RESOURCE_UI_COPY.en;
}
