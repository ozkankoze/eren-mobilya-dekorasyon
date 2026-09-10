import type { MetadataRoute } from "next";
import { readContent } from "@/lib/blob";
import { getCategories, getProjects } from "@/lib/content";
import { imageUrl } from "@/lib/images";
import { site } from "@/lib/site";
import { mutlakAdres } from "@/lib/seo";

/**
 * Sitemap panel içeriğinden üretilir: panelden eklenen kategori ve projeler
 * otomatik girer, silinenler otomatik çıkar.
 *
 * `lastModified` panelin son kayıt zamanıdır. Her istekte "şu an" yazmak
 * arama motorlarına yanlış sinyal verir; içerik değişmediyse tarih de
 * değişmemelidir.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [content, categories, projects] = await Promise.all([
    readContent(),
    getCategories(),
    getProjects(),
  ]);

  const guncellenme = content.updatedAt ? new Date(content.updatedAt) : new Date();

  return [
    {
      url: site.url,
      lastModified: guncellenme,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...categories.map((c) => ({
      url: mutlakAdres(`/kategori/${c.slug}`),
      lastModified: guncellenme,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: [mutlakAdres(imageUrl(c.image, 1536))],
    })),
    ...projects.map((p) => ({
      url: mutlakAdres(`/proje/${p.slug}`),
      lastModified: guncellenme,
      changeFrequency: "yearly" as const,
      priority: 0.7,
      images: [mutlakAdres(imageUrl(p.image, 1536))],
    })),
  ];
}
