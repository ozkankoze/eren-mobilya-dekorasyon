# Eren Mobilya Tasarım

Modern, sade ve premium bir mobilya markası web sitesi.
Next.js 16 (App Router) + TypeScript + saf CSS ile geliştirildi. Ekstra CSS
framework'ü yok, fontlar site içinden servis edilir (dışarıya font isteği gitmez).

---

## Hızlı başlangıç

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # üretim derlemesi
```

## Vercel'e yükleme

1. Bu klasörü bir GitHub deposuna gönderin (ya da Vercel CLI ile `vercel` komutunu çalıştırın).
2. Vercel'de **Add New → Project** ile depoyu seçin.
3. Framework otomatik olarak **Next.js** algılanır — ayar değiştirmenize gerek yok.
4. **Storage → Blob** bölümünden bir Blob deposu oluşturup projeye bağlayın.
   Vercel `BLOB_READ_WRITE_TOKEN` değişkenini otomatik ekler.
5. **Settings → Environment Variables** altına yönetim paneli için iki değişken ekleyin
   (aşağıdaki tabloya bakın).
6. **Deploy**.
7. Domain'i bağladıktan sonra `lib/site.ts` içindeki `url` alanını kendi alan
   adınızla güncelleyin (canonical, Open Graph ve sitemap bu değeri kullanır),
   ardından yeniden deploy edin.

### Ortam değişkenleri

| Değişken | Zorunlu | Ne işe yarar |
| --- | --- | --- |
| `ADMIN_PASSWORD` | Panel için | `/admin` giriş şifresi. Uzun ve tahmin edilemez seçin. |
| `ADMIN_SECRET` | Panel için | Oturum çerezini imzalayan gizli anahtar. Rastgele uzun bir metin (örn. `openssl rand -base64 32`). Değiştirirseniz açık oturumlar kapanır. |
| `BLOB_READ_WRITE_TOKEN` | Panel için | Vercel Blob deposu bağlandığında otomatik gelir. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Hayır | Google Search Console doğrulama kodu. Tanımlı değilse etiket basılmaz. |
| `NEXT_PUBLIC_YANDEX_VERIFICATION` | Hayır | Yandex Webmaster doğrulama kodu. |
| `NEXT_PUBLIC_GOOGLE_TAG_ID` | Hayır | Google etiketi (Ads/Analytics). Tanımsızsa `AW-18442698100` kullanılır; boş değer verirseniz etiket hiç yüklenmez. |

Bu değişkenler tanımlı değilse **site normal çalışmaya devam eder**; yalnızca
yönetim paneli devre dışı kalır ve sayfalar `lib/data.ts` içindeki
varsayılan içerikle yayınlanır.

Sayfalar statik olarak üretilir (SSG); panelden bir değişiklik kaydedildiğinde
ilgili sayfalar arka planda yeniden üretilir.

---

## Yönetim paneli (`/admin`)

Müşterinin kod bilmeden fotoğraf ve metin değiştirebilmesi için siteden bağımsız
bir panel vardır: **https://alanadiniz.com/admin**

- **Giriş:** tek şifre (`ADMIN_PASSWORD`). Oturum 14 gün açık kalır, çerez
  HttpOnly ve imzalıdır; `/admin` altındaki her adres oturum ister.
- **Sekmeler:** Ana Sayfa · Kategoriler · Projeler · Uygulamalar
- **Düzenleme:** her kayıtta fotoğraf, başlık, açıklama ve fotoğraf açıklaması
  (alt metni) değiştirilebilir.
- **Ekleme ve silme:** Ana Sayfa dışındaki üç bölümde tam CRUD vardır —
  "+ Yeni … Ekle" düğmesiyle kayıt oluşturulur, her kart kendi **Sil**
  düğmesiyle kaldırılır (silmeden önce kart içinde onay istenir).
  Ana Sayfa bilinçli olarak kapsam dışıdır: hero tek bir sabit bölümdür,
  çoğaltılamaz ve silinemez.

| Bölüm | Eklerken doldurulan alanlar |
| --- | --- |
| Kategori | fotoğraf (zorunlu), ad, slug, açıklama, alt metin |
| Proje | fotoğraf (zorunlu), ad, slug, kategori, yer, yıl, açıklama, alt metin |
| Uygulama | fotoğraf (zorunlu), ad, slug, kategori, alt metin, "öne çıkar" |

- **Slug:** ad yazılırken otomatik üretilir (Türkçe karakterler ASCII'ye
  çevrilir), istenirse elle değiştirilebilir. Aynı adres iki kez kullanılamaz.
- **Yeni kayıtlar listenin sonuna eklenir** ve ana sayfa, kategori/proje alt
  sayfaları, footer menüsü ile `sitemap.xml` otomatik güncellenir.
- **Panelden eklenen kayıtlarda** yapısal alanlar (kategori, yer, yıl, öne
  çıkar) sonradan da düzenlenebilir.
- **Fotoğraf yükleme:** seçilen fotoğraf tarayıcıda küçültülür, sunucuda
  480 / 768 / 1100 / 1536 px WebP sürümleri üretilir ve Vercel Blob'a yazılır.
  Site bu sürümleri `srcset` ile servis eder — yani panelden yüklenen fotoğraflar
  da koddaki fotoğraflar kadar hızlıdır.
- **Geri alma:** "Eski fotoğrafa dön" düğmesi koddan gelen bir kaydın
  fotoğrafını `lib/data.ts` içindeki özgün hâline döndürür. Metinler korunur.
- **Silme nasıl çalışır:** panelden eklenen kayıt JSON'dan tamamen çıkarılır ve
  fotoğraf dosyaları Blob'dan silinir. Koddan gelen kayıt çalışma anında
  `lib/data.ts`'ten silinemeyeceği için slug'ı bir "gizli" listesine yazılır;
  kayıt sitede görünmez olur, üzerine yazma verisi ve panelden yüklenmiş
  fotoğrafı temizlenir. Kalıcı olarak kaldırmak isterseniz `lib/data.ts`
  içinden de silebilirsiniz.
- **Kategori silinince** o kategoriye bağlı uygulamalar da listelerden çıkar —
  böylece var olmayan bir sayfaya bağlantı kalmaz.
- **Güvenlik ağı:** panel düzenlemeleri Blob'daki tek bir JSON dosyasında
  "üzerine yazma" olarak durur. Depo erişilemezse ya da JSON bozulursa site
  otomatik olarak koddaki varsayılan içerikle çalışmaya devam eder.
- Panel `robots.txt` ile ve `noindex` etiketiyle arama motorlarına kapalıdır.

Panelin dosyaları: `app/admin/`, `app/api/admin/`, `components/admin/`,
`lib/auth.ts`, `lib/blob.ts`, `lib/content.ts`, `lib/admin-ortak.ts`,
`lib/gorsel-yukle.ts`, `lib/slug.ts`, `proxy.ts`.

**Şifreyi değiştirmek:** Vercel → Settings → Environment Variables →
`ADMIN_PASSWORD` değerini güncelleyip **Redeploy** edin.

---

## İçeriği nereden değiştiririm?

> Fotoğraf ve başlık değişiklikleri için koda dokunmanız gerekmez —
> yukarıdaki `/admin` paneli bunun içindir. Aşağıdakiler kategori/proje
> *eklemek* ya da yapıyı değiştirmek içindir.

Neredeyse her şey iki dosyada:

| Dosya | İçerik |
| --- | --- |
| `lib/site.ts` | Marka adı, **logo**, telefon, WhatsApp numarası, menü, alan adı |
| `lib/data.ts` | Kategoriler, uygulamalar, projeler ve görseller |

Bir kategori, uygulama veya proje eklemek için ilgili diziye yeni bir nesne
eklemeniz yeterli. Ana sayfa, kategori alt sayfaları, menüler, sitemap ve
`/kategori/...` adresleri otomatik olarak güncellenir.

Bir uygulamayı ana sayfadaki **Öne Çıkan İşler** bölümünde göstermek için
kaydına `featured: true` ekleyin. Şu an 12 uygulama seçili (3'lü grid).

Ana sayfadaki **Kategoriler** bölümü, her kategoriyi büyük bir fotoğraf +
ad + kısa açıklama + "Kategoriyi İncele" bağlantısı olan bir kart olarak
gösterir. Masaüstünde 2 kolonluk editorial grid kullanılır; bir kategoriye
`wide: true` verirseniz o kart tam genişlikte gösterilir (şu an Mutfak,
TV Üniteleri ve Ticari Projeler böyle). Geniş olmayan kart sayısı tek kalırsa
satır sonunda boşluk oluşurdu; `izgaraDenkle()` (lib/content.ts) son normal
kartı otomatik olarak tam genişliğe çeker, böylece panelden kategori eklenip
silindiğinde ızgara bozulmaz. Mobilde tüm kartlar tek kolonda alt alta akar.

### Logo

| Dosya | Kullanım |
| --- | --- |
| `public/logo.svg` | Yatay kilit (EREN | MOBİLYA TASARIM / ATAŞEHİR) — header ve footer |
| `public/logo-mark.svg` | Kare monogram — sosyal medya, uygulama ikonu |
| `app/icon.svg` | Favicon (monogramın aynısı) |

Logo, sitenin başlık fontu Manrope'un harflerinden gerçek vektör yollarına
çevrilerek üretildi; hiçbir fontun kurulu olmasına bağlı değildir ve her
ölçekte keskindir. Arka planı transparandır.

**Header ve footer her zaman yatay wordmark'ı kullanır** — kare monogram
(`logo-mark.svg`) yalnızca favicon ve manifest içindir.

Wordmark, `components/site/LogoWordmark.tsx` içinde satır içi (inline) SVG
olarak gömülüdür ve `public/logo.svg` ile birebir aynı çizimdir. Böylece
`fill="currentColor"` çalışır: logo hero fotoğrafının üzerinde beyaz, sayfa
kaydırılınca koyu antrasit görünür.

Logonun ekrandaki yüksekliği `app/globals.css` → `.wordmark svg` kuralındadır
(header 12–17px, footer 16–22px; dar ekranlarda taşmaması için `clamp` ile
küçülür).

Logoyu değiştirmek isterseniz `public/logo.svg` dosyasını güncelleyip aynı
`viewBox` ve `path` verisini `components/site/LogoWordmark.tsx` içine
taşıyın.

### Fotoğraflar

Sitedeki tüm fotoğraflar sizin gerçek uygulama görsellerinizdir. Kaynak
dosyalar `gorseller-kaynak/` klasöründe, siteye servis edilen optimize
sürümler ise `public/gorseller/` klasöründedir.

**Yeni fotoğraf eklemek:**

1. Fotoğrafı `gorseller-kaynak/` klasörüne anlamlı bir adla koyun
   (örn. `mutfak-ada-antrasit.jpg`).
2. `node scripts/optimize-images.mjs` çalıştırın. Script her fotoğraf için
   480 / 768 / 1100 / 1536 px genişliklerde WebP üretir ve
   `lib/image-manifest.json` dosyasını günceller.
3. `lib/data.ts` içinde ilgili yere dosyanın adını (uzantısız) yazın.

**Kırpma kontrolü:** `lib/data.ts` içindeki her kayıtta isteğe bağlı `focus`
alanı vardır; CSS `object-position` değeri alır (örn. `"50% 40%"`). Kare veya
geniş çerçevede mobilyanın önemli kısmı kadraj dışında kalıyorsa bu değerle
odağı kaydırabilirsiniz.

**Mobil hero kırpımı:** Hero fotoğrafı için ayrı bir dikey kırpım üretilir.
Hangi görselin dikey kırpılacağı `scripts/optimize-images.mjs` içindeki
`PORTRAIT_CROPS` listesinde tanımlıdır.

### Marka adı, telefon ve adres

Marka adı `lib/site.ts` içinde iki alanda tutulur: `name` (metinlerde ve
structured data'da kullanılan tam ad) ve `wordmark` (header/footer'da büyük
harfle yazılan hâli). İkisini değiştirmeniz sitenin tamamı için yeterlidir.

**Adres:** Henüz adres bilgisi olmadığı için sitede hiçbir yerde adres ya da
konum bilgisi yok — `site.address` alanı kaldırıldı, JSON-LD'de `PostalAddress`
bulunmuyor. Adres netleştiğinde `lib/site.ts` içine bir `address` nesnesi
ekleyip footer ve `app/(site)/layout.tsx` içindeki `jsonLd` sabitine bağlayabilirsiniz.

### Sosyal medya ve e-posta

`lib/site.ts` içinde `email` alanı ve `social` dizisi vardır. Sosyal medya
bağlantıları üç yerde birden görünür (İletişim bölümü, footer, mobil menü) ve
JSON-LD'deki `sameAs` alanına da otomatik eklenir — arama motorlarının siteyi
hesaplarınızla eşleştirmesi için. Yeni bir hesap eklemek için `social`
dizisine `{ label, href }` eklemeniz yeterli.

### Telefon numaraları

`lib/site.ts` içinde iki numara tutulur: `phone` (ana numara — WhatsApp da
buna bağlıdır) ve `phone2` (ikinci numara). İkisi de İletişim bölümünde,
footer'da ve mobil menüde alt alta gösterilir; JSON-LD'ye de her ikisi
eklenir.

### WhatsApp numarası

`lib/site.ts` → `whatsapp` bölümü. `number` alanı ülke kodlu ve işaretsiz
olmalıdır (`905326403692`). Bağlantı `https://wa.me/905326403692?text=...`
biçiminde üretilir; hazır mesajı da aynı yerden değiştirebilirsiniz.

