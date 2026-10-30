import {
  feature1DesktopEnImg,
  feature1DesktopKoImg,
  feature1MobileEnImg,
  feature1MobileKoImg,
  feature2DesktopEnImg,
  feature2DesktopKoImg,
  feature2MobileEnImg,
  feature2MobileKoImg,
  feature3EnImg,
  feature3KoImg,
  ganadaMockupDesktopEnImg,
  ganadaMockupDesktopKoImg,
  ganadaMockupMobileEnImg,
  ganadaMockupMobileKoImg,
  mockupDesktopEnImg,
  mockupDesktopKoImg,
  mockupMobileEnImg,
  mockupMobileKoImg,
  pricingEnImg,
  pricingKoImg,
} from "@/assets/images";

export const IMAGES = {
  en: {
    mockupDesktop: mockupDesktopEnImg,
    mockupMobile: mockupMobileEnImg,
    pricing: pricingEnImg,
    feature1: feature1DesktopEnImg,
    feature1Mobile: feature1MobileEnImg,
    feature2: feature2DesktopEnImg,
    feature2Mobile: feature2MobileEnImg,
    feature3: feature3EnImg,
    ganadaMockupDesktop: ganadaMockupDesktopEnImg,
    ganadaMockupMobile: ganadaMockupMobileEnImg,
  },
  ko: {
    mockupDesktop: mockupDesktopKoImg,
    mockupMobile: mockupMobileKoImg,
    pricing: pricingKoImg,
    feature1: feature1DesktopKoImg,
    feature1Mobile: feature1MobileKoImg,
    feature2: feature2DesktopKoImg,
    feature2Mobile: feature2MobileKoImg,
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
