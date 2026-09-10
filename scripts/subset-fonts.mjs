/**
 * FONT ALT KÜME ARACI
 *
 * Inter ve Manrope'un değişken sürümlerini yalnızca sitenin ihtiyaç duyduğu
 * karakterlere indirir: Latin + Türkçe + noktalama + para birimi.
 *
 *   170 KiB (4 dosya)  →  32 KiB (2 dosya)
 *
 * Fontların değişken kalınlık ekseni (wght) korunur; sitedeki 400/500/600
 * ağırlıkları aynı dosyadan gelmeye devam eder.
 *
 * Çalıştırmak için:
 *   pip install fonttools brotli
 *   node scripts/subset-fonts.mjs
 *
 * Kaynak fontlar `@fontsource-variable/*` paketlerinden gelir (devDependencies).
 * Çıktı `public/fonts/` içine yazılır; `app/globals.css` bu dosyaları kullanır.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";

/** Latin + Latin Extended-A (Türkçe) + noktalama + para birimi + oklar */
const UNICODES = [
  "U+0000-00FF",
  "U+0100-017F",
  "U+2000-206F",
  "U+20A0-20BF",
  "U+2122",
  "U+2190-2193",
  "U+2212",
  "U+FEFF",
  "U+FFFD",
].join(",");

const ISLER = [
  {
    kaynak:
      "node_modules/@fontsource-variable/inter/files/inter-latin-ext-wght-normal.woff2",
    cikti: "public/fonts/inter-tr.woff2",
  },
  {
    kaynak:
      "node_modules/@fontsource-variable/manrope/files/manrope-latin-ext-wght-normal.woff2",
    cikti: "public/fonts/manrope-tr.woff2",
  },
];

mkdirSync("public/fonts", { recursive: true });

for (const { kaynak, cikti } of ISLER) {
  if (!existsSync(kaynak)) {
    console.error(`Kaynak font bulunamadı: ${kaynak}\n→ npm install çalıştırın.`);
    process.exit(1);
  }

  execFileSync(
    "python3",
    [
      "-m",
      "fontTools.subset",
      kaynak,
      `--unicodes=${UNICODES}`,
      "--layout-features=*",
      "--flavor=woff2",
      `--output-file=${cikti}`,
      "--name-IDs=*",
      "--notdef-outline",
      "--recommended-glyphs",
    ],
    { stdio: "inherit" }
  );

  const kb = Math.round(statSync(cikti).size / 1024);
  console.log(`${cikti.padEnd(30)} ${kb} KiB`);
}

console.log(
  "\nBitti. Yedek font metriklerini değiştirdiyseniz app/globals.css içindeki\n" +
    "ascent-override / size-adjust değerlerini de güncelleyin."
);
