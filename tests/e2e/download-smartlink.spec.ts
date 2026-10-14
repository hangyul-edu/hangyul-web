import { test, expect, devices, type Page } from "@playwright/test";

/**
 * /download?app=ganada 스마트 다운로드 링크 (OneLink)
 *
 * SNS·광고·QR에 쓰는 단일 링크로, 프록시(src/lib/downloadSmartLink.ts)가 페이지를
 * 렌더링하기 전에 요청 User-Agent를 보고 Android는 Google Play,
 * iOS는 App Store로 302를 내보냅니다.
 * 데스크톱·봇·판별 불가 기기는 홈페이지의 기존 기기 선택 모달로 보냅니다.
 *
 * 이 파일은 UA 문자열을 흉내 낸 요청/브라우저 에뮬레이션 기반 검증입니다.
 * (실제 iPhone·Android 단말이나 실제 Instagram 앱에서의 동작은 포함하지 않습니다.)
 */

const SMART_LINK = "/download?app=ganada";

const PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.talkhangyul.ganada";
const APP_STORE_URL =
  "https://apps.apple.com/us/app/hangyul-ganada/id6804839101";

/** iOS: Safari·Chrome과 Instagram/Facebook/TikTok 인앱 브라우저 */
const IOS_UA = {
  safari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  chrome:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.6422.80 Mobile/15E148 Safari/604.1",
  instagram:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 334.0.0.27.103 (iPhone14,3; iOS 17_5; en_US; en; scale=3.00; 1284x2778; 609240913)",
  facebook:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBDV/iPhone15,2;FBMD/iPhone;FBSN/iOS;FBSV/17.5;FBSS/3;FBID/phone;FBLC/en_US;FBOP/5]",
  tiktok:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly_34.5.0 JsSdk/2.0 NetType/WIFI Channel/App Store ByteLocale/en Region/US WKWebView/1",
  kakaotalk:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 10.4.5",
  // iPad는 제품 문구에서 지원을 말하지 않지만, 링크를 눌렀을 때 막다른 화면이 되지 않도록 App Store로 보냅니다.
  ipad:
    "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
} as const;

/** Android: 일반 브라우저와 인앱 브라우저·WebView */
const ANDROID_UA = {
  chrome:
    "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
  samsungInternet:
    "Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36",
  instagram:
    "Mozilla/5.0 (Linux; Android 13; SM-A536B Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.179 Mobile Safari/537.36 Instagram 334.0.0.42.95 Android (33/13; 450dpi; 1080x2176; samsung; SM-A536B; a53x; s5e8825; en_GB; 609240913)",
  facebook:
    "Mozilla/5.0 (Linux; Android 14; SM-S918B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0.6422.112 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/465.0.0.42.84;]",
  tiktok:
    "Mozilla/5.0 (Linux; Android 13; Pixel 7 Build/TQ3A.230805.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 trill_2023005030 JsSdk/1.0 NetType/WIFI Channel/googleplay AppName/musical_ly",
  kakaotalk:
    "Mozilla/5.0 (Linux; Android 13; SM-S901N Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 KAKAOTALK 10.4.5",
  webview:
    "Mozilla/5.0 (Linux; Android 11; moto g power (2022) Build/RRMS31.Q1-33-28-2; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/107.0.5304.91 Mobile Safari/537.36",
} as const;

const DESKTOP_UA = {
  windowsChrome:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  macSafari: devices["Desktop Safari"].userAgent,
  macChrome: devices["Desktop Chrome"].userAgent,
  linuxFirefox:
    "Mozilla/5.0 (X11; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0",
  chromeOS:
    "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
} as const;

const CRAWLER_UA = {
  googlebotDesktop:
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/125.0.0.0 Safari/537.36",
  // 스마트폰 Googlebot UA에는 "Android"가 들어 있지만 스토어로 보내면 안 됩니다.
  googlebotSmartphone:
    "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  facebookScraper:
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
  naverYeti: "Mozilla/5.0 (compatible; Yeti/1.1; +https://naver.me/spd)",
} as const;

/** 리다이렉트를 따라가지 않고 응답 자체(상태·Location·캐시 헤더)를 확인합니다. */
function rawResponse(page: Page, url: string, userAgent: string) {
  return page.request.get(url, {
    headers: { "user-agent": userAgent },
    maxRedirects: 0,
  });
}

