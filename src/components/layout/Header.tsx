"use client";

import Image from "next/image";
import styles from "./Header.module.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";

import {
  LOCALE_CONFIG,
  getLocaleSearchTokens,
  normalizeSearchText,
} from "@/constants/locales";
import {
  chevronDownIcon,
  chevronUpIcon,
  listIcon,
  logoIcon,
} from "@/assets/icons";

const LANGUAGES = routing.locales.map((code) => ({
  code,
  ...LOCALE_CONFIG[code],
  // 검색 비교용 문자열은 렌더링마다 다시 만들지 않도록 미리 계산해 둔다.
  searchTokens: getLocaleSearchTokens(code),
}));

export default function Header() {
  const t = useTranslations("Header.nav");
  const tAria = useTranslations("Header.aria");
  const tSearch = useTranslations("Header.search");

  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const selectedLang = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [languageQuery, setLanguageQuery] = useState("");
  const headerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 지원 언어가 많아 검색으로 걸러낸다. 언어명(모국어/영어)과 locale 코드 모두 매칭한다.
  const filteredLanguages = useMemo(() => {
    const keyword = normalizeSearchText(languageQuery);
    if (!keyword) return LANGUAGES;

    return LANGUAGES.filter((lang) =>
      lang.searchTokens.some((token) => token.includes(keyword))
    );
  }, [languageQuery]);

  // 데스크톱에서 목록을 열면 검색창에 포커스한다.
  // (모바일은 키보드가 목록을 가리므로 자동 포커스하지 않는다.)
  useEffect(() => {
    if (!isLangOpen) return;

    if (window.matchMedia("(min-width: 769px)").matches) {
      searchInputRef.current?.focus();
    }
  }, [isLangOpen]);

  const closeLangDropDown = useCallback(() => {
    setIsLangOpen(false);
    setLanguageQuery("");
  }, []);

  // 지원 언어가 많아 전체 locale을 미리 받아오면 초기 로딩이 무거워지므로,
  // 사용자가 목록에서 특정 언어를 가리키거나 포커스했을 때만 해당 locale을 프리페치합니다.
  const prefetchLocale = useCallback(
    (targetLocale: string) => {
      if (targetLocale === locale) return;
      router.prefetch(pathname, { locale: targetLocale });
    },
    [locale, pathname, router]
  );

  const toggleLangDropDown = () => {
    setIsLangOpen((prev) => !prev);
    setLanguageQuery("");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    closeLangDropDown();
  };

  const handleSelect = (lang: (typeof LANGUAGES)[0]) => {
    window.scrollTo({ top: 0, behavior: "instant" });
    router.replace(pathname, { locale: lang.code });
    closeLangDropDown();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        closeLangDropDown();
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen || isLangOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen, isLangOpen, closeLangDropDown]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLangDropDown();
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeLangDropDown]);

  return (
    <header className={styles.header} ref={headerRef}>
      <div className={styles.container}>
        <Link
          href="/"
          onClick={(e) => {
            // 1. 모바일 메뉴 닫기
            setIsMobileMenuOpen(false);

            // 2. 현재 페이지가 홈('/')인 경우
            if (pathname === "/") {
              e.preventDefault(); // 기본 링크 이동 동작 방지

              // 주소창에서 해시(#pricing 등) 제거 (페이지 새로고침 없이)
              window.history.pushState({}, "", window.location.pathname);

              // 최상단으로 부드럽게 이동
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }
          }}
        >
          <Image
            src={logoIcon}
            alt="HanGyul Logo"
            width={151}
            height={32}
            className={styles.logo}
          />
        </Link>

        <nav className={styles.desktopNav}>
          <a href="#intro" className={styles.navLink}>
            {t("why")}
          </a>
          <a href="#features" className={styles.navLink}>
            {t("learning")}
          </a>
          <a href="#pricing" className={styles.navLink}>
            {t("membership")}
          </a>
        </nav>
        <div className={styles.rightControls}>
          <div className={styles.dropdownWrapper}>
            <button
              className={`${styles.dropdownTrigger} ${
                isLangOpen ? styles.active : ""
              }`}
              onClick={toggleLangDropDown}
              aria-label={tAria("language")}
              aria-expanded={isLangOpen}
              aria-haspopup="listbox"
            >
              <div className={styles.langInfo}>
                <Image
                  src={selectedLang.flag}
                  alt={selectedLang.code}
                  width={20}
                  height={13}
                />
                <span className={styles.langCode}>{selectedLang.name}</span>
              </div>

              <Image
                src={isLangOpen ? chevronUpIcon : chevronDownIcon}
                alt=""
                width={16}
                height={16}
                className={styles.chevron}
              />
            </button>

            {isLangOpen && (
              <div className={styles.dropdownPanel}>
                <input
                  ref={searchInputRef}
                  type="text"
                  className={styles.searchInput}
                  value={languageQuery}
                  onChange={(event) => setLanguageQuery(event.target.value)}
                  placeholder={tSearch("placeholder")}
                  aria-label={tSearch("placeholder")}
                  autoComplete="off"
                />

                {filteredLanguages.length === 0 ? (
                  <p className={styles.emptyResult}>{tSearch("noResults")}</p>
                ) : (
                  <ul className={styles.dropdownList}>
                    {filteredLanguages.map((lang) => (
                      <li key={lang.code}>
                        <button
                          className={`${styles.dropdownItem} ${
                            selectedLang.code === lang.code
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => handleSelect(lang)}
                          onMouseEnter={() => prefetchLocale(lang.code)}
                          onFocus={() => prefetchLocale(lang.code)}
                          lang={lang.code}
                        >
                          <div className={styles.langInfo}>
                            <Image
                              src={lang.flag}
                              alt=""
                              width={20}
                              height={13}
                              loading="eager"
                            />
                            <span className={styles.langCode}>{lang.name}</span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <button
            className={styles.hamburger}
            onClick={toggleMobileMenu}
            aria-label={tAria("menu")}
            aria-expanded={isMobileMenuOpen}
          >
            <Image src={listIcon} alt="" width={24} height={24} />
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className={styles.mobileMenuOverlay}>
          <nav className={styles.mobileNav}>
            <a
              href="#intro"
              onClick={toggleMobileMenu}
              className={styles.navLink}
            >
              {t("why")}
            </a>
            <a
              href="#features"
              onClick={toggleMobileMenu}
              className={styles.navLink}
            >
              {t("learning")}
            </a>
            <a
              href="#pricing"
              onClick={toggleMobileMenu}
              className={styles.navLink}
            >
              {t("membership")}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
