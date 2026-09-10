import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  deleteImages,
  isBlobConfigured,
  readContentFresh,
  writeContent,
} from "@/lib/blob";
import type { SiteContent } from "@/lib/content";
import {
  KOVA,
  KOD_SLUGLARI,
  damgala,
  gorselAdresleri,
  listeBolumuMu,
  metin,
  overrideGorselleri,
  panelKaydi,
} from "@/lib/admin-ortak";

export const runtime = "nodejs";

/**
 * Kayıt siler.
 *
 *  - **Panelden eklenen kayıt:** `yeni` listesinden tamamen çıkarılır ve
 *    fotoğraf dosyaları depodan silinir.
 *  - **Koddan gelen kayıt:** `lib/data.ts` çalışma anında değiştirilemediği
 *    için slug `gizli` listesine yazılır; kayıt sitede görünmez olur.
 *    Varsa üzerine yazma verisi ve panelden yüklenmiş fotoğrafı da temizlenir.
 */
export async function POST(request: Request) {
  if (!isBlobConfigured()) {
    return NextResponse.json(
      { hata: "Depolama bağlı değil." },
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
  const slug = metin(form, "slug");

  if (!listeBolumuMu(bolum)) {
    return NextResponse.json(
      { hata: "Bu bölümden kayıt silinemez." },
      { status: 400 }
    );
  }

  const content = await readContentFresh();
  const alan = KOVA[bolum];
  const silinecekGorseller: string[] = [];

  let guncel: SiteContent;

  const panel = panelKaydi(content, bolum, slug);

  if (panel) {
    silinecekGorseller.push(...gorselAdresleri(panel.kayit.image));

    const liste = (content.yeni[alan] as unknown[]).filter(
      (_, i) => i !== panel.indeks
    );
    guncel = {
      ...content,
      yeni: { ...content.yeni, [alan]: liste },
    } as SiteContent;
  } else if (KOD_SLUGLARI[bolum].includes(slug)) {
    silinecekGorseller.push(...overrideGorselleri(content[alan][slug]));

    // Üzerine yazma verisini de temizle — kayıt geri getirilirse sıfırdan başlar
    const overrides = { ...content[alan] };
    delete overrides[slug];

    guncel = {
      ...content,
      [alan]: overrides,
      gizli: {
        ...content.gizli,
        [alan]: [...new Set([...content.gizli[alan], slug])],
      },
    } as SiteContent;
  } else {
    return NextResponse.json({ hata: "Kayıt bulunamadı." }, { status: 404 });
  }

  try {
    await writeContent(damgala(guncel));
  } catch (error) {
    return NextResponse.json(
      {
        hata:
          error instanceof Error
            ? `Silinemedi: ${error.message}`
            : "Silinemedi.",
      },
      { status: 500 }
    );
  }

  // İçerik kaydedildikten sonra artık kullanılmayan dosyaları temizle
  await deleteImages(silinecekGorseller);

  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true });
}
