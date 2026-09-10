/**
 * Marka ve site geneli ayarlar.
 * Telefon, adres, sosyal medya, menü gibi tüm sabitler burada.
 */

export const site = {
  name: "Eren Mobilya Tasarım Ataşehir",
  /** Header ve footer'da tipografik olarak yazılan marka adı. */
  wordmark: "EREN MOBİLYA TASARIM · ATAŞEHİR",
  /**
   * Marka logosu — `public/logo.svg`.
   * Başka bir dosya kullanmak isterseniz yalnızca `src` ve `ratio` değerlerini
   * güncelleyin; header ve footer otomatik olarak yeni logoyu kullanır.
   * `ratio` = logonun en / boy oranı (viewBox'tan).
   */
  logo: {
    src: "/logo.svg",
    mark: "/logo-mark.svg",
    alt: "Eren Mobilya Tasarım Ataşehir",
    ratio: 8.8279,
  },
  tagline:
    "Mutfak, yatak odası, banyo ve vestiyerde ölçüye özel üretim. Tasarımdan montaja tek elden.",
  description:
    "Eren Mobilya Tasarım ile ölçüye özel mutfak, yatak odası, banyo, vestiyer ve TV ünitesi çözümlerini keşfedin. Konut ve ticari projelerde tasarımdan montaja anahtar teslim uygulama.",
  /** Deploy sonrası kendi alan adınızla değiştirin. */
  url: "https://www.erenmobilyatasarimatasehir.com",
  locale: "tr_TR",
  /** Birinci (ana) numara — WhatsApp da bu numaraya bağlıdır */
  phone: {
    display: "0532 640 36 92",
    href: "tel:+905326403692",
  },
  /** İkinci numara — sitede birincinin altında gösterilir */
  phone2: {
    display: "0541 565 35 67",
    href: "tel:+905415653567",
  },
  /** E-posta — sitede İletişim bölümünde, footer'da ve mobil menüde görünür */
  email: {
    display: "erenmobilya18@gmail.com",
    href: "mailto:erenmobilya18@gmail.com",
  },
  /**
   * Google etiketi (Google Ads / Analytics).
   * Yalnızca üretim derlemesinde ve site sayfalarında yüklenir; yönetim
   * panelinde çalışmaz. Değiştirmek için NEXT_PUBLIC_GOOGLE_TAG_ID kullanın;
   * boş değer atarsanız etiket hiç yüklenmez.
   */
  googleTagId:
    process.env.NEXT_PUBLIC_GOOGLE_TAG_ID ?? "AW-18442698100",
  whatsapp: {
    display: "0532 640 36 92",
    number: "905326403692",
    href: "https://wa.me/905326403692",
    message: "Merhaba, ölçüye özel mobilya çalışmalarınız hakkında bilgi almak istiyorum.",
  },
} as const;

/** WhatsApp linkini hazır mesajla birlikte üretir. */
export function whatsappLink(message: string = site.whatsapp.message) {
  return `${site.whatsapp.href}?text=${encodeURIComponent(message)}`;
}

export type SocialLink = { label: string; href: string };

/** Sosyal medya hesapları — footer, iletişim bölümü, mobil menü ve JSON-LD */
export const social: SocialLink[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/erenmobilyatasarimatasehir",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61594321048217",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@erenmobilyatasarim",
  },
];

export type NavItem = { label: string; href: string };

export const nav: NavItem[] = [
  { label: "Kategoriler", href: "/#kategoriler" },
  { label: "Projeler", href: "/#projeler" },
  { label: "Hakkımızda", href: "/#hakkimizda" },
  { label: "İletişim", href: "/#iletisim" },
];
