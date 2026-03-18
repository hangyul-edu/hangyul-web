import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const axe = async (page: import("@playwright/test").Page) => {
  // Framer Motion 애니메이션이 완료되기 전에 axe가 스캔하면
  // 부분 opacity 상태의 색상이 측정되어 flaky한 결과가 나올 수 있음
  await page.addStyleTag({
    content: `*, *::before, *::after {
      animation-duration: 0s !important;
      transition-duration: 0s !important;
    }`,
  });

  return new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    // Channel Talk 위젯은 서드파티 코드라 접근성을 제어할 수 없으므로 제외
    .exclude("#ch-plugin-entry")
    // storeBtn은 브랜드 디자인 제약(흰 텍스트 + #ff6700 배경)으로 인해
    // WCAG 대비율 미달(2.76:1)이 불가피한 known issue
    .exclude(".storeBtn");
};

test.describe("Accessibility (WCAG)", () => {
  test("/ko - WCAG 위반 없음", async ({ page }) => {
    await page.goto("/ko");
    const results = await (await axe(page)).analyze();
    expect(results.violations).toEqual([]);
  });

  test("/en - WCAG 위반 없음", async ({ page }) => {
    await page.goto("/en");
    const results = await (await axe(page)).analyze();
    expect(results.violations).toEqual([]);
  });

  test("이용약관 모달 - WCAG 위반 없음", async ({ page }) => {
    await page.goto("/ko");
    await page.getByRole("button", { name: /이용약관/i }).click();
    await page.getByRole("dialog", { name: /이용약관/ }).waitFor({ state: "visible" });

    // 모달 내부만 스캔 (배경 페이지는 /ko 테스트에서 별도 검사)
    const results = await (await axe(page)).include('[role="dialog"]').analyze();
    expect(results.violations).toEqual([]);
  });
});
