import type { StaticImageData } from "next/image";

import type { DownloadResourceSlug } from "./downloadResources";

import ep01EnCover from "@/assets/images/resources/ep01-en-study-guide/cover.webp";
import ep01EnPage3 from "@/assets/images/resources/ep01-en-study-guide/page-3.webp";
import ep01EnPage21 from "@/assets/images/resources/ep01-en-study-guide/page-21.webp";
import ep01EnOg from "@/assets/images/resources/ep01-en-study-guide/og.jpg";
import ep02EnCover from "@/assets/images/resources/ep02-en-study-guide/cover.webp";
import ep02EnPage3 from "@/assets/images/resources/ep02-en-study-guide/page-3.webp";
import ep02EnPage10 from "@/assets/images/resources/ep02-en-study-guide/page-10.webp";
import ep02EnOg from "@/assets/images/resources/ep02-en-study-guide/og.jpg";
import words500EnCover from "@/assets/images/resources/ep01-en-500-essential-korean-words-study-guide/cover.webp";
import words500EnPage4 from "@/assets/images/resources/ep01-en-500-essential-korean-words-study-guide/page-4.webp";
import words500EnPage65 from "@/assets/images/resources/ep01-en-500-essential-korean-words-study-guide/page-65.webp";
import words500EnOg from "@/assets/images/resources/ep01-en-500-essential-korean-words-study-guide/og.jpg";
import ep03EnCover from "@/assets/images/resources/ep03-en-study-guide/cover.webp";
import ep03EnPage3 from "@/assets/images/resources/ep03-en-study-guide/page-3.webp";
import ep03EnPage14 from "@/assets/images/resources/ep03-en-study-guide/page-14.webp";
import ep03EnOg from "@/assets/images/resources/ep03-en-study-guide/og.jpg";
import words1000EnCover from "@/assets/images/resources/ep02-en-1000-korean-words-study-guide/cover.webp";
import words1000EnPage4 from "@/assets/images/resources/ep02-en-1000-korean-words-study-guide/page-4.webp";
import words1000EnPage12 from "@/assets/images/resources/ep02-en-1000-korean-words-study-guide/page-12.webp";
import words1000EnOg from "@/assets/images/resources/ep02-en-1000-korean-words-study-guide/og.jpg";

/**
 * 판(edition)별 이미지. scripts/generate-resource-previews.ts 로 실제 PDF에서 만듭니다.
 * 키 타입이 등록된 slug 전체이므로, 판을 추가하고 여기를 빠뜨리면 타입 오류가 납니다.
 *
 * 미리보기 alt 문구는 messages의 ResourceDownload.resources.<messagesKey>.previews.<altKey>
 */
export type ResourceEditionAssets = {
  cover: StaticImageData;
  /** "A look inside" 썸네일 (최대 2장) */
  previews: {
    image: StaticImageData;
    altKey: "chapter" | "review" | "checklist";
  }[];
  /** 1200×630 공유 이미지 */
  ogImage: StaticImageData;
};

export const DOWNLOAD_RESOURCE_ASSETS: Record<
  DownloadResourceSlug,
  ResourceEditionAssets
> = {
  "ep01-en-study-guide": {
    cover: ep01EnCover,
    previews: [
      { image: ep01EnPage3, altKey: "chapter" },
      { image: ep01EnPage21, altKey: "review" },
    ],
    ogImage: ep01EnOg,
  },
  "ep02-en-study-guide": {
    cover: ep02EnCover,
    previews: [
      { image: ep02EnPage3, altKey: "chapter" },
      { image: ep02EnPage10, altKey: "review" },
    ],
    ogImage: ep02EnOg,
  },
  "ep01-en-500-essential-korean-words-study-guide": {
    cover: words500EnCover,
    previews: [
      // p.4: 1장 단어 본문 (단어·로마자·품사·뜻·예문·용법 메모)
      { image: words500EnPage4, altKey: "chapter" },
      // p.65: 빠른 참고표 & 체크리스트 (복습 진도 체크)
      { image: words500EnPage65, altKey: "checklist" },
    ],
    ogImage: words500EnOg,
  },
  "ep03-en-study-guide": {
    cover: ep03EnCover,
    previews: [
      // p.3: 1장 문장 본문 (문장·뜻·로마자·용법 메모·실제 대화)
      { image: ep03EnPage3, altKey: "chapter" },
      // p.14: 2장 마지막 문장 + A–D 네 문제가 다 보이는 챕터 복습
      { image: ep03EnPage14, altKey: "review" },
    ],
    ogImage: ep03EnOg,
  },
  "ep02-en-1000-korean-words-study-guide": {
    cover: words1000EnCover,
    previews: [
      // p.4: 1장 단어 본문 (단어·로마자·품사·뜻·예문·용법 메모)
      { image: words1000EnPage4, altKey: "chapter" },
      // p.12: 2장 마지막 단어 + A–C 챕터 복습
      { image: words1000EnPage12, altKey: "review" },
    ],
    ogImage: words1000EnOg,
  },
};

export function getResourceAssets(slug: string): ResourceEditionAssets {
  return DOWNLOAD_RESOURCE_ASSETS[slug as DownloadResourceSlug];
}
