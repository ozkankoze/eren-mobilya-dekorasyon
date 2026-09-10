import Reveal from "@/components/site/Reveal";
import ProjectCard from "@/components/site/ProjectCard";
import { getProjects, izgaraDenkle } from "@/lib/content";

export default async function Projects() {
  const projects = izgaraDenkle(await getProjects());

  return (
    <section className="section projects" id="projeler" aria-labelledby="projeler-baslik">
      <div className="container">
        <Reveal className="section__head">
          <div>
            <span className="eyebrow">03 — Projeler</span>
            <h2 className="section__title" id="projeler-baslik">
              Projeler
            </h2>
          </div>
          <p className="section__note">
            Ölçüye özel üretim ve yerinde uygulamayla tamamladığımız yaşam
            alanlarından bir seçki.
          </p>
        </Reveal>

        <div className="projects__grid">
          {projects.map((project, i) => (
            <Reveal
              key={project.slug}
              as="article"
              delay={i * 60}
              className={`project${project.wide ? " project--wide" : ""}`}
            >
              <ProjectCard project={project} wide={project.wide} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
