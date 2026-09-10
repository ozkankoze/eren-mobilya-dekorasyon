import SiteChrome from "@/components/site/SiteChrome";
import GoogleTag from "@/components/site/GoogleTag";
import { site, social } from "@/lib/site";
import { ogImage } from "@/lib/data";
import { mutlakAdres, ogGorsel } from "@/lib/seo";

/**
 * YAPISAL VERİ (JSON-LD)
 *
 * Tek bir `@graph` içinde üç düğüm: işletme, web sitesi ve logo. `@id`
 * kullanıldığı için alt sayfalardaki BreadcrumbList ve CollectionPage
 * kayıtları bu düğümlere bağlanabilir; Google bunları tek bir varlık olarak
 * anlar.
 *
 * ADRES: Doğrulanmış bir adres olmadığı için `PostalAddress` ve `areaServed`
 * bilinçli olarak yok — uydurma konum iddiası, Google'ın yerel sonuçlarında
 * güven kaybına yol açar. Adres netleştiğinde işletme düğümüne eklenebilir.
 */

const isletmeId = `${site.url}/#isletme`;
const siteId = `${site.url}/#website`;
const logoId = `${site.url}/#logo`;

const paylasim = ogGorsel(ogImage, site.name)[0];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["FurnitureStore", "Organization"],
      "@id": isletmeId,
      name: site.name,
      alternateName: "Eren Mobilya Tasarım",
      description: site.description,
      url: site.url,
      telephone: ["+905326403692", "+905415653567"],
      email: site.email.display,
      sameAs: social.map((s) => s.href),
      logo: {
        "@type": "ImageObject",
        "@id": logoId,
        url: mutlakAdres(site.logo.mark),
        contentUrl: mutlakAdres(site.logo.mark),
        caption: site.name,
      },
      image: { "@id": logoId },
      slogan: site.tagline,
      knowsLanguage: "tr",
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+905326403692",
          contactType: "customer service",
          availableLanguage: "Turkish",
        },
        {
          "@type": "ContactPoint",
          telephone: "+905415653567",
          contactType: "customer service",
          availableLanguage: "Turkish",
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": siteId,
      url: site.url,
      name: site.name,
      description: site.description,
      inLanguage: "tr-TR",
      publisher: { "@id": isletmeId },
      image: paylasim.url,
    },
  ],
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteChrome>{children}</SiteChrome>
      <GoogleTag />
    </>
  );
}
