import { test, expect, devices, type Locator, type Page } from "@playwright/test";

const PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.talkhangyul.ganada";
const APP_STORE_URL =
  "https://apps.apple.com/us/app/hangyul-ganada/id6804839101";

const MAC_UA = devices["Desktop Safari"].userAgent;

/**
 * describe 블록 안에서 test.use()에 넘길 수 있도록 기기 프리셋에서
 * 워커를 새로 띄우게 만드는 defaultBrowserType만 제거합니다.
 */
function emulate(name: keyof typeof devices) {
  const { defaultBrowserType: _browser, ...options } = devices[name];
  void _browser;
  return options;
}

/** 스토어 도메인으로의 실제 네트워크 요청을 막고 도착만 확인합니다. */
async function stubStores(page: Page) {
  await page.context().route(/https:\/\/(play\.google\.com|apps\.apple\.com)\/.*/, (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "<title>store</title>" })
  );
}

/** 어떤 흐름에서도 브라우저 기본 alert()가 뜨지 않아야 합니다. */
function failOnNativeDialog(page: Page) {
  page.on("dialog", async (dialog) => {
    await dialog.dismiss();
    throw new Error(`Unexpected native dialog: ${dialog.message()}`);
  });
}

const startNow = (page: Page) =>
  page.getByRole("button", { name: /start now/i }).first();
const startGanada = (page: Page) =>
  page.getByRole("button", { name: /start hangyul ganada/i });

/**
 * 스크롤 등장 애니메이션(framer-motion) 도중에 클릭하면 좌표가 어긋나
 * 클릭이 빗나갈 수 있으므로, 조상 요소가 모두 완전히 보일 때까지 기다린 뒤 클릭합니다.
 */
async function clickCta(button: Locator) {
  await button.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      button.evaluate((el) => {
        for (let node: HTMLElement | null = el as HTMLElement; node; node = node.parentElement) {
          if (getComputedStyle(node).opacity !== "1") return false;
        }
        return true;
      })
    )
    .toBe(true);
  await button.click();
}
const launchModal = (page: Page) => page.locator('[data-modal="launch"]');
const storeSelectModal = (page: Page) =>
  page.locator('[data-modal="storeSelect"]');
const launchCta = (page: Page) =>
  launchModal(page).getByRole("button", { name: /start with hangyul ganada/i });

