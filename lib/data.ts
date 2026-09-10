import type { ImageValue } from "./content";

/**
 * SİTENİN VARSAYILAN İÇERİĞİ.
 *
 * Kategori, uygulama ve projeleri buradan düzenleyebilirsiniz;
 * sayfalar, menüler, alt sayfalar ve sitemap bu veriden otomatik üretilir.
 *
 * GÖRSELLER
 * `image` alanı `public/gorseller/` içindeki dosyanın adıdır (uzantısız).
 * Yeni fotoğraf eklemek için: dosyayı `gorseller-kaynak/` klasörüne koyun,
 * `node scripts/optimize-images.mjs` çalıştırın, sonra adını buraya yazın.
 *
 * `focus` alanı kırpma odağıdır (CSS object-position). Kare veya geniş
 * çerçevelerde mobilyanın önemli kısmının kadraj dışında kalmaması için
 * kullanılır; boş bırakılırsa merkez alınır.
 */

export type Category = {
  slug: string;
  name: string;
  description: string;
  image: ImageValue;
  imageAlt: string;
  focus?: string;
  /** Ana sayfadaki kategori gridinde tam genişlikte gösterilsin mi */
  wide?: boolean;
};

export type Product = {
  slug: string;
  name: string;
  category: string;
  image: ImageValue;
  imageAlt: string;
  focus?: string;
  /** Ana sayfadaki "Öne Çıkanlar" bölümünde gösterilsin mi */
  featured?: boolean;
};

export type Project = {
  slug: string;
  name: string;
  location: string;
  year: string;
  /** Projenin bağlı olduğu kategori (iç linkleme için) */
  category: string;
  description: string;
  image: ImageValue;
  imageAlt: string;
  focus?: string;
  /** Galeride tam genişlikte gösterilsin mi */
  wide?: boolean;
};

/* ------------------------------------------------------------------ */
/* KATEGORİLER                                                         */
/* ------------------------------------------------------------------ */

export const categories: Category[] = [
  {
    slug: "mutfak",
    name: "Mutfak",
    description:
      "Kavisli adalar, gizli aydınlatma ve derz vermeyen dolap yüzeyleri. Ölçüye özel planlanan, günlük kullanımı kolaylaştıran mutfaklar.",
    image: "mutfak-yuvarlak-ada",
    imageAlt: "Yuvarlak fluted adalı, krem renkli ölçüye özel mutfak",
    wide: true,
  },
  {
    slug: "yatak-odasi",
    name: "Yatak Odası",
    description:
      "Kemerli başlıklar, LED'li nişler ve tavana kadar gardıroplar. Dinginliği önceleyen, mekânın ölçüsüne göre kurgulanan yatak odaları.",
    image: "yatak-kemerli",
    imageAlt: "Kemerli ahşap başlıklı, gizli LED aydınlatmalı yatak odası",
  },
  {
    slug: "cocuk-odasi",
    name: "Çocuk Odası",
    description:
      "Güvenli malzeme, yuvarlatılmış kenarlar ve büyümeye ayak uyduran modüler kurgu. Ranza, dolap, çalışma ve oyun alanı tek bir tasarım diliyle planlanır.",
    image: "cocuk-odasi-ayicik",
    imageAlt: "Ayıcık temalı, mavi-beyaz ranzalı ve LED aydınlatmalı çocuk odası",
  },
  {
    slug: "tv-uniteleri",
    name: "TV Üniteleri",
    description:
      "Duvarla bütünleşen paneller, gizli kablo kanalları ve dolaylı aydınlatma. Salonun karakterini belirleyen ana yüzey.",
    image: "tv-acik-mese",
    imageAlt: "Açık meşe kaplamalı, kavisli hatlı LED aydınlatmalı TV ünitesi",
    wide: true,
  },
  {
    slug: "banyo",
    name: "Banyo",
    description:
      "Neme dayanıklı malzemeler, aynalı dolaplar ve kompakt alanlarda bile ferah duran depolama çözümleri.",
    image: "banyo-yuvarlak-ayna",
    imageAlt: "Yuvarlak LED aynalı, beyaz dolaplı ferah banyo",
    focus: "50% 42%",
  },
  {
    slug: "vestiyer",
    name: "Vestiyer & Antre",
    description:
      "Eve girişte ilk izlenim: aynalı paneller, oturaklı üniteler ve görünmeyen ayakkabılık çözümleri.",
    image: "antre-organik-ayna",
    imageAlt: "Organik formlu aynası ve oturaklı ünitesi olan antre",
  },
  {
    slug: "ticari",
    name: "Ticari Projeler",
    description:
      "Güzellik merkezi, klinik ve ofisler için anahtar teslim iç mekân ve mobilya uygulamaları.",
    image: "ticari-kuafor",
    imageAlt: "Aynalı çalışma istasyonlarıyla kuaför ve saç tasarım alanı",
    wide: true,
  },
];

