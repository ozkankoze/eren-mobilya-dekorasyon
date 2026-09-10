import type { Metadata, Viewport } from "next";
import ReactDOM from "react-dom";
import "./globals.css";

import { site } from "@/lib/site";
import { ogImage } from "@/lib/data";
import { metaAciklama, ogGorsel } from "@/lib/seo";

/**
 * SİTE GENELİ META ETİKETLERİ
 *
 * Buradaki değerler tüm sayfalar için varsayılandır; alt sayfalar
 * `generateMetadata` ile kendi başlık, açıklama ve görsellerini bildirir.
 * Canonical adres bilinçli olarak burada yok — her sayfa kendi adresini
 * `alternates.canonical` ile verir (bkz. app/(site)/page.tsx).
 */

/**
 * Google, arama sonucunda başlığın yaklaşık ilk 60 karakterini gösterir;
 * bu yüzden marka + iki ana hizmet ile sınırlı tutuldu.
 */
const anaBaslik =
  "Eren Mobilya Tasarım Ataşehir | Ölçüye Özel Mutfak ve Dolap";

const anaAciklama = metaAciklama(site.description);

const paylasimGorseli = ogGorsel(
  ogImage,
  `${site.name} — ölçüye özel mutfak uygulaması`
);

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: anaBaslik,
    template: `%s | ${site.name}`,
  },
  description: anaAciklama,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  category: "Mobilya ve İç Mekân Tasarımı",
  /** Telefon numaralarını iOS'un otomatik linke çevirmesini engelle */
  formatDetection: { telephone: false, address: false, email: false },
  appleWebApp: {
    capable: true,
    title: "Eren Mobilya Tasarım",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: anaBaslik,
    description: anaAciklama,
    images: paylasimGorseli,
  },
  twitter: {
    card: "summary_large_image",
    title: anaBaslik,
    description: anaAciklama,
    images: paylasimGorseli.map((g) => g.url),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  /**
   * Arama motoru doğrulama kodları.
   * Google Search Console / Yandex Webmaster kodunu ortam değişkeni olarak
   * ekleyin; tanımlı değilse etiket hiç basılmaz.
   */
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f5f2",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  /**
   * Fontları önceden yükle. `<link>` etiketini elle yazmak yerine React'in
   * preload API'si kullanılır: Next bunu <head>'e tek seferde koyar, elle
   * yazılan etiket ise hidrasyondan sonra ikinci kez ekleniyordu.
   */
  ReactDOM.preload("/fonts/inter-tr.woff2", {
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  });
  ReactDOM.preload("/fonts/manrope-tr.woff2", {
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  });

  return (
    <html lang="tr">
      {/* Sitenin header/footer çerçevesi app/(site)/layout.tsx içindedir;
          admin paneli kendi çerçevesini kullanır. */}
      <body>{children}</body>
    </html>
  );
}
