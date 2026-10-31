"use client";

import Image from "next/image";
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
import {
  DOWNLOAD_LANG_PARAM,
  DOWNLOAD_RESOURCE_PARAM,
} from "@/constants/downloadResources";
import { routing } from "@/i18n/routing";
import { pushResourceEvent } from "./ResourceTracking";
import styles from "./ResourcePage.module.css";

/**
 * 자료 페이지 언어 선택기 (헤더 우측)
 *
 * 홈페이지 헤더와 같은 로케일 목록(routing.locales)·언어명·국기(LOCALE_CONFIG)·
 * 검색 규칙·번역(Header.aria / Header.search)을 재사용합니다.
 *
 * 동작
 *  - 화면 언어(lang)만 바꾸고 utm_* 등 다른 쿼리는 그대로 둡니다.
 *  - 같은 가족에 선택한 언어의 PDF 판이 실제로 있으면 그 판(resource)으로 함께 전환하고,
 *    없으면 지금 판을 유지합니다. (판을 지어내지 않습니다.)
 *  - 각 항목은 실제 링크(<a href>)라 JS 없이도 동작하고, JS가 있으면 클릭 시
 *    현재 주소의 다른 파라미터까지 보존한 URL로 이동합니다.
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
  /** 지금 보고 있는 판 slug (자료 없음 화면에서는 null) */
  resourceSlug: string | null;
  /** 판 언어 → 판 slug (같은 가족에 실제로 있는 판만) */
  siblingEditions: Record<string, string>;
};

export default function ResourceLanguageSelector({
  uiLanguage,
  resourceSlug,
  siblingEditions,
}: Props) {
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

  /** base(현재 쿼리)를 보존하고 lang(+필요하면 resource)만 바꾼 주소 */
  const hrefFor = useCallback(
    (code: string, base = "") => {
      const params = new URLSearchParams(base);
      const sibling = siblingEditions[code];
      if (sibling) {
        params.set(DOWNLOAD_RESOURCE_PARAM, sibling);
      } else if (!params.has(DOWNLOAD_RESOURCE_PARAM) && resourceSlug) {
        params.set(DOWNLOAD_RESOURCE_PARAM, resourceSlug);
      }
      params.set(DOWNLOAD_LANG_PARAM, code);
      return `/download?${params.toString()}`;
    },
    [resourceSlug, siblingEditions]
  );

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
      resource_slug: resourceSlug ?? "",
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
    <div className={styles.langSelector} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.langTrigger}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${tAria("language")}: ${current.name}`}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <Image
          className={styles.langFlag}
          src={current.flag}
          alt=""
          width={20}
          height={14}
        />
        <span className={styles.langName} lang={current.code}>
          {current.name}
        </span>
        <svg
          className={styles.langChevron}
          data-open={open}
          viewBox="0 0 16 16"
          width="14"
          height="14"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="m4 6 4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        id={panelId}
        className={styles.langPanel}
        hidden={!open}
        onKeyDown={handlePanelKeyDown}
      >
        {LANGUAGES.length > SEARCH_THRESHOLD && (
          <input
            ref={searchRef}
            type="search"
            className={styles.langSearch}
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
          <p className={styles.langEmpty} role="status">
            {tSearch("noResults")}
          </p>
        ) : (
          <ul className={styles.langList} ref={listRef}>
            {filtered.map((lang) => (
              <li key={lang.code}>
                <a
                  className={styles.langOption}
                  href={hrefFor(lang.code)}
                  hrefLang={lang.code}
                  lang={lang.code}
                  aria-current={lang.code === uiLanguage ? "true" : undefined}
                  onClick={(event) => handleSelect(event, lang.code)}
                >
                  <Image src={lang.flag} alt="" width={20} height={14} />
                  <span className={styles.langOptionName}>{lang.name}</span>
                  {lang.code === uiLanguage && (
                    <svg
                      className={styles.langCheck}
                      viewBox="0 0 16 16"
                      width="16"
                      height="16"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        d="m3.5 8.5 3 3 6-7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
