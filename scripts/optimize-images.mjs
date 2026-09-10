/**
 * Fotoğraf optimizasyonu.
 *
 * Kaynak fotoğrafları `gorseller-kaynak/` klasörüne koyup
 *   node scripts/optimize-images.mjs
 * komutunu çalıştırın. Script her fotoğraf için birkaç farklı genişlikte
 * WebP üretir ve `lib/image-manifest.json` dosyasını günceller.
 * Siteye eklenen bileşenler bu manifest'ten srcset üretir.
 *
 * Ayrıca hero fotoğrafı için mobil (3:4) özel kırpım üretilir; böylece
 * dar ekranlarda mobilyanın önemli kısımları kesilmez.
 */
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const SRC_DIR = "gorseller-kaynak";
const OUT_DIR = path.join("public", "gorseller");
const MANIFEST = path.join("lib", "image-manifest.json");
const WIDTHS = [480, 640, 768, 1100, 1536];
const QUALITY = 76;

/** Mobilde dikey kırpım istenen görseller: ad -> hedef oran (en/boy) */
const PORTRAIT_CROPS = {
  "mutfak-dalgali-ada": 0.72,
};

await fs.mkdir(OUT_DIR, { recursive: true });

const files = (await fs.readdir(SRC_DIR)).filter((f) =>
  /\.(png|jpe?g|webp)$/i.test(f)
);

const manifest = {};

for (const file of files.sort()) {
  const name = path.basename(file, path.extname(file));
  const input = path.join(SRC_DIR, file);
  const meta = await sharp(input).metadata();

  const widths = WIDTHS.filter((w) => w <= meta.width);
  if (widths.length === 0 || widths.at(-1) !== Math.min(meta.width, WIDTHS.at(-1))) {
    widths.push(meta.width);
  }

  for (const w of widths) {
    await sharp(input)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(path.join(OUT_DIR, `${name}-${w}.webp`));
  }

  manifest[name] = { width: meta.width, height: meta.height, widths };

  // Mobil dikey kırpım
  const ratio = PORTRAIT_CROPS[name];
  if (ratio) {
    const cropW = Math.min(meta.width, Math.round(meta.height * ratio));
    const cropH = Math.min(meta.height, Math.round(cropW / ratio));
    const portraitWidths = [420, 640, 900].filter((w) => w <= cropW);
    if (!portraitWidths.includes(cropW)) portraitWidths.push(cropW);

    for (const w of portraitWidths) {
      await sharp(input)
        .extract({
          left: Math.round((meta.width - cropW) / 2),
          top: Math.round((meta.height - cropH) / 2),
          width: cropW,
          height: cropH,
        })
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(path.join(OUT_DIR, `${name}-dikey-${w}.webp`));
    }
    manifest[`${name}-dikey`] = {
      width: cropW,
      height: cropH,
      widths: portraitWidths,
    };
  }

  console.log(`${name}  ${meta.width}x${meta.height}  ->  ${widths.join(", ")}`);
}

await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\n${Object.keys(manifest).length} görsel işlendi.`);
