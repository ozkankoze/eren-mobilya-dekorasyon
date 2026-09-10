import Link from "next/link";
import Img from "./Img";
import type { Project } from "@/lib/data";

/**
 * Proje kartı — ana sayfadaki Projeler bölümünde ve proje detay
 * sayfasındaki "Diğer projeler" listesinde kullanılır.
 * Kartın tamamı `/proje/[slug]` sayfasına gider.
 */
export default function ProjectCard({
  project,
  wide = false,
}: {
  project: Project;
  wide?: boolean;
}) {
  const href = `/proje/${project.slug}`;

  return (
    <>
      {/* Görsel bağlantısı klavye sırasında tekrar etmesin diye
          odaklanılabilir değil; başlık ve alttaki bağlantı yeterli. */}
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        title={`${project.name} projesini incele`}
      >
        <div className="project__media media media--zoom">
          <Img
            name={project.image}
            alt={project.imageAlt}
            focus={project.focus}
            sizes={wide ? "92vw" : "(min-width: 900px) 46vw, 92vw"}
          />
        </div>
      </Link>

      <div className="project__body">
        <div>
          <p className="project__meta">
            {project.location} · {project.year}
          </p>
          <h3 className="project__name">
            <Link href={href}>{project.name}</Link>
          </h3>
        </div>
        <div>
          <p className="project__text">{project.description}</p>
          <Link
            className="link-arrow project__link"
            href={href}
            title={`${project.name} projesini incele`}
            aria-label={`${project.name} projesini incele`}
          >
            Projeyi İncele
          </Link>
        </div>
      </div>
    </>
  );
}
