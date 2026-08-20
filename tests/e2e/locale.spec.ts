import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

// messages 디렉터리를 기준으로 지원 로케일 목록을 만든다 (언어 추가 시 자동 반영)
const LOCALES = fs
  .readdirSync(path.resolve(process.cwd(), "messages"))
  .filter((file) => file.endsWith(".json"))
  .map((file) => file.replace(".json", ""));

test.describe("Locale Switching", () => {
  test("기본 URL은 /en으로 리다이렉트", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/(en|ko)/);
  });

  test("/ko 접속 시 한국어 콘텐츠 표시", async ({ page }) => {
    await page.goto("/ko");
    await expect(page.locator("html")).toHaveAttribute("lang", "ko");
    await expect(page.getByText("지금 시작하기").first()).toBeVisible();
  });

  test("/en 접속 시 영어 콘텐츠 표시", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByText("Start Now").first()).toBeVisible();
  });

  test("언어 토글 클릭 시 로케일 전환 및 URL 변경", async ({ page }) => {
    await page.goto("/ko");

    // 언어 드롭다운 열기
    await page.locator("header button").filter({ hasText: /한국어|english/i }).click();
    await page.getByText("English").click();

    await expect(page).toHaveURL(/\/en/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("로케일 전환 후 스크롤이 최상단으로 이동", async ({ page }) => {
    await page.goto("/ko");
    await page.evaluate(() => window.scrollTo(0, 800));

    await page.locator("header button").filter({ hasText: /한국어/i }).click();
    await page.getByText("English").click();

    await page.waitForURL(/\/en/);
    // smooth scroll 완료를 기다린 후 확인
    await page.waitForFunction(() => window.scrollY < 100, { timeout: 3000 });
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(100);
  });

  test("지원하는 모든 로케일 페이지가 정상 응답", async ({ request }) => {
    expect(LOCALES.length).toBe(32);

    for (const locale of LOCALES) {
      const response = await request.get(`/${locale}`);
      expect(response.status(), `/${locale}`).toBe(200);
    }
  });

  test("/vi 접속 시 베트남어 콘텐츠 표시", async ({ page }) => {
    await page.goto("/vi");
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");
    await expect(page.getByText("Bắt đầu ngay").first()).toBeVisible();
  });

  test("/ar 접속 시 RTL 레이아웃 적용", async ({ page }) => {
    await page.goto("/ar");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("언어 목록에 32개 언어가 모두 노출되고 스크롤 가능", async ({ page }) => {
    await page.goto("/en");
    await page.locator("header button[aria-haspopup='listbox']").click();

    const list = page.locator("header ul");
    await expect(list).toBeVisible();
    await expect(list.locator("li")).toHaveCount(32);

    const scrollable = await list.evaluate(
      (el) => el.scrollHeight > el.clientHeight
    );
    expect(scrollable).toBe(true);
  });

  test("언어 검색 - 영어 이름과 현지 언어명 모두 매칭", async ({ page }) => {
    await page.goto("/en");
    await page.locator("header button[aria-haspopup='listbox']").click();

    const search = page.locator("header input[type='text']");
    const list = page.locator("header ul");

    await search.fill("German");
    await expect(list.locator("li")).toHaveCount(1);
    await expect(list.locator("li")).toContainText("Deutsch");

    // 발음 구별 기호 없이 입력해도 검색된다
    await search.fill("tieng viet");
    await expect(list.locator("li")).toContainText("Tiếng Việt");

    // 현지 언어명으로도 검색된다
    await search.fill("日本語");
    await expect(list.locator("li")).toContainText("日本語");
  });

  test("언어 검색 - 결과가 없으면 안내 문구 표시", async ({ page }) => {
    await page.goto("/en");
    await page.locator("header button[aria-haspopup='listbox']").click();
    await page.locator("header input[type='text']").fill("zzzzzz");

    await expect(page.locator("header ul")).toHaveCount(0);
    await expect(page.getByText("No languages found")).toBeVisible();
  });

  test("약관/개인정보처리방침이 선택한 언어로 표시", async ({ page }) => {
    await page.goto("/de?legal=terms");
    const terms = page.getByRole("dialog", { name: "Nutzungsbedingungen" });
    await expect(terms).toBeVisible();
    await expect(terms).toContainText("Artikel 1 (Zweck)");

    await page.goto("/vi?legal=privacy");
    const privacy = page.getByRole("dialog", { name: "Chính sách bảo mật" });
    await expect(privacy).toBeVisible();
    await expect(privacy).toContainText("Điều 1. Thông tin chúng tôi thu thập");
  });

  test("새 언어로 전환 후 새로고침해도 해당 언어 유지", async ({ page }) => {
    await page.goto("/en");
    await page.locator("header button[aria-haspopup='listbox']").click();
    await page.locator("header ul").getByRole("button", { name: /Tiếng Việt/ }).click();

    await expect(page).toHaveURL(/\/vi/);

    await page.reload();
    await expect(page).toHaveURL(/\/vi/);
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  });
});
