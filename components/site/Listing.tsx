import Link from "next/link";
import Img from "./Img";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";
import { WhatsAppIcon } from "./Icons";
import { whatsappLink } from "@/lib/site";
import type { Product } from "@/lib/data";
import type { ImageValue } from "@/lib/content";

export type Chip = { href: string; label: string; active?: boolean };

/**
 * Kategori alt sayfalarının şablonu.
 */
export default function Listing({
  eyebrow,
  slug,
  title,
  description,
  image,
  imageAlt,
  focus,
  crumb,
  products,
  chips,
  chipsLabel,
}: {
  eyebrow: string;
  /** Kategori slug'ı — kartların kendi sayfasına link vermesini önler */
  slug: string;
  title: string;
  description: string;
  image: ImageValue;
  imageAlt: string;
  focus?: string;
  crumb: string;
  products: Product[];
  chips: Chip[];
  chipsLabel: string;
}) {
  return (
    <>
      <section className="pagehead" data-media-head>
        <div className="pagehead__media">
          <Img
            name={image}
            alt={imageAlt}
            focus={focus}
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
              <li>{crumb}</li>
            </ol>
          </nav>
          <span className="eyebrow" style={{ color: "rgba(255,255,255,.72)" }}>
            {eyebrow}
          </span>
          <h1 className="pagehead__title" style={{ marginTop: 12 }}>
            {title}
          </h1>
          <p className="pagehead__text">{description}</p>
        </div>
      </section>

      <section className="section" aria-labelledby="urunler-baslik">
        <div className="container">
          <Reveal className="section__head">
            <div>
              <span className="eyebrow">{products.length} uygulama</span>
              <h2 className="section__title" id="urunler-baslik">
                Uygulamalar
              </h2>
            </div>
            <p className="section__note">
              Ölçü, malzeme ve yüzey seçenekleri için WhatsApp&apos;tan
              yazabilir ya da showroom&apos;da inceleyebilirsiniz.
            </p>
          </Reveal>

          {products.length > 0 ? (
            <div className="products">
              {products.map((product, i) => (
                <Reveal key={product.slug} delay={(i % 3) * 70}>
                  <ProductCard
                    product={product}
                    currentCategory={slug}
                    categoryLabel={title}
                  />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="lead">
              Bu bölüm için görseller yakında eklenecek. Dilerseniz
              WhatsApp&apos;tan bize yazın, sizin için seçki hazırlayalım.
            </p>
          )}

          <nav aria-label={chipsLabel}>
            <p className="eyebrow" style={{ marginTop: "clamp(48px,6vw,88px)" }}>
              {chipsLabel}
            </p>
            <ul className="chips">
              {chips.map((chip) =>
                chip.active ? (
                  // Bulunduğunuz sayfa: kendine link vermez, yalnızca işaretlenir
                  <li key={chip.href}>
                    <span className="chip is-active" aria-current="page">
                      {chip.label}
                    </span>
                  </li>
                ) : (
                  <li key={chip.href}>
                    <Link className="chip" href={chip.href}>
                      {chip.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </nav>
        </div>
      </section>

      <section className="section section--tight cta-band">
        <div className="container">
          <span className="eyebrow">İletişim</span>
          <h2 className="cta-band__title">
            Beğendiğiniz bir parçayı ölçünüze göre üretelim.
          </h2>
          <div className="cta-band__actions">
            <a
              className="btn"
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="btn__icon" />
              WhatsApp&apos;tan İletişime Geç
            </a>
            <Link className="btn btn--ghost" href="/#kategoriler">
              Tüm Kategoriler
            </Link>
            <Link className="btn btn--ghost" href="/#projeler">
              Projelerimiz
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
