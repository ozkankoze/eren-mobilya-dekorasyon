import Reveal from "@/components/site/Reveal";
import { highlights } from "@/lib/data";

/**
 * Hero'nun hemen altındaki ince hizmet şeridi.
 * Markanın ne yaptığını üç satırda anlatır; sayfayı doldurmaz.
 */
export default function Highlights() {
  return (
    <section className="strip" aria-label="Hizmetlerimiz">
      <div className="container">
        <Reveal className="strip__grid">
          {highlights.map((item) => (
            <div className="strip__item" key={item.title}>
              <p className="strip__title">{item.title}</p>
              <p className="strip__text">{item.text}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
