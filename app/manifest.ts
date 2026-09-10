import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { metaAciklama } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Eren Mobilya Tasarım",
    description: metaAciklama(site.description),
    start_url: "/",
    scope: "/",
    id: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f5f2",
    theme_color: "#f7f5f2",
    lang: "tr",
    dir: "ltr",
    categories: ["shopping", "lifestyle", "business"],
    icons: [
      {
        src: site.logo.mark,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      // PWA yükleme ekranı ve Android ana ekran kısayolu için raster sürümler
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
