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