---

## Hız (Core Web Vitals)

Ölçüm: Lighthouse, mobil emülasyon, yavaş 4G kısıtlaması.

| | Önce | Sonra |
| --- | --- | --- |
| Performans skoru | 83 | **94–95** |
| First Contentful Paint | 2,3 sn | **0,9 sn** |
| Largest Contentful Paint | 4,0 sn | **2,7–2,9 sn** |
| Cumulative Layout Shift | 0,022 (sahada 0,101) | **0** |
| Speed Index | 3,0 sn | **0,9 sn** |
| Erişilebilirlik | 96 | **100** |

### Yapılanlar

**Fontlar (en büyük kazanç).** Inter ve Manrope, `@fontsource` paketlerinden
tüm alfabelerle (kiril, yunan, vietnamca…) geliyordu: 4 dosya, 170 KiB — sayfanın
en ağır kaynağı. Türkçe + Latin karakterlere indirildi: **2 dosya, 32 KiB**.
Değişken kalınlık ekseni korundu. Üretmek için `npm run fonts`
(gerekli: `pip install fonttools brotli`).

**Font kaynaklı düzen kayması.** Sistem fontu ile gerçek font farklı yer
kapladığı için font yüklendiğinde metin oynuyordu (CLS 0,101). `app/globals.css`
içindeki "Inter Yedek" / "Manrope Yedek" tanımları, `size-adjust` ve
`ascent-override` ile yedek fontu gerçek fontla birebir aynı yüksekliğe
oturtur — **CLS 0'a indi**. Metrikleri değiştirirseniz `npm run fonts`
çıktısındaki notu izleyin.

