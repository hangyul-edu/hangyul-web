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
/** 우상단 ✕ 아이콘 버튼 (하단 "Close" 버튼과 접근성 이름이 같으므로 data 훅으로 구분) */
const launchCloseIcon = (page: Page) =>
  launchModal(page).locator('[data-modal-close="icon"]');
/** 하단 "Close" 버튼 */
const launchCloseButton = (page: Page) =>
  launchModal(page).locator("button:not([data-modal-close])", {
    hasText: /^close$/i,
  });
/** 기기 선택 카드: 접근성 이름은 "Download Hangyul Ganada for Android from Google Play" 형태입니다. */
const androidCard = (page: Page) =>
  storeSelectModal(page).getByRole("button", { name: /for android/i });
const appleCard = (page: Page) =>
  storeSelectModal(page).getByRole("button", { name: /for iphone from/i });

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
    await launchCloseButton(page).click();

    await expect(launchModal(page)).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
  });

  test("Top-right ✕ closes the modal and restores focus", async ({ page }) => {
    const trigger = startNow(page);
    await trigger.click();

    const icon = launchCloseIcon(page);
    await expect(icon).toBeVisible();
    await expect(icon).toHaveAccessibleName("Close");

    // 카드 우상단에 놓이고, 모서리에 붙지 않았는지 확인합니다.
    const modalBox = (await launchModal(page).boundingBox())!;
    const iconBox = (await icon.boundingBox())!;
    expect(iconBox.width).toBeGreaterThanOrEqual(40);
    expect(iconBox.height).toBeGreaterThanOrEqual(40);
    expect(iconBox.y - modalBox.y).toBeGreaterThanOrEqual(8);
    expect(modalBox.x + modalBox.width - (iconBox.x + iconBox.width)).toBeGreaterThanOrEqual(8);

    await icon.click();
    await expect(launchModal(page)).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
  });

  // 키보드 포커스 링은 데스크톱 관심사이므로 모바일 프로젝트에서는 건너뜁니다.
  test("Top-right ✕ is keyboard focusable with a visible focus ring", async ({
    page,
    isMobile,
  }) => {
    test.skip(!!isMobile, "keyboard-only behaviour");
    await startNow(page).click();

    // 포커스 트랩이 ✕에 포커스를 두므로, Tab 3번(✕ → Close → CTA → 순환)이면 다시 ✕입니다.
    // 프로그램 포커스로는 :focus-visible이 켜지지 않으므로 실제 키보드로 이동합니다.
    const icon = launchCloseIcon(page);
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(icon).toBeFocused();
    await expect(icon).toHaveCSS("outline-style", "solid");

    await page.keyboard.press("Enter");
    await expect(launchModal(page)).toHaveCount(0);
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
    await expect(launchCloseIcon(page)).toHaveAccessibleName("닫기");
    await expect(modal).toContainText("한귤, 한글날에 만나요");
    await expect(modal).toContainText("2026년 10월 9일");
    await expect(modal.getByRole("button", { name: "한귤 가나다로 시작하기" })).toBeVisible();
  });
});

