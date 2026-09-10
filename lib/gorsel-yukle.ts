import sharp from "sharp";
import { writeImage } from "./blob";
import type { StoredImage } from "./content";

/**
 * Panelden yüklenen fotoğrafı sitenin kullandığı boyutlarda WebP'ye çevirip
 * Vercel Blob'a yazar. Yalnızca sunucu tarafında (Node runtime) çalışır.
 */

/** Sitedeki `Img` bileşeninin beklediği genişlikler */
const WIDTHS = [480, 640, 768, 1100, 1536];
const QUALITY = 76;

/** Yüklenen fotoğrafın kabul edilen en büyük dosya boyutu */
export const MAX_BYTES = 12 * 1024 * 1024;

/** Gelen dosyanın fotoğraf olduğunu ve boyutunun uygun olduğunu doğrular */
export function dosyaKontrol(file: File): string | null {
  if (file.size > MAX_BYTES) return "Fotoğraf çok büyük (en fazla 12 MB).";
  if (!file.type.startsWith("image/"))
    return "Yalnızca fotoğraf yükleyebilirsiniz.";
  return null;
}

export async function gorselIsle(
  file: File,
  bolum: string,
  slug: string
): Promise<StoredImage> {
  const input = Buffer.from(await file.arrayBuffer());
  const meta = await sharp(input, { failOn: "none" }).rotate().metadata();

  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (!width || !height) throw new Error("Fotoğraf okunamadı.");

  // Dosya adı zaman damgalı: eski sürüm önbellekte kalsa bile yenisi görünür
  const damga = Date.now().toString(36);

  /**
   * Üretilecek genişlikler. Fotoğraf 1536 pikselden darsa büyütmeyiz;
   * bunun yerine en büyük boyut olarak fotoğrafın kendi genişliği kullanılır,
   * böylece geniş ekranda bulanıklaşmaz.
   */
  const enBuyuk = Math.min(width, WIDTHS[WIDTHS.length - 1]);
  const hedefler = [...WIDTHS.filter((w) => w < enBuyuk), enBuyuk];

  const sources: { w: number; url: string }[] = [];
  for (const w of hedefler) {
    const buffer = await sharp(input, { failOn: "none" })
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();

    const url = await writeImage(
      `gorseller/${bolum}/${slug}-${damga}-${w}.webp`,
      buffer
    );
    sources.push({ w, url });
  }

  sources.sort((a, b) => a.w - b.w);
  return { kind: "blob", width, height, sources };
}
