import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isBlobConfigured, readContentFresh, writeContent } from "@/lib/blob";
import { dosyaKontrol, gorselIsle } from "@/lib/gorsel-yukle";
import type {
  EkKategori,
  EkProje,
  EkUygulama,
  ItemOverride,
  SiteContent,
  StoredImage,
} from "@/lib/content";
import {
  KOVA,
  KOD_SLUGLARI,
  damgala,
  dosya as formDosyasi,
  isaretli,
  kayitVarMi,
  listeBolumuMu,
  metin,
  panelKaydi,
  type Bolum,
} from "@/lib/admin-ortak";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Mevcut bir kaydı günceller.
 *
 * Üç durum vardır:
 *  - `hero`  → ana sayfa fotoğrafı (yalnızca fotoğraf ve alt metin)
 *  - koddan gelen kayıt → `categories/products/projects` altında üzerine yazma
 *  - panelden eklenen kayıt → `yeni` listesindeki nesne doğrudan güncellenir
 */
export async function POST(request: Request) {
  if (!isBlobConfigured()) {
    return NextResponse.json(
      {
        hata:
          "Depolama bağlı değil. Vercel projesine bir Blob deposu ekleyip BLOB_READ_WRITE_TOKEN tanımlayın.",
      },
      { status: 500 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ hata: "Geçersiz istek." }, { status: 400 });
  }

  const bolum = metin(form, "bolum") as Bolum;
  const slug = metin(form, "slug");

  if (bolum !== "hero" && !listeBolumuMu(bolum)) {
    return NextResponse.json({ hata: "Bilinmeyen bölüm." }, { status: 400 });
  }

  const content = await readContentFresh();

  if (bolum !== "hero" && !kayitVarMi(content, bolum, slug)) {
    return NextResponse.json({ hata: "Bilinmeyen kayıt." }, { status: 400 });
  }

  // --- Fotoğraf (isteğe bağlı) ---
  const yeniDosya = formDosyasi(form);
  if (yeniDosya) {
    const hata = dosyaKontrol(yeniDosya);
    if (hata) return NextResponse.json({ hata }, { status: 400 });
  }

  let image: StoredImage | undefined;
  try {
    if (yeniDosya) {
      image = await gorselIsle(yeniDosya, bolum, slug || "hero");
    }
  } catch (error) {
    return NextResponse.json(
      {
        hata:
          error instanceof Error
            ? `Fotoğraf işlenemedi: ${error.message}`
            : "Fotoğraf işlenemedi.",
      },
      { status: 400 }
    );
  }

  /** Fotoğrafı koddaki varsayılana döndür */
  const gorseliSifirla = isaretli(form, "gorseliSifirla");

  let guncel: SiteContent = damgala(content);
  let sonucKaydi: unknown;

  if (bolum === "hero") {
    const hero = { ...content.hero };
    hero.imageAlt = metin(form, "imageAlt") || undefined;
    if (image) hero.image = image;
    else if (gorseliSifirla) delete hero.image;

    guncel = { ...guncel, hero };
    sonucKaydi = hero;
  } else if (KOD_SLUGLARI[bolum].includes(slug)) {
    // Koddan gelen kayıt → üzerine yazma
    const alan = KOVA[bolum];
    const onceki: ItemOverride = content[alan][slug] ?? {};
    const sonraki: ItemOverride = { ...onceki };

    sonraki.name = metin(form, "name") || undefined;
    sonraki.description = metin(form, "description") || undefined;
    sonraki.imageAlt = metin(form, "imageAlt") || undefined;

    if (image) sonraki.image = image;
    else if (gorseliSifirla) delete sonraki.image;

    guncel = {
      ...guncel,
      [alan]: { ...content[alan], [slug]: sonraki },
    } as SiteContent;
    sonucKaydi = sonraki;
  } else {
    // Panelden eklenen kayıt → nesnenin kendisi güncellenir
    const bulunan = panelKaydi(content, bolum, slug);
    if (!bulunan) {
      return NextResponse.json({ hata: "Bilinmeyen kayıt." }, { status: 400 });
    }

    const kayit = { ...bulunan.kayit } as EkKategori & EkUygulama & EkProje;

    const name = metin(form, "name");
    const imageAlt = metin(form, "imageAlt");
    if (name) kayit.name = name;
    if (imageAlt) kayit.imageAlt = imageAlt;
    if (bolum !== "uygulama") kayit.description = metin(form, "description");

    // Panelden eklenen kayıtlarda yapısal alanlar da düzenlenebilir
    const kategori = metin(form, "category");
    if (kategori && (bolum === "uygulama" || bolum === "proje")) {
      kayit.category = kategori;
    }
    if (bolum === "proje") {
      const yer = metin(form, "location");
      const yil = metin(form, "year");
      if (yer) kayit.location = yer;
      if (yil) kayit.year = yil;
    }
    if (bolum === "uygulama") {
      kayit.featured = isaretli(form, "featured") || undefined;
    }

    if (image) kayit.image = image;

    const alan = KOVA[bolum];
    const liste = [...(content.yeni[alan] as unknown[])];
    liste[bulunan.indeks] = kayit;

    guncel = {
      ...guncel,
      yeni: { ...content.yeni, [alan]: liste },
    } as SiteContent;
    sonucKaydi = kayit;
  }

  try {
    await writeContent(guncel);
  } catch (error) {
    return NextResponse.json(
      {
        hata:
          error instanceof Error
            ? `Kaydedilemedi: ${error.message}`
            : "Kaydedilemedi.",
      },
      { status: 500 }
    );
  }

  // Site sayfaları yeni içerikle yeniden üretilsin
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, kayit: sonucKaydi });
}