/* ------------------------------------------------------------------ */
/* UYGULAMALAR — kategori sayfalarını ve Öne Çıkan İşler'i besler       */
/* ------------------------------------------------------------------ */

export const products: Product[] = [
  // Mutfak
  {
    slug: "dalgali-ada-mutfak",
    name: "Dalgalı Ada Mutfak",
    category: "mutfak",
    image: "mutfak-dalgali-ada",
    imageAlt: "Dalga formlu fluted adalı, mermer tezgâhlı mutfak",
  },
  {
    slug: "yuvarlak-ada-mutfak",
    name: "Yuvarlak Ada Mutfak",
    category: "mutfak",
    image: "mutfak-yuvarlak-ada",
    imageAlt: "Yuvarlak fluted adalı krem mutfak",
  },
  {
    slug: "beyaz-lake-mutfak",
    name: "Beyaz Lake Mutfak",
    category: "mutfak",
    image: "mutfak-beyaz-lake",
    imageAlt: "Beyaz lake dolaplı, bar taburelerinin olduğu adalı mutfak",
    featured: true,
  },
  {
    slug: "yesil-krem-mutfak",
    name: "Yeşil & Krem Mutfak",
    category: "mutfak",
    image: "mutfak-yesil-krem",
    imageAlt: "Yeşil üst dolaplı, krem alt dolaplı ve LED aydınlatmalı köşe mutfak",
    featured: true,
  },
  {
    slug: "krem-mat-mutfak",
    name: "Krem Mat Mutfak",
    category: "mutfak",
    image: "mutfak-krem-mat",
    imageAlt: "Mat krem dolaplı, ahşap detaylı mutfak",
    featured: true,
  },

  // Yatak Odası
  {
    slug: "kemerli-yatak-odasi",
    name: "Kemerli Başlıklı Yatak Odası",
    category: "yatak-odasi",
    image: "yatak-kemerli",
    imageAlt: "Kemerli ahşap başlıklı yatak odası",
  },
  {
    slug: "sicak-mese-yatak-odasi",
    name: "Sıcak Meşe Yatak Odası",
    category: "yatak-odasi",
    image: "yatak-sicak-mese",
    imageAlt: "Meşe panelli, oval aynalı yatak odası",
    featured: true,
  },
  {
    slug: "koyu-ceviz-yatak-odasi",
    name: "Koyu Ceviz Yatak Odası",
    category: "yatak-odasi",
    image: "yatak-koyu-ceviz",
    imageAlt: "Koyu ceviz kaplamalı yatak odası",
    featured: true,
  },
  {
    slug: "gri-lake-yatak-odasi",
    name: "Gri Lake Yatak Odası",
    category: "yatak-odasi",
    image: "yatak-gri-lake",
    imageAlt: "Gri lake dolaplı, yuvarlak aynalı yatak odası",
  },

  // TV Üniteleri
  {
    slug: "acik-mese-tv-unitesi",
    name: "Açık Meşe TV Ünitesi",
    category: "tv-uniteleri",
    image: "tv-acik-mese",
    imageAlt: "Açık meşe kaplamalı kavisli TV ünitesi",
  },
  {
    slug: "krem-fluted-tv-unitesi",
    name: "Krem Fluted TV Ünitesi",
    category: "tv-uniteleri",
    image: "tv-krem-fluted",
    imageAlt: "Krem fluted panelli, gizli LED aydınlatmalı geniş TV ünitesi",
    featured: true,
  },
  {
    slug: "fluted-gri-tv-unitesi",
    name: "Fluted Gri TV Ünitesi",
    category: "tv-uniteleri",
    image: "tv-fluted-gri",
    imageAlt: "Gri fluted panelli, raflı TV ünitesi",
    featured: true,
  },

  // Çocuk Odası
  {
    slug: "ayicik-cocuk-odasi",
    name: "Ayıcık Temalı Çocuk Odası",
    category: "cocuk-odasi",
    image: "cocuk-odasi-ayicik",
    imageAlt: "Mavi-beyaz ranzalı, ayıcık detaylı çocuk odası",
  },

  // Banyo
  {
    slug: "yuvarlak-aynali-banyo",
    name: "Yuvarlak Aynalı Banyo",
    category: "banyo",
    image: "banyo-yuvarlak-ayna",
    imageAlt: "Yuvarlak LED aynalı, beyaz dolaplı banyo",
  },
  {
    slug: "antrasit-banyo",
    name: "Antrasit Banyo",
    category: "banyo",
    image: "banyo-antrasit",
    imageAlt: "Antrasit dolaplı, LED aynalı banyo",
    featured: true,
  },
  {
    slug: "yesil-altin-banyo",
    name: "Yeşil & Altın Detaylı Banyo",
    category: "banyo",
    image: "banyo-yesil-altin",
    imageAlt: "Yeşil üst dolaplı, altın detaylı ve LED aynalı banyo",
    featured: true,
  },
  {
    slug: "kompakt-banyo-unitesi",
    name: "Kompakt Banyo Ünitesi",
    category: "banyo",
    image: "banyo-kompakt",
    imageAlt: "Kompakt banyoda gri dolap ve yuvarlak LED ayna",
    focus: "50% 40%",
  },

  // Vestiyer & Antre
  {
    slug: "organik-aynali-vestiyer",
    name: "Organik Aynalı Vestiyer",
    category: "vestiyer",
    image: "antre-organik-ayna",
    imageAlt: "Organik formlu aynalı, oturaklı antre ünitesi",
  },
  {
    slug: "oturakli-antre-unitesi",
    name: "Oturaklı Antre Ünitesi",
    category: "vestiyer",
    image: "antre-oturakli",
    imageAlt: "Oturaklı, aynalı ve ahşap panelli antre ünitesi",
    focus: "50% 45%",
    featured: true,
  },
  {
    slug: "lamelli-antre-paneli",
    name: "Lamelli Antre Paneli",
    category: "vestiyer",
    image: "antre-lamelli",
    imageAlt: "Koyu lamelli panelli, boy aynalı antre konsolu",
    focus: "50% 45%",
    featured: true,
  },

  // Ticari
  {
    slug: "kuafor-alani",
    name: "Kuaför ve Saç Tasarım Alanı",
    category: "ticari",
    image: "ticari-kuafor",
    imageAlt: "Aynalı istasyonlarıyla kuaför alanı",
  },
  {
    slug: "kalici-makyaj-unitesi",
    name: "Kalıcı Makyaj Ünitesi",
    category: "ticari",
    image: "ticari-makyaj",
    imageAlt: "Ampullü aynası olan kalıcı makyaj ve uygulama odası",
    featured: true,
  },
];

