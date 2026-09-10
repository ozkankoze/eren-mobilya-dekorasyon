"use client";

import { useEffect, useState } from "react";
import { WhatsAppIcon } from "./Icons";
import { whatsappLink } from "@/lib/site";

/**
 * Sağ alt köşede sabit duran WhatsApp butonu.
 * - Sayfanın en üstündeyken görünmez (hero'yu kapatmasın diye).
 * - İletişim bölümü ekrandayken gizlenir (oradaki CTA ile çakışmasın diye).
 * - Mobilde sadece ikon, masaüstünde ikon + metin.
 */
export default function WhatsAppFab() {
  const [visible, setVisible] = useState(false);
  const [contactInView, setContactInView] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.5);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const target = document.getElementById("iletisim");
    if (!target || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([entry]) => setContactInView(entry.isIntersecting),
      { threshold: 0.2 }
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);

  const show = visible && !contactInView;

  return (
    <a
      className={`fab${show ? " is-visible" : ""}`}
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp'tan yazın"
      tabIndex={show ? 0 : -1}
    >
      <WhatsAppIcon className="fab__icon" />
      <span className="fab__label">WhatsApp&apos;tan Yazın</span>
    </a>
  );
}
