import manifest from "./image-manifest.json";
import { isStoredImage, type ImageValue } from "./content";

/**
 * Görsel yardımcıları.
 *
 * İki kaynak desteklenir:
 *  1. Yerleşik fotoğraflar — `public/gorseller/` içindeki WebP dosyaları.
 *     `lib/image-manifest.json` hangi genişliklerin üretildiğini tutar;
 *     bu dosya `node scripts/optimize-images.mjs` ile oluşturulur.
 *  2. Admin panelinden yüklenen fotoğraflar — Vercel Blob'da saklanır ve
 *     tüm boyutlarının adresi içerik JSON'unda tutulur.
 */

type Entry = { width: number; height: number; widths: number[] };

const images = manifest as Record<string, Entry>;

export type ImageMeta = { width: number; height: number };

export function imageMeta(value: ImageValue): ImageMeta | undefined {
  if (isStoredImage(value)) return { width: value.width, height: value.height };
  const entry = images[value];
  return entry ? { width: entry.width, height: entry.height } : undefined;
}

/** Tek bir genişlik için dosya adresi. */
export function imageUrl(value: ImageValue, width?: number): string {
  if (isStoredImage(value)) {
    const target = width ?? value.sources[value.sources.length - 1]?.w ?? 0;
    const chosen =
      value.sources.find((s) => s.w >= target) ??
      value.sources[value.sources.length - 1];
    return chosen?.url ?? "";
  }

  const entry = images[value];
  if (!entry) return value; // doğrudan verilen bir yol ise olduğu gibi kullan

  const target = width ?? entry.widths[entry.widths.length - 1];
  const chosen =
    entry.widths.find((w) => w >= target) ?? entry.widths[entry.widths.length - 1];
  return `/gorseller/${value}-${chosen}.webp`;
}

/** Responsive srcset. */
export function imageSrcSet(value: ImageValue): string | undefined {
  if (isStoredImage(value)) {
    return value.sources.map((s) => `${s.url} ${s.w}w`).join(", ");
  }
  const entry = images[value];
  if (!entry) return undefined;
  return entry.widths.map((w) => `${imageUrl(value, w)} ${w}w`).join(", ");
}

/** Görselin doğal en/boy oranı — layout kaymasını önlemek için. */
export function imageRatio(value: ImageValue) {
  const meta = imageMeta(value);
  return meta ? meta.width / meta.height : undefined;
}
