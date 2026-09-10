import type {
  EkKategori,
  EkProje,
  EkUygulama,
  SiteContent,
} from "./content";

/**
 * Vercel Blob katmanı.
 *
 * Panelde yapılan her şey (düzenleme, ekleme, silme) tek bir JSON dosyasında
 * tutulur. Panelden yüklenen fotoğraflar da aynı Blob deposuna gider.
 *
 * `BLOB_READ_WRITE_TOKEN` tanımlı değilse tüm okuma işlemleri boş içerik
 * döndürür; site koddaki varsayılanlarla çalışır, panel de uyarı gösterir.
 */

export const CONTENT_PATH = "icerik/site-icerik.json";

const emptyContent: SiteContent = {
  version: 2,
  updatedAt: "",
  hero: {},
  categories: {},
  products: {},
  projects: {},
  yeni: { categories: [], products: [], projects: [] },
  gizli: { categories: [], products: [], projects: [] },
};

export function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function dizi<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function sluglar(value: unknown): string[] {
  return dizi<unknown>(value).filter(
    (s): s is string => typeof s === "string" && s.length > 0
  );
}

/**
 * Okunan JSON'u beklenen şekle getirir.
 *
 * Panelin ilk sürümü (`version: 1`) ekleme/silme alanlarını içermiyordu;
 * eksik alanlar burada boş olarak tamamlanır, böylece eski kayıtlar
 * kaybolmadan yeni sürümle çalışmaya devam eder.
 */
function normalize(data: Partial<SiteContent> | null): SiteContent {
  if (!data || typeof data !== "object") return emptyContent;

  return {
    version: 2,
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : "",
    hero: data.hero ?? {},
    categories: data.categories ?? {},
    products: data.products ?? {},
    projects: data.projects ?? {},
    yeni: {
      categories: dizi<EkKategori>(data.yeni?.categories),
      products: dizi<EkUygulama>(data.yeni?.products),
      projects: dizi<EkProje>(data.yeni?.projects),
    },
    gizli: {
      categories: sluglar(data.gizli?.categories),
      products: sluglar(data.gizli?.products),
      projects: sluglar(data.gizli?.projects),
    },
  };
}

/**
 * İçerik JSON'unun adresini bulur. Blob URL'leri rastgele son ek içerebildiği
 * için dosya `list()` ile aranır.
 */
async function contentUrl(): Promise<string | null> {
  const { list } = await import("@vercel/blob");
  const { blobs } = await list({ prefix: CONTENT_PATH, limit: 1 });
  return blobs[0]?.url ?? null;
}

async function oku(cacheOption: RequestInit): Promise<SiteContent> {
  if (!isBlobConfigured()) return emptyContent;

  try {
    const url = await contentUrl();
    if (!url) return emptyContent;

    const res = await fetch(url, cacheOption);
    if (!res.ok) return emptyContent;

    return normalize((await res.json()) as Partial<SiteContent>);
  } catch {
    // Blob geçici olarak erişilemezse site varsayılan içerikle ayakta kalır
    return emptyContent;
  }
}

/** Site sayfaları için — ISR ile önbelleklenir, kaydetmede revalidate edilir */
export async function readContent(): Promise<SiteContent> {
  return oku({ next: { revalidate: 300 } } as RequestInit);
}

/** Panelin okuması için — önbelleksiz, her zaman en güncel hali */
export async function readContentFresh(): Promise<SiteContent> {
  return oku({ cache: "no-store" });
}

export async function writeContent(content: SiteContent) {
  const { put } = await import("@vercel/blob");
  await put(CONTENT_PATH, JSON.stringify(content, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  });
}

/** Panelden yüklenen bir fotoğraf boyutunu Blob'a yazar, adresini döndürür */
export async function writeImage(
  path: string,
  data: Buffer | Uint8Array,
  contentType = "image/webp"
) {
  const { put } = await import("@vercel/blob");
  const blob = await put(path, Buffer.from(data), {
    access: "public",
    contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
    // Fotoğraf adresleri benzersiz (zaman damgalı) olduğu için uzun önbellek
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  });
  return blob.url;
}

/**
 * Artık kullanılmayan fotoğrafları depodan siler.
 * Başarısız olursa sessizce geçilir — silme işleminin kendisi bu yüzden
 * başarısız sayılmamalı.
 */
export async function deleteImages(urls: string[]) {
  if (urls.length === 0 || !isBlobConfigured()) return;
  try {
    const { del } = await import("@vercel/blob");
    await del(urls);
  } catch {
    // Yetim dosya kalması siteyi etkilemez
  }
}
