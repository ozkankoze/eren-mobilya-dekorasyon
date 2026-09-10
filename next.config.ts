import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  /**
   * Not: `experimental.inlineCss` denendi ve geri alındı — CSS'i HTML'e gömmek
   * belgeyi büyüttüğü için ilk boyamayı (FCP 1,0 sn → 1,8 sn) geciktirdi.
   * Ayrı CSS dosyası paralel indirildiği için daha hızlı.
   */
};

export default nextConfig;
