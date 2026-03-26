import { KOFlag, USFlag } from "@/assets/flags";
import type { StaticImageData } from "next/image";

export const LOCALE_CONFIG: Record<string, { name: string; flag: StaticImageData }> = {
  en: { name: "English", flag: USFlag },
  ko: { name: "한국어", flag: KOFlag },
};
