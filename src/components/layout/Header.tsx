"use client";

import Image from "next/image";
import styles from "./Header.module.css";
import { useEffect, useRef, useState } from "react";

import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";

import { KOFlag, USFlag } from "@/assets/flags";
import {
  chevronDownIcon,
  chevronUpIcon,
  listIcon,
  logoIcon,
} from "@/assets/icons";

const LANGUAGES = [
  { code: "en", name: "English", label: "English", flag: USFlag },
  { code: "ko", name: "한국어", label: "한국어", flag: KOFlag },
];

export default function Header() {
  const t = useTranslations("Header.nav");

  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const selectedLang = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);

  const toggleLangDropDown = () => {
    setIsLangOpen((prev) => !prev);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    setIsLangOpen(false);
  };

  const handleSelect = (lang: (typeof LANGUAGES)[0]) => {
    window.scrollTo({ top: 0, behavior: "instant" });
    router.replace(pathname, { locale: lang.code });
    setIsLangOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setIsLangOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen || isLangOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen, isLangOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLangOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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
              aria-label="언어 선택"
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
              <ul className={styles.dropdownList}>
                {LANGUAGES.map((lang) => (
                  <li key={lang.code}>
                    <button
                      className={`${styles.dropdownItem} ${
                        selectedLang.code === lang.code ? styles.selected : ""
                      }`}
                      onClick={() => handleSelect(lang)}
                    >
                      <div className={styles.langInfo}>
                        <Image
                          src={lang.flag}
                          alt={lang.code}
                          width={20}
                          height={13}
                        />
                        <span className={styles.langCode}>{lang.name}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            className={styles.hamburger}
            onClick={toggleMobileMenu}
            aria-label="내비게이션 메뉴"
            aria-expanded={isMobileMenuOpen}
          >
            <Image src={listIcon} alt="" width={24} height={24} />
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className={styles.mobileMenuOverlay}>
          <nav className={styles.mobileNav}>
            <a href="#intro" onClick={toggleMobileMenu} className={styles.navLink}>
              {t("why")}
            </a>
            <a href="#features" onClick={toggleMobileMenu} className={styles.navLink}>
              {t("learning")}
            </a>
            <a href="#pricing" onClick={toggleMobileMenu} className={styles.navLink}>
              {t("membership")}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