test.describe("Main HANGYUL launch modal", () => {
  test.beforeEach(async ({ page }) => {
    failOnNativeDialog(page);
    await page.goto("/en");
  });

  test("Start Now opens the October 9 launch modal instead of alert()", async ({ page }) => {
    await startNow(page).click();

    const modal = launchModal(page);
    await expect(modal).toBeVisible();
    await expect(modal).toHaveAttribute("role", "dialog");
    await expect(modal).toContainText("Hangyul launches on Hangul Day");
    await expect(modal).toContainText("October 9, 2026");
    await expect(modal).not.toContainText("August 31");
    await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
  });

  test("Bottom CTA Start Now also opens the launch modal", async ({ page }) => {
    await clickCta(page.getByRole("button", { name: /start now/i }).nth(1));
    await expect(launchModal(page)).toBeVisible();
  });

  test("Close button closes the modal and restores focus", async ({ page }) => {
    const trigger = startNow(page);
    await trigger.click();
    await launchModal(page).getByRole("button", { name: /^close$/i }).click();

    await expect(launchModal(page)).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
  });

  test("Escape closes the modal", async ({ page }) => {
    await startNow(page).click();
    await expect(launchModal(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(launchModal(page)).toHaveCount(0);
  });

  test("Clicking the overlay closes the modal", async ({ page }) => {
    await startNow(page).click();
    await expect(launchModal(page)).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(launchModal(page)).toHaveCount(0);
  });

  test("Dedicated Ganada CTA never shows the launch modal", async ({ page }) => {
    await stubStores(page);
    await clickCta(startGanada(page));
    await expect(launchModal(page)).toHaveCount(0);
  });

  test("Korean copy", async ({ page }) => {
    await page.goto("/ko");
    await page.getByRole("button", { name: /지금 시작하기/ }).first().click();
    const modal = launchModal(page);
    await expect(modal).toContainText("한귤, 한글날에 만나요");
    await expect(modal).toContainText("2026년 10월 9일");
    await expect(modal.getByRole("button", { name: "한귤 가나다로 시작하기" })).toBeVisible();
  });
});

test.describe("Hangyul Ganada routing — desktop (Windows)", () => {
  test.use(emulate("Desktop Chrome"));

  test.beforeEach(async ({ page }) => {
    failOnNativeDialog(page);
    await stubStores(page);
    await page.goto("/en");
  });

  test("Ganada CTA opens the store chooser, Google Play opens Play in a new tab", async ({ page, context }) => {
    await clickCta(startGanada(page));

    const chooser = storeSelectModal(page);
    await expect(chooser).toBeVisible();
    await expect(chooser).toContainText("Choose your device");

    const popup = context.waitForEvent("page");
    await chooser.getByRole("button", { name: "Google Play" }).click();
    const newPage = await popup;
    await newPage.waitForLoadState();
    expect(newPage.url()).toBe(PLAY_URL);
    await expect(chooser).toHaveCount(0);
    expect(page.url()).toContain("/en");
  });

  test("App Store choice opens the App Store in a new tab", async ({ page, context }) => {
    await clickCta(startGanada(page));
    const popup = context.waitForEvent("page");
    await storeSelectModal(page).getByRole("button", { name: "App Store" }).click();
    expect((await popup).url()).toBe(APP_STORE_URL);
  });

  test("Start Now → launch modal → Ganada CTA → store chooser", async ({ page, context }) => {
    await startNow(page).click();
    await launchCta(page).click();

    await expect(launchModal(page)).toHaveCount(0);
    await expect(storeSelectModal(page)).toBeVisible();

    const popup = context.waitForEvent("page");
    await storeSelectModal(page).getByRole("button", { name: "Google Play" }).click();
    expect((await popup).url()).toBe(PLAY_URL);
  });

  test("Store chooser: Escape closes and focus returns to the original trigger", async ({ page }) => {
    const trigger = startNow(page);
    await trigger.click();
    await launchCta(page).click();
    await expect(storeSelectModal(page)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(storeSelectModal(page)).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("Store chooser ✕ button closes it", async ({ page }) => {
    await clickCta(startGanada(page));
    await storeSelectModal(page).getByRole("button", { name: /^close$/i }).click();
    await expect(storeSelectModal(page)).toHaveCount(0);
  });
});

test.describe("Hangyul Ganada routing — desktop (macOS, no touch)", () => {
  test.use(emulate("Desktop Safari"));

  test("A real Mac is not treated as an iPad", async ({ page }) => {
    failOnNativeDialog(page);
    await stubStores(page);
    await page.goto("/en");
    await clickCta(startGanada(page));
    await expect(storeSelectModal(page)).toBeVisible();
    expect(page.url()).toContain("/en");
  });
});

test.describe("Hangyul Ganada routing — Android", () => {
  test.use(emulate("Pixel 7"));

  test.beforeEach(async ({ page }) => {
    failOnNativeDialog(page);
    await stubStores(page);
    await page.goto("/en");
  });

  test("Ganada CTA goes straight to Google Play", async ({ page }) => {
    await clickCta(startGanada(page));
    await page.waitForURL(PLAY_URL);
    await expect(storeSelectModal(page)).toHaveCount(0);
  });

  test("Start Now → launch modal → Ganada CTA → Google Play", async ({ page }) => {
    await startNow(page).click();
    await expect(launchModal(page)).toBeVisible();
    await launchCta(page).click();
    await page.waitForURL(PLAY_URL);
  });
});

test.describe("Hangyul Ganada routing — iPhone", () => {
  test.use(emulate("iPhone 13"));

  test.beforeEach(async ({ page }) => {
    failOnNativeDialog(page);
    await stubStores(page);
    await page.goto("/en");
  });

  test("Ganada CTA goes straight to the App Store", async ({ page }) => {
    await clickCta(startGanada(page));
    await page.waitForURL(APP_STORE_URL);
  });

  test("Start Now → launch modal → Ganada CTA → App Store", async ({ page }) => {
    await startNow(page).click();
    await launchCta(page).click();
    await page.waitForURL(APP_STORE_URL);
  });
});

test.describe("Hangyul Ganada routing — iPad (legacy 'iPad' UA)", () => {
  test.use(emulate("iPad (gen 7)"));

  test("Ganada CTA goes straight to the App Store", async ({ page }) => {
    failOnNativeDialog(page);
    await stubStores(page);
    await page.goto("/en");
    await clickCta(startGanada(page));
    await page.waitForURL(APP_STORE_URL);
  });
});

test.describe("Hangyul Ganada routing — iPadOS 13+ (Macintosh UA + touch)", () => {
  // iPadOS Safari는 데스크톱 Safari와 같은 Macintosh UA를 보내지만 멀티터치를 지원합니다.
  test.use({ userAgent: MAC_UA, hasTouch: true, viewport: { width: 1024, height: 1366 } });

  test("Ganada CTA goes straight to the App Store", async ({ page }) => {
    failOnNativeDialog(page);
    await stubStores(page);
    await page.goto("/en");
    await clickCta(startGanada(page));
    await page.waitForURL(APP_STORE_URL);
  });

  test("Start Now → launch modal → Ganada CTA → App Store", async ({ page }) => {
    failOnNativeDialog(page);
    await stubStores(page);
    await page.goto("/en");
    await startNow(page).click();
    await launchCta(page).click();
    await page.waitForURL(APP_STORE_URL);
  });
});
