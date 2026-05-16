import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Script from "next/script";

import { routing } from "@/i18n/routing";
import { BASE_URL } from "@/constants/site";

import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const META: Record<
  string,
  {
    title: string;
    description: string;
    keywords: string[];
    ogTitle: string;
    ogDescription: string;
    ogLocale: string;
  }
> = {
  en: {
    title: "Hangyul - AI Korean Learning App | Speak Korean with AI",
    description:
      "Speak Korean naturally with fun, AI-powered lessons made for real conversations.",
    keywords: [
      "AI Korean learning",
      "learn Korean",
      "speak Korean",
      "Korean language app",
      "Korean speaking practice",
      "AI pronunciation training",
      "Korean learning app",
      "Korean speaking AI",
      "Korean study online",
      "Talk Hangyul",
    ],
    ogTitle: "Hangyul - Speak Korean Naturally with AI",
    ogDescription:
      "Learn Korean with AI. Hangyul helps you practice pronunciation, learn real Korean sentences, and build speaking confidence through personalized AI feedback.",
    ogLocale: "en_US",
  },
  ko: {
    title: "한귤 | AI와 함께 자연스럽게 말하는 한국어",
    description: "AI와 함께 말하면서 배우는 쉽고 재미있는 한국어 학습 플랫폼",
    keywords: [
      "AI 한국어 학습",
      "한국어 회화 앱",
      "한국어 말하기 연습",
      "AI 발음 교정",
      "한국어 공부 앱",
      "한국어 학습 플랫폼",
      "한국어 회화 연습",
      "한국어 AI 튜터",
      "한국어 공부 온라인",
      "한귤 Hangyul",
    ],
    ogTitle: "AI와 함께 배우는 한국어 회화, 한귤",
    ogDescription:
      "AI 발음 분석과 개인 맞춤 학습으로 한국어를 자연스럽게 말해보세요. 실제 한국어 문장을 연습하며 말하기 자신감을 키울 수 있습니다.",
    ogLocale: "ko_KR",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = META[locale] ?? META.en;

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
      images: [{ url: "/og-image.png", width: 800, height: 400 }],
      locale: meta.ogLocale,
      type: "website",
    },
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
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

  return (
    <html lang={locale}>
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
            Skip to main content
          </a>

          <Header />

          {children}

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
  pluginKey: "${process.env.NEXT_PUBLIC_CHANNEL_IO_KEY}"
});
`,
            }}
          />

          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
