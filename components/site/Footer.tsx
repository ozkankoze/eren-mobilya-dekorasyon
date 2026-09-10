import Link from "next/link";
import Wordmark from "./Wordmark";
import { getCategories } from "@/lib/content";
import { nav, site, social, whatsappLink } from "@/lib/site";

export default async function Footer() {
  const categories = await getCategories();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Wordmark href={null} large />
            <p className="footer__about">
              Yaşam alanları için ölçüye özel mobilya çözümleri tasarlar ve
              üretiriz. Konut ve ticari projelerde tasarımdan montaja anahtar
              teslim uygulama.
            </p>

            <ul className="socials" aria-label="Sosyal medya">
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

          <nav aria-label="Kategoriler">
            <h2 className="footer__heading">Kategoriler</h2>
            <ul className="footer__list">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/kategori/${c.slug}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Alt menü">
            <h2 className="footer__heading">Menü</h2>
            <ul className="footer__list">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="footer__heading">İletişim</h2>
            <ul className="footer__list">
              <li>
                <a href={site.phone.href}>{site.phone.display}</a>
              </li>
              <li>
                <a href={site.phone2.href}>{site.phone2.display}</a>
              </li>
              <li>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={site.email.href}>{site.email.display}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} {site.name}. Tüm hakları saklıdır.</p>
          <p className="footer__phones">
            <a href={site.phone.href}>{site.phone.display}</a>
            <a href={site.phone2.href}>{site.phone2.display}</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
