import Script from "next/script";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import Footer from "@/components/layout/Footer";
import ResourceHeader from "@/components/download/ResourceHeader";
import styles from "@/components/download/ResourcePage.module.css";
import { getLocaleDirection } from "@/constants/locales";
import { getDownloadResource } from "@/content/downloadResources";
import { routing } from "@/i18n/routing";

/**
 * 무료 학습 자료 페이지 레이아웃
 * (/download?resource=<slug>&lang=<UI 언어> 에서 /download/<slug>/<lang> 으로 rewrite 됨)
 *
 * 홈페이지 레이아웃(src/app/[locale]/layout.tsx)의 큰 내비게이션 대신
 * 로고 + 언어 선택기만 있는 최소 헤더를 쓰고, 푸터는 기존 한귤 푸터를 재사용합니다.
 * html lang/dir 은 화면 언어를 따릅니다 (PDF 판 언어와는 별개).
 */

export default async function ResourceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ resource: string; lang: string }>;
}) {
  const { resource: slug, lang } = await params;
  if (!hasLocale(routing.locales, lang)) notFound();

  // 요청 헤더를 읽지 않도록 로케일을 먼저 지정해 정적 생성을 유지합니다.
  setRequestLocale(lang);
  const messages = await getMessages({ locale: lang });
  const resolved = getDownloadResource(slug);

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
    <html lang={lang} dir={getLocaleDirection(lang)}>
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
        <NextIntlClientProvider locale={lang} messages={clientMessages}>
          <ResourceHeader
            uiLanguage={lang}
            resourceSlug={resolved?.edition.slug ?? null}
            siblingEditions={
              resolved
                ? Object.fromEntries(
                    Object.entries(resolved.family.editions).map(
                      ([language, edition]) => [language, edition.slug]
                    )
                  )
                : {}
            }
          />
          {children}
          {/* 푸터도 헤더·히어로·섹션과 같은 컨테이너(--container, --gutter)에 맞춥니다. */}
          <Footer containerClassName={styles.footerContainer} alignEnd />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
