import type { Metadata } from "next";
import "./globals.css";

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
        url: "/og-image.png",
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
}: {
  children: React.ReactNode;
}) {
  return children;
}
