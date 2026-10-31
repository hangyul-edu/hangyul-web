/**
 * 무료 학습 자료(PDF) 미리보기 이미지 생성 스크립트
 *
 * 사용법:
 *   npx tsx scripts/generate-resource-previews.ts <pdf 파일명> <리소스 slug> [미리보기 페이지...]
 *
 * 예시 (EP01):
 *   npx tsx scripts/generate-resource-previews.ts EP01_EN_Study_Guide.pdf ep01-en-study-guide 3 5
 *
 * - <pdf 파일명>은 src/assets/downloads/ 아래 파일 이름입니다.
 * - 결과물은 src/assets/images/resources/<slug>/ 에 저장됩니다.
 *     cover.webp      표지 (다운로드 페이지 히어로)
 *     page-<n>.webp   본문 미리보기 페이지
 *     og.jpg          1200×630 소셜 공유 이미지 (표지를 브랜드 배경 위에 배치)
 * - 런타임에 PDF를 읽지 않도록, 페이지는 이 정적 이미지만 사용합니다.
 *
 * 요구 사항: poppler-utils(pdftoppm), sharp(Next.js 이미지 최적화 의존성으로 설치됨)
 */

import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const DOWNLOADS_DIR = path.resolve(ROOT, "src/assets/downloads");
const OUTPUT_ROOT = path.resolve(ROOT, "src/assets/images/resources");

/** 히어로 표지는 데스크톱에서 최대 약 400px로 보이므로 2배 밀도 + 여유분 */
const COVER_WIDTH = 880;
/** 본문 미리보기는 작은 썸네일(약 240px)로만 보입니다. */
const PAGE_WIDTH = 560;
const OG_SIZE = { width: 1200, height: 630 } as const;
/** PDF 표지 하단 띠와 같은 계열의 따뜻한 배경 */
const OG_BACKGROUND = "#f6f3ea";

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function renderPage(pdf: string, page: number, width: number, tmpDir: string) {
  const prefix = path.join(tmpDir, `p${page}`);
  execFileSync("pdftoppm", [
    "-f", String(page),
    "-l", String(page),
    "-singlefile",
    "-png",
    "-scale-to-x", String(width),
    "-scale-to-y", "-1",
    pdf,
    prefix,
  ]);
  return `${prefix}.png`;
}

async function main() {
  const [pdfName, slug, ...pageArgs] = process.argv.slice(2);

  if (!pdfName || !slug) {
    fail("usage: generate-resource-previews.ts <pdf file name> <slug> [pages...]");
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fail(`slug must be kebab-case: ${slug}`);
  }

  const pdf = path.join(DOWNLOADS_DIR, pdfName);
  if (!fs.existsSync(pdf)) fail(`PDF not found: ${pdf}`);

  const pages = pageArgs.map(Number);
  if (pages.some((p) => !Number.isInteger(p) || p < 1)) {
    fail("preview pages must be positive integers");
  }

  const outDir = path.join(OUTPUT_ROOT, slug);
  fs.mkdirSync(outDir, { recursive: true });

  // 중간 PNG는 OS 임시 폴더에만 두고 끝나면 지웁니다.
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hangyul-preview-"));

  try {
    const coverPng = renderPage(pdf, 1, COVER_WIDTH, tmpDir);
    await sharp(coverPng)
      .webp({ quality: 86, effort: 6 })
      .toFile(path.join(outDir, "cover.webp"));

    for (const page of pages) {
      const png = renderPage(pdf, page, PAGE_WIDTH, tmpDir);
      await sharp(png)
        .webp({ quality: 82, effort: 6 })
        .toFile(path.join(outDir, `page-${page}.webp`));
    }

    // 소셜 공유 이미지: 표지를 가운데 두고 부드러운 그림자를 깝니다.
    const coverHeight = 540;
    const cover = await sharp(coverPng)
      .resize({ height: coverHeight })
      .png()
      .toBuffer();
    const { width: coverW = 0 } = await sharp(cover).metadata();
    const left = Math.round((OG_SIZE.width - coverW) / 2);
    const top = Math.round((OG_SIZE.height - coverHeight) / 2);

    // sharp는 한 파이프라인에서 composite를 blur보다 나중에 적용하므로 두 단계로 나눕니다.
    const shadowShape = await sharp({
      create: {
        width: coverW + 80,
        height: coverHeight + 80,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: Buffer.from(
            `<svg width="${coverW}" height="${coverHeight}"><rect width="100%" height="100%" rx="6" fill="rgba(60,40,10,0.18)"/></svg>`
          ),
          left: 40,
          top: 50,
        },
      ])
      .png()
      .toBuffer();
    const shadow = await sharp(shadowShape).blur(16).png().toBuffer();

    await sharp({
      create: {
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        channels: 3,
        background: OG_BACKGROUND,
      },
    })
      .composite([
        { input: shadow, left: left - 40, top: top - 40 },
        { input: cover, left, top },
      ])
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(path.join(outDir, "og.jpg"));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  for (const file of fs.readdirSync(outDir)) {
    const { size } = fs.statSync(path.join(outDir, file));
    console.log(`✓ ${path.relative(ROOT, path.join(outDir, file))} (${(size / 1024).toFixed(1)} KB)`);
  }
}

main();
