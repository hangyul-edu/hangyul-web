/**
 * 번역 파일 검증 스크립트
 *
 * 사용법: npx tsx scripts/validate-translations.ts
 *
 * 검증 내용:
 * - 기준 로케일(en) 대비 다른 로케일에 누락된 키
 * - 다른 로케일에만 있고 기준 로케일에 없는 키 (잉여 키)
 * - 값이 비어 있거나 구조(객체/문자열)가 다른 키
 * - routing.locales와 messages 파일 목록의 불일치
 * - 로케일별 약관/개인정보처리방침 문서 존재 여부 및 로더 등록 여부
 * - 영어 원문이 그대로 복사된 것으로 의심되는 값 (경고)
 */

import fs from "fs";
import path from "path";
import { loadLegalDocument } from "../src/content/legal";

const ROOT = process.cwd();
const MESSAGES_DIR = path.resolve(ROOT, "messages");
const CONTENT_DIR = path.resolve(ROOT, "src/content");
const ROUTING_FILE = path.resolve(ROOT, "src/i18n/routing.ts");
const LEGAL_LOADER_FILE = path.resolve(CONTENT_DIR, "legal.ts");
const BASE_LOCALE = "en";

/** 영어 그대로 두는 것이 자연스러운 값 (브랜드/차용어 등) */
const ENGLISH_ALLOWLIST = new Set([
  "Footer.ceo",
  "Footer.businessDivision",
  "Footer.email",
  "Footer.businessNumber",
  "Footer.mailOrderNumber",
  "Pricing.category",
  "Header.nav.membership",
  "StoreSelectModal.androidLabel",
  "StoreSelectModal.appleLabel",
]);

type NestedMessages = {
  [key: string]: string | NestedMessages;
};

function flatten(obj: NestedMessages, prefix = ""): [string, string][] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      return flatten(value as NestedMessages, fullKey);
    }
    return [[fullKey, value as string] as [string, string]];
  });
}

function loadMessages(locale: string): NestedMessages {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as NestedMessages;
}

function getLocales(): string[] {
  return fs
    .readdirSync(MESSAGES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}

function getRoutingLocales(): string[] {
  const source = fs.readFileSync(ROUTING_FILE, "utf-8");
  const block = source.match(/locales:\s*\[([\s\S]*?)\]/);
  if (!block) return [];
  return [...block[1].matchAll(/"([a-z-]+)"/g)].map((m) => m[1]);
}

async function validate() {
  const locales = getLocales();
  const baseEntries = flatten(loadMessages(BASE_LOCALE));
  const baseKeys = baseEntries.map(([key]) => key);
  const baseValues = new Map(baseEntries);

  let hasError = false;

  // 1. routing.locales ↔ messages 파일 목록
  const routingLocales = getRoutingLocales();
  const notRouted = locales.filter((l) => !routingLocales.includes(l));
  const noMessages = routingLocales.filter((l) => !locales.includes(l));

  if (notRouted.length > 0) {
    console.error(`\n[routing] messages는 있으나 routing.locales에 없음: ${notRouted.join(", ")}`);
    hasError = true;
  }
  if (noMessages.length > 0) {
    console.error(`\n[routing] routing.locales에 있으나 messages 파일이 없음: ${noMessages.join(", ")}`);
    hasError = true;
  }

  // 2. 로케일별 키/값 검증
  for (const locale of locales) {
    if (locale === BASE_LOCALE) continue;

    const entries = flatten(loadMessages(locale));
    const keys = entries.map(([key]) => key);

    const missing = baseKeys.filter((k) => !keys.includes(k));
    const extra = keys.filter((k) => !baseKeys.includes(k));
    const empty = entries.filter(([, value]) => typeof value !== "string" || value.trim() === "");
    const copied = entries.filter(
      ([key, value]) =>
        !ENGLISH_ALLOWLIST.has(key) && baseValues.get(key) === value
    );

    if (missing.length > 0) {
      console.error(`\n[${locale}] 누락된 키 (${missing.length}개):`);
      missing.forEach((k) => console.error(`  ✗ ${k}`));
      hasError = true;
    }

    if (extra.length > 0) {
      console.warn(`\n[${locale}] 잉여 키 (${extra.length}개):`);
      extra.forEach((k) => console.warn(`  ? ${k}`));
    }

    if (empty.length > 0) {
      console.error(`\n[${locale}] 값이 비어 있거나 구조가 잘못된 키 (${empty.length}개):`);
      empty.forEach(([k]) => console.error(`  ✗ ${k}`));
      hasError = true;
    }

    if (copied.length > 0) {
      console.warn(`\n[${locale}] 영어 원문과 동일한 값 (${copied.length}개, 의도된 차용어인지 확인 필요):`);
      copied.forEach(([k, v]) => console.warn(`  ? ${k} = "${v}"`));
    }

    if (missing.length === 0 && extra.length === 0 && empty.length === 0) {
      console.log(`\n[${locale}] ✓ 모든 키 일치`);
    }
  }

  // 3. 약관/개인정보처리방침 문서
  const loaderSource = fs.readFileSync(LEGAL_LOADER_FILE, "utf-8");

  for (const type of ["terms", "privacy"] as const) {
    for (const locale of locales) {
      const filePath = path.join(CONTENT_DIR, type, `${locale}.ts`);

      if (!fs.existsSync(filePath)) {
        console.error(`\n[${locale}] ✗ ${type} 문서 없음 (src/content/${type}/${locale}.ts)`);
        hasError = true;
        continue;
      }

      // 실제 모듈을 불러와 값이 채워져 있는지 확인한다.
      const document = await loadLegalDocument(type, locale);
      for (const field of ["title", "lastUpdated", "body"] as const) {
        if (typeof document[field] !== "string" || document[field].trim() === "") {
          console.error(`\n[${locale}] ✗ ${type} 문서의 ${field} 값이 비어 있음`);
          hasError = true;
        }
      }

      if (!loaderSource.includes(`./${type}/${locale}"`)) {
        console.error(`\n[${locale}] ✗ ${type} 문서가 src/content/legal.ts 로더에 등록되지 않음`);
        hasError = true;
      }
    }
  }

  console.log(`\n약관/개인정보처리방침 문서 ${locales.length}개 로케일 확인 완료`);

  if (hasError) {
    console.error("\n번역 검증 실패. 위 항목을 수정해주세요.");
    process.exit(1);
  } else {
    console.log("\n번역 검증 통과 ✓");
  }
}

validate();
