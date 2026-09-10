/**
 * SEO denetimi — üretilen HTML'i gerçekten okur.
 * Sunucu 4321'de ayakta olmalı.
 */
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4321";
const KANONIK_KOK = "https://www.erenmobilyatasarimatasehir.com";

const sonuc = [];
const kontrol = (ad, kosul, ek = "") => {
  sonuc.push({ ad, ok: Boolean(kosul) });
  console.log(`${kosul ? "PASS" : "FAIL"}  ${ad}${ek ? " — " + ek : ""}`);
};

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

/** Sayfanın SEO ile ilgili tüm etiketlerini toplar */
async function topla(yol) {
  const res = await page.goto(`${BASE}${yol}`, { waitUntil: "load" });
  return {
    durum: res.status(),
    ...(await page.evaluate(() => {
      const meta = (n) =>
        document.querySelector(`meta[name="${n}"]`)?.getAttribute("content") ?? null;
      const og = (p) =>
        document.querySelector(`meta[property="${p}"]`)?.getAttribute("content") ?? null;
      const ldler = [...document.querySelectorAll('script[type="application/ld+json"]')].map(
        (s) => s.textContent
      );
      return {
        lang: document.documentElement.lang,
        title: document.title,
        titleSayisi: document.querySelectorAll("title").length,
        description: meta("description"),
        robots: meta("robots"),
        canonical:
          document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
        ogTitle: og("og:title"),
        ogDesc: og("og:description"),
        ogImage: og("og:image"),
        ogImageW: og("og:image:width"),
        ogImageH: og("og:image:height"),
        ogImageAlt: og("og:image:alt"),
        ogUrl: og("og:url"),
        ogType: og("og:type"),
        ogSite: og("og:site_name"),
        ogLocale: og("og:locale"),
        twCard: meta("twitter:card"),
        twTitle: meta("twitter:title"),
        twImage: meta("twitter:image"),
        h1Sayisi: document.querySelectorAll("h1").length,
        h1: document.querySelector("h1")?.innerText?.trim() ?? "",
        manifest: document.querySelector('link[rel="manifest"]')?.getAttribute("href") ?? null,
        appleIcon:
          document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute("href") ?? null,
        ldler,
        gorselAltsiz: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
        keywords: meta("keywords"),
        favicon: [...document.querySelectorAll('link[rel~="icon"]')].map((l) => l.getAttribute("href")),
        // Genel metinli bağlantılar açıklayıcı bir title taşımalı
        genelLinkler: [...document.querySelectorAll("a")]
          // Not: JS'de "İ".toLowerCase() Türkçe'de beklenen "i"yi vermez,
          // bu yüzden metinler olduğu gibi karşılaştırılır.
          .filter((a) => ["İncele", "Kategoriyi İncele", "Projeyi İncele", "Bilgi Alın"].includes((a.textContent || "").trim()))
          .map((a) => ({ metin: a.textContent.trim(), title: a.getAttribute("title") })),
        titlesizGorselLink: [...document.querySelectorAll('a[aria-hidden="true"]')]
          .filter((a) => !a.getAttribute("title")).length,
        sosyalRel: [...document.querySelectorAll('a[href*="instagram"],a[href*="facebook"],a[href*="tiktok"]')]
          .map((a) => a.getAttribute("rel")),
        // next/script "afterInteractive": head'e preload düşer, <script> ise
        // hidrasyondan sonra eklenir. İkisinden biri yeterli.
        gtag: Boolean(
          document.querySelector('script[src*="googletagmanager.com/gtag/js"]') ||
            document.querySelector('link[rel="preload"][href*="googletagmanager.com/gtag/js"]')
        ),
      };
    })),
  };
}

const ld = (s) => {
  const hepsi = [];
  for (const metin of s.ldler) {
    try {
      const v = JSON.parse(metin);
      hepsi.push(...(Array.isArray(v) ? v : [v]));
    } catch {
      hepsi.push({ __bozuk: true });
    }
  }
  return hepsi;
};
const tipler = (s) =>
  ld(s).flatMap((n) => (n["@graph"] ? n["@graph"] : [n])).map((n) => n["@type"]).flat();

