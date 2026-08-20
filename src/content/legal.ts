/**
 * 약관·개인정보처리방침 문서 로더
 *
 * 문서 원문이 크기 때문에 모든 locale을 정적으로 import하면 번들이 불필요하게 커집니다.
 * 모달을 열 때 현재 locale의 문서만 동적으로 불러옵니다.
 *
 * 언어 추가 시 src/content/terms/<locale>.ts 와 src/content/privacy/<locale>.ts 를 만들고
 * 아래 목록에 추가하세요. (scripts/validate-translations.ts가 누락 여부를 검증합니다.)
 */
export type LegalDocument = {
  title: string;
  lastUpdated: string;
  body: string;
};

export type LegalDocumentType = "terms" | "privacy";

type LegalLoaders = Record<string, () => Promise<LegalDocument>>;

const TERMS: LegalLoaders = {
  ar: () => import("./terms/ar").then((m) => m.termsAr),
  bn: () => import("./terms/bn").then((m) => m.termsBn),
  cs: () => import("./terms/cs").then((m) => m.termsCs),
  de: () => import("./terms/de").then((m) => m.termsDe),
  el: () => import("./terms/el").then((m) => m.termsEl),
  en: () => import("./terms/en").then((m) => m.termsEn),
  es: () => import("./terms/es").then((m) => m.termsEs),
  fil: () => import("./terms/fil").then((m) => m.termsFil),
  fr: () => import("./terms/fr").then((m) => m.termsFr),
  hi: () => import("./terms/hi").then((m) => m.termsHi),
  hu: () => import("./terms/hu").then((m) => m.termsHu),
  id: () => import("./terms/id").then((m) => m.termsId),
  it: () => import("./terms/it").then((m) => m.termsIt),
  ja: () => import("./terms/ja").then((m) => m.termsJa),
  kk: () => import("./terms/kk").then((m) => m.termsKk),
  ko: () => import("./terms/ko").then((m) => m.termsKo),
  ky: () => import("./terms/ky").then((m) => m.termsKy),
  mn: () => import("./terms/mn").then((m) => m.termsMn),
  nl: () => import("./terms/nl").then((m) => m.termsNl),
  pl: () => import("./terms/pl").then((m) => m.termsPl),
  pt: () => import("./terms/pt").then((m) => m.termsPt),
  ro: () => import("./terms/ro").then((m) => m.termsRo),
  ru: () => import("./terms/ru").then((m) => m.termsRu),
  sv: () => import("./terms/sv").then((m) => m.termsSv),
  ta: () => import("./terms/ta").then((m) => m.termsTa),
  te: () => import("./terms/te").then((m) => m.termsTe),
  th: () => import("./terms/th").then((m) => m.termsTh),
  tr: () => import("./terms/tr").then((m) => m.termsTr),
  uk: () => import("./terms/uk").then((m) => m.termsUk),
  uz: () => import("./terms/uz").then((m) => m.termsUz),
  vi: () => import("./terms/vi").then((m) => m.termsVi),
  zh: () => import("./terms/zh").then((m) => m.termsZh),
};

const PRIVACY: LegalLoaders = {
  ar: () => import("./privacy/ar").then((m) => m.privacyAr),
  bn: () => import("./privacy/bn").then((m) => m.privacyBn),
  cs: () => import("./privacy/cs").then((m) => m.privacyCs),
  de: () => import("./privacy/de").then((m) => m.privacyDe),
  el: () => import("./privacy/el").then((m) => m.privacyEl),
  en: () => import("./privacy/en").then((m) => m.privacyEn),
  es: () => import("./privacy/es").then((m) => m.privacyEs),
  fil: () => import("./privacy/fil").then((m) => m.privacyFil),
  fr: () => import("./privacy/fr").then((m) => m.privacyFr),
  hi: () => import("./privacy/hi").then((m) => m.privacyHi),
  hu: () => import("./privacy/hu").then((m) => m.privacyHu),
  id: () => import("./privacy/id").then((m) => m.privacyId),
  it: () => import("./privacy/it").then((m) => m.privacyIt),
  ja: () => import("./privacy/ja").then((m) => m.privacyJa),
  kk: () => import("./privacy/kk").then((m) => m.privacyKk),
  ko: () => import("./privacy/ko").then((m) => m.privacyKo),
  ky: () => import("./privacy/ky").then((m) => m.privacyKy),
  mn: () => import("./privacy/mn").then((m) => m.privacyMn),
  nl: () => import("./privacy/nl").then((m) => m.privacyNl),
  pl: () => import("./privacy/pl").then((m) => m.privacyPl),
  pt: () => import("./privacy/pt").then((m) => m.privacyPt),
  ro: () => import("./privacy/ro").then((m) => m.privacyRo),
  ru: () => import("./privacy/ru").then((m) => m.privacyRu),
  sv: () => import("./privacy/sv").then((m) => m.privacySv),
  ta: () => import("./privacy/ta").then((m) => m.privacyTa),
  te: () => import("./privacy/te").then((m) => m.privacyTe),
  th: () => import("./privacy/th").then((m) => m.privacyTh),
  tr: () => import("./privacy/tr").then((m) => m.privacyTr),
  uk: () => import("./privacy/uk").then((m) => m.privacyUk),
  uz: () => import("./privacy/uz").then((m) => m.privacyUz),
  vi: () => import("./privacy/vi").then((m) => m.privacyVi),
  zh: () => import("./privacy/zh").then((m) => m.privacyZh),
};

const LOADERS: Record<LegalDocumentType, LegalLoaders> = {
  terms: TERMS,
  privacy: PRIVACY,
};

/** 해당 locale의 문서를 불러옵니다. 문서가 없는 locale은 영어로 대체합니다. */
export function loadLegalDocument(
  type: LegalDocumentType,
  locale: string
): Promise<LegalDocument> {
  const loaders = LOADERS[type];
  return (loaders[locale] ?? loaders.en)();
}