**Ön yükleme.** Fontlar `ReactDOM.preload` ile, hero fotoğrafı da
`<link rel="preload" as="image">` ile (mobil/masaüstü için ayrı kırpımlar)
`<head>`'e taşınır. Tarayıcı CSS'i beklemeden indirmeye başlar.

**Görsel boyutları.** Basamaklara 640 px eklendi (480 / 640 / 768 / 1100 / 1536),
böylece orta yoğunluklu telefonlar gereğinden büyük dosya indirmiyor. Hem
`scripts/optimize-images.mjs` hem panel yükleme hattı aynı listeyi kullanır.

**Denenip geri alınan:** `experimental.inlineCss` — CSS'i HTML'e gömmek belgeyi
büyüttüğü için FCP'yi 0,9 sn'den 1,8 sn'ye çıkardı. Ayrı dosya paralel
indirildiği için daha hızlı; `next.config.ts` içinde not olarak duruyor.

**Not — Google etiketi.** Reklam dönüşüm ölçümü üçüncü taraf bir betik
yükler; bu tek başına PSI skorunu birkaç puan düşürür. Yukarıdaki ölçüm
etiket kapalıyken alınmıştır. Etiketi geçici olarak kapatmak için Vercel'de
`NEXT_PUBLIC_GOOGLE_TAG_ID` değişkenine boş değer verin.

