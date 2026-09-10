import {
  categories as defaultCategories,
  products as defaultProducts,
  projects as defaultProjects,
  heroImage as defaultHero,
} from "./data";
import type { Category, Product, Project } from "./data";
import { readContent } from "./blob";

/**
 * SİTE İÇERİĞİ — kod + panel birleşimi.
 *
 * `lib/data.ts` içindeki listeler temel içeriktir. Admin panelinden yapılan
 * her şey Vercel Blob'daki tek bir JSON dosyasında saklanır ve burada
 * birleştirilir. Üç tür panel kaydı vardır:
 *
 *  1. **Düzenleme** (`categories` / `products` / `projects`)
 *     Koddaki bir kaydın üzerine yazma — fotoğraf, başlık, açıklama.
 *  2. **Ekleme** (`yeni`)
 *     Panelden oluşturulan yeni kayıtlar; listelerin **sonuna** eklenir.
 *  3. **Silme** (`gizli`)
 *     Koddan gelen bir kaydın slug'ı buraya yazılır ve kayıt gizlenir.
 *     Panelden eklenen kayıtlar ise doğrudan `yeni` listesinden çıkarılır.
 *
 * Blob yapılandırılmamışsa ya da okunamıyorsa site, koddaki varsayılan
 * içerikle sorunsuz çalışmaya devam eder.
 */

/** Panelden yüklenen bir fotoğrafın Blob'daki tüm boyutları */
export type StoredImage = {
  kind: "blob";
  width: number;
  height: number;
  sources: { w: number; url: string }[];
};

/** Görsel ya yerleşik dosya adıdır ya da panelden yüklenmiş bir kayıt */
export type ImageValue = string | StoredImage;

export type ItemOverride = {
  name?: string;
  description?: string;
  image?: StoredImage;
  imageAlt?: string;
};

export type HeroOverride = {
  image?: StoredImage;
  imageAlt?: string;
};

/* ---------------- Panelden eklenen kayıtlar ---------------- */

export type EkKategori = {
  slug: string;
  name: string;
  description: string;
  image: StoredImage;
  imageAlt: string;
  wide?: boolean;
};

export type EkUygulama = {
  slug: string;
  name: string;
  category: string;
  image: StoredImage;
  imageAlt: string;
  featured?: boolean;
};

export type EkProje = {
  slug: string;
  name: string;
  location: string;
  year: string;
  category: string;
  description: string;
  image: StoredImage;
  imageAlt: string;
  wide?: boolean;
};

export type SiteContent = {
  version: 2;
  updatedAt: string;
  hero: HeroOverride;
  categories: Record<string, ItemOverride>;
  products: Record<string, ItemOverride>;
  projects: Record<string, ItemOverride>;
  yeni: {
    categories: EkKategori[];
    products: EkUygulama[];
    projects: EkProje[];
  };
  gizli: {
    categories: string[];
    products: string[];
    projects: string[];
  };
};

export const emptyContent: SiteContent = {
  version: 2,
  updatedAt: "",
  hero: {},
  categories: {},
  products: {},
  projects: {},
  yeni: { categories: [], products: [], projects: [] },
  gizli: { categories: [], products: [], projects: [] },
};

export function isStoredImage(value: unknown): value is StoredImage {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as StoredImage).kind === "blob" &&
    Array.isArray((value as StoredImage).sources)
  );
}

function merge<T extends Category | Product | Project>(
  item: T,
  over?: ItemOverride
): T {
  if (!over) return item;

  const next: Record<string, unknown> = { ...item };
  const name = over.name?.trim();
  const description = over.description?.trim();
  const imageAlt = over.imageAlt?.trim();

  if (name) next.name = name;
  // Uygulamaların (Product) açıklaması yok; yalnızca varsa güncellenir.
  if (description && "description" in item) next.description = description;
  if (over.image) next.image = over.image;
  if (imageAlt) next.imageAlt = imageAlt;

  return next as T;
}

/**
 * Ana sayfadaki kategori ve proje ızgaraları iki kolonludur; tam genişlikte
 * kartlar (`wide`) çıkarıldıktan sonra geriye tek sayıda kart kalırsa satır
 * sonunda boşluk oluşur. Panelden kayıt eklenip silinebildiği için bu sayı
 * artık sabit değil: son normal kartı tam genişliğe çekerek boşluğu kapatırız.
 */
export function izgaraDenkle<T extends { wide?: boolean }>(liste: T[]): T[] {
  const normalIndeksler = liste
    .map((item, i) => (item.wide ? -1 : i))
    .filter((i) => i >= 0);

  if (normalIndeksler.length % 2 === 0) return liste;

  const son = normalIndeksler[normalIndeksler.length - 1];
  return liste.map((item, i) => (i === son ? { ...item, wide: true } : item));
}

/** Panel düzenlemeleriyle birleştirilmiş kategori listesi */
export async function getCategories(): Promise<Category[]> {
  const content = await readContent();
  const kod = defaultCategories
    .filter((c) => !content.gizli.categories.includes(c.slug))
    .map((c) => merge(c, content.categories[c.slug]));

  return [...kod, ...content.yeni.categories];
}

/**
 * Panel düzenlemeleriyle birleştirilmiş uygulama listesi.
 * Kategorisi silinmiş uygulamalar listelenmez — aksi hâlde kartları var
 * olmayan bir kategori sayfasına bağlanırdı.
 */
export async function getProducts(): Promise<Product[]> {
  const content = await readContent();
  const gorunurKategoriler = new Set(
    (await getCategories()).map((c) => c.slug)
  );

  const kod = defaultProducts
    .filter((p) => !content.gizli.products.includes(p.slug))
    .map((p) => merge(p, content.products[p.slug]));

  return [...kod, ...content.yeni.products].filter((p) =>
    gorunurKategoriler.has(p.category)
  );
}

/** Panel düzenlemeleriyle birleştirilmiş proje listesi */
export async function getProjects(): Promise<Project[]> {
  const content = await readContent();
  const kod = defaultProjects
    .filter((p) => !content.gizli.projects.includes(p.slug))
    .map((p) => merge(p, content.projects[p.slug]));

  return [...kod, ...content.yeni.projects];
}

export async function getCategoryBySlug(slug: string) {
  return (await getCategories()).find((c) => c.slug === slug);
}

export async function getProjectBySlug(slug: string) {
  return (await getProjects()).find((p) => p.slug === slug);
}

export async function getOtherProjects(slug: string) {
  return (await getProjects()).filter((p) => p.slug !== slug);
}

export async function getProductsByCategory(slug: string) {
  return (await getProducts()).filter((p) => p.category === slug);
}

export async function getFeaturedProducts() {
  return (await getProducts()).filter((p) => p.featured);
}

/** Kategori slug'ından görünen ada — ürün kartlarındaki etiket için */
export async function getCategoryLabels(): Promise<Record<string, string>> {
  const list = await getCategories();
  return Object.fromEntries(list.map((c) => [c.slug, c.name]));
}

export type HeroContent = {
  src: ImageValue;
  /** Mobil dikey kırpım — yalnızca yerleşik fotoğrafta vardır */
  portrait: string | null;
  alt: string;
};

/** Ana sayfa hero fotoğrafı */
export async function getHero(): Promise<HeroContent> {
  const content = await readContent();
  const over = content.hero ?? {};

  if (over.image) {
    return {
      src: over.image,
      portrait: null,
      alt: over.imageAlt?.trim() || defaultHero.alt,
    };
  }

  return {
    src: defaultHero.src,
    portrait: defaultHero.portrait,
    alt: over.imageAlt?.trim() || defaultHero.alt,
  };
}
