import { MetadataRoute } from "next";
import { BASE_URL, IS_PRODUCTION_DEPLOYMENT } from "@/constants/site";

export default function robots(): MetadataRoute.Robots {
  // 프리뷰/개발 배포는 프로덕션과 검색 결과에서 경쟁하지 않도록 크롤링을 막습니다.
  if (!IS_PRODUCTION_DEPLOYMENT) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: [
      // 공개 마케팅 페이지 전체를 허용합니다. 렌더링에 필요한 JS/CSS/이미지도
      // /_next 아래에 있으므로 별도로 막지 않습니다.
      { userAgent: "*", allow: "/" },
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "Googlebot-Image", allow: "/" },
      // 네이버 검색 크롤러
      { userAgent: "Yeti", allow: "/" },
      // 다음(카카오) 검색 크롤러
      { userAgent: "Daum", allow: "/" },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
