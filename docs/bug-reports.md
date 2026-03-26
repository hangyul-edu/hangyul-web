# Bug Reports

한귤 웹 랜딩 페이지 개발 과정에서 발견 및 수정된 버그 목록입니다.

---

## BUG-001 · Netlify 배포 실패 (pnpm 심볼릭 링크 오류)

| 항목 | 내용 |
|---|---|
| 심각도 | Critical |
| 발견 경위 | Netlify 배포 시도 중 빌드 로그에서 발견 |
| 관련 커밋 | `cc339e2` `b7eb5b3` `0845633` `3b13d4b` `ec133f9` `b2870a3` |

**재현 조건**
- Netlify에서 Next.js 프로젝트를 pnpm으로 빌드 시도

**원인**
- `netlify.toml`의 `publish` 경로 오타
- pnpm 심볼릭 링크와 Netlify 빌드 환경 충돌
- `@netlify/plugin-nextjs` 미설치로 인한 빌드 명령어 충돌

**해결 방법**
- `@netlify/plugin-nextjs` 패키지 설치 및 `netlify.toml`에 플러그인 등록
- `publish` 경로를 `.next`로 수정
- 빌드 명령어를 플러그인 방식으로 통일

---

## BUG-002 · OG 이미지 URL이 localhost로 노출

