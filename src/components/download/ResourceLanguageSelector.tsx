"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";

import {
  LOCALE_CONFIG,
  getLocaleSearchTokens,
  normalizeSearchText,
} from "@/constants/locales";
import { routing } from "@/i18n/routing";
import { chevronDownIcon, chevronUpIcon } from "@/assets/icons";
import headerStyles from "@/components/layout/Header.module.css";
import { pushResourceEvent } from "./ResourceTracking";
import styles from "./ResourcePage.module.css";

/**
 * 자료 페이지 언어 선택기 (헤더 우측)
 *
 * 홈페이지 헤더와 같은 로케일 목록(routing.locales)·언어명·국기(LOCALE_CONFIG)·
 * 검색 규칙·번역(Header.aria / Header.search)을 재사용하고, 모양은 홈페이지 헤더의
 * 스타일(Header.module.css: dropdownWrapper/Trigger/Panel/Item, 쉐브론 아이콘)을 그대로
 * 씁니다. 홈페이지 Header 컴포넌트는 내비게이션·햄버거와 묶여 있어 동작만 따로 둡니다.
 *
 * 동작
 *  - 지금 주소의 첫 경로(/<UI 언어>)만 바꿉니다:
 *    /en/resources/<pageSlug> → /ja/resources/<pageSlug>. 각 언어의 대표 주소이므로
 *    hreflang과 같은 주소이고, 판(PDF 언어)은 그 페이지가 실제로 있는 판으로 정합니다.
 *  - 각 항목은 실제 링크(<a href>)라 JS 없이도 동작하고(크롤러도 따라갈 수 있음),
 *    JS가 있으면 클릭 시 utm_* 등 지금 주소의 쿼리를 보존한 URL로 이동합니다.
 */

const LANGUAGES = routing.locales.map((code) => ({
  code,
  ...LOCALE_CONFIG[code],
  searchTokens: getLocaleSearchTokens(code),
}));

/** 목록이 길어 검색창을 함께 보여줍니다. */
const SEARCH_THRESHOLD = 8;

type Props = {
  uiLanguage: string;
};

export default function ResourceLanguageSelector({ uiLanguage }: Props) {
  const pathname = usePathname();
  const tAria = useTranslations("Header.aria");
  const tSearch = useTranslations("Header.search");

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const panelId = useId();

  const current =
    LANGUAGES.find((lang) => lang.code === uiLanguage) ?? LANGUAGES[0];

  const filtered = useMemo(() => {
    const keyword = normalizeSearchText(query);
    if (!keyword) return LANGUAGES;
    return LANGUAGES.filter((lang) =>
      lang.searchTokens.some((token) => token.includes(keyword))
    );
  }, [query]);

  /** 첫 경로 조각(화면 언어)만 바꾸고, search(현재 쿼리)가 있으면 보존한 주소 */
  const hrefFor = useCallback(
    (code: string, search = "") => {
      const [, , ...rest] = (pathname ?? `/${uiLanguage}`).split("/");
      return `/${[code, ...rest].join("/")}${search}`;
    },
    [pathname, uiLanguage]
  );
  // 이벤트에 남길 자료 식별자 (/<lang>/resources/<pageSlug>의 pageSlug, 목록이면 "")
  const resourceSlug = pathname?.split("/")[3] ?? "";

  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    setQuery("");
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    // 데스크톱에서만 검색창에 바로 포커스 (모바일은 키보드가 목록을 가림)
    if (window.matchMedia("(min-width: 769px)").matches) {
      searchRef.current?.focus();
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const handleSelect = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    code: string
  ) => {
    // 새 탭 열기 등 수정 키가 눌린 클릭은 브라우저 기본 동작에 맡깁니다.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();

    if (code === uiLanguage) {
      close(true);
      return;
    }

    pushResourceEvent("resource_language_change", {
      resource_slug: resourceSlug,
      previous_language: uiLanguage,
      selected_language: code,
    });
    // 화면 언어마다 html lang/dir이 달라 전체 페이지로 이동합니다.
    window.location.assign(hrefFor(code, window.location.search));
  };

  /** 위/아래 화살표로 검색창과 목록 사이를 오갑니다. */
  const handlePanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const links = Array.from(
      listRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []
    );
    if (links.length === 0) return;
    event.preventDefault();

    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (event.key === "ArrowDown") {
      links[index < 0 ? 0 : Math.min(index + 1, links.length - 1)].focus();
    } else if (index <= 0) {
      (searchRef.current ?? links[0]).focus();
    } else {
      links[index - 1].focus();
    }
  };

  return (
    <div className={headerStyles.dropdownWrapper} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`${headerStyles.dropdownTrigger} ${
          open ? headerStyles.active : ""
        } ${styles.langTrigger}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${tAria("language")}: ${current.name}`}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <span className={headerStyles.langInfo}>
          <Image src={current.flag} alt="" width={20} height={13} />
          <span className={headerStyles.langCode} lang={current.code}>
            {current.name}
          </span>
        </span>
        <Image
          src={open ? chevronUpIcon : chevronDownIcon}
          alt=""
          width={16}
          height={16}
          className={headerStyles.chevron}
        />
      </button>

      <div
        id={panelId}
        className={headerStyles.dropdownPanel}
        hidden={!open}
        onKeyDown={handlePanelKeyDown}
      >
        {LANGUAGES.length > SEARCH_THRESHOLD && (
          <input
            ref={searchRef}
            type="text"
            className={headerStyles.searchInput}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={tSearch("placeholder")}
            aria-label={tSearch("placeholder")}
            autoComplete="off"
            enterKeyHint="go"
            onKeyDown={(event) => {
              // Enter는 첫 번째 검색 결과를 선택합니다.
              if (event.key === "Enter" && filtered.length > 0) {
                event.preventDefault();
                listRef.current?.querySelector<HTMLAnchorElement>("a")?.click();
              }
            }}
          />
        )}

        {filtered.length === 0 ? (
          <p className={headerStyles.emptyResult} role="status">
            {tSearch("noResults")}
          </p>
        ) : (
          <ul className={headerStyles.dropdownList} ref={listRef}>
            {filtered.map((lang) => (
              <li key={lang.code}>
                <a
                  className={`${headerStyles.dropdownItem} ${
                    lang.code === uiLanguage ? headerStyles.selected : ""
                  } ${styles.langOption}`}
                  href={hrefFor(lang.code)}
                  hrefLang={lang.code}
                  lang={lang.code}
                  aria-current={lang.code === uiLanguage ? "true" : undefined}
                  onClick={(event) => handleSelect(event, lang.code)}
                >
                  <span className={headerStyles.langInfo}>
                    <Image src={lang.flag} alt="" width={20} height={13} />
                    <span className={headerStyles.langCode}>{lang.name}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
