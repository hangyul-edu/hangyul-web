import { readFile } from "fs/promises";
import path from "path";

import {
  DOWNLOAD_RESOURCE_SLUGS,
  getDownloadResource,
} from "@/content/downloadResources";

/**
 * /download/files/<slug>.pdf — 무료 학습 자료 PDF
 *
 * 등록된 자료마다 빌드 시점에 정적으로 생성되어 CDN에서 바로 내려갑니다.
 * Content-Disposition: attachment 로 브라우저가 지정한 파일 이름으로 저장하게 하고,
 * 원본 경로(src/assets/downloads/…)는 사용자에게 노출하지 않습니다.
 * 등록되지 않은 파일 이름은 404입니다.
 */

export const dynamic = "force-static";
export const dynamicParams = false;

const DOWNLOADS_DIR = path.join(process.cwd(), "src", "assets", "downloads");

export function generateStaticParams() {
  return DOWNLOAD_RESOURCE_SLUGS.map((slug) => ({ file: `${slug}.pdf` }));
}

/** RFC 6266: ASCII 대체 이름 + UTF-8 이름을 함께 넣습니다. */
function contentDisposition(fileName: string): string {
  const ascii = fileName.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const resource = file.endsWith(".pdf")
    ? getDownloadResource(file.slice(0, -".pdf".length))
    : null;

  if (!resource) {
    return new Response("Not found", { status: 404 });
  }

  const pdf = await readFile(path.join(DOWNLOADS_DIR, resource.file));

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(pdf.byteLength),
      "Content-Disposition": contentDisposition(resource.downloadFileName),
      // 같은 주소로 수정본을 다시 올릴 수 있으므로 브라우저 캐시는 짧게 둡니다.
      "Cache-Control": "public, max-age=3600",
      "X-Robots-Tag": "noindex",
    },
  });
}
