"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Wordmark from "./Wordmark";
import MobileMenu from "./MobileMenu";
import { nav } from "@/lib/site";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const burgerRef = useRef<HTMLButtonElement>(null);

  // Scroll durumu — header'a ince bir alt çizgi ekler
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sayfa değişince menüyü kapat
  useEffect(() => setOpen(false), [pathname]);

  const close = useCallback(() => {
    setOpen(false);
    burgerRef.current?.focus();
  }, []);

  /**
   * Ana sayfa ve alt sayfalar tam genişlikte bir fotoğrafla başlar.
   * Bu sayfalarda header, sayfa kaydırılana kadar fotoğrafın üzerinde
   * saydam ve beyaz yazılı durur.
   */
  const overMedia =
    pathname === "/" ||
    pathname.startsWith("/kategori/") ||
    pathname.startsWith("/proje/");
  const light = overMedia && !scrolled && !open;

  return (
    <>
      <header
        className={`header${scrolled ? " is-scrolled" : ""}${light ? " header--over" : ""}`}
      >
        <div className="container header__inner">
          <Wordmark />

          <nav className="nav" aria-label="Ana menü">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="nav__link">
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            ref={burgerRef}
            type="button"
            className="burger"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={open}
            aria-controls="mobil-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Katman body'nin altına portal ile taşınır — bkz. MobileMenu.tsx */}
      <MobileMenu open={open} onClose={close} />
    </>
  );
}
