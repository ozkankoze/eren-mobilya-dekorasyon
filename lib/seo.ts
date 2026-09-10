import { imageMeta, imageUrl } from "./images";
import { isStoredImage, type ImageValue } from "./content";
import { site } from "./site";

/**
 * SEO yardımcıları.
 *
 * Amaç: her sayfada aynı kurallarla üretilen canonical adres, meta açıklama
 * ve Open Graph görseli. Böylece yeni bir sayfa eklendiğinde SEO alanlarını
 * elle yazmak gerekmez.
 */

/** Arama sonuçlarında kırpılmadan görünen açıklama uzunluğu */
const ACIKLAMA_SINIRI = 158;

/** Site kökünden mutlak adres üretir (`/kategori/mutfak` → `https://…`) */
export function mutlakAdres(yol: string): string {
  if (/^https?:\/\//i.test(yol)) return yol;
  return `${site.url}${yol.startsWith("/") ? yol : `/${yol}`}`;
}

/**
 * Meta açıklamayı arama sonucunda kırpılmayacak uzunluğa getirir.
 * Kelime ortasından kesmez.
 */
export function metaAciklama(metin: string, sinir = ACIKLAMA_SINIRI): string {
  const temiz = metin.replace(/\s+/g, " ").trim();
  if (temiz.length <= sinir) return temiz;

  const kesilmis = temiz.slice(0, sinir - 1);
  const bosluk = kesilmis.lastIndexOf(" ");
  return `${(bosluk > 40 ? kesilmis.slice(0, bosluk) : kesilmis).replace(/[.,;:\-–—]$/, "")}…`;
}

export type OgGorsel = {
  url: string;
  width: number;
  height: number;
  alt: string;
};

/**
 * Paylaşım görseli. Open Graph için en az 1200 piksel genişlik önerilir;
 * elimizdeki en büyük sürüm seçilir ve gerçek en/boy oranı bildirilir —
 * böylece WhatsApp ve Facebook önizlemesi kırpılmadan çıkar.
 */
export function ogGorsel(image: ImageValue, alt: string): OgGorsel[] {
  const meta = imageMeta(image);
  const url = mutlakAdres(imageUrl(image, 1536));
  if (!meta) return [{ url, width: 1536, height: 1024, alt }];

  // Servis edilen sürümün gerçek boyutu: genişlik 1536'ya ölçeklenmiş hâli
  const genislik = Math.min(meta.width, 1536);
  const yukseklik = Math.round((genislik / meta.width) * meta.height);
  return [{ url, width: genislik, height: yukseklik, alt }];
}

/**
 * Panelden yüklenmiş bir görselin sunucu adresi (Vercel Blob).
 * Hero fotoğrafı oradan geliyorsa sayfaya `preconnect` eklenir; bu, en büyük
 * görselin (LCP) yüklenmesini hızlandırır.
 */
export function blobKokeni(image: ImageValue): string | null {
  if (!isStoredImage(image)) return null;
  const ilk = image.sources[0]?.url;
  if (!ilk) return null;
  try {
    return new URL(ilk).origin;
  } catch {
    return null;
  }
}
