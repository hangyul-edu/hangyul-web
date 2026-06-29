# Lighthouse Performance Optimization Case Study

## 개요

한귤 랜딩 페이지의 Lighthouse Performance 점수가 58점으로 측정되었다. TBT는 0ms, CLS는 0으로 안정적이었지만, FCP와 LCP가 모두 4.6초로 느려 첫 화면 렌더링 점수가 크게 낮아졌다.

## 개선 전 지표

| 항목 | 측정값 |
|---|---:|
| Performance | 58 |
| First Contentful Paint | 4.6s |
| Largest Contentful Paint | 4.6s |
| Total Blocking Time | 0ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 6.4s |

## 병목 분석

Lighthouse 리포트와 빌드 산출물을 함께 확인해 병목을 세 가지로 분리했다.

1. 외부 폰트 CSS가 렌더 차단 요청으로 동작했다.
   - `globals.css`의 `@import`가 JSDelivr Pretendard CSS를 critical path에 추가했다.
   - Lighthouse 기준 해당 요청은 약 2.29초 동안 초기 렌더링을 지연시켰다.

2. LCP 이미지가 과도하게 컸다.
   - LCP element는 hero background 이미지였다.
   - 기존 `background.png`는 3.1MB PNG였고, Lighthouse LCP breakdown에서 resource load duration이 8.12초로 측정되었다.

3. 첫 화면에 필요하지 않은 이미지까지 preload되었다.
   - hero slogan, mockup, 하단 CTA background까지 `priority`가 지정되어 head preload에 올라갔다.
   - LCP 이미지와 다른 이미지들이 초기 네트워크 대역폭을 경쟁했다.

## 적용한 개선

### 1. LCP 이미지 경량화

기존 PNG 이미지를 WebP로 변환하고 hero 전용 리소스로 분리했다.

| 리소스 | 변경 전 | 변경 후 |
|---|---:|---:|
| hero background | 3.1MB PNG | 56KB WebP |
| ko mockup | 1.1MB PNG | 64KB WebP |
| en mockup | 1.1MB PNG | 64KB WebP |

관련 변경:

- `src/assets/images/background-hero.webp` 추가
- `src/assets/images/mockup-ko.webp` 추가
- `src/assets/images/mockup-en.webp` 추가
- `src/assets/images/index.ts`에서 WebP asset을 export하도록 변경

### 2. LCP 리소스 우선순위 명확화

hero background만 `priority`와 `fetchPriority="high"`를 유지했다. 빌드된 HTML에서 LCP preload에 `fetchPriority="high"`가 반영되는 것을 확인했다.

```tsx
<Image
  src={backgroundHeroImg}
  alt=""
  fill
  priority
  fetchPriority="high"
  sizes="100vw"
  className={styles.background}
/>
```

### 3. 불필요한 preload 제거

첫 화면 LCP에 직접 필요하지 않은 이미지의 `priority`를 제거했다.

- hero slogan desktop/mobile
- hero mockup
- CTA desktop/mobile background

그 결과 빌드된 `/ko` HTML의 이미지 preload는 LCP background 중심으로 정리되었다.

### 4. 렌더 차단 폰트 요청 제거

외부 CDN `@import`를 제거하고 시스템 폰트 fallback 스택을 사용했다. 이 변경으로 초기 CSS가 더 이상 `cdn.jsdelivr.net` 요청을 기다리지 않는다.

```css
body {
  font-family:
    "Pretendard Variable",
    Pretendard,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}
```

### 5. hero 초기 콘텐츠 즉시 표시

hero 영역의 Framer Motion 초기 상태가 `opacity: 0`으로 서버 HTML에 렌더링되고 있었다. LCP/FCP에 중요한 hero 영역에서는 애니메이션 wrapper를 제거해 텍스트와 주요 콘텐츠가 HTML 파싱 직후 바로 그려지도록 바꿨다.

## 검증

로컬 검증 결과:

```bash
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/eslint src/app/globals.css src/components/home/MainSection.tsx src/components/home/CtaSection.tsx src/assets/images/index.ts src/constants/images.ts
./node_modules/.bin/next build
```

결과:

- TypeScript: 통과
- ESLint: 오류 없음
- Next production build: 통과
- 빌드된 HTML에서 `cdn.jsdelivr.net` 폰트 요청 제거 확인
- 빌드된 HTML에서 LCP preload에 `fetchPriority="high"` 반영 확인

## 포트폴리오 서술 예시

Lighthouse Performance 58점 문제를 Core Web Vitals 관점에서 분석하고 개선했다. TBT와 CLS는 안정적이었기 때문에 JavaScript 실행 지연보다 초기 렌더링 경로에 집중했다. Lighthouse breakdown에서 LCP element가 hero background 이미지임을 확인했고, 동시에 외부 Pretendard CSS가 render-blocking request로 잡혀 FCP/LCP를 지연시키는 것을 발견했다.

개선 과정에서는 3.1MB PNG hero background를 56KB WebP로 경량화하고, LCP 리소스에만 `priority`와 `fetchPriority="high"`를 적용했다. 반대로 slogan, mockup, CTA background처럼 첫 페인트에 직접 필요하지 않은 이미지 preload는 제거해 네트워크 경쟁을 줄였다. 또한 CDN `@import` 폰트 요청을 제거해 critical request chain을 단축했고, hero 콘텐츠의 초기 `opacity: 0` 애니메이션을 제거해 HTML 파싱 직후 콘텐츠가 바로 표시되도록 개선했다.

이 작업을 통해 이미지 전송량과 critical request chain을 줄이고, LCP 리소스 발견 및 우선순위를 명확히 했다. 개선 후 production build에서 외부 폰트 요청 제거, LCP preload `fetchPriority="high"` 반영, WebP asset 적용을 확인했다.