test.describe("Launch modal action order — mobile", () => {
  test.use(emulate("iPhone 13"));

  /** 모바일에서는 주요 CTA(주황)가 보조 "닫기"(회색) 위에 와야 합니다. */
  async function expectCtaAboveClose(page: Page) {
    const cta = (await launchCta(page).boundingBox())!;
    const close = (await launchCloseButton(page).boundingBox())!;
    expect(cta.y + cta.height).toBeLessThanOrEqual(close.y + 1);
    // 세로로 쌓였는지(가로 나란히가 아닌지) 확인합니다.
    expect(Math.abs(cta.x - close.x)).toBeLessThan(1);
  }

  test("orange CTA is above the grey Close button", async ({ page }) => {
    failOnNativeDialog(page);
    await page.goto("/en");
    await startNow(page).click();
    await expect(launchModal(page)).toBeVisible();
    await expectCtaAboveClose(page);
  });

  test("both close mechanisms still work: grey Close", async ({ page }) => {
    failOnNativeDialog(page);
    await page.goto("/en");
    await startNow(page).click();
    await launchCloseButton(page).click();
    await expect(launchModal(page)).toHaveCount(0);
  });

  test("both close mechanisms still work: top-right ✕", async ({ page }) => {
    failOnNativeDialog(page);
    await page.goto("/en");
    await startNow(page).click();
    await launchCloseIcon(page).click();
    await expect(launchModal(page)).toHaveCount(0);
  });

  /** 번역이 긴 로케일에서도 순서가 유지되고 버튼이 카드를 넘지 않아야 합니다. */
  for (const [locale, trigger, cta] of [
    ["de", /Jetzt starten/, /Mit Hangyul Ganada starten/],
    ["vi", /Bắt đầu ngay/, /Bắt đầu với Hangyul Ganada/],
    ["hu", /Kezdd el most/, /Kezdés a Hangyul Ganadával/],
    ["th", /เริ่มเลย/, /เริ่มกับ Hangyul Ganada/],
  ] as const) {
    test(`${locale}: long CTA stays above Close and inside the card`, async ({ page }) => {
      failOnNativeDialog(page);
      await page.goto(`/${locale}`);
      await page.getByRole("button", { name: trigger }).first().click();

      const modal = launchModal(page);
      await expect(modal).toBeVisible();

      const ctaButton = modal.getByRole("button", { name: cta });
      const modalBox = (await modal.boundingBox())!;
      const ctaBox = (await ctaButton.boundingBox())!;
      // DOM 순서는 [회색 닫기, 주요 CTA]이므로 첫 번째가 회색 버튼입니다.
      const grey = (await modal
        .locator("button:not([data-modal-close])")
        .first()
        .boundingBox())!;

      // 주요 CTA가 DOM에서는 마지막이지만 화면에서는 회색 버튼 위에 있어야 합니다.
      expect(ctaBox.y + ctaBox.height).toBeLessThanOrEqual(grey.y + 1);
      expect(ctaBox.x).toBeGreaterThanOrEqual(modalBox.x - 0.5);
      expect(ctaBox.x + ctaBox.width).toBeLessThanOrEqual(
        modalBox.x + modalBox.width + 0.5
      );
      expect(
        await ctaButton.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)
      ).toBe(true);
      // 카드가 뷰포트를 넘지 않아야 합니다.
      const viewport = page.viewportSize()!;
      expect(modalBox.x).toBeGreaterThanOrEqual(-0.5);
      expect(modalBox.x + modalBox.width).toBeLessThanOrEqual(viewport.width + 0.5);
    });
  }
});

test.describe("Launch modal action order — desktop", () => {
  test.use(emulate("Desktop Chrome"));

  test("desktop keeps the two buttons side by side, Close first", async ({ page }) => {
    failOnNativeDialog(page);
    await page.goto("/en");
    await startNow(page).click();

    const cta = (await launchCta(page).boundingBox())!;
    const close = (await launchCloseButton(page).boundingBox())!;
    expect(Math.abs(cta.y - close.y)).toBeLessThan(1);
    expect(close.x).toBeLessThan(cta.x);
  });
});

