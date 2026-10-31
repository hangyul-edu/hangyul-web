import Script from "next/script";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import Footer from "@/components/layout/Footer";
import ResourceHeader from "@/components/download/ResourceHeader";
import styles from "@/components/download/ResourcePage.module.css";
import {
  getDownloadResource,
  getResourceUiCopy,
} from "@/content/downloadResources";
import { routing } from "@/i18n/routing";

/**
 * 무료 학습 자료 페이지 레이아웃 (/download?resource=<slug> 에서 rewrite 됨)
 *
 * 홈페이지 레이아웃(src/app/[locale]/layout.tsx)의 큰 내비게이션 대신
 * 로고만 있는 최소 헤더를 쓰고, 푸터는 기존 한귤 푸터를 그대로 재사용합니다.
 * html lang은 자료 언어를 따릅니다 (예: 영어판 → en).
 */
export default async function ResourceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ resource: string }>;
}) {
  const { resource: slug } = await params;
  const resource = getDownloadResource(slug);
  const language = resource?.language ?? routing.defaultLocale;
  const copy = getResourceUiCopy(language);

  // 기존 푸터(약관 모달 포함)가 쓰는 메시지만 클라이언트로 넘깁니다.
  const footerLocale = hasLocale(routing.locales, language)
    ? language
    : routing.defaultLocale;
  // 요청 헤더를 읽지 않도록 로케일을 먼저 지정해 정적 생성을 유지합니다.
  setRequestLocale(footerLocale);
  const messages = await getMessages({ locale: footerLocale });
  const footerMessages = {
    Footer: messages.Footer,
    LegalModal: messages.LegalModal,
  };

  return (
    <html lang={language}>
      <head>
        {/* 홈페이지와 같은 GTM 컨테이너 (새 분석 도구는 추가하지 않음) */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K6QCG39T');`,
          }}
        />
      </head>
      <body className={styles.page}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K6QCG39T"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <NextIntlClientProvider locale={footerLocale} messages={footerMessages}>
          <ResourceHeader homeLabel={copy.homeLink} />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
