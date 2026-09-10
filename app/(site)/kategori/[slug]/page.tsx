import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Listing from "@/components/site/Listing";
import { categories } from "@/lib/data";
import {
  getCategories,
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/content";
import { imageUrl } from "@/lib/images";
import { site } from "@/lib/site";
import { metaAciklama, mutlakAdres, ogGorsel } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  // Panelden silinmiş kategori: arama motorlarına dizine ekleme demeliyiz
  if (!category) {
    return { title: "Kategori bulunamadı", robots: { index: false, follow: true } };
  }

  const title = category.name;
  const description = metaAciklama(category.description);
  const yol = `/kategori/${category.slug}`;
  const gorseller = ogGorsel(category.image, category.imageAlt);

  return {
    title,
    description,
    alternates: { canonical: yol },
    openGraph: {
      type: "website",
      locale: site.locale,
      siteName: site.name,
      title: `${title} | ${site.name}`,
      description,
      url: yol,
      images: gorseller,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${site.name}`,
      description,
      images: gorseller.map((g) => g.url),
    },
  };
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const [category, allCategories] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
  ]);
  if (!category) notFound();

  const products = await getProductsByCategory(category.slug);
  const adres = mutlakAdres(`/kategori/${category.slug}`);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Kategoriler",
        item: `${site.url}/#kategoriler`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: adres,
      },
    ],
  };

  /**
   * Kategori sayfası bir koleksiyon sayfasıdır: içindeki uygulamalar
   * `ItemList` olarak bildirilir. Fiyat/stok verisi olmadığı için `Product`
   * yerine `ImageObject` kullanılır — uydurma `offers` alanı eklemiyoruz.
   */
  const koleksiyon = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${adres}#sayfa`,
    url: adres,
    name: category.name,
    description: category.description,
    inLanguage: "tr-TR",
    isPartOf: { "@id": `${site.url}/#website` },
    about: { "@id": `${site.url}/#isletme` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: mutlakAdres(imageUrl(category.image, 1536)),
      caption: category.imageAlt,
    },
    mainEntity: {
      "@type": "ItemList",
      name: `${category.name} uygulamaları`,
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "ImageObject",
          name: p.name,
          url: mutlakAdres(imageUrl(p.image, 1536)),
          caption: p.imageAlt,
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumb, koleksiyon]),
        }}
      />
      <Listing
        eyebrow="Kategori"
        slug={category.slug}
        title={category.name}
        description={category.description}
        image={category.image}
        imageAlt={category.imageAlt}
        focus={category.focus}
        crumb={category.name}
        products={products}
        chipsLabel="Diğer kategoriler"
        chips={allCategories.map((c) => ({
          href: `/kategori/${c.slug}`,
          label: c.name,
          active: c.slug === category.slug,
        }))}
      />
    </>
  );
}
