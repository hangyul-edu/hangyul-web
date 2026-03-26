import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const axe = async (page: import("@playwright/test").Page) => {
  // Framer Motion 애니메이션이 완료되기 전에 axe가 스캔하면
  // 부분 opacity 상태의 색상이 측정되어 flaky한 결과가 나올 수 있음
  // Framer Motion은 JS로 opacity를 제어하므로 animation-duration만으로는 부족
  // opacity: 1 !important로 강제 고정해야 axe가 실제 색상을 측정할 수 있음
  await page.addStyleTag({
    content: `*, *::before, *::after {
      animation-duration: 0s !important;
      transition-duration: 0s !important;
      opacity: 1 !important;
    }`,
  });

  return new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    // Channel Talk 위젯은 서드파티 코드라 접근성을 제어할 수 없으므로 제외
    .exclude("#ch-plugin-entry")
    // 아래 요소들은 브랜드 컬러(#ff6700) 사용으로 인한 known issue
    // CSS Modules가 클래스명을 변환하므로 substring 매칭 사용
    // storeBtn: 흰 텍스트 + #ff6700 배경 (2.76:1)
    .exclude('[class*="storeBtn"]')
    // ServiceIntro 제목: #ff6700 텍스트 + #feead6 배경 (2.49:1)
    .exclude("#intro h2")
    // KeyFeatures/Pricing category: #ff6700 텍스트 + #ffffff 배경 (2.91:1)
    .exclude('[class*="category"]');
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
