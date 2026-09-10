import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "http://127.0.0.1:4321";
const OUT = "/tmp/admin-test";
fs.mkdirSync(OUT, { recursive: true });

const sonuc = [];
const kontrol = (ad, kosul, ek = "") => {
  sonuc.push({ ad, ok: Boolean(kosul), ek });
  console.log(`${kosul ? "PASS" : "FAIL"}  ${ad}${ek ? " — " + ek : ""}`);
};

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

// ---------------------------------------------------------------- oturum yok
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();

  await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
  kontrol("Oturumsuz /admin giriş sayfasına yönlenir", page.url().endsWith("/admin/giris"), page.url());

  const api = await page.request.post(`${BASE}/api/admin/kaydet`, { data: {} });
  kontrol("Oturumsuz kaydetme 401 döner", api.status() === 401, String(api.status()));

  // Yanlış şifre
  await page.fill('input[type="password"]', "yanlis");
  await page.click('button[type="submit"]');
  let alertMetin = "";
  try {
    // Not: Next.js sayfada boş bir role="alert" duyurucu tutar; kendi
    // hata mesajımızı sınıfıyla seçiyoruz.
    await page.waitForSelector(".yp-durum--err", { timeout: 8000 });
    alertMetin = (await page.textContent(".yp-durum--err")) ?? "";
  } catch {
    alertMetin = "(uyarı görünmedi)";
  }
  kontrol("Yanlış şifre hata gösterir", alertMetin.includes("hatalı"), alertMetin);

  await ctx.close();
}

// ---------------------------------------------------------------- giriş + panel
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const konsol = [];
page.on("console", (m) => m.type() === "error" && konsol.push(m.text()));
page.on("pageerror", (e) => konsol.push(String(e)));

await page.goto(`${BASE}/admin/giris`, { waitUntil: "domcontentloaded" });
await page.fill('input[type="password"]', "Sifre1234");
await page.click('button[type="submit"]');
await page.waitForURL(`${BASE}/admin`, { timeout: 30000 });
await page.waitForSelector(".yp-card", { timeout: 30000 });
kontrol("Doğru şifreyle panele girilir", page.url() === `${BASE}/admin`);

const uyariVar = await page.locator(".yp-uyari").count();
kontrol("Depo bağlıyken uyarı gösterilmez", uyariVar === 0);

// Sekme sayıları
const sekmeler = ["Ana Sayfa", "Kategoriler", "Projeler", "Uygulamalar"];
const sayilar = {};
for (const s of sekmeler) {
  await page.click(`button.yp__tab:text-is("${s}")`);
  await page.waitForTimeout(120);
  sayilar[s] = await page.locator(".yp-card").count();
}
kontrol("Ana Sayfa: 1 kayıt", sayilar["Ana Sayfa"] === 1, String(sayilar["Ana Sayfa"]));
kontrol("Kategoriler: 7 kayıt", sayilar["Kategoriler"] === 7, String(sayilar["Kategoriler"]));
kontrol("Projeler: 4 kayıt", sayilar["Projeler"] === 4, String(sayilar["Projeler"]));
kontrol("Uygulamalar: 22 kayıt", sayilar["Uygulamalar"] === 22, String(sayilar["Uygulamalar"]));

// Mobil ekran görüntüsü
await page.click('button.yp__tab:text-is("Kategoriler")');
await page.waitForTimeout(200);
await page.screenshot({ path: path.join(OUT, "panel-390.png"), fullPage: false });

// ------------------------------------------------- fotoğraf + metin değiştirme
const kaynak = "gorseller-kaynak/banyo-antrasit.jpg"; // mutfak'ta kullanılmayan bir foto
const kart = page.locator(".yp-card").first(); // Mutfak
await kart.locator('input[type="file"]').setInputFiles(kaynak);
await kart.locator('input[type="text"]').first().fill("Mutfak Dolapları");
await kart.locator("textarea").fill("Panelden güncellenmiş kategori açıklaması.");
await kart.locator('input[type="text"]').last().fill("Panelden yüklenen mutfak fotoğrafı");
await kart.locator('button[type="submit"]').click();

