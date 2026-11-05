import Script from "next/script";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import Footer from "@/components/layout/Footer";
import ResourceHeader from "@/components/download/ResourceHeader";
import styles from "@/components/download/ResourcePage.module.css";
import { getLocaleDirection } from "@/constants/locales";
import { routing } from "@/i18n/routing";

/**
 * 무료 학습 자료 레이아웃 (/<UI 언어>/resources, /<UI 언어>/resources/<pageSlug>)
 *
 * 홈페이지 레이아웃(src/app/[locale]/(home)/layout.tsx)의 큰 내비게이션 대신
 * 로고 + 언어 선택기만 있는 최소 헤더를 쓰고, 푸터는 홈페이지와 같은 Footer 컴포넌트를
 * 그대로 씁니다 (문구는 같은 messages.Footer, 반응형은 같은 Footer.module.css).
 * html lang/dir 은 화면 언어를 따릅니다 (PDF 판 언어와는 별개).
 */

export default async function ResourcesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // 요청 헤더를 읽지 않도록 로케일을 먼저 지정해 정적 생성을 유지합니다.
  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  // 클라이언트 컴포넌트(언어 선택기·자료 없음 화면·기존 푸터)가 쓰는 메시지만 넘깁니다.
  const clientMessages = {
    Header: { aria: messages.Header.aria, search: messages.Header.search },
    Footer: messages.Footer,
    LegalModal: messages.LegalModal,
    ResourceDownload: {
      common: messages.ResourceDownload.common,
      notFound: messages.ResourceDownload.notFound,
    },
  };

  return (
    <html lang={locale} dir={getLocaleDirection(locale)}>
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
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
          <ResourceHeader uiLanguage={locale} />
          {children}
          {/* 홈페이지와 같은 푸터 컴포넌트를 변형 없이 그대로 씁니다. */}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
