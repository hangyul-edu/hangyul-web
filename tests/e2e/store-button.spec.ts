import { test, expect } from "@playwright/test";

test.describe("Store Button", () => {
  test("한국어 - 스토어 버튼 클릭 시 런칭 예정 알림 표시", async ({ page }) => {
    await page.goto("/ko");

    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toContain("2026년 6월 29일");
      await dialog.accept();
    });

    await page
      .getByRole("button", { name: /지금 시작하기/i })
      .first()
      .click();
  });

  test("영어 - 스토어 버튼 클릭 시 런칭 예정 알림 표시", async ({ page }) => {
    await page.goto("/en");

    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toContain("June 29, 2026");
      await dialog.accept();
    });

    await page
      .getByRole("button", { name: /start now/i })
      .first()
      .click();
  });
});
