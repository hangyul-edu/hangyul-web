/**
 * JSON-LD 구조화 데이터
 *
 * 목적은 검색엔진이 "한귤", "Hangyul", "HANGYUL", "talkhangyul.com"을
 * 같은 브랜드(엔티티)로 인식하게 하는 것입니다.
 *
 * - WebSite / Organization은 @id로 식별되므로 모든 로케일 페이지에서
 *   같은 노드를 내보내도 중복으로 취급되지 않습니다.
 * - 앱이 아직 스토어에 출시되지 않아(STORE_LINKS 주석 처리) 다운로드 URL·가격·평점 등
 *   검증 가능한 값이 없으므로 SoftwareApplication은 넣지 않습니다.
 */
import {
  BASE_URL,
  BRAND,
  BUSINESS_REGISTRATION_NUMBER,
  LOGO_IMAGE,
  OG_IMAGE,
  SUPPORT_EMAIL,
} from "@/constants/site";
import { LOCALE_META } from "@/constants/metadata";
import { routing } from "@/i18n/routing";

const WEBSITE_ID = `${BASE_URL}/#website`;
const ORGANIZATION_ID = `${BASE_URL}/#organization`;

type JsonLdNode = Record<string, unknown>;

function organizationNode(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: BRAND.name,
    alternateName: [BRAND.nameKo, "HANGYUL", "HanGyul"],
    url: `${BASE_URL}/`,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}${LOGO_IMAGE.path}`,
      width: LOGO_IMAGE.width,
      height: LOGO_IMAGE.height,
    },
    image: `${BASE_URL}${OG_IMAGE.path}`,
    email: SUPPORT_EMAIL,
    // 사이트 푸터에 이미 공개된 사업자등록번호
    identifier: {
      "@type": "PropertyValue",
      name: "사업자등록번호",
      value: BUSINESS_REGISTRATION_NUMBER,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: SUPPORT_EMAIL,
    },
  };
}

function webSiteNode(locale: string): JsonLdNode {
  const meta = LOCALE_META[locale] ?? LOCALE_META.en;

  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${BASE_URL}/`,
    name: BRAND.name,
    alternateName: [...BRAND.alternateNames],
    description: meta.description,
    inLanguage: [...routing.locales],
    publisher: { "@id": ORGANIZATION_ID },
  };
}

function webPageNode(locale: string): JsonLdNode {
  const meta = LOCALE_META[locale] ?? LOCALE_META.en;
  const url = `${BASE_URL}/${locale}`;

  return {
    "@type": "WebPage",
    "@id": url,
    url,
    name: meta.title,
    description: meta.description,
    inLanguage: locale,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
    primaryImageOfPage: `${BASE_URL}${OG_IMAGE.path}`,
  };
}

/** 로케일 페이지 하나에 삽입할 JSON-LD 그래프 */
export function buildStructuredData(locale: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationNode(), webSiteNode(locale), webPageNode(locale)],
  };
}

/* ───────────── 무료 학습 자료 페이지 ───────────── */

/**
 * JSON을 <script> 안에 그대로 넣을 때 "</script>" 등으로 태그가 끊기지 않게
 * "<"를 이스케이프합니다. (JSON 값은 그대로입니다.)
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** 학습 자료가 다루는 언어 (한국어) */
const KOREAN_LANGUAGE: JsonLdNode = {
  "@type": "Language",
  name: "Korean",
  alternateName: "ko",
};

export type BreadcrumbItem = { name: string; url: string };

function breadcrumbNode(pageUrl: string, items: BreadcrumbItem[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export type ResourceJsonLdInput = {
  /** 이 화면 언어의 대표 주소 (절대 URL) */
  url: string;
  /** 화면 언어 */
  locale: string;
  /** 페이지 제목 (<title>) */
  pageTitle: string;
  /** 자료 이름 (예: "100 Everyday Korean Sentences EP01") */
  name: string;
  description: string;
  /** PDF가 쓰인 언어 (판 언어) */
  editionLanguage: string;
  /** PDF 절대 URL */
  fileUrl: string;
  /** 표지 이미지 절대 URL */
  thumbnailUrl: string;
  /** 공유 이미지 절대 URL */
  imageUrl: string;
  series?: string;
  breadcrumb: BreadcrumbItem[];
};

/**
 * 학습 자료 페이지의 JSON-LD 그래프.
 *
 * 실제로 확인할 수 있는 사실만 넣습니다. 평점·리뷰·저자·가격·발행일·학습 시간처럼
 * 근거가 없는 값은 넣지 않습니다. LearningResource는 전용 리치 결과가 없는 타입이지만
 * schema.org 표준 어휘라 검색엔진이 자료의 성격(무료 PDF 학습 자료)을 이해하는 데 씁니다.
 */
export function buildResourceStructuredData(input: ResourceJsonLdInput) {
  const resourceId = `${input.url}#resource`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(),
      {
        "@type": "WebPage",
        "@id": input.url,
        url: input.url,
        name: input.pageTitle,
        description: input.description,
        inLanguage: input.locale,
        isPartOf: { "@id": WEBSITE_ID },
        breadcrumb: { "@id": `${input.url}#breadcrumb` },
        primaryImageOfPage: input.imageUrl,
        mainEntity: { "@id": resourceId },
      },
      {
        "@type": "LearningResource",
        "@id": resourceId,
        name: input.name,
        description: input.description,
        url: input.url,
        // 화면 언어와 별개로, PDF 자체가 쓰인 언어입니다.
        inLanguage: input.editionLanguage,
        learningResourceType: "Study guide",
        isAccessibleForFree: true,
        encodingFormat: "application/pdf",
        encoding: {
          "@type": "MediaObject",
          contentUrl: input.fileUrl,
          encodingFormat: "application/pdf",
        },
        thumbnailUrl: input.thumbnailUrl,
        image: input.imageUrl,
        about: KOREAN_LANGUAGE,
        provider: { "@id": ORGANIZATION_ID },
        publisher: { "@id": ORGANIZATION_ID },
        ...(input.series
          ? { isPartOf: { "@type": "CreativeWorkSeries", name: input.series } }
          : {}),
      },
      breadcrumbNode(input.url, input.breadcrumb),
    ],
  };
}

export type ResourceIndexJsonLdInput = {
  url: string;
  locale: string;
  pageTitle: string;
  description: string;
  items: { name: string; url: string }[];
  breadcrumb: BreadcrumbItem[];
};

/** 자료 목록 페이지(/<UI 언어>/resources)의 JSON-LD 그래프 */
export function buildResourceIndexStructuredData(input: ResourceIndexJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(),
      {
        "@type": "CollectionPage",
        "@id": input.url,
        url: input.url,
        name: input.pageTitle,
        description: input.description,
        inLanguage: input.locale,
        isPartOf: { "@id": WEBSITE_ID },
        publisher: { "@id": ORGANIZATION_ID },
        breadcrumb: { "@id": `${input.url}#breadcrumb` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: input.items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            url: item.url,
          })),
        },
      },
      breadcrumbNode(input.url, input.breadcrumb),
    ],
  };
}
