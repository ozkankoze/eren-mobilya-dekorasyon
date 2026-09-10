import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isBlobConfigured, readContentFresh, writeContent } from "@/lib/blob";
import { dosyaKontrol, gorselIsle } from "@/lib/gorsel-yukle";
import type { EkKategori, EkProje, EkUygulama } from "@/lib/content";
import { getCategories } from "@/lib/content";
import {
  damgala,
  doluSluglar,
  dosya as formDosyasi,
  isaretli,
  kayitEkle,
  listeBolumuMu,
  metin,
  type YeniKayit,
} from "@/lib/admin-ortak";
import { slugGecerliMi, slugify } from "@/lib/slug";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Yeni kategori / uygulama / proje ekler.
 * Kayıt her zaman ilgili listenin **sonuna** eklenir.
 *
 * Ana sayfa bilinçli olarak kapsam dışıdır: hero tek bir sabit bölümdür,
 * çoğaltılamaz.
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

  const bolum = metin(form, "bolum");
  if (!listeBolumuMu(bolum)) {
    return NextResponse.json(
      { hata: "Bu bölüme yeni kayıt eklenemez." },
      { status: 400 }
    );
  }

  // --- Zorunlu metin alanları ---
  const name = metin(form, "name");
  if (!name) {
    return NextResponse.json({ hata: "Başlık gerekli." }, { status: 400 });
  }

  const imageAlt = metin(form, "imageAlt") || name;

  // --- Slug ---
  const slug = slugify(metin(form, "slug") || name);
  if (!slugGecerliMi(slug)) {
    return NextResponse.json(
      {
        hata:
          "Adres (slug) geçersiz. Yalnızca küçük harf, rakam ve tire kullanın.",
      },
      { status: 400 }
    );
  }

  const content = await readContentFresh();
  if (doluSluglar(content, bolum).has(slug)) {
    return NextResponse.json(
      { hata: `"${slug}" adresi zaten kullanılıyor. Farklı bir ad deneyin.` },
      { status: 409 }
    );
  }

  // --- Kategori bağlantısı (uygulama ve proje için zorunlu) ---
  let category = "";
  if (bolum === "uygulama" || bolum === "proje") {
    category = metin(form, "category");
    const gecerli = (await getCategories()).some((c) => c.slug === category);
    if (!gecerli) {
      return NextResponse.json(
        { hata: "Geçerli bir kategori seçin." },
        { status: 400 }
      );
    }
  }

  // --- Fotoğraf (yeni kayıtlarda zorunlu) ---
  const dosya = formDosyasi(form);
  if (!dosya) {
    return NextResponse.json(
      { hata: "Yeni kayıt için fotoğraf seçmelisiniz." },
      { status: 400 }
    );
  }
  const dosyaHatasi = dosyaKontrol(dosya);
  if (dosyaHatasi) {
    return NextResponse.json({ hata: dosyaHatasi }, { status: 400 });
  }

  let image;
  try {
    image = await gorselIsle(dosya, bolum, slug);
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

  // --- Kaydı kur ---
  let kayit: YeniKayit;

  if (bolum === "kategori") {
    const kategori: EkKategori = {
      slug,
      name,
      description: metin(form, "description"),
      image,
      imageAlt,
    };
    kayit = kategori;
  } else if (bolum === "uygulama") {
    const uygulama: EkUygulama = {
      slug,
      name,
      category,
      image,
      imageAlt,
    };
    if (isaretli(form, "featured")) uygulama.featured = true;
    kayit = uygulama;
  } else {
    const proje: EkProje = {
      slug,
      name,
      location: metin(form, "location") || name,
      year: metin(form, "year") || String(new Date().getFullYear()),
      category,
      description: metin(form, "description"),
      image,
      imageAlt,
    };
    kayit = proje;
  }

  try {
    await writeContent(damgala(kayitEkle(content, bolum, kayit)));
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

  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, slug, kayit });
}