test.describe("/download?app=ganada — iOS gets a server-side 302 to the App Store", () => {
  for (const [name, ua] of Object.entries(IOS_UA)) {
    test(`iOS (${name})`, async ({ page }) => {
      const response = await rawResponse(page, SMART_LINK, ua);

      expect(response.status()).toBe(302);
      expect(response.headers()["location"]).toBe(APP_STORE_URL);
    });
  }
});

test.describe("/download?app=ganada — Android gets a server-side 302 to Google Play", () => {
  for (const [name, ua] of Object.entries(ANDROID_UA)) {
    test(`Android (${name})`, async ({ page }) => {
      const response = await rawResponse(page, SMART_LINK, ua);

      expect(response.status()).toBe(302);
      expect(response.headers()["location"]).toBe(PLAY_URL);
    });
  }
});

test.describe("/download?app=ganada — redirect and cache safety", () => {
  test("store redirects are temporary (302), never permanent", async ({ page }) => {
    for (const ua of [IOS_UA.safari, ANDROID_UA.chrome]) {
      const response = await rawResponse(page, SMART_LINK, ua);

      expect(response.status()).toBe(302);
      expect(response.status()).not.toBe(301);
      expect(response.status()).not.toBe(308);
    }
  });

  test("device-dependent responses are never cached (no-store + Vary)", async ({ page }) => {
    for (const ua of [IOS_UA.instagram, ANDROID_UA.instagram, DESKTOP_UA.windowsChrome]) {
      const headers = (await rawResponse(page, SMART_LINK, ua)).headers();

      expect(headers["cache-control"]).toContain("no-store");
      expect(headers["cache-control"]).toContain("private");
      expect(headers["vary"]?.toLowerCase()).toContain("user-agent");
    }
  });

  test("an Android response is never reused for an iPhone on the same URL", async ({ page }) => {
    // 같은 URL을 번갈아 호출해도 매번 요청 UA에 맞는 목적지가 나와야 합니다.
    for (let round = 0; round < 2; round++) {
      expect((await rawResponse(page, SMART_LINK, ANDROID_UA.chrome)).headers()["location"]).toBe(PLAY_URL);
      expect((await rawResponse(page, SMART_LINK, IOS_UA.safari)).headers()["location"]).toBe(APP_STORE_URL);
    }
  });

  test("store targets are absolute URLs, never local routes", async ({ page }) => {
    expect(
      (await rawResponse(page, SMART_LINK, IOS_UA.tiktok)).headers()["location"]
    ).toMatch(/^https:\/\/apps\.apple\.com\//);
    expect(
      (await rawResponse(page, SMART_LINK, ANDROID_UA.tiktok)).headers()["location"]
    ).toMatch(/^https:\/\/play\.google\.com\//);
  });

  test("the smart link never redirects back to itself", async ({ page }) => {
    for (const ua of [IOS_UA.safari, ANDROID_UA.chrome, DESKTOP_UA.windowsChrome, ""]) {
      const location = (await rawResponse(page, SMART_LINK, ua)).headers()["location"];

      expect(location).not.toContain("/download");
    }
  });
});

test.describe("/download?app=ganada — desktop and unknown devices", () => {
  for (const [name, ua] of Object.entries(DESKTOP_UA)) {
    test(`desktop (${name}) goes to the homepage device chooser, not a store`, async ({ page }) => {
      const response = await rawResponse(page, SMART_LINK, ua);

      expect(response.status()).toBe(302);
      expect(response.headers()["location"]).toBe("/?download=ganada");
    });
  }

  test("an empty User-Agent goes to the device chooser", async ({ page }) => {
    const response = await rawResponse(page, SMART_LINK, "");

    expect(response.headers()["location"]).toBe("/?download=ganada");
  });

  test("an unrecognised User-Agent goes to the device chooser", async ({ page }) => {
    const response = await rawResponse(page, SMART_LINK, "SomeUnknownClient/1.0");

    expect(response.headers()["location"]).toBe("/?download=ganada");
  });

  for (const [name, ua] of Object.entries(CRAWLER_UA)) {
    test(`crawler (${name}) is not sent to a store`, async ({ page }) => {
      const response = await rawResponse(page, SMART_LINK, ua);

      expect(response.headers()["location"]).toBe("/?download=ganada");
    });
  }
});

test.describe("/download — marketing query parameters", () => {
  test("utm parameters do not break iOS detection", async ({ page }) => {
    const response = await rawResponse(
      page,
      "/download?app=ganada&utm_source=instagram&utm_medium=social&utm_campaign=launch",
      IOS_UA.instagram
    );

    expect(response.status()).toBe(302);
    // 스토어가 모르는 파라미터를 거부할 수 있으므로 utm_*은 스토어 주소에 붙이지 않습니다.
    expect(response.headers()["location"]).toBe(APP_STORE_URL);
  });

  test("utm parameters do not break Android detection", async ({ page }) => {
    const response = await rawResponse(
      page,
      "/download?app=ganada&utm_source=tiktok&utm_medium=social",
      ANDROID_UA.instagram
    );

    expect(response.headers()["location"]).toBe(PLAY_URL);
  });

  test("app can appear after other parameters", async ({ page }) => {
    const response = await rawResponse(
      page,
      "/download?utm_source=instagram&app=ganada",
      IOS_UA.safari
    );

    expect(response.headers()["location"]).toBe(APP_STORE_URL);
  });

  test("utm parameters are kept on the desktop fallback for attribution", async ({ page }) => {
    const response = await rawResponse(
      page,
      "/download?app=ganada&utm_source=instagram&utm_medium=social",
      DESKTOP_UA.windowsChrome
    );

    expect(response.headers()["location"]).toBe(
      "/?utm_source=instagram&utm_medium=social&download=ganada"
    );
  });

  test("a mixed-case app value still works", async ({ page }) => {
    const response = await rawResponse(page, "/download?app=Ganada", IOS_UA.safari);

    expect(response.headers()["location"]).toBe(APP_STORE_URL);
  });
});

test.describe("/download — graceful handling of other requests", () => {
  test("/download without an app parameter goes to the homepage", async ({ page }) => {
    const response = await rawResponse(page, "/download", ANDROID_UA.chrome);

    expect(response.status()).toBe(302);
    expect(response.headers()["location"]).toBe("/");
  });

  test("an unknown app value does not guess a store", async ({ page }) => {
    const response = await rawResponse(page, "/download?app=hangyul", IOS_UA.safari);

    expect(response.status()).toBe(302);
    expect(response.headers()["location"]).toBe("/");
  });

  test("/download/ keeps working through the existing trailing-slash policy", async ({ page }) => {
    const normalised = await rawResponse(page, "/download/?app=ganada", IOS_UA.safari);
    expect(normalised.status()).toBe(308);
    expect(normalised.headers()["location"]).toBe("/download?app=ganada");

    const response = await rawResponse(
      page,
      normalised.headers()["location"],
      IOS_UA.safari
    );
    expect(response.status()).toBe(302);
    expect(response.headers()["location"]).toBe(APP_STORE_URL);
  });

  test("locale homepages are untouched by the smart link", async ({ page }) => {
    for (const path of ["/en", "/ko"]) {
      const response = await rawResponse(page, path, ANDROID_UA.chrome);
      expect(response.status()).toBe(200);
    }
  });
});

/** 스토어 도메인으로의 실제 네트워크 요청을 막고 도착만 확인합니다. */
async function stubStores(page: Page) {
  await page.context().route(
    /https:\/\/(play\.google\.com|apps\.apple\.com)\/.*/,
    (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<title>store</title>",
      })
  );
}

const storeSelectModal = (page: Page) => page.locator('[data-modal="storeSelect"]');

test.describe("/download?app=ganada — desktop lands on the existing device chooser", () => {
  test.use({ userAgent: DESKTOP_UA.windowsChrome });

  test.beforeEach(async ({ page }) => {
    await stubStores(page);
  });

  test("the homepage opens the existing Ganada chooser automatically", async ({ page }) => {
    await page.goto(SMART_LINK);

    // 프록시 302 → next-intl 로케일 리다이렉트 → 홈페이지
    await expect(page).toHaveURL(/\/en\?download=ganada/);

    const chooser = storeSelectModal(page);
    await expect(chooser).toBeVisible();
    await expect(chooser).toContainText("Which device do you use?");
    await expect(chooser).toContainText("Download on Google Play");
    await expect(chooser).toContainText("Download on the App Store");
    // 기존 홈페이지가 그대로 보이므로 별도의 다운로드 전용 페이지는 만들지 않았습니다.
    await expect(page.locator("header")).toBeVisible();
  });

  test("choosing iPhone opens the App Store", async ({ page, context }) => {
    await page.goto(SMART_LINK);
    await expect(storeSelectModal(page)).toBeVisible();

    const popup = context.waitForEvent("page");
    await storeSelectModal(page)
      .getByRole("button", { name: /for iphone from the app store/i })
      .click();

    expect((await popup).url()).toBe(APP_STORE_URL);
  });

  test("choosing Android opens Google Play", async ({ page, context }) => {
    await page.goto(SMART_LINK);
    await expect(storeSelectModal(page)).toBeVisible();

    const popup = context.waitForEvent("page");
    await storeSelectModal(page)
      .getByRole("button", { name: /for android from google play/i })
      .click();

    expect((await popup).url()).toBe(PLAY_URL);
  });

  test("the chooser can be dismissed and leaves a usable homepage", async ({ page }) => {
    await page.goto(SMART_LINK);
    await expect(storeSelectModal(page)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(storeSelectModal(page)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /why hangyul/i })).toBeVisible();
  });

  test("utm parameters survive the redirect to the homepage", async ({ page }) => {
    await page.goto("/download?app=ganada&utm_source=instagram&utm_medium=social");

    await expect(page).toHaveURL(/utm_source=instagram/);
    await expect(page).toHaveURL(/utm_medium=social/);
    await expect(storeSelectModal(page)).toBeVisible();
  });

  test("the homepage Ganada CTA still works on its own", async ({ page }) => {
    await page.goto("/en");

    const chooser = storeSelectModal(page);
    await expect(chooser).toHaveCount(0);

    const cta = page.getByRole("button", { name: /start hangyul ganada/i });
    await cta.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        cta.evaluate((el) => {
          for (let node: HTMLElement | null = el as HTMLElement; node; node = node.parentElement) {
            if (getComputedStyle(node).opacity !== "1") return false;
          }
          return true;
        })
      )
      .toBe(true);
    await cta.click();

    await expect(chooser).toBeVisible();
  });
});

