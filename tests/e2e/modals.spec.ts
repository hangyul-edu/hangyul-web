import { test, expect } from "@playwright/test";

test.describe("Legal Modals", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ko");
  });

  test("이용약관 버튼 클릭 시 모달 열림", async ({ page }) => {
    await page.getByRole("button", { name: /이용약관/i }).click();
    await expect(page.getByRole("dialog", { name: /이용약관/ })).toBeVisible();
  });

  test("이용약관 버튼 클릭 시 legal 파라미터 반영", async ({ page }) => {
    await page.getByRole("button", { name: /이용약관/i }).click();
    await expect(page).toHaveURL(/\/ko\?legal=terms$/);
  });

  test("개인정보처리방침 버튼 클릭 시 모달 열림", async ({ page }) => {
    await page.getByRole("button", { name: /개인정보/i }).click();
    await expect(page.getByRole("dialog", { name: /개인정보/ })).toBeVisible();
  });

  test("개인정보취급방침 URL 접속 시 모달 자동 열림", async ({ page }) => {
    await page.goto("/ko?legal=privacy");
    await expect(page.getByRole("dialog", { name: /개인정보/ })).toBeVisible();
  });

  test("이용약관 URL 접속 시 모달 자동 열림", async ({ page }) => {
    await page.goto("/ko?legal=terms");
    await expect(page.getByRole("dialog", { name: /이용약관/ })).toBeVisible();
  });

  test("잘못된 legal 파라미터는 모달을 열지 않음", async ({ page }) => {
    await page.goto("/ko?legal=unknown");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("모달 열릴 때 배경 스크롤 잠금", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.getByRole("button", { name: /이용약관/i }).click();

    const overflow = await page.evaluate(
      () => document.documentElement.style.overflow
    );
    expect(overflow).toBe("hidden");
  });

  test("닫기 버튼 클릭 시 모달 닫힘", async ({ page }) => {
    await page.getByRole("button", { name: /이용약관/i }).click();
    const modal = page.getByRole("dialog", { name: /이용약관/ });
    await expect(modal).toBeVisible();

    await page.getByRole("button", { name: /닫기/i }).click();
    await expect(modal).not.toBeVisible();
  });

  test("닫기 버튼 클릭 시 legal 파라미터 제거", async ({ page }) => {
    await page.goto("/ko?legal=terms");
    await page.getByRole("button", { name: /닫기/i }).click();
    await expect(page).toHaveURL(/\/ko$/);
  });

  test("모달 닫힌 후 배경 스크롤 복원", async ({ page }) => {
    await page.getByRole("button", { name: /이용약관/i }).click();
    await page.getByRole("button", { name: /닫기/i }).click();

    const overflow = await page.evaluate(
      () => document.documentElement.style.overflow
    );
    expect(overflow).not.toBe("hidden");
  });

  test("모달 외부 클릭 시 모달 닫힘", async ({ page }) => {
    await page.getByRole("button", { name: /이용약관/i }).click();
    const modal = page.getByRole("dialog", { name: /이용약관/ });
    await expect(modal).toBeVisible();

    // 뷰포트 좌상단(모달 외부 배경)을 클릭
    await page.mouse.click(5, 5);
    await expect(modal).not.toBeVisible();
  });
});

test.describe("Legal Modals - English", () => {
  test("영문 이용약관 모달 콘텐츠 표시", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("button", { name: /terms/i }).click();
    const modal = page.getByRole("dialog", { name: /terms/i });
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Terms");
  });

  test("Privacy Policy URL 접속 시 모달 자동 열림", async ({ page }) => {
    await page.goto("/en?legal=privacy");
    await expect(page.getByRole("dialog", { name: /privacy/i })).toBeVisible();
  });

  test("Terms of Service URL 접속 시 모달 자동 열림", async ({ page }) => {
    await page.goto("/en?legal=terms");
    await expect(page.getByRole("dialog", { name: /terms/i })).toBeVisible();
  });
});