/* ------------------------------------------------------------------ */
/* PROJELER — Güzellik Merkezi, anahtar teslim uygulama                */
/* ------------------------------------------------------------------ */

export const projects: Project[] = [
  {
    slug: "guzellik-merkezi-resepsiyon",
    name: "Resepsiyon ve Karşılama",
    location: "Güzellik Merkezi",
    year: "2025",
    category: "ticari",
    description:
      "Kavisli tavan nişleri, arkadan aydınlatmalı logo paneli ve tezgâh altı gizli depolama ile karşılama alanı.",
    image: "ticari-resepsiyon",
    imageAlt: "Güzellik merkezi resepsiyon ve karşılama alanı",
    wide: true,
  },
  {
    slug: "guzellik-merkezi-lounge",
    name: "Bekleme ve Dinlenme Salonu",
    location: "Güzellik Merkezi",
    year: "2025",
    category: "ticari",
    description:
      "Yuvarlak oturma grubu, fluted duvar paneli ve ürün teşhir rafları bir arada.",
    image: "ticari-lounge",
    imageAlt: "Güzellik merkezinin bekleme ve dinlenme salonu",
  },
  {
    slug: "guzellik-merkezi-cilt-bakim",
    name: "Cilt Bakım Odası",
    location: "Güzellik Merkezi",
    year: "2025",
    category: "ticari",
    description:
      "Cihaz ve malzeme depolamasını gizleyen dolap sistemi, hijyenik yüzeyler ve yumuşak dolaylı ışık.",
    image: "ticari-cilt-bakim",
    imageAlt: "Güzellik merkezinin cilt bakım odası",
  },
  {
    slug: "guzellik-merkezi-manikur",
    name: "Manikür ve Pedikür Alanı",
    location: "Güzellik Merkezi",
    year: "2025",
    category: "ticari",
    description:
      "Sıralı çalışma istasyonları, ürün teşhir duvarı ve neon marka detayıyla tek parça tasarlanan alan.",
    image: "ticari-manikur",
    imageAlt: "Güzellik merkezinin manikür ve pedikür alanı",
    wide: true,
  },
];

