import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Script from "next/script";

import { routing } from "@/i18n/routing";

import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const baseUrl = "https://talkhangyul.com";

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
      "Hangyul is an AI-powered Korean learning platform designed to help you speak Korean naturally. Practice pronunciation, learn real Korean sentences, and improve your speaking skills with personalized AI feedback.",
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
    description:
      "한귤은 AI 발음 분석과 맞춤형 학습으로 한국어를 쉽고 재미있게 배울 수 있는 한국어 학습 플랫폼입니다. 실제 한국어 문장을 연습하며 자연스럽게 말하기 실력을 키워보세요.",
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
    metadataBase: new URL(baseUrl),
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: `${baseUrl}/${locale}`,
      siteName: "Hangyul",
      images: [{ url: "/og-image.png", width: 800, height: 400 }],
      locale: meta.ogLocale,
      type: "website",
    },
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
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
      <body>
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
