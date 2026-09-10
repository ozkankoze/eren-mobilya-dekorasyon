import Panel, { type PanelKayit } from "@/components/admin/Panel";
import { isBlobConfigured, readContentFresh } from "@/lib/blob";
import {
  getCategories,
  getHero,
  getProducts,
  getProjects,
} from "@/lib/content";
import {
  categories as varsayilanKategoriler,
  heroImage as varsayilanHero,
  products as varsayilanUygulamalar,
  projects as varsayilanProjeler,
} from "@/lib/data";
import { imageUrl } from "@/lib/images";
import { site } from "@/lib/site";

// Panel her zaman en güncel içeriği göstermeli
export const dynamic = "force-dynamic";

/** Slug → koddaki özgün fotoğrafın adresi ("eski fotoğrafa dön" önizlemesi) */
function varsayilanlar(
  liste: { slug: string; image: string | object }[]
): Record<string, string> {
  return Object.fromEntries(
    liste.map((item) => [item.slug, imageUrl(item.image as string, 768)])
  );
}

export default async function AdminSayfasi() {
  const [content, kategoriler, uygulamalar, projeler, hero] = await Promise.all(
    [
      readContentFresh(),
      getCategories(),
      getProducts(),
      getProjects(),
      getHero(),
    ]
  );

  const kVars = varsayilanlar(varsayilanKategoriler);
  const uVars = varsayilanlar(varsayilanUygulamalar);
  const pVars = varsayilanlar(varsayilanProjeler);

  const kodKategori = new Set(varsayilanKategoriler.map((c) => c.slug));
  const kodUygulama = new Set(varsayilanUygulamalar.map((p) => p.slug));
  const kodProje = new Set(varsayilanProjeler.map((p) => p.slug));

  const kayitlar: PanelKayit[] = [
    {
      bolum: "hero",
      slug: "hero",
      grup: "Ana Sayfa",
      kaynak: "kod",
      baslik: "Ana sayfa büyük fotoğrafı",
      altbaslik: "Sitenin en üstünde tam ekran görünen fotoğraf",
      imageAlt: hero.alt,
      onizleme: imageUrl(hero.src, 768),
      varsayilanOnizleme: imageUrl(varsayilanHero.src, 768),
      panelden: Boolean(content.hero?.image),
      silinebilir: false,
    },
    ...kategoriler.map<PanelKayit>((c) => {
      const kodMu = kodKategori.has(c.slug);
      return {
        bolum: "kategori",
        slug: c.slug,
        grup: "Kategoriler",
        kaynak: kodMu ? "kod" : "panel",
        baslik: c.name,
        altbaslik: `/kategori/${c.slug}`,
        name: c.name,
        description: c.description,
        imageAlt: c.imageAlt,
        onizleme: imageUrl(c.image, 768),
        varsayilanOnizleme: kodMu ? kVars[c.slug] : "",
        panelden: kodMu ? Boolean(content.categories[c.slug]?.image) : true,
        silinebilir: true,
      };
    }),
    ...projeler.map<PanelKayit>((p) => {
      const kodMu = kodProje.has(p.slug);
      return {
        bolum: "proje",
        slug: p.slug,
        grup: "Projeler",
        kaynak: kodMu ? "kod" : "panel",
        baslik: p.name,
        altbaslik: `/proje/${p.slug}`,
        name: p.name,
        description: p.description,
        imageAlt: p.imageAlt,
        onizleme: imageUrl(p.image, 768),
        varsayilanOnizleme: kodMu ? pVars[p.slug] : "",
        panelden: kodMu ? Boolean(content.projects[p.slug]?.image) : true,
        silinebilir: true,
        category: p.category,
        location: p.location,
        year: p.year,
      };
    }),
    ...uygulamalar.map<PanelKayit>((p) => {
      const kodMu = kodUygulama.has(p.slug);
      return {
        bolum: "uygulama",
        slug: p.slug,
        grup: "Uygulamalar",
        kaynak: kodMu ? "kod" : "panel",
        baslik: p.name,
        altbaslik: `Kategori: ${p.category}`,
        name: p.name,
        imageAlt: p.imageAlt,
        onizleme: imageUrl(p.image, 768),
        varsayilanOnizleme: kodMu ? uVars[p.slug] : "",
        panelden: kodMu ? Boolean(content.products[p.slug]?.image) : true,
        silinebilir: true,
        category: p.category,
        featured: Boolean(p.featured),
      };
    }),
  ];

  return (
    <Panel
      marka={site.name}
      kayitlar={kayitlar}
      kategoriSecenekleri={kategoriler.map((c) => ({
        slug: c.slug,
        name: c.name,
      }))}
      depoBagli={isBlobConfigured()}
      guncellenme={content.updatedAt}
    />
  );
}
