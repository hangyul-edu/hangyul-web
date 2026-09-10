/**
 * 한귤 공식 소셜 미디어 채널.
 *
 * 플랫폼 이름은 고유명사이므로 번역하지 않고, 스크린리더용 문구만
 * Footer.socialLinkLabel 메시지로 지역화합니다.
 */
export const SOCIAL_LINKS = [
  { platform: "YouTube", href: "https://www.youtube.com/@talkhangyul" },
  { platform: "Instagram", href: "https://www.instagram.com/talkhangyul" },
  { platform: "TikTok", href: "https://www.tiktok.com/@talkhangyul" },
  { platform: "Facebook", href: "https://www.facebook.com/share/1HDHU95quq" },
] as const;

export type SocialPlatform = (typeof SOCIAL_LINKS)[number]["platform"];