---

## Google Ads / Google etiketi

`components/site/GoogleTag.tsx` — gtag.js, `next/script` ile
`afterInteractive` stratejisinde yüklenir: sayfa çizildikten sonra devreye
girer, ilk boyamayı geciktirmez. Google'ın verdiği kod parçasıyla aynı işi
yapar.

- Etiket kimliği: `lib/site.ts` → `googleTagId` (varsayılan `AW-18442698100`).
  Değiştirmek için Vercel'de `NEXT_PUBLIC_GOOGLE_TAG_ID` tanımlayın.
- Yalnızca **üretim** derlemesinde çalışır — yerelde test dönüşümü göndermez.
- Yalnızca **site** sayfalarında; yönetim panelinde yüklenmez.

---

## SEO

Tüm SEO alanları içerikten otomatik üretilir; panelden kategori/proje
eklediğinizde başlık, açıklama, canonical adres, paylaşım görseli ve sitemap
kaydı kendiliğinden oluşur. Elle güncellenmesi gereken bir liste yoktur.

### Sayfa başına üretilenler

| Alan | Nasıl üretilir |
| --- | --- |
| `<title>` | Sayfa adı + ` | Eren Mobilya Tasarım Ataşehir` (şablon `app/layout.tsx`) |
| `meta description` | İçerikteki açıklama, `metaAciklama()` ile 158 karaktere kırpılır (kelime ortasından kesmez) |
| `link rel=canonical` | Her sayfa kendi adresini bildirir; kök layout canonical vermez |
| Open Graph | `og:title`, `og:description`, `og:url`, `og:type`, `og:site_name`, `og:locale`, `og:image` (+ genişlik, yükseklik, alt metin) |
| Twitter | `summary_large_image` kartı, sayfaya özel başlık/açıklama/görsel |
| `meta robots` | Site sayfaları `index, follow` + `max-image-preview:large`; 404, `/admin` ve kategorisi silinmiş sayfalar `noindex` |