| 항목 | 내용 |
|---|---|
| 심각도 | High |
| 발견 경위 | 카카오톡 OG 디버거(https://developers.kakao.com/tool/debugger/sharing)로 확인 |
| 관련 커밋 | `bd7323b` |

**재현 조건**
1. `NEXT_PUBLIC_SITE_URL` 환경변수 미설정 상태로 빌드
2. 카카오톡 또는 OG 디버거로 `https://talkhangyul.com` 스크랩

**원인**
`app/layout.tsx`의 `metadataBase` fallback이 `http://localhost:3000`으로 설정되어 있어, 빌드 환경에서 환경변수가 없을 경우 og:image URL이 `http://localhost:3000/og-image.png`로 생성됨

```ts
// 수정 전
metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")

// 수정 후
metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://talkhangyul.com")
```

**해결 방법**
fallback 값을 실제 프로덕션 URL로 변경. `NEXT_PUBLIC_SITE_URL`은 스테이징 등 다른 환경에서 오버라이드 가능하도록 유지

---

## BUG-003 · 헤더 내비게이션 클릭 시 해당 섹션으로 이동하지 않음

| 항목 | 내용 |
|---|---|
| 심각도 | High |
| 발견 경위 | 브라우저에서 수동 테스트 중 발견 |
| 관련 커밋 | `90b8dd8` |

**재현 조건**
1. `https://talkhangyul.com/ko` 접속
2. 헤더의 "Why 한귤?", "학습 소개", "멤버십" 클릭

**원인**
next-intl의 `<Link>` 컴포넌트는 `href="#intro"` 형태의 hash 링크를 라우터 경로로 처리하여 페이지 이동을 시도함. 앵커 스크롤이 동작하지 않음

**해결 방법**
해시 링크는 next-intl `<Link>` 대신 HTML `<a>` 태그로 교체

```tsx
// 수정 전
<Link href="#intro">Why 한귤?</Link>

// 수정 후
<a href="#intro">Why 한귤?</a>
```

---

## BUG-004 · 언어 전환 후 스크롤 위치가 최상단으로 이동하지 않음

| 항목 | 내용 |
|---|---|
| 심각도 | Medium |
| 발견 경위 | 브라우저에서 수동 테스트 중 발견 |
| 관련 커밋 | `d814252` |

**재현 조건**
1. 페이지를 아래로 스크롤
2. 헤더의 언어 토글로 한국어 ↔ 영어 전환

**원인**
`router.replace()`로 로케일 전환 시 Next.js가 스크롤 위치를 복원하여 이전 스크롤 위치가 유지됨

**해결 방법**
로케일 전환 직전 `window.scrollTo({ top: 0, behavior: "instant" })`를 명시적으로 호출

```ts
const handleSelect = (lang: ...) => {
  window.scrollTo({ top: 0, behavior: "instant" }); // 추가
  router.replace(pathname, { locale: lang.code });
};
```

---

## BUG-005 · 모달이 헤더 및 장식 요소 뒤로 가려지는 z-index 문제

| 항목 | 내용 |
|---|---|
| 심각도 | High |
| 발견 경위 | QR 모달 및 약관 모달 테스트 중 발견 |
| 관련 커밋 | `280c31b` |

**재현 조건**
1. Framer Motion `motion.*` 요소 내부에서 `position: fixed` 모달 렌더링
2. 모달 위로 헤더나 `.deco` 요소가 노출됨

**원인**
Framer Motion의 `transform` CSS 속성이 새로운 stacking context를 생성하여, 내부의 `position: fixed` 요소가 해당 context에 갇힘. 아무리 높은 `z-index`를 지정해도 부모 stacking context를 벗어날 수 없음

**해결 방법**
`createPortal(content, document.body)`로 모달을 stacking context 바깥인 `document.body`에 직접 렌더링

```tsx
return createPortal(
  <div className={styles.overlay}>...</div>,
  document.body
);
```

---

## BUG-006 · 모달 열림 시 배경 스크롤이 잠기지 않음

| 항목 | 내용 |
|---|---|
| 심각도 | Medium |
| 발견 경위 | 모달 열린 상태에서 배경 스크롤 가능함을 수동 테스트 중 발견 |
| 관련 커밋 | `280c31b` |

**재현 조건**
1. 이용약관 또는 개인정보 모달 열기
2. 모달 뒤 배경 스크롤 시도

**원인**
`document.body.style.overflow = "hidden"`으로 스크롤을 제한했으나, Next.js App Router는 `<html>` 요소를 스크롤 컨테이너로 사용하므로 `body`에 적용해도 효과 없음

**해결 방법**
`document.documentElement.style.overflow = "hidden"`으로 타겟 변경

```ts
// 수정 전
document.body.style.overflow = "hidden";

// 수정 후
document.documentElement.style.overflow = "hidden";
```

---

## BUG-007 · 모달 하단 border-radius가 적용되지 않음

| 항목 | 내용 |
|---|---|
| 심각도 | Low |
| 발견 경위 | 모달 UI 시각적 검토 중 발견 |
| 관련 커밋 | `280c31b` |

**재현 조건**
1. 이용약관 모달 열기
2. 모달 하단 모서리 확인

**원인**
`.modal`에 `border-radius: 16px`이 적용되어 있으나, 내부 스크롤 영역(`.body`)의 콘텐츠가 모서리 밖으로 overflow되어 radius가 보이지 않음

**해결 방법**
`.modal`에 `overflow: hidden` 추가하여 자식 요소가 rounded corner를 벗어나지 않도록 처리

---

## BUG-008 · 데스크탑용 `\n` 줄바꿈이 모바일에서 레이아웃 깨짐

| 항목 | 내용 |
|---|---|
| 심각도 | Medium |
| 발견 경위 | 모바일 뷰포트에서 시각적 검토 중 발견 |
| 관련 커밋 | `462dfed` |

**재현 조건**
1. 모바일 화면(375px)에서 각 섹션 텍스트 확인
2. 데스크탑 기준으로 삽입된 `\n`이 모바일에서 불필요한 위치에서 줄바꿈 발생

**원인**
번역 JSON의 `\n`은 `white-space: pre-line`으로 모든 화면 크기에서 동일하게 강제 줄바꿈됨. 모바일에서는 컨테이너 너비가 좁아 원하지 않는 위치에서 줄바꿈 발생

**해결 방법**
화면 크기별로 다른 줄바꿈이 필요한 위치는 `t.rich()`와 CSS `display` 제어로 처리

```json
"title": "지금 바로,<mobileBr></mobileBr>말하는 한국어를 시작하세요"
```
```css
.mobileBr { display: none; }
@media (max-width: 768px) { .mobileBr { display: block; } }
```

---

## BUG-009 · Footer copyright 텍스트 색상 대비율 WCAG AA 미달

| 항목 | 내용 |
|---|---|
| 심각도 | Serious (접근성) |
| 발견 경위 | axe-core 자동화 접근성 검사 (`pnpm test:e2e`) |
| 관련 커밋 | 현재 브랜치 수정 |

**재현 조건**
`pnpm exec playwright test accessibility` 실행

**원인**
`var(--gray-400)` = `#9b9b9b`의 흰 배경 대비율이 2.77:1로, WCAG 2 AA 기준(4.5:1) 미달

**해결 방법**
`var(--gray-500)` = `#595959`로 변경 (대비율 7.14:1)

---

## BUG-010 · 약관 모달 날짜 텍스트 색상 대비율 WCAG AA 미달

| 항목 | 내용 |
|---|---|
| 심각도 | Serious (접근성) |
| 발견 경위 | axe-core 자동화 접근성 검사 (`pnpm test:e2e`) |
| 관련 커밋 | 현재 브랜치 수정 |

**재현 조건**
이용약관 모달 열린 상태에서 `pnpm exec playwright test accessibility` 실행

**원인**
`.lastUpdated`의 `#999999`가 흰 배경 대비율 2.84:1로 WCAG 2 AA 기준 미달

**해결 방법**
`var(--gray-500)` = `#595959`로 변경 (대비율 7.14:1)

---

## BUG-011 · 약관 모달 스크롤 영역 키보드 접근 불가

| 항목 | 내용 |
|---|---|
| 심각도 | Serious (접근성) |
| 발견 경위 | axe-core 자동화 접근성 검사 (`pnpm test:e2e`) |
| 관련 커밋 | 현재 브랜치 수정 |

**재현 조건**
이용약관 모달 열린 상태에서 `pnpm exec playwright test accessibility` 실행

**원인**
`overflow-y: auto`가 적용된 `.body` 영역에 `tabindex`가 없어 키보드(Tab, 방향키)로 스크롤 불가. WCAG 2.1 기준 위반

**해결 방법**
스크롤 가능한 `.body` div에 `tabIndex={0}` 추가

```tsx
<div className={styles.body} tabIndex={0}>{body}</div>
```
