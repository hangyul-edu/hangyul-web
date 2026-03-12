import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
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
  openGraph: {
    title: "Hangyul - Speak Korean Naturally with AI",
    description:
      "Learn Korean with AI. Hangyul helps you practice pronunciation, learn real Korean sentences, and build speaking confidence through personalized AI feedback.",
    images: [
      {
        url: "/images/og-image.png",
        width: 800,
        height: 400,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
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
      var ch = function() {
        ch.c(arguments);
      };
      ch.q = [];
      ch.c = function(args) {
        ch.q.push(args);
      };
      w.ChannelIO = ch;
      function l() {
        if (w.ChannelIOInitialized) {
          return;
        }
        w.ChannelIOInitialized = true;
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = 'https://cdn.channel.io/plugin/ch-plugin-web.js';
        s.charset = 'UTF-8';
        var x = document.getElementsByTagName('script')[0];
        x.parentNode.insertBefore(s, x);
      }
      if (document.readyState === 'complete') {
        l();
      } else if (window.attachEvent) {
        window.attachEvent('onload', l);
      } else {
        window.addEventListener('DOMContentLoaded', l, false);
        window.addEventListener('load', l, false);
      }
    })();
    
    ChannelIO('boot', {
      "pluginKey": "${process.env.NEXT_PUBLIC_CHANNEL_IO_KEY}"
    });
    `,
          }}
        />
        <Footer />
      </body>
    </html>
  );
}
