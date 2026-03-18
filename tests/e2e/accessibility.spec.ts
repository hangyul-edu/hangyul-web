import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Channel Talk 위젯은 서드파티 코드라 접근성을 제어할 수 없으므로 제외
const axe = (page: import("@playwright/test").Page) =>
  new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .exclude("#ch-plugin-entry");

test.describe("Accessibility (WCAG)", () => {
  test("/ko - WCAG 위반 없음", async ({ page }) => {
    await page.goto("/ko");
    const results = await axe(page).analyze();
    expect(results.violations).toEqual([]);
  });

  test("/en - WCAG 위반 없음", async ({ page }) => {
    await page.goto("/en");
    const results = await axe(page).analyze();
    expect(results.violations).toEqual([]);
  });

  test("이용약관 모달 - WCAG 위반 없음", async ({ page }) => {
    await page.goto("/ko");
    await page.getByRole("button", { name: /이용약관/i }).click();
    await page.getByRole("dialog", { name: /이용약관/ }).waitFor({ state: "visible" });

    // 모달 내부만 스캔 (배경 페이지는 /ko 테스트에서 별도 검사)
    const results = await axe(page).include('[role="dialog"]').analyze();
    expect(results.violations).toEqual([]);
  });
});