Paylaşım görseli her zaman 1536 piksel genişliğindeki sürümdür ve gerçek
en/boy oranı bildirilir — WhatsApp ve Facebook önizlemesi kırpmadan çıkar.

### Yapısal veri (JSON-LD)

| Sayfa | Şemalar |
| --- | --- |
| Ana sayfa | `FurnitureStore` + `Organization` (`@graph`), `WebSite`, `WebPage`, kategorilerin `ItemList`'i |
| Kategori | `BreadcrumbList`, `CollectionPage` + içindeki uygulamaların `ItemList`'i |
| Proje | `BreadcrumbList`, `CreativeWork` |

Düğümler `@id` ile birbirine bağlıdır (`#isletme`, `#website`), böylece Google
sayfaları tek bir işletme varlığı altında toplar.

**Adres:** Doğrulanmış adres olmadığı için `PostalAddress`, `areaServed` ve
koordinat alanları bilinçli olarak yoktur — uydurma konum iddiası yerel
sonuçlarda güven kaybına yol açar. Adres netleştiğinde
`app/(site)/layout.tsx` içindeki işletme düğümüne eklenebilir.

### Dosyalar ve ikonlar

- `/sitemap.xml` — panel içeriğinden üretilir, her adresin ana görselini de
  listeler (`image:image`). `lastModified` panelin son kayıt zamanıdır.
- `/robots.txt` — `/admin` ve `/api/` engelli, `Sitemap` ve `Host` satırları var.
- `/manifest.webmanifest` — SVG + 192/512 px PNG + maskable ikon.
- `app/icon.svg` (favicon), `app/apple-icon.png` (iOS ana ekran, 180 px).

