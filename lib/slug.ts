/**
 * Slug üretimi ve doğrulaması.
 *
 * Hem panelde (tarayıcı) hem de API tarafında aynı kural geçerli olsun diye
 * ortak dosyada. Türkçe karakterler ASCII karşılıklarına çevrilir.
 */

/** Adres satırında kullanılabilecek slug deseni */
export const SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const SLUG_MAKS = 60;

export function slugify(input: string): string {
  return (
    input
      // Türkçe büyük harfler: İ ve I ayrı ayrı ele alınmalı
      .replace(/İ/g, "I")
      .replace(/I/g, "i")
      .toLowerCase()
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      // Kalan aksanları ayıkla (é → e gibi)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, SLUG_MAKS)
      .replace(/-+$/g, "")
  );
}

export function slugGecerliMi(slug: string): boolean {
  return (
    slug.length >= 2 && slug.length <= SLUG_MAKS && SLUG_DESENI.test(slug)
  );
}
