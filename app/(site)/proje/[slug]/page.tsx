import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Img from "@/components/site/Img";
import Reveal from "@/components/site/Reveal";
import ProjectCard from "@/components/site/ProjectCard";
import { WhatsAppIcon } from "@/components/site/Icons";
import { projects } from "@/lib/data";
import {
  getCategoryLabels,
  getOtherProjects,
  getProjectBySlug,
} from "@/lib/content";
import { imageUrl } from "@/lib/images";
import { site, whatsappLink } from "@/lib/site";
import { metaAciklama, mutlakAdres, ogGorsel } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  // Panelden silinmiş proje: arama motorlarına dizine ekleme demeliyiz
  if (!project) {
    return { title: "Proje bulunamadı", robots: { index: false, follow: true } };
  }

  // Şablon sona markayı ekliyor; başlığın kısa kalması için yalnızca ad
  const title = project.name;
  const description = metaAciklama(project.description);
  const yol = `/proje/${project.slug}`;
  const gorseller = ogGorsel(project.image, project.imageAlt);

  return {
    title,
    description,
    alternates: { canonical: yol },
    openGraph: {
      type: "article",
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

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const [project, labels] = await Promise.all([
    getProjectBySlug(slug),
    getCategoryLabels(),
  ]);
  if (!project) notFound();

  const others = await getOtherProjects(project.slug);
  // Kategori panelden silinmiş olabilir; o zaman bağlantı verilmez
  const categoryLabel: string | undefined = labels[project.category];

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: site.url },
      { "@type": "ListItem", position: 2, name: "Projeler", item: `${site.url}/#projeler` },
      {
        "@type": "ListItem",
        position: 3,
        name: project.name,
        item: `${site.url}/proje/${project.slug}`,
      },
    ],
  };

  const adres = mutlakAdres(`/proje/${project.slug}`);

  /**
   * Tamamlanmış bir uygulama işi: `CreativeWork`. Ürün gibi satılan bir şey
   * olmadığı için `Product`/`offers` kullanılmaz.
   */
  const projeVerisi = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${adres}#proje`,
    url: adres,
    name: project.name,
    description: project.description,
    inLanguage: "tr-TR",
    dateCreated: project.year,
    creator: { "@id": `${site.url}/#isletme` },
    isPartOf: { "@id": `${site.url}/#website` },
    image: {
      "@type": "ImageObject",
      url: mutlakAdres(imageUrl(project.image, 1536)),
      caption: project.imageAlt,
    },
    ...(categoryLabel ? { genre: categoryLabel } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumb, projeVerisi]),
        }}
      />

      <section className="pagehead" data-media-head>
        <div className="pagehead__media">
          <Img
            name={project.image}
            alt={project.imageAlt}
            focus={project.focus}
            sizes="100vw"
            priority
          />
        </div>
        <div className="pagehead__scrim" aria-hidden="true" />
        <div className="container">
          <nav aria-label="Sayfa yolu">
            <ol className="crumbs">
              <li>
                <Link href="/">Ana Sayfa</Link>
              </li>
              <li>
                <Link href="/#projeler">Projeler</Link>
              </li>
              <li>{project.name}</li>
            </ol>
          </nav>
          <span className="eyebrow" style={{ color: "rgba(255,255,255,.72)" }}>
            Proje
          </span>
          <h1 className="pagehead__title" style={{ marginTop: 12 }}>
            {project.name}
          </h1>
          <p className="pagehead__text">
            {project.location} · {project.year}
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="kunye-baslik">
        <div className="container">
          <div className="facts">
            <Reveal>
              <span className="eyebrow">Proje künyesi</span>
              <h2 className="section__title" id="kunye-baslik">
                Uygulama detayları
              </h2>
              <dl className="facts__list">
                <div>
                  <dt>Yer</dt>
                  <dd>{project.location}</dd>
                </div>
                <div>
                  <dt>Yıl</dt>
                  <dd>{project.year}</dd>
                </div>
                {categoryLabel && (
                  <div>
                    <dt>Kapsam</dt>
                    <dd>
                      <Link href={`/kategori/${project.category}`}>
                        {categoryLabel}
                      </Link>
                    </dd>
                  </div>
                )}
              </dl>
            </Reveal>

            <Reveal delay={80}>
              <p className="lead">{project.description}</p>
              <p className="facts__text">
                Tasarımdan üretime ve yerinde montaja kadar tüm süreci tek
                elden yürüttük. Benzer bir alan için ölçü, malzeme ve yüzey
                seçeneklerini konuşmak isterseniz WhatsApp&apos;tan
                yazabilirsiniz.
              </p>
              {categoryLabel && (
                <Link
                  className="link-arrow facts__link"
                  href={`/kategori/${project.category}`}
                >
                  {categoryLabel} uygulamalarını görün
                </Link>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="section projects" aria-labelledby="diger-projeler">
          <div className="container">
            <Reveal className="section__head">
              <div>
                <span className="eyebrow">{others.length} proje</span>
                <h2 className="section__title" id="diger-projeler">
                  Diğer projeler
                </h2>
              </div>
              <p className="section__note">
                Aynı uygulamanın diğer mekânları ve teslim ettiğimiz başka
                alanlar.
              </p>
            </Reveal>

            <div className="projects__grid">
              {others.map((other, i) => (
                <Reveal key={other.slug} as="article" delay={i * 60} className="project">
                  <ProjectCard project={other} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section section--tight cta-band">
        <div className="container">
          <span className="eyebrow">İletişim</span>
          <h2 className="cta-band__title">
            Benzer bir projeyi sizin mekânınız için planlayalım.
          </h2>
          <div className="cta-band__actions">
            <a
              className="btn"
              href={whatsappLink(
                `Merhaba, ${project.name} projeniz hakkında bilgi almak istiyorum.`
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="btn__icon" />
              WhatsApp&apos;tan İletişime Geç
            </a>
            <Link className="btn btn--ghost" href="/#kategoriler">
              Tüm Kategoriler
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
