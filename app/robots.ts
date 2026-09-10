import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Yönetim paneli ve API uçları arama sonuçlarında görünmesin
        disallow: ["/admin", "/api/"],
      },
      // Yapay zekâ tarayıcıları için ayrı kural gerekirse buraya eklenir.
    ],
    sitemap: `${site.url}/sitemap.xml`,
    /** Tek canonical alan adı — www ile www'suz sürüm birbirine karışmasın */
    host: site.url.replace(/^https?:\/\//, ""),
  };
}
