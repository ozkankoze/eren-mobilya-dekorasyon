/**
 * Admin panelinin CRUD davranışını uçtan uca sınar.
 * Çalıştırmadan önce: sunucu 4321'de, sahte Blob sunucusu 4322'de ayakta olmalı.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "http://127.0.0.1:4321";
const OUT = "/tmp/admin-crud";
const JSON_YOL = ".testblob/icerik/site-icerik.json";
fs.mkdirSync(OUT, { recursive: true });

const sonuc = [];
const kontrol = (ad, kosul, ek = "") => {
  sonuc.push({ ad, ok: Boolean(kosul) });
  console.log(`${kosul ? "PASS" : "FAIL"}  ${ad}${ek ? " — " + ek : ""}`);
};
const icerik = () =>
  fs.existsSync(JSON_YOL) ? JSON.parse(fs.readFileSync(JSON_YOL, "utf8")) : null;

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const jsHatalar = [];
page.on("pageerror", (e) => jsHatalar.push(String(e)));

await page.goto(`${BASE}/admin/giris`, { waitUntil: "domcontentloaded" });
await page.fill('input[type="password"]', "Sifre1234");
await page.click('button[type="submit"]');
await page.waitForSelector(".yp-card", { timeout: 30000 });

const sekme = (ad) => page.click(`button.yp__tab:text-is("${ad}")`);
const kartlar = () => page.locator(".yp-card:not(.yp-card--yeni)");

// ---------------------------------------------------------- KURAL: Ana Sayfa
await sekme("Ana Sayfa");
await page.waitForTimeout(200);
kontrol(
  "Ana Sayfa'da ekleme düğmesi YOK",
  (await page.locator(".yp__ekle").count()) === 0
);
kontrol("Ana Sayfa kaydı silinemez", (await page.locator('button:text-is("Sil")').count()) === 0);
kontrol("Ana Sayfa'da tek kayıt var", (await kartlar().count()) === 1);

// ---------------------------------------------------------------- KATEGORİ +
await sekme("Kategoriler");
await page.waitForTimeout(200);
const kategoriOnce = await kartlar().count();
kontrol("Kategoriler'de ekleme düğmesi var", (await page.locator(".yp-btn--ekle").count()) === 1);

await page.click(".yp-btn--ekle");
await page.waitForSelector(".yp-card--yeni");
const yeniForm = page.locator(".yp-card--yeni");

await yeniForm.locator('input[type="text"]').first().fill("Çalışma Odası & Ofis");
await page.waitForTimeout(150);
const otoSlug = await yeniForm.locator('input[type="text"]').nth(1).inputValue();
kontrol("Slug addan otomatik üretildi", otoSlug === "calisma-odasi-ofis", otoSlug);

// Fotoğrafsız gönderim reddedilmeli
await yeniForm.locator('button[type="submit"]').click();
await page.waitForSelector(".yp-card--yeni .yp-durum--err", { timeout: 8000 });
kontrol(
  "Fotoğrafsız ekleme reddedilir",
  (await yeniForm.locator(".yp-durum--err").textContent())?.includes("Fotoğraf")
);

await yeniForm.locator('input[type="file"]').setInputFiles("gorseller-kaynak/mutfak-krem-mat.jpg");
await yeniForm.locator("textarea").fill("Evden çalışanlar için ölçüye özel çalışma odası çözümleri.");
await yeniForm.locator('input[type="text"]').last().fill("Ahşap raflı çalışma odası");
await yeniForm.locator('button[type="submit"]').click();

await page.waitForSelector(".yp-card--yeni", { state: "detached", timeout: 40000 });
await page.waitForTimeout(600);
kontrol("Kategori eklendi (liste büyüdü)", (await kartlar().count()) === kategoriOnce + 1);

const c1 = icerik();
const yeniKat = c1?.yeni?.categories?.[0];
kontrol("JSON'a kategori yazıldı", yeniKat?.slug === "calisma-odasi-ofis", yeniKat?.slug);
kontrol("Yeni kategoride görsel var", (yeniKat?.image?.sources?.length ?? 0) >= 3);
kontrol(
  "Yeni kategori listenin SONUNDA",
  (await kartlar().nth(kategoriOnce).locator("h2").textContent())?.includes("Çalışma Odası")
);
kontrol(
  "Yeni kayıtta 'Panelden eklendi' rozeti var",
  (await kartlar().nth(kategoriOnce).locator(".yp-card__rozet").textContent()) ===
    "Panelden eklendi"
);

// Aynı slug ikinci kez eklenemez
await page.click(".yp-btn--ekle");
await page.waitForSelector(".yp-card--yeni");
const form2 = page.locator(".yp-card--yeni");
await form2.locator('input[type="text"]').first().fill("Çalışma Odası & Ofis");
await form2.locator('input[type="file"]').setInputFiles("gorseller-kaynak/mutfak-krem-mat.jpg");
await form2.locator('button[type="submit"]').click();
await page.waitForSelector(".yp-card--yeni .yp-durum--err", { timeout: 40000 });
kontrol(
  "Aynı slug ikinci kez eklenemez",
  (await form2.locator(".yp-durum--err").textContent())?.includes("kullanılıyor")
);
await form2.locator('button:text-is("Vazgeç")').click();

// ---------------------------------------------------------------- UYGULAMA +
await sekme("Uygulamalar");
await page.waitForTimeout(200);
const uygulamaOnce = await kartlar().count();
await page.click(".yp-btn--ekle");
await page.waitForSelector(".yp-card--yeni");
const uForm = page.locator(".yp-card--yeni");
await uForm.locator('input[type="text"]').first().fill("Beyaz Çalışma Masası");
await uForm.locator("select").selectOption("calisma-odasi-ofis");
await uForm.locator('input[type="file"]').setInputFiles("gorseller-kaynak/antre-lamelli.jpg");
await uForm.locator('input[type="checkbox"]').check();
await uForm.locator('button[type="submit"]').click();
await page.waitForSelector(".yp-card--yeni", { state: "detached", timeout: 40000 });
await page.waitForTimeout(600);
kontrol("Uygulama eklendi", (await kartlar().count()) === uygulamaOnce + 1);

const c2 = icerik();
kontrol(
  "Uygulama doğru kategoriye bağlandı",
  c2?.yeni?.products?.[0]?.category === "calisma-odasi-ofis"
);
kontrol("Öne çıkar işareti kaydedildi", c2?.yeni?.products?.[0]?.featured === true);

// ------------------------------------------------------------------- PROJE +
await sekme("Projeler");
await page.waitForTimeout(200);
const projeOnce = await kartlar().count();
await page.click(".yp-btn--ekle");
await page.waitForSelector(".yp-card--yeni");
const pForm = page.locator(".yp-card--yeni");
await pForm.locator('input[type="text"]').first().fill("Ofis Katı Yenileme");
await pForm.locator("select").selectOption("calisma-odasi-ofis");
const pMetin = pForm.locator('input[type="text"]');
await pMetin.nth(2).fill("Plaza Ofis"); // Yer
await pMetin.nth(3).fill("2026"); // Yıl
await pForm.locator("textarea").fill("Açık ofis için ölçüye özel dolap ve çalışma istasyonları.");
await pForm.locator('input[type="file"]').setInputFiles("gorseller-kaynak/ticari-makyaj.jpg");
await pForm.locator('button[type="submit"]').click();
await page.waitForSelector(".yp-card--yeni", { state: "detached", timeout: 40000 });
await page.waitForTimeout(600);
kontrol("Proje eklendi", (await kartlar().count()) === projeOnce + 1);

const c3 = icerik();
const yeniProje = c3?.yeni?.projects?.[0];
kontrol("Proje alanları tam", yeniProje?.location === "Plaza Ofis" && yeniProje?.year === "2026",
  `${yeniProje?.location} / ${yeniProje?.year}`);

// ------------------------------------------------------- SİTEDE GÖRÜNÜYOR MU
const siteCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const sitePage = await siteCtx.newPage();
const siteHatalar = [];
sitePage.on("pageerror", (e) => siteHatalar.push(String(e)));

await sitePage.goto(`${BASE}/`, { waitUntil: "load" });
await sitePage.waitForTimeout(500);
const anaMetin = await sitePage.textContent("body");
kontrol("Yeni kategori ana sayfada", anaMetin.includes("Çalışma Odası & Ofis"));
kontrol("Yeni proje ana sayfada", anaMetin.includes("Ofis Katı Yenileme"));
kontrol("Öne çıkan yeni uygulama ana sayfada", anaMetin.includes("Beyaz Çalışma Masası"));
kontrol(
  "Footer'da yeni kategori linki var",
  (await sitePage.locator('footer a[href="/kategori/calisma-odasi-ofis"]').count()) > 0
);

// Izgara boşluğu: geniş olmayan kart sayısı çift olmalı
const denge = await sitePage.evaluate(() => {
  const say = (sel, wide) =>
    document.querySelectorAll(sel).length - document.querySelectorAll(wide).length;
  return {
    kategori: say(".catcard", ".catcard--wide"),
    proje: say(".project", ".project--wide"),
  };
});
kontrol("Kategori ızgarasında boşluk yok", denge.kategori % 2 === 0, `normal kart: ${denge.kategori}`);
kontrol("Proje ızgarasında boşluk yok", denge.proje % 2 === 0, `normal kart: ${denge.proje}`);

const r1 = await sitePage.goto(`${BASE}/kategori/calisma-odasi-ofis`, { waitUntil: "load" });
kontrol("Yeni kategori sayfası açılıyor", r1.status() === 200, `HTTP ${r1.status()}`);
kontrol("Kategori H1 doğru", (await sitePage.textContent("h1")).trim() === "Çalışma Odası & Ofis");
kontrol(
  "Yeni uygulama kategori sayfasında listeleniyor",
  (await sitePage.textContent("body")).includes("Beyaz Çalışma Masası")
);

const r2 = await sitePage.goto(`${BASE}/proje/ofis-kati-yenileme`, { waitUntil: "load" });
kontrol("Yeni proje sayfası açılıyor", r2.status() === 200, `HTTP ${r2.status()}`);
kontrol("Proje künyesi doğru", (await sitePage.textContent("body")).includes("Plaza Ofis"));

const smText = await (await sitePage.request.get(`${BASE}/sitemap.xml`)).text();
kontrol("Sitemap yeni kategoriyi içeriyor", smText.includes("/kategori/calisma-odasi-ofis"));
kontrol("Sitemap yeni projeyi içeriyor", smText.includes("/proje/ofis-kati-yenileme"));

const bozuk = await sitePage.evaluate(() =>
  [...document.images]
    .filter((i) => {
      const r = i.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight * 1.2;
    })
    .filter((i) => !i.complete || i.naturalWidth === 0)
    .map((i) => i.currentSrc || i.src)
);
kontrol("Yeni sayfalarda kırık görsel yok", bozuk.length === 0, bozuk.slice(0, 3).join(" | "));

// ------------------------------------------------------ PANEL KAYDINI DÜZENLE
await page.bringToFront();
await sekme("Projeler");
await page.waitForTimeout(300);
const projeKart = kartlar().nth(projeOnce);
await projeKart.locator('input[type="text"]').first().fill("Ofis Katı Yenileme 2");
await projeKart.locator('input[type="text"]').nth(2).fill("2027"); // Yıl
await projeKart.locator('button[type="submit"]').click();
await page.waitForSelector(".yp-durum--ok", { timeout: 30000 });
await page.waitForTimeout(600);
const c4 = icerik();
kontrol(
  "Panel kaydı düzenlenebiliyor",
  c4?.yeni?.projects?.[0]?.name === "Ofis Katı Yenileme 2" &&
    c4?.yeni?.projects?.[0]?.year === "2027",
  `${c4?.yeni?.projects?.[0]?.name} / ${c4?.yeni?.projects?.[0]?.year}`
);

// ------------------------------------------------------------- SİLME + ONAY
await sekme("Uygulamalar");
await page.waitForTimeout(300);
const silinecek = kartlar().nth(uygulamaOnce);
const silinecekGorseller = (icerik()?.yeni?.products?.[0]?.image?.sources ?? []).map(
  (s) => path.join(".testblob", new URL(s.url).pathname.slice(1))
);

await silinecek.locator('button:text-is("Sil")').click();
await page.waitForSelector(".yp-onaykutu");
kontrol("Silmeden önce onay isteniyor", (await page.locator(".yp-onaykutu").count()) === 1);
kontrol(
  "Onay kutusunda kayıt adı geçiyor",
  (await page.locator(".yp-onaykutu").textContent())?.includes("Beyaz Çalışma Masası")
);

// Vazgeç gerçekten vazgeçiyor mu
await page.locator('.yp-onaykutu button:text-is("Vazgeç")').click();
await page.waitForTimeout(300);
kontrol("Vazgeç silmiyor", (await kartlar().count()) === uygulamaOnce + 1);

await silinecek.locator('button:text-is("Sil")').click();
await page.waitForSelector(".yp-onaykutu");
await page.locator('.yp-onaykutu button:text-is("Evet, sil")').click();
await page.waitForTimeout(2500);
kontrol("Onaydan sonra kayıt silindi", (await kartlar().count()) === uygulamaOnce);
kontrol("JSON'dan uygulama kaldırıldı", (icerik()?.yeni?.products ?? []).length === 0);
kontrol(
  "Silinen kaydın fotoğraf dosyaları da temizlendi",
  silinecekGorseller.length > 0 && silinecekGorseller.every((f) => !fs.existsSync(f))
);

// --------------------------------------------- KODDAN GELEN KAYDI SİLME (gizle)
await sekme("Kategoriler");
await page.waitForTimeout(300);
await kartlar().first().locator('button:text-is("Sil")').click(); // Mutfak
await page.waitForSelector(".yp-onaykutu");
await page.locator('.yp-onaykutu button:text-is("Evet, sil")').click();
await page.waitForTimeout(2500);
kontrol("Koddan gelen kategori gizlendi", (icerik()?.gizli?.categories ?? []).includes("mutfak"));
kontrol("Kategori listesinden düştü", (await kartlar().count()) === kategoriOnce);

await sitePage.bringToFront();
await sitePage.goto(`${BASE}/`, { waitUntil: "load" });
await sitePage.waitForTimeout(400);
const anaMetin2 = await sitePage.textContent("body");
kontrol("Silinen kategori ana sayfada yok", !anaMetin2.includes("Kategoriyi İncele\nMutfak"));
kontrol(
  "Silinen kategorinin footer linki yok",
  (await sitePage.locator('footer a[href="/kategori/mutfak"]').count()) === 0
);
const r3 = await sitePage.goto(`${BASE}/kategori/mutfak`, { waitUntil: "domcontentloaded" });
kontrol("Silinen kategori sayfası 404", r3.status() === 404, `HTTP ${r3.status()}`);

const smText2 = await (await sitePage.request.get(`${BASE}/sitemap.xml`)).text();
kontrol("Sitemap'ten de düştü", !smText2.includes("/kategori/mutfak"));

await sitePage.goto(`${BASE}/`, { waitUntil: "load" });
await sitePage.waitForTimeout(400);
const denge2 = await sitePage.evaluate(() => {
  const say = (sel, wide) =>
    document.querySelectorAll(sel).length - document.querySelectorAll(wide).length;
  return say(".catcard", ".catcard--wide");
});
kontrol("Silmeden sonra da ızgarada boşluk yok", denge2 % 2 === 0, `normal kart: ${denge2}`);
// Ekran altındaki lazy görseller henüz yüklenmemiş olabilir; yalnızca
// görüntü alanına girenler kontrol edilir.
const gorunurKirik = (sayfa) =>
  sayfa.evaluate(() =>
    [...document.images]
      .filter((i) => {
        const r = i.getBoundingClientRect();
        return r.bottom > 0 && r.top < window.innerHeight * 1.2;
      })
      .filter((i) => !i.complete || i.naturalWidth === 0)
      .map((i) => i.currentSrc || i.src)
  );
const kirik2 = await gorunurKirik(sitePage);
kontrol("Silmeden sonra kırık görsel yok", kirik2.length === 0, kirik2.slice(0, 3).join(" | "));

// -------------------------------------------------------------- MOBİL GÖRÜNÜM
await page.bringToFront();
await sekme("Projeler");
await page.waitForTimeout(300);
await page.click(".yp-btn--ekle");
await page.waitForSelector(".yp-card--yeni");
const tasma = await page.evaluate(
  () => document.documentElement.scrollWidth > window.innerWidth + 1
);
kontrol("Panelde yatay taşma yok (390px)", !tasma);
await page.screenshot({ path: path.join(OUT, "yeni-kayit-390.png") });
await page.locator('.yp-card--yeni button:text-is("Vazgeç")').click();

const genisCtx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
const genisPage = await genisCtx.newPage();
await genisPage.goto(`${BASE}/admin/giris`, { waitUntil: "load" });
await genisPage.fill('input[type="password"]', "Sifre1234");
await genisPage.click('button[type="submit"]');
await genisPage.waitForSelector(".yp-card", { timeout: 30000 });
await genisPage.click('button.yp__tab:text-is("Projeler")');
await genisPage.click(".yp-btn--ekle");
await genisPage.waitForSelector(".yp-card--yeni");
await genisPage.waitForTimeout(300);
await genisPage.screenshot({ path: path.join(OUT, "yeni-kayit-1280.png") });
const tasma2 = await genisPage.evaluate(
  () => document.documentElement.scrollWidth > window.innerWidth + 1
);
kontrol("Panelde yatay taşma yok (1280px)", !tasma2);

kontrol("Panelde JS hatası yok", jsHatalar.length === 0, jsHatalar.slice(0, 2).join(" | "));
kontrol("Sitede JS hatası yok", siteHatalar.length === 0, siteHatalar.slice(0, 2).join(" | "));

await browser.close();

const basarisiz = sonuc.filter((s) => !s.ok);
console.log(`\n${sonuc.length - basarisiz.length}/${sonuc.length} test geçti`);
if (basarisiz.length) process.exit(1);