test.describe("Hangyul Ganada routing — desktop (Windows)", () => {
  test.use(emulate("Desktop Chrome"));

  test.beforeEach(async ({ page }) => {
    failOnNativeDialog(page);
    await stubStores(page);
    await page.goto("/en");
  });

  test("Ganada CTA opens the device chooser, Android card opens Google Play in a new tab", async ({ page, context }) => {
    await clickCta(startGanada(page));

    const chooser = storeSelectModal(page);
    await expect(chooser).toBeVisible();
    await expect(chooser).toContainText("Which device do you use?");
    await expect(chooser).toContainText("Choose your device to download Hangyul Ganada.");

    const popup = context.waitForEvent("page");
    await androidCard(page).click();
    const newPage = await popup;
    await newPage.waitForLoadState();
    expect(newPage.url()).toBe(PLAY_URL);
    await expect(chooser).toHaveCount(0);
    expect(page.url()).toContain("/en");
  });

  test("iPhone card opens the App Store in a new tab", async ({ page, context }) => {
    await clickCta(startGanada(page));
    const popup = context.waitForEvent("page");
    await appleCard(page).click();
    expect((await popup).url()).toBe(APP_STORE_URL);
  });

  test("Device is the primary label and the store is secondary on each card", async ({ page }) => {
    await clickCta(startGanada(page));

    const android = androidCard(page);
    await expect(android).toHaveAccessibleName("Download Hangyul Ganada for Android from Google Play");
    await expect(android.locator("span").filter({ hasText: /^Android$/ })).toBeVisible();
    await expect(android).toContainText("Download on Google Play");

    const apple = appleCard(page);
    await expect(apple).toHaveAccessibleName("Download Hangyul Ganada for iPhone from the App Store");
    await expect(apple.locator("span").filter({ hasText: /^iPhone$/ })).toBeVisible();
    await expect(apple).toContainText("Download on the App Store");

    // 스토어 이름만 단독 버튼으로 존재하지 않아야 합니다 (기기 카드 전체가 버튼).
    await expect(storeSelectModal(page).getByRole("button", { name: /^google play$/i })).toHaveCount(0);
    await expect(storeSelectModal(page).getByRole("button", { name: /^app store$/i })).toHaveCount(0);
    await expect(storeSelectModal(page).getByRole("button")).toHaveCount(3); // ✕ + 2 cards
  });

  test("Clicking the secondary store caption inside a card also opens the store", async ({ page, context }) => {
    await clickCta(startGanada(page));
    const popup = context.waitForEvent("page");
    await storeSelectModal(page).getByText("Download on the App Store").click();
    expect((await popup).url()).toBe(APP_STORE_URL);
  });

  test("Cards are keyboard-operable: Tab to iPhone and press Enter", async ({ page, context }) => {
    await clickCta(startGanada(page));
    await expect(storeSelectModal(page)).toBeVisible();

    // 포커스 트랩이 첫 요소(✕)에 포커스를 두므로 Tab 두 번이면 두 번째 카드입니다.
    await page.keyboard.press("Tab");
    await expect(androidCard(page)).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(appleCard(page)).toBeFocused();

    const popup = context.waitForEvent("page");
    await page.keyboard.press("Enter");
    expect((await popup).url()).toBe(APP_STORE_URL);
  });

  test("Cards do not overflow the modal in a long-translation locale", async ({ page }) => {
    await page.goto("/hu");
    await clickCta(page.getByRole("button", { name: "Hangyul Ganada indítása" }));
    const chooser = storeSelectModal(page);
    await expect(chooser).toBeVisible();

    const modalBox = await chooser.boundingBox();
    for (const card of await chooser.locator("button[data-platform]").all()) {
      const box = await card.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(modalBox!.x);
      expect(box!.x + box!.width).toBeLessThanOrEqual(modalBox!.x + modalBox!.width + 0.5);
      expect(await card.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    }
  });

  test("Korean copy: device first, store second", async ({ page, context }) => {
    await page.goto("/ko");
    await clickCta(page.getByRole("button", { name: /한귤 가나다 시작하기|한귤 가나다로 시작하기/ }).first());
    const chooser = storeSelectModal(page);
    await expect(chooser).toContainText("어떤 기기에서 시작할까요?");
    await expect(chooser).toContainText("한귤 가나다를 사용할 기기를 선택해주세요.");

    const android = chooser.getByRole("button", { name: "Android용 한귤 가나다를 Google Play에서 다운로드" });
    await expect(android).toContainText("Android");
    await expect(android).toContainText("Google Play에서 다운로드");

    const apple = chooser.getByRole("button", { name: "iPhone용 한귤 가나다를 App Store에서 다운로드" });
    await expect(apple).toContainText("iPhone");
    await expect(apple).toContainText("App Store에서 다운로드");

    const popup = context.waitForEvent("page");
    await android.click();
    expect((await popup).url()).toBe(PLAY_URL);
  });

  test("Start Now → launch modal → Ganada CTA → store chooser", async ({ page, context }) => {
    await startNow(page).click();
    await launchCta(page).click();

    await expect(launchModal(page)).toHaveCount(0);
    await expect(storeSelectModal(page)).toBeVisible();

    const popup = context.waitForEvent("page");
    await androidCard(page).click();
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