/* ------------------------------------------------------------------ */
/* SABİT GÖRSELLER                                                     */
/* ------------------------------------------------------------------ */

export const heroImage = {
  src: "mutfak-dalgali-ada",
  /** Mobilde kullanılan dikey kırpım (scripts/optimize-images.mjs üretir) */
  portrait: "mutfak-dalgali-ada-dikey",
  alt: "Dalga formlu fluted adası ve mermer tezgâhı olan ölçüye özel mutfak",
};

export const ogImage = heroImage.src;

/* ------------------------------------------------------------------ */
/* SHOWROOM ŞERİDİ (hero'nun hemen altı)                               */
/* ------------------------------------------------------------------ */

export const highlights = [
  {
    title: "Ölçüye özel üretim",
    text: "Her ünite, konulacağı mekânın ölçüsüne ve ışığına göre üretilir.",
  },
  {
    title: "3B görselleştirme",
    text: "Üretime başlamadan önce mekânınızı birebir görüyorsunuz.",
  },
  {
    title: "Teslimat ve montaj",
    text: "Teslimat, montaj ve yerleşim bize ait.",
  },
];

/* ------------------------------------------------------------------ */
/* YARDIMCI FONKSİYONLAR                                               */
/* ------------------------------------------------------------------ */

export const featuredProducts = () => products.filter((p) => p.featured);

export const getCategory = (slug: string) =>
  categories.find((c) => c.slug === slug);

export const getProject = (slug: string) =>
  projects.find((p) => p.slug === slug);

export const otherProjects = (slug: string) =>
  projects.filter((p) => p.slug !== slug);

export const productsByCategory = (slug: string) =>
  products.filter((p) => p.category === slug);

export const categoryName = (slug: string) => getCategory(slug)?.name ?? slug;
