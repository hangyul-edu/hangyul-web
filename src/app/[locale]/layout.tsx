import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Script from "next/script";

import { routing } from "@/i18n/routing";
import {
  BASE_URL,
  BRAND,
  GOOGLE_SITE_VERIFICATION,
  IS_PRODUCTION_DEPLOYMENT,
  NAVER_SITE_VERIFICATION,
  OG_IMAGE,
} from "@/constants/site";
import { getLocaleDirection } from "@/constants/locales";
import { LOCALE_META } from "@/constants/metadata";
import { buildStructuredData } from "@/constants/structuredData";

import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = LOCALE_META[locale] ?? LOCALE_META.en;

  const ogImage = {
    url: OG_IMAGE.path,
    width: OG_IMAGE.width,
    height: OG_IMAGE.height,
    alt: `${BRAND.name} (${BRAND.nameKo})`,
  };

  return {
    metadataBase: new URL(BASE_URL),
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    applicationName: BRAND.name,
    creator: BRAND.name,
    publisher: BRAND.name,
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: `${BASE_URL}/${locale}`,
      siteName: BRAND.name,
      images: [ogImage],
      locale: meta.ogLocale,
      // 나머지 로케일도 같은 콘텐츠의 다른 언어 버전임을 알립니다.
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => (LOCALE_META[l] ?? LOCALE_META.en).ogLocale),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.ogTitle,
      description: meta.ogDescription,
      images: [ogImage],
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, `${BASE_URL}/${l}`])
        ),
        "x-default": `${BASE_URL}/${routing.defaultLocale}`,
      },
    },
    // 프리뷰/개발 배포가 프로덕션과 검색 결과에서 경쟁하지 않도록 색인을 막습니다.
    robots: IS_PRODUCTION_DEPLOYMENT
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : { index: false, follow: false },
    verification: {
      ...(GOOGLE_SITE_VERIFICATION
        ? { google: GOOGLE_SITE_VERIFICATION }
        : {}),
      ...(NAVER_SITE_VERIFICATION
        ? { other: { "naver-site-verification": NAVER_SITE_VERIFICATION } }
        : {}),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations("A11y");

  // 로컬 개발 환경처럼 키가 없을 때는 위젯을 붙이지 않는다 (운영에서는 키가 설정되어 동일하게 동작)
  const channelIoKey = process.env.NEXT_PUBLIC_CHANNEL_IO_KEY;

  return (
    <html lang={locale} dir={getLocaleDirection(locale)}>
      <head>
        {/*
          브랜드 엔티티(한귤 = Hangyul = talkhangyul.com) 구조화 데이터.
          크롤러가 초기 HTML에서 바로 읽을 수 있도록 next/script가 아닌
          일반 script 태그로 렌더링합니다.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildStructuredData(locale)),
          }}
        />
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
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K6QCG39T"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <a href="#main-content" className="skip-nav">
            {t("skipToContent")}
          </a>

          <Header />

          {children}

          {channelIoKey && (
            <Script
              id="channelTalk"
              strategy="lazyOnload"
              dangerouslySetInnerHTML={{
                __html: `
(function() {
  var w = window;
  if (w.ChannelIO) {
    return (window.console.error || window.console.log || function(){})('ChannelIO script included twice.');
  }
  var ch = function() { ch.c(arguments); };
  ch.q = [];
  ch.c = function(args) { ch.q.push(args); };
  w.ChannelIO = ch;

  function l() {
    if (w.ChannelIOInitialized) return;
    w.ChannelIOInitialized = true;

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://cdn.channel.io/plugin/ch-plugin-web.js';

    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
  }

  if (document.readyState === 'complete') {
    l();
  } else {
    window.addEventListener('DOMContentLoaded', l);
    window.addEventListener('load', l);
  }
})();

ChannelIO('boot', {
  pluginKey: "${channelIoKey}"
});
`,
              }}
            />
          )}

          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
