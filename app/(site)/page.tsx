import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import Highlights from "@/components/sections/Highlights";
import Categories from "@/components/sections/Categories";
import Featured from "@/components/sections/Featured";
import Projects from "@/components/sections/Projects";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import { getCategories } from "@/lib/content";
import { site } from "@/lib/site";
import { mutlakAdres } from "@/lib/seo";

/**
 * Canonical adres burada verilir (kök layout'ta değil) — böylece admin paneli
 * gibi site dışı sayfalar yanlışlıkla ana sayfayı canonical göstermez.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const categories = await getCategories();

  /**
   * Ana sayfadaki kategori bölümünün yapısal karşılığı. Google'ın site
   * bağlantılarını (sitelinks) doğru çıkarmasına yardım eder.
   */
  const kategoriListesi = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Kategoriler",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: categories.length,
    itemListElement: categories.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      url: mutlakAdres(`/kategori/${c.slug}`),
    })),
  };

  const anaSayfa = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${site.url}/#anasayfa`,
    url: site.url,
    /**
     * Sayfadaki görünen H1 ile birebir aynı — yapısal veri ile görünen
     * içeriğin uyumsuz olması SEO araçlarında uyarı üretir.
     */
    name: "Yaşam alanları için zamansız tasarım.",
    headline: "Yaşam alanları için zamansız tasarım.",
    description: site.description,
    inLanguage: "tr-TR",
    isPartOf: { "@id": `${site.url}/#website` },
    about: { "@id": `${site.url}/#isletme` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([anaSayfa, kategoriListesi]),
        }}
      />
      <Hero />
      <Highlights />
      <Categories />
      <Featured />
      <Projects />
      <About />
      <Contact />
    </>
  );
}
