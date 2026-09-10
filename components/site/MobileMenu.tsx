"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Wordmark from "./Wordmark";
import { WhatsAppIcon } from "./Icons";
import { nav, site, social, whatsappLink } from "@/lib/site";

/**
 * Mobil tam ekran navigasyon katmanı.
 *
 * NEDEN PORTAL:
 * Katman `createPortal` ile doğrudan <body>'nin son çocuğu olarak render
 * edilir. Böylece sayfadaki hiçbir `transform`, `filter`, `backdrop-filter`,
 * `isolation` ya da `position` kuralı katmanı kendi kutusuna hapsedemez veya
 * altında bırakamaz. (Header'daki `backdrop-filter` tam olarak buna yol
 * açıyordu: menü header'ın içindeyken ekranı değil header kutusunu kaplıyordu.)
 *
 * Katman açıkken sayfanın geri kalanı hem `inert` yapılır hem de opak katman
 * tarafından örtülür; arkada ne tıklama ne de klavye odağı çalışır.
 */
export default function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  /** Sayfa kilidi + arka planı etkileşime kapatma */
  useEffect(() => {
    if (!open) return;

    const html = document.documentElement;
    const body = document.body;
    const y = window.scrollY;
    const prevBody = body.style.cssText;

    html.classList.add("is-locked");
    body.classList.add("is-locked");
    // iOS Safari'de overflow:hidden tek başına yetmez — body sabitlenir
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    // Arka plandaki her şey etkileşime ve odağa kapalı
    const behind = [
      document.querySelector("header.header"),
      document.getElementById("icerik"),
      document.querySelector("footer"),
      document.querySelector(".fab"),
    ].filter(Boolean) as HTMLElement[];
    behind.forEach((el) => el.setAttribute("inert", ""));

    closeRef.current?.focus();

    return () => {
      html.classList.remove("is-locked");
      body.classList.remove("is-locked");
      body.style.cssText = prevBody;
      behind.forEach((el) => el.removeAttribute("inert"));
      window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
    };
  }, [open]);

  /** Esc ile kapat + odağı katman içinde tut */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      id="mobil-menu"
      ref={panelRef}
      className={`menu${open ? " is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Menü"
      inert={!open}
    >
      <div className="container menu__top">
        <Wordmark onClick={onClose} />
        <button
          ref={closeRef}
          type="button"
          className="menu__close"
          aria-label="Menüyü kapat"
          onClick={onClose}
        >
          <span />
          <span />
        </button>
      </div>

      <nav className="container menu__nav" aria-label="Mobil menü">
        <ul className="menu__list">
          {nav.map((item, i) => (
            <li key={item.href} className="menu__item">
              <Link
                href={item.href}
                className="menu__link"
                style={{ ["--i" as string]: i }}
                onClick={onClose}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container menu__foot">
        <div className="menu__phones">
          <a className="menu__phone" href={site.phone.href}>
            {site.phone.display}
          </a>
          <a className="menu__phone" href={site.phone2.href}>
            {site.phone2.display}
          </a>
          <a className="menu__mail" href={site.email.href}>
            {site.email.display}
          </a>
        </div>
        <a
          className="btn"
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
        >
          <WhatsAppIcon className="btn__icon" />
          WhatsApp&apos;tan İletişime Geç
        </a>

        <ul className="socials" aria-label="Sosyal medya">
          {social.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                target="_blank"
                rel="me noopener noreferrer"
                title={`${item.label} hesabımız (yeni sekmede açılır)`}
                onClick={onClose}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body
  );
}