await page.waitForSelector('.yp-durum--ok', { timeout: 30000 });
kontrol("Kategori kaydı başarılı", true);

const rozet = await kart.locator(".yp-card__rozet").count();
kontrol("Kart 'Panelden' rozeti gösterir", rozet === 1);

await page.screenshot({ path: path.join(OUT, "panel-kaydedildi-390.png") });

// Yazılan JSON gerçekten diskte mi
const jsonYol = ".testblob/icerik/site-icerik.json";
const jsonVar = fs.existsSync(jsonYol);
kontrol("İçerik JSON'u yazıldı", jsonVar);
let icerik = null;
if (jsonVar) {
  icerik = JSON.parse(fs.readFileSync(jsonYol, "utf8"));
  const m = icerik.categories?.mutfak;
  kontrol("JSON'da yeni başlık var", m?.name === "Mutfak Dolapları", m?.name);
  kontrol("JSON'da yeni açıklama var", m?.description?.startsWith("Panelden"), m?.description?.slice(0, 30));
  kontrol("JSON'da çoklu boyut var", m?.image?.sources?.length >= 3, String(m?.image?.sources?.length));
  const genislikler = m?.image?.sources?.map((s) => s.w) ?? [];
  kontrol("Boyutlar artan sırada ve 480 ile başlar", genislikler[0] === 480 && genislikler.every((w, i) => i === 0 || w > genislikler[i - 1]), JSON.stringify(genislikler));
  const dosyalar = m?.image?.sources?.every((s) => fs.existsSync(path.join(".testblob", new URL(s.url).pathname.slice(1))));
  kontrol("Tüm WebP dosyaları diskte", dosyalar);
}

// ---------------------------------------------------------------- site tarafı
const siteCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const sitePage = await siteCtx.newPage();
const siteHatalar = [];
sitePage.on("pageerror", (e) => siteHatalar.push(String(e)));

await sitePage.goto(`${BASE}/`, { waitUntil: "load" });
await sitePage.waitForTimeout(400);

const anaSayfaMetin = await sitePage.textContent("body");
kontrol("Ana sayfada yeni kategori başlığı görünür", anaSayfaMetin.includes("Mutfak Dolapları"));
kontrol("Ana sayfada yeni açıklama görünür", anaSayfaMetin.includes("Panelden güncellenmiş kategori açıklaması."));

const blobSrc = await sitePage.locator('img[src*="127.0.0.1:4322"]').count();
kontrol("Ana sayfada panelden yüklenen görsel servis edilir", blobSrc > 0, `${blobSrc} adet`);

// Görsel gerçekten yüklendi mi (kırık değil)
const bozuk = await sitePage.evaluate(() => {
  // Ekranın altındaki lazy görseller henüz yüklenmemiş olabilir; yalnızca
  // görüntü alanına giren görseller kontrol edilir.
  const gorunur = [...document.images].filter((i) => {
    const r = i.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight * 1.2;
  });
  return gorunur
    .filter((i) => !i.complete || i.naturalWidth === 0)
    .map((i) => i.currentSrc || i.src);
});
kontrol("Ana sayfada kırık görsel yok", bozuk.length === 0, bozuk.slice(0, 3).join(" | "));

// Header/footer hâlâ yerinde (chrome bölünmesi bozmadı mı)
kontrol("Header var", (await sitePage.locator("header.header").count()) === 1);
kontrol("Footer var", (await sitePage.locator("footer.footer").count()) === 1);
kontrol("WhatsApp butonu var", (await sitePage.locator(".fab").count()) === 1);
kontrol("Tek H1 var", (await sitePage.locator("h1").count()) === 1);
kontrol("main#icerik var", (await sitePage.locator("main#icerik").count()) === 1);
kontrol("JSON-LD var", (await sitePage.locator('script[type="application/ld+json"]').count()) >= 1);

// Kategori sayfası
await sitePage.goto(`${BASE}/kategori/mutfak`, { waitUntil: "load" });
const katMetin = await sitePage.textContent("body");
kontrol("Kategori sayfası yeni başlığı kullanır", katMetin.includes("Mutfak Dolapları"));
const katH1 = await sitePage.textContent("h1");
kontrol("Kategori H1 doğru", katH1.trim() === "Mutfak Dolapları", katH1.trim());
const katBozuk = await sitePage.evaluate(() =>
  [...document.images].filter((i) => {
    const r = i.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight * 1.2 && (!i.complete || i.naturalWidth === 0);
  }).length
);
kontrol("Kategori sayfasında kırık görsel yok", katBozuk === 0);

