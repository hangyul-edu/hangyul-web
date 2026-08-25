import {
  feature1EnImg,
  feature1KoImg,
  feature2EnImg,
  feature2KoImg,
  feature3EnImg,
  feature3KoImg,
  ganadaMockupDesktopEnImg,
  ganadaMockupDesktopKoImg,
  ganadaMockupMobileEnImg,
  ganadaMockupMobileKoImg,
  mockupEnImg,
  mockupKoImg,
  pricingEnImg,
  pricingKoImg,
} from "@/assets/images";

export const IMAGES = {
  en: {
    mockup: mockupEnImg,
    pricing: pricingEnImg,
    feature1: feature1EnImg,
    feature2: feature2EnImg,
    feature3: feature3EnImg,
    ganadaMockupDesktop: ganadaMockupDesktopEnImg,
    ganadaMockupMobile: ganadaMockupMobileEnImg,
  },
  ko: {
    mockup: mockupKoImg,
    pricing: pricingKoImg,
    feature1: feature1KoImg,
    feature2: feature2KoImg,
    feature3: feature3KoImg,
    ganadaMockupDesktop: ganadaMockupDesktopKoImg,
    ganadaMockupMobile: ganadaMockupMobileKoImg,
  },
};

/**
 * locale별 스크린샷 이미지를 반환합니다.
 * 전용 이미지가 없는 locale은 영어 이미지로 대체합니다.
 */
export function getLocaleImages(locale: string) {
  return IMAGES[locale as keyof typeof IMAGES] ?? IMAGES.en;
}
