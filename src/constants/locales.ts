import {
  BDFlag,
  CNFlag,
  CZFlag,
  DEFlag,
  ESFlag,
  FRFlag,
  GRFlag,
  HUFlag,
  IDFlag,
  INFlag,
  ITFlag,
  JPFlag,
  KGFlag,
  KOFlag,
  KZFlag,
  MNFlag,
  NLFlag,
  PHFlag,
  PLFlag,
  PTFlag,
  ROFlag,
  RUFlag,
  SAFlag,
  SEFlag,
  THFlag,
  TRFlag,
  UAFlag,
  USFlag,
  UZFlag,
  VNFlag,
} from "@/assets/flags";
import type { StaticImageData } from "next/image";

export type LocaleInfo = {
  /** 해당 언어 화자가 쓰는 언어명 */
  name: string;
  /** 영어 언어명 (언어 검색용) */
  englishName: string;
  flag: StaticImageData;
  /** 검색 시 함께 매칭할 대체 명칭 */
  aliases?: string[];
};

export const LOCALE_CONFIG: Record<string, LocaleInfo> = {
  en: { name: "English", englishName: "English", flag: USFlag },
  ko: { name: "한국어", englishName: "Korean", flag: KOFlag },
  ar: { name: "العربية", englishName: "Arabic", flag: SAFlag },
  bn: { name: "বাংলা", englishName: "Bengali", flag: BDFlag },
  zh: { name: "中文", englishName: "Chinese", flag: CNFlag, aliases: ["Mandarin"] },
  cs: { name: "čeština", englishName: "Czech", flag: CZFlag },
  nl: { name: "Nederlands", englishName: "Dutch", flag: NLFlag },
  fr: { name: "français", englishName: "French", flag: FRFlag },
  de: { name: "Deutsch", englishName: "German", flag: DEFlag },
  el: { name: "Ελληνικά", englishName: "Greek", flag: GRFlag },
  hi: { name: "हिन्दी", englishName: "Hindi", flag: INFlag },
  hu: { name: "magyar", englishName: "Hungarian", flag: HUFlag },
  id: { name: "Indonesia", englishName: "Indonesian", flag: IDFlag, aliases: ["Bahasa Indonesia"] },
  it: { name: "italiano", englishName: "Italian", flag: ITFlag },
  ja: { name: "日本語", englishName: "Japanese", flag: JPFlag },
  pl: { name: "polski", englishName: "Polish", flag: PLFlag },
  pt: { name: "português", englishName: "Portuguese", flag: PTFlag },
  ro: { name: "română", englishName: "Romanian", flag: ROFlag },
  ru: { name: "русский", englishName: "Russian", flag: RUFlag },
  es: { name: "español", englishName: "Spanish", flag: ESFlag },
  sv: { name: "svenska", englishName: "Swedish", flag: SEFlag },
  fil: { name: "Filipino", englishName: "Filipino", flag: PHFlag, aliases: ["Tagalog"] },
  ta: { name: "தமிழ்", englishName: "Tamil", flag: INFlag },
  te: { name: "తెలుగు", englishName: "Telugu", flag: INFlag },
  th: { name: "ไทย", englishName: "Thai", flag: THFlag },
  tr: { name: "Türkçe", englishName: "Turkish", flag: TRFlag },
  uk: { name: "українська", englishName: "Ukrainian", flag: UAFlag },
  vi: { name: "Tiếng Việt", englishName: "Vietnamese", flag: VNFlag },
  uz: { name: "Oʻzbekcha", englishName: "Uzbek", flag: UZFlag },
  kk: { name: "қазақ", englishName: "Kazakh", flag: KZFlag },
  ky: { name: "Кыргызча", englishName: "Kyrgyz", flag: KGFlag },
  mn: { name: "монгол хэл", englishName: "Mongolian", flag: MNFlag },
};

// 오른쪽에서 왼쪽으로 읽는 언어 (RTL)
const RTL_LOCALES = ["ar"];

export function getLocaleDirection(locale: string): "ltr" | "rtl" {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}

/**
 * 검색 비교용 문자열 정규화
 * - 앞뒤 공백 제거, 소문자 변환
 * - 라틴 문자의 발음 구별 기호 제거 (예: "Tiếng Việt" → "tieng viet")
 *   비라틴 문자는 결합 문자 범위가 달라 영향을 받지 않습니다.
 */
export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** locale 하나에 대해 검색 대상이 되는 문자열 목록 */
export function getLocaleSearchTokens(code: string): string[] {
  const info = LOCALE_CONFIG[code];
  if (!info) return [normalizeSearchText(code)];

  return [code, info.name, info.englishName, ...(info.aliases ?? [])].map(
    normalizeSearchText
  );
}