// Proje sayfası
await sitePage.goto(`${BASE}/proje/guzellik-merkezi-lounge`, { waitUntil: "load" });
kontrol("Proje sayfası açılır", (await sitePage.locator("h1").count()) === 1);

// 404
const r404 = await sitePage.goto(`${BASE}/olmayan-sayfa`, { waitUntil: "domcontentloaded" });
kontrol("404 sayfası header/footer ile gelir", (await sitePage.locator("footer.footer").count()) === 1, `HTTP ${r404.status()}`);

// robots
const robots = await sitePage.request.get(`${BASE}/robots.txt`);
const robotsText = await robots.text();
kontrol("robots.txt /admin'i engeller", robotsText.includes("Disallow: /admin"), robotsText.replace(/\n/g, " | "));

await sitePage.screenshot({ path: path.join(OUT, "site-1280.png"), fullPage: false });

// ---------------------------------------------------------------- geri alma
await page.bringToFront();
await page.locator(".yp-card").first().locator('button:text-is("Eski fotoğrafa dön")').click();
await page.waitForSelector(".yp-durum--ok", { timeout: 20000 });
await page.waitForTimeout(500);
const icerik2 = JSON.parse(fs.readFileSync(jsonYol, "utf8"));
kontrol("Geri alma görseli siler", !icerik2.categories?.mutfak?.image);
kontrol("Geri alma metni korur", icerik2.categories?.mutfak?.name === "Mutfak Dolapları");

// ISR yenilenmesi bir istek gecikebilir; kısa bir tekrar denemesi
await sitePage.goto(`${BASE}/kategori/mutfak`, { waitUntil: "load" });
await sitePage.waitForTimeout(800);
await sitePage.reload({ waitUntil: "load" });
await sitePage.waitForTimeout(400);
const geriBozuk = await sitePage.evaluate(() =>
  [...document.images]
    .filter((i) => {
      const r = i.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight * 1.2 && (!i.complete || i.naturalWidth === 0);
    })
    .map((i) => i.currentSrc || i.src)
);
kontrol("Geri alma sonrası site sağlam", geriBozuk.length === 0, geriBozuk.join(" | "));

// ---------------------------------------------------------------- çıkış
// Masaüstü panel görünümü
const genisCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const genisPage = await genisCtx.newPage();
await genisPage.goto(`${BASE}/admin/giris`, { waitUntil: "load" });
await genisPage.fill('input[type="password"]', "Sifre1234");
await genisPage.click('button[type="submit"]');
await genisPage.waitForSelector(".yp-card", { timeout: 30000 });
await genisPage.click('button.yp__tab:text-is("Kategoriler")');
await genisPage.waitForTimeout(400);
await genisPage.screenshot({ path: path.join(OUT, "panel-1280.png") });
const yatayTasma = await genisPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
kontrol("Panelde yatay taşma yok (1280px)", !yatayTasma);
await genisCtx.close();

const darTasma = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
kontrol("Panelde yatay taşma yok (390px)", !darTasma);

await page.click('button:text-is("Çıkış")');
await page.waitForURL(`${BASE}/admin/giris`, { timeout: 10000 });
kontrol("Çıkış giriş sayfasına döner", page.url().endsWith("/admin/giris"));
await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
kontrol("Çıkış sonrası panel kapalı", page.url().endsWith("/admin/giris"));

kontrol("Panelde JS hatası yok", konsol.length === 0, konsol.slice(0, 2).join(" | "));
kontrol("Sitede JS hatası yok", siteHatalar.length === 0, siteHatalar.slice(0, 2).join(" | "));

await browser.close();

const basarisiz = sonuc.filter((s) => !s.ok);
console.log(`\n${sonuc.length - basarisiz.length}/${sonuc.length} test geçti`);
if (basarisiz.length) process.exit(1);