### SEO araçlarının işaretlediği ve kapatılan noktalar

| Bulgu | Yapılan |
| --- | --- |
| Meta keyword etiketi (Google kullanmıyor) | Tamamen kaldırıldı |
| Title etiketi olmayan bağlantılar | "İncele", "Kategoriyi İncele", "Projeyi İncele", "Bilgi Alın" gibi genel metinli bağlantılara ve karttaki görsel bağlantılarına açıklayıcı `title` + `aria-label` eklendi |
| Dış bağlantı `rel` kullanımı | Sosyal hesap bağlantıları `rel="me noopener noreferrer"` — `me`, hesabın bize ait olduğunu bildirir |
| Schema / görünen içerik uyumsuzluğu | Ana sayfadaki `WebPage.name` birebir H1 metnine eşitlendi |
| Favicon | `app/favicon.ico` (16/32/48 px) eklendi — SVG ikonun yanında, `/favicon.ico` isteyen istemciler için |
| Renk kontrastı (erişilebilirlik) | `--ink-3` #8b857c → #6f695f. Eski ton açık zeminde 3,36:1 idi, WCAG AA 4,5:1 ister. Artık en düşük 4,6:1 |

### Yayın sonrası yapılacaklar

1. **Tek alan adı seçin.** `lib/site.ts` → `url` şu an
   `https://www.erenmobilyatasarimatasehir.com`. Vercel → Settings → Domains
   altında bunu **Primary Domain** yapın ve diğer sürümü (www'suz ve/veya
   http) buraya yönlendirin. www'suz sürümü tercih ederseniz `lib/site.ts`
   içindeki `url` alanını da değiştirip yeniden dağıtın — canonical, sitemap
   ve JSON-LD hepsi bu değeri kullanır.
2. **Google Search Console**'a mülkü ekleyin, `/sitemap.xml` adresini gönderin.
   Doğrulama için HTML etiketi yöntemini seçerseniz kodu Vercel'de
   `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` değişkenine yazıp yeniden dağıtın
   (Yandex için `NEXT_PUBLIC_YANDEX_VERIFICATION`). Tanımlı değilse etiket
   hiç basılmaz.
3. **Google Business Profile** açtığınızda profil adresini
   `app/(site)/layout.tsx` içindeki `sameAs` listesine ekleyin.
4. Zengin sonuçları `search.google.com/test/rich-results` ile kontrol edin.

`node scripts/test-seo.mjs` (sunucu ayaktayken) tüm bu alanları üretilen
HTML üzerinde denetler.

---

## Sayfa yapısı

- `/` — tek sayfa akışı: Hero → Hizmetler → Kategoriler → Öne Çıkan İşler →
  Projeler → Hakkımızda → İletişim
- `/kategori/[slug]` — Mutfak, Yatak Odası, Çocuk Odası, TV Üniteleri,
  Banyo, Vestiyer & Antre, Ticari Projeler (7 sayfa)
- `/proje/[slug]` — her proje için detay sayfası (4 sayfa)
- `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` — otomatik üretilir

### İç linkleme

Sayfalar birbirine şu şekilde bağlıdır; yeni kategori veya proje eklediğinizde
bu bağlantılar otomatik oluşur:

- Ana sayfa → 6 kategori sayfası (kategori kartları, footer) ve 4 proje
  sayfası (proje kartları)
- Kategori sayfası → diğer 5 kategori (alt bölümdeki etiketler), ana sayfa,
  projeler bölümü. Bulunduğunuz kategori etiket olarak işaretlenir ama kendine
  link vermez.
- Proje sayfası → diğer 3 proje, bağlı olduğu kategori sayfası, ana sayfa
- Kategori sayfasındaki uygulama kartları → o parçaya özel hazır mesajla
  WhatsApp (aynı sayfaya link vermek yerine)
- 404 sayfası → tüm kategoriler, projeler ve iletişim

## Dosya düzeni

