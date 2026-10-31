import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ResourceDownloadPage from "@/components/download/ResourceDownloadPage";
import { resourcePagePath } from "@/constants/downloadResources";
import {
  BASE_URL,
  BRAND,
  IS_PRODUCTION_DEPLOYMENT,
} from "@/constants/site";
import {
  DOWNLOAD_RESOURCE_SLUGS,
  getDownloadResource,
} from "@/content/downloadResources";

/**
 * 무료 학습 자료 다운로드 페이지
 *
 * 공개 URL: /download?resource=<slug>
 * 프록시(src/lib/downloadSmartLink.ts)가 이 내부 경로(/download/<slug>)로 rewrite 합니다.
 * 등록된 자료는 빌드 시 정적으로 생성되고, 모르는 slug는 not-found.tsx(404)를 보여줍니다.
 */

export function generateStaticParams() {
  return DOWNLOAD_RESOURCE_SLUGS.map((resource) => ({ resource }));
}

type PageProps = { params: Promise<{ resource: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { resource: slug } = await params;
  const resource = getDownloadResource(slug);

  if (!resource) {
    return {
      title: `Resource not found | ${BRAND.name}`,
      robots: { index: false, follow: true },
    };
  }

  // utm_* 등이 붙은 링크도 하나의 대표 주소로 모읍니다.
  const url = `${BASE_URL}${resourcePagePath(resource.slug)}`;
  const shareImage = resource.seo.ogImage ?? resource.cover;
  const image = {
    url: shareImage.src,
    width: shareImage.width,
    height: shareImage.height,
    alt: resource.coverAlt,
  };

  return {
    metadataBase: new URL(BASE_URL),
    title: resource.seo.title,
    description: resource.seo.description,
    applicationName: BRAND.name,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: BRAND.name,
      title: resource.seo.title,
      description: resource.seo.description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: resource.seo.title,
      description: resource.seo.description,
      images: [image],
    },
    robots: IS_PRODUCTION_DEPLOYMENT
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export default async function Page({ params }: PageProps) {
  const { resource: slug } = await params;
  const resource = getDownloadResource(slug);

  if (!resource) notFound();

  return <ResourceDownloadPage resource={resource} />;
}