test.describe("/download?app=ganada — locale negotiation still applies", () => {
  // 기존 next-intl 로케일 협상이 그대로 동작해야 합니다 (프록시가 "/"로 보내므로).
  test.use({ userAgent: DESKTOP_UA.windowsChrome, locale: "ko-KR" });

  test("a Korean visitor gets the Korean homepage chooser", async ({ page }) => {
    await stubStores(page);
    await page.goto(SMART_LINK);

    await expect(page).toHaveURL(/\/ko\?download=ganada/);
    await expect(storeSelectModal(page)).toContainText("어떤 기기에서 시작할까요?");
  });
});

test.describe("/download?app=ganada — iPadOS 13+ desktop mode (Macintosh UA + touch)", () => {
  /*
   * iPadOS Safari는 데스크톱 Safari와 같은 UA를 보내 서버에서는 구분할 수 없습니다.
   * 프록시가 홈페이지로 보내고, 홈페이지의 기존 기기 판별(터치 지원 확인)이
   * 추가 클릭 없이 App Store로 이어 줍니다. (제품 문구는 그대로 iPhone만 안내)
   */
  test.use({
    userAgent: DESKTOP_UA.macSafari,
    hasTouch: true,
    viewport: { width: 1024, height: 1366 },
  });

  test("ends up at the App Store without an extra click", async ({ page }) => {
    await stubStores(page);
    await page.goto(SMART_LINK);

    await page.waitForURL(APP_STORE_URL);
  });
});

test.describe("/download?app=ganada — a real Mac is not treated as an iPad", () => {
  test.use({ userAgent: DESKTOP_UA.macSafari, hasTouch: false });

  test("stays on the homepage chooser", async ({ page }) => {
    await stubStores(page);
    await page.goto(SMART_LINK);

    await expect(storeSelectModal(page)).toBeVisible();
    await page.waitForTimeout(500);
    expect(page.url()).toContain("download=ganada");
  });
});
