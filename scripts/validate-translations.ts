/**
 * 번역 파일 키 누락 검증 스크립트
 *
 * 사용법: npx tsx scripts/validate-translations.ts
 *
 * 검증 내용:
 * - 기준 로케일(en) 대비 다른 로케일에 누락된 키
 * - 다른 로케일에만 있고 기준 로케일에 없는 키 (잉여 키)
 */

import fs from "fs";
import path from "path";

const MESSAGES_DIR = path.resolve(process.cwd(), "messages");
const BASE_LOCALE = "en";

type NestedMessages = {
  [key: string]: string | NestedMessages;
};

function flattenKeys(obj: NestedMessages, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      return flattenKeys(value as NestedMessages, fullKey);
    }
    return [fullKey];
  });
}

function loadMessages(locale: string): NestedMessages {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as NestedMessages;
}

function getLocales(): string[] {
  return fs
    .readdirSync(MESSAGES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}

function validate() {
  const locales = getLocales();
  const baseMessages = loadMessages(BASE_LOCALE);
  const baseKeys = flattenKeys(baseMessages);

  let hasError = false;

  for (const locale of locales) {
    if (locale === BASE_LOCALE) continue;

    const messages = loadMessages(locale);
    const keys = flattenKeys(messages);

    const missing = baseKeys.filter((k) => !keys.includes(k));
    const extra = keys.filter((k) => !baseKeys.includes(k));

    if (missing.length > 0) {
      console.error(`\n[${locale}] 누락된 키 (${missing.length}개):`);
      missing.forEach((k) => console.error(`  ✗ ${k}`));
      hasError = true;
    }

    if (extra.length > 0) {
      console.warn(`\n[${locale}] 잉여 키 (${extra.length}개):`);
      extra.forEach((k) => console.warn(`  ? ${k}`));
    }

    if (missing.length === 0 && extra.length === 0) {
      console.log(`\n[${locale}] ✓ 모든 키 일치`);
    }
  }

  if (hasError) {
    console.error("\n번역 키 검증 실패. 위 누락된 키를 추가해주세요.");
    process.exit(1);
  } else {
    console.log("\n번역 키 검증 통과 ✓");
  }
}

validate();