/* ------------------------------------------------------------- ANA SAYFA */
const ana = await topla("/");
kontrol("Ana sayfa: lang=tr", ana.lang === "tr", ana.lang);
kontrol("Ana sayfa: tek <title>", ana.titleSayisi === 1);
kontrol("Ana sayfa: başlık SERP'te kırpılmıyor (<=60)", ana.title.length <= 60, `${ana.title.length} karakter`);
kontrol("Ana sayfa: meta description var", Boolean(ana.description));
kontrol(
  "Ana sayfa: açıklama 160 karakteri aşmıyor",
  (ana.description?.length ?? 999) <= 160,
  `${ana.description?.length} karakter`
);
// Next kök adresi eğik çizgisiz yazar; ikisi de aynı adrestir
kontrol(
  "Ana sayfa: canonical mutlak ve doğru",
  ana.canonical === KANONIK_KOK || ana.canonical === `${KANONIK_KOK}/`,
  ana.canonical
);
kontrol("Ana sayfa: tek h1", ana.h1Sayisi === 1);
kontrol("Ana sayfa: og:title", Boolean(ana.ogTitle));
kontrol("Ana sayfa: og:image mutlak", ana.ogImage?.startsWith("https://"), ana.ogImage);
kontrol("Ana sayfa: og:image boyutları bildirilmiş", Boolean(ana.ogImageW && ana.ogImageH), `${ana.ogImageW}x${ana.ogImageH}`);
kontrol("Ana sayfa: og:image genişliği >= 1200", Number(ana.ogImageW) >= 1200, ana.ogImageW);
kontrol("Ana sayfa: og:image:alt", Boolean(ana.ogImageAlt));
kontrol("Ana sayfa: og:type=website", ana.ogType === "website", ana.ogType);
kontrol("Ana sayfa: og:site_name", Boolean(ana.ogSite));
kontrol("Ana sayfa: og:locale=tr_TR", ana.ogLocale === "tr_TR", ana.ogLocale);
kontrol("Ana sayfa: twitter card", ana.twCard === "summary_large_image");
kontrol("Ana sayfa: robots index", (ana.robots ?? "index").includes("index") && !(ana.robots ?? "").includes("noindex"), ana.robots);
kontrol("Ana sayfa: manifest bağlı", Boolean(ana.manifest));
kontrol("Ana sayfa: apple-touch-icon var", Boolean(ana.appleIcon), ana.appleIcon);
kontrol("Ana sayfa: alt metni olmayan görsel yok", ana.gorselAltsiz === 0, String(ana.gorselAltsiz));

const anaLd = ld(ana);
kontrol("Ana sayfa: tüm JSON-LD geçerli", anaLd.every((n) => !n.__bozuk));
const anaTipler = tipler(ana);
kontrol("Ana sayfa: FurnitureStore var", anaTipler.includes("FurnitureStore"), anaTipler.join(", "));
kontrol("Ana sayfa: WebSite var", anaTipler.includes("WebSite"));
kontrol("Ana sayfa: WebPage var", anaTipler.includes("WebPage"));
kontrol("Ana sayfa: ItemList var", anaTipler.includes("ItemList"));

const isletme = anaLd
  .flatMap((n) => (n["@graph"] ? n["@graph"] : [n]))
  .find((n) => String(n["@type"]).includes("FurnitureStore"));
kontrol("İşletmede telefon var", Array.isArray(isletme?.telephone) && isletme.telephone.length === 2);
kontrol("İşletmede e-posta var", isletme?.email === "erenmobilya18@gmail.com");
kontrol("İşletmede sosyal hesaplar var", (isletme?.sameAs?.length ?? 0) === 3);
kontrol("İşletmede logo var", Boolean(isletme?.logo?.url));

// KULLANICI KURALI: adres / konum iddiası olmamalı
const hamLd = JSON.stringify(anaLd);
kontrol("JSON-LD'de PostalAddress YOK", !hamLd.includes("PostalAddress"));
kontrol("JSON-LD'de address alanı YOK", !/"address"/.test(hamLd));
kontrol("JSON-LD'de areaServed YOK", !hamLd.includes("areaServed"));
kontrol("JSON-LD'de geo/koordinat YOK", !/"geo"|latitude|longitude/.test(hamLd));

