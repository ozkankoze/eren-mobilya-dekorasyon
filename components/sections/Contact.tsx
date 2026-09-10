import Reveal from "@/components/site/Reveal";
import { WhatsAppIcon } from "@/components/site/Icons";
import { site, social, whatsappLink } from "@/lib/site";

export default function Contact() {
  return (
    <section className="section contact" id="iletisim" aria-labelledby="iletisim-baslik">
      <div className="container">
        <Reveal>
          <span className="eyebrow">05 — İletişim</span>
          <h2 className="contact__title" id="iletisim-baslik">
            Hayalinizdeki yaşam alanını birlikte tasarlayalım.
          </h2>
        </Reveal>

        <Reveal className="contact__grid" delay={80}>
          <div className="contact__lines">
            <div>
              <span className="contact__label">Telefon</span>
              <a className="contact__value" href={site.phone.href}>
                {site.phone.display}
              </a>
              <a className="contact__value" href={site.phone2.href}>
                {site.phone2.display}
              </a>
            </div>
            <div>
              <span className="contact__label">WhatsApp</span>
              <a
                className="contact__value"
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
              >
                {site.whatsapp.display}
              </a>
            </div>
            <div>
              <span className="contact__label">E-posta</span>
              <a className="contact__value contact__value--mail" href={site.email.href}>
                {site.email.display}
              </a>
            </div>
          </div>

          <div className="contact__actions">
            <a
              className="btn btn--light"
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="btn__icon" />
              WhatsApp&apos;tan İletişime Geç
            </a>

            <ul className="socials socials--light" aria-label="Sosyal medya">
              {social.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="me noopener noreferrer"
                    title={`${item.label} hesabımız (yeni sekmede açılır)`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
