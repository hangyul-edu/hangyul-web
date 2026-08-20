import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Script from "next/script";

import { routing } from "@/i18n/routing";
import { BASE_URL, OG_IMAGE_VERSION } from "@/constants/site";
import { getLocaleDirection } from "@/constants/locales";
import { LOCALE_META } from "@/constants/metadata";

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

  return {
    metadataBase: new URL(BASE_URL),
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: `${BASE_URL}/${locale}`,
      siteName: "Hangyul",
      images: [
        {
          url: `/og-image.png?v=${OG_IMAGE_VERSION}`,
          width: 800,
          height: 400,
        },
      ],
      locale: meta.ogLocale,
      type: "website",
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
    verification: {
      other: {
        "naver-site-verification": "24a1793e885cebe60e445152f81f0da70598918b",
      },
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