/* --------------------------------------------------------- KATEGORİ SAYFASI */
const kat = await topla("/kategori/mutfak");
kontrol("Kategori: canonical doğru", kat.canonical === `${KANONIK_KOK}/kategori/mutfak`, kat.canonical);
kontrol("Kategori: başlıkta marka var", kat.title.includes("Eren Mobilya Tasarım Ataşehir"), kat.title);
kontrol("Kategori: açıklama 160'ı aşmıyor", (kat.description?.length ?? 999) <= 160, `${kat.description?.length}`);
kontrol("Kategori: og:url doğru", kat.ogUrl === `${KANONIK_KOK}/kategori/mutfak`, kat.ogUrl);
kontrol("Kategori: og:image mutlak", kat.ogImage?.startsWith("https://"), kat.ogImage);
kontrol("Kategori: twitter:image var", Boolean(kat.twImage));
kontrol("Kategori: tek h1", kat.h1Sayisi === 1);
const katTipler = tipler(kat);
kontrol("Kategori: BreadcrumbList var", katTipler.includes("BreadcrumbList"));
kontrol("Kategori: CollectionPage var", katTipler.includes("CollectionPage"));
const koleksiyon = ld(kat).find((n) => n["@type"] === "CollectionPage");
kontrol(
  "Kategori: ItemList uygulamaları listeliyor",
  (koleksiyon?.mainEntity?.itemListElement?.length ?? 0) > 0,
  `${koleksiyon?.mainEntity?.itemListElement?.length} kayıt`
);
kontrol("Kategori: tüm JSON-LD geçerli", ld(kat).every((n) => !n.__bozuk));

/* ------------------------------------------------------------ PROJE SAYFASI */
const proje = await topla("/proje/guzellik-merkezi-lounge");
kontrol("Proje: canonical doğru", proje.canonical === `${KANONIK_KOK}/proje/guzellik-merkezi-lounge`, proje.canonical);
kontrol("Proje: og:type=article", proje.ogType === "article", proje.ogType);
kontrol("Proje: og:image mutlak", proje.ogImage?.startsWith("https://"));
kontrol("Proje: tek h1", proje.h1Sayisi === 1);
const projeTipler = tipler(proje);
kontrol("Proje: BreadcrumbList var", projeTipler.includes("BreadcrumbList"));
kontrol("Proje: CreativeWork var", projeTipler.includes("CreativeWork"));
kontrol("Proje: tüm JSON-LD geçerli", ld(proje).every((n) => !n.__bozuk));

/* ------------------------------------------------ SEO ARACI BULGULARI */
kontrol("meta keywords etiketi YOK (Google kullanmıyor)", ana.keywords === null, ana.keywords ?? "");
kontrol("favicon bağlantısı var", ana.favicon.length > 0, ana.favicon.join(" | "));
kontrol(
  "Sosyal hesap bağlantılarında rel=me var",
  ana.sosyalRel.length > 0 && ana.sosyalRel.every((r) => (r ?? "").includes("me")),
  ana.sosyalRel.join(" | ")
);
kontrol(
  "Sosyal bağlantılarda noopener korunuyor",
  ana.sosyalRel.every((r) => (r ?? "").includes("noopener"))
);
kontrol(
  "Genel metinli bağlantıların hepsinde açıklayıcı title var",
  ana.genelLinkler.length > 0 && ana.genelLinkler.every((l) => l.title && l.title.length > 10),
  `${ana.genelLinkler.length} bağlantı`
);
kontrol(
  "Görsel bağlantılarında title var",
  ana.titlesizGorselLink === 0,
  `${ana.titlesizGorselLink} eksik`
);
const anaWebPage = anaLd.find((n) => n["@type"] === "WebPage");
kontrol(
  "Schema WebPage adı görünen H1 ile aynı",
  anaWebPage?.name && ana.h1.includes(anaWebPage.name),
  `schema: ${anaWebPage?.name}`
);
kontrol("Google etiketi (gtag) yükleniyor", ana.gtag);

const ico = await page.request.get(`${BASE}/favicon.ico`);
kontrol("favicon.ico servis ediliyor", ico.status() === 200, `HTTP ${ico.status()}`);