```
app/
  layout.tsx           meta etiketleri, Open Graph, fontlar (site + panel ortak)
  globals.css          tüm tasarım sistemi (renk, tipografi, bileşenler)
  (site)/              SİTE — header/footer çerçevesi ve JSON-LD
    layout.tsx
    page.tsx           ana sayfa
    kategori/[slug]/   kategori sayfaları
    proje/[slug]/      proje detay sayfaları
  admin/               YÖNETİM PANELİ — kendi çerçevesi ve stili
    layout.tsx
    page.tsx           kayıt listesi
    giris/page.tsx     giriş ekranı
    admin.css          panele özel stiller (site stillerini etkilemez)
  api/admin/           giris · cikis · kaydet · ekle · sil
  manifest.ts          web app manifest
  not-found.tsx        404 sayfası
proxy.ts               /admin ve /api/admin için oturum kontrolü
components/
  site/                Header, Footer, SiteChrome, GoogleTag, Wordmark, LogoWordmark,
                       Img, ProductCard, ProjectCard, Listing, WhatsAppFab,
                       Reveal, Icons
  sections/            Hero, Highlights, Categories, Featured, Projects,
                       About, Contact
  admin/               Panel, KayitKarti, YeniKayitFormu, GirisFormu
lib/
  site.ts              marka ve iletişim bilgileri
  data.ts              varsayılan içerik (kategori, uygulama, proje)
  content.ts           varsayılan içerik + panel eklemeleri/silmeleri birleşimi
  blob.ts              Vercel Blob okuma/yazma/silme
  admin-ortak.ts       API uçlarının paylaştığı yardımcılar
  gorsel-yukle.ts      yüklenen fotoğrafı WebP'ye çevirip Blob'a yazar
  slug.ts              adres (slug) üretimi ve doğrulaması
  seo.ts               canonical adres, meta açıklama ve OG görseli yardımcıları
  auth.ts              panel şifresi ve imzalı oturum çerezi
  resim-kucult.ts      yüklemeden önce tarayıcıda küçültme
  images.ts            görsel adres yardımcıları
  image-manifest.json  otomatik üretilir — elle düzenlemeyin
scripts/
  optimize-images.mjs  fotoğraf optimizasyon aracı (npm run images)
  subset-fonts.mjs     fontları Türkçeye göre alt kümeye indirir (npm run fonts)
  test-admin.mjs       panel giriş/düzenleme testi (playwright gerektirir)
  test-admin-crud.mjs  panel ekleme/silme testi (playwright gerektirir)
  test-seo.mjs         SEO etiketleri, yapısal veri ve font/ön yükleme denetimi
gorseller-kaynak/      yüksek çözünürlüklü kaynak fotoğraflar
public/gorseller/      siteye servis edilen WebP sürümler
public/fonts/          alt kümelenmiş Inter ve Manrope (npm run fonts üretir)
public/logo.svg        yatay logo kilidi
public/logo-mark.svg   kare monogram
```

## Tasarım sistemi

Renk, tipografi ve boşluk değerleri `app/globals.css` en üstündeki
`:root` bloğunda değişken olarak tanımlıdır. Örneğin arka plan tonunu
değiştirmek için tek satır yeterlidir:

```css
--bg: #f7f5f2;      /* kırık beyaz */
--bg-alt: #efece6;  /* açık sıcak gri */
--ink: #191816;     /* koyu antrasit */
--wood: #a07b52;    /* doğal ahşap vurgusu */
```

## Kontrol edilenler

- 375 / 390 / 414 / 768 / 1024 / 1280 / 1440 / 1920 px genişliklerde yatay
  kaydırma yok, görsel taşması yok
- Her sayfada tek `h1`, doğru başlık hiyerarşisi
- Klavye ile tam gezinme, "İçeriğe geç" bağlantısı, görünür odak halkaları
- `prefers-reduced-motion` açıkken animasyonlar devre dışı
- Görsellerde `srcset` + `sizes` + lazy loading; tüm fotoğraflar WebP
- Her fotoğrafın en/boy oranı HTML'e yazıldığı için yüklenirken sayfa kaymaz
- Kırpma oranları fotoğrafların doğal oranına göre seçildi (kare kartlar,
  projelerde 5:4, geniş kartlarda 3:2) — mobilyalar kadraj dışında kalmıyor
