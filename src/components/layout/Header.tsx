"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";
import { useEffect, useRef, useState } from "react";

const LANGUAGES = [
  { code: "kr", name: "한국어", label: "한국어", flag: "/flags/KR.svg" },
  {
    code: "en",
    name: "English",
    label: "English",
    flag: "/flags/US.svg",
  },
  { code: "cn", name: "中文", label: "中文", flag: "/flags/CN.svg" },
  { code: "jp", name: "日本語", label: "日本語", flag: "/flags/JP.svg" },
  { code: "sa", name: "العربية", label: "العربية", flag: "/flags/SA.svg" },
];

export default function Header() {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);

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
    setSelectedLang(lang);
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

  return (
    <header className={styles.header} ref={headerRef}>
      <div className={styles.container}>
        <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
          <Image
            src="/icons/logo.svg"
            alt="HanGyul Logo"
            width={151}
            height={32}
            className={styles.logo}
          />
        </Link>

        <nav className={styles.desktopNav}>
          <Link href="#intro" className={styles.navlink}>
            서비스 소개
          </Link>
          <Link href="#features" className={styles.navlink}>
            주요 기능
          </Link>
          <Link href="#pricing" className={styles.navlink}>
            가격 안내
          </Link>
        </nav>
        <div className={styles.rightControls}>
          <div className={styles.dropdownWrapper}>
            <button
              className={`${styles.dropdownTrigger} ${
                isLangOpen ? styles.active : ""
              }`}
              onClick={toggleLangDropDown}
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
                src={
                  isLangOpen
                    ? "/icons/chevron-up.svg"
                    : "/icons/chevron-down.svg"
                }
                alt="toggle arrow"
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

          <button className={styles.hamburger} onClick={toggleMobileMenu}>
            <Image src="/icons/list.svg" alt="menu" width={24} height={24} />
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className={styles.mobileMenuOverlay}>
          <nav className={styles.mobileNav}>
            <Link href="#intro" onClick={toggleMobileMenu}>
              서비스 소개
            </Link>
            <Link href="#features" onClick={toggleMobileMenu}>
              주요 기능
            </Link>
            <Link href="#pricing" onClick={toggleMobileMenu}>
              가격 안내
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