/* ------------------------------------------------------- FONT / PERFORMANS */
const fontlar = await page.evaluate(() =>
  [...document.querySelectorAll('link[rel="preload"][as="font"]')].map((l) => l.getAttribute("href"))
);
kontrol("Fontlar ön yükleniyor", fontlar.length === 2, fontlar.join(" | "));
for (const f of fontlar) {
  const res = await page.request.get(`${BASE}${f}`);
  const kb = Math.round(Number(res.headers()["content-length"] || 0) / 1024);
  kontrol(`${f} servis ediliyor ve küçük (<40 KiB)`, res.status() === 200 && kb > 0 && kb < 40, `${kb} KiB`);
}
const heroOn = await page.evaluate(() =>
  [...document.querySelectorAll('link[rel="preload"][as="image"]')].length
);
kontrol("Hero fotoğrafı ön yükleniyor", heroOn > 0, `${heroOn} etiket`);

/* ------------------------------------------------------ NOINDEX OLMASI GEREKENLER */
const yok = await topla("/olmayan-sayfa");
kontrol("404: HTTP 404 dönüyor", yok.durum === 404, `HTTP ${yok.durum}`);
kontrol("404: noindex", (yok.robots ?? "").includes("noindex"), yok.robots);

const giris = await topla("/admin/giris");
kontrol("Admin girişi: noindex", (giris.robots ?? "").includes("noindex"), giris.robots);

/* --------------------------------------------------------------- ROBOTS / SITEMAP */
const robots = await (await page.request.get(`${BASE}/robots.txt`)).text();
kontrol("robots.txt: Sitemap satırı var", robots.includes(`Sitemap: ${KANONIK_KOK}/sitemap.xml`), robots.split("\n").filter(Boolean).join(" | "));
kontrol("robots.txt: /admin engelli", robots.includes("Disallow: /admin"));
kontrol("robots.txt: /api engelli", robots.includes("Disallow: /api/"));
kontrol("robots.txt: Host satırı var", /Host:/.test(robots));

const sm = await (await page.request.get(`${BASE}/sitemap.xml`)).text();
kontrol("sitemap.xml: XML bildirimi", sm.trimStart().startsWith("<?xml"));
kontrol("sitemap.xml: image ad alanı tanımlı", sm.includes("http://www.google.com/schemas/sitemap-image/1.1"));
const urlSayisi = (sm.match(/<url>/g) ?? []).length;
kontrol("sitemap.xml: 12 adres (1 + 7 kategori + 4 proje)", urlSayisi === 12, `${urlSayisi} adres`);
kontrol("sitemap.xml: görseller listeleniyor", (sm.match(/<image:loc>/g) ?? []).length === 11, `${(sm.match(/<image:loc>/g) ?? []).length} görsel`);
kontrol("sitemap.xml: adresler mutlak", !/<loc>\/|<loc>http:\/\/127/.test(sm));
kontrol("sitemap.xml: /admin yok", !sm.includes("/admin"));

const mfRes = await page.request.get(`${BASE}/manifest.webmanifest`);
let mf = null;
try { mf = JSON.parse(await mfRes.text()); } catch {}
kontrol("manifest: geçerli JSON", Boolean(mf));
kontrol("manifest: 192 ve 512 px ikonlar var",
  ["192x192", "512x512"].every((s) => mf?.icons?.some((i) => i.sizes === s)));
kontrol("manifest: maskable ikon var", mf?.icons?.some((i) => i.purpose === "maskable"));

const apple = await page.request.get(`${BASE}/apple-icon.png`);
kontrol("apple-icon.png servis ediliyor", apple.status() === 200, `HTTP ${apple.status()}`);

/* ---------------------------------------------- ESKİ MARKA / YASAKLI İÇERİK */
const anaHtml = await (await page.request.get(`${BASE}/`)).text();
/**
 * Eski marka adları hiçbir yerde geçmemeli. Tam kelime aranır: "Ataşehir
 * mobilyacı" gibi meşru anahtar kelimeler yanlışlıkla eşleşmesin.
 */
const yasaklar = [
  ["Ataşehir Mobilya", /ataşehir\s+mobilya(?![a-zçğıöşü])/i],
  ["Eren Mobilya Dekorasyon", /eren\s+mobilya\s+dekorasyon/i],
  ["unsplash", /unsplash/i],
];
for (const [ad, desen] of yasaklar) {
  const eslesme = anaHtml.match(desen);
  kontrol(`Ana sayfada "${ad}" geçmiyor`, !eslesme, eslesme?.[0] ?? "");
}

await browser.close();

const basarisiz = sonuc.filter((s) => !s.ok);
console.log(`\n${sonuc.length - basarisiz.length}/${sonuc.length} SEO kontrolü geçti`);
if (basarisiz.length) process.exit(1);
