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

/**
 * 판(edition)별 이미지. scripts/generate-resource-previews.ts 로 실제 PDF에서 만듭니다.
 * 키 타입이 등록된 slug 전체이므로, 판을 추가하고 여기를 빠뜨리면 타입 오류가 납니다.
 *
 * 미리보기 alt 문구는 messages의 ResourceDownload.resources.<messagesKey>.previews.<altKey>
 */
export type ResourceEditionAssets = {
  cover: StaticImageData;
  /** "A look inside" 썸네일 (최대 2장) */
  previews: { image: StaticImageData; altKey: "chapter" | "review" }[];
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
};

export function getResourceAssets(slug: string): ResourceEditionAssets {
  return DOWNLOAD_RESOURCE_ASSETS[slug as DownloadResourceSlug];
}
