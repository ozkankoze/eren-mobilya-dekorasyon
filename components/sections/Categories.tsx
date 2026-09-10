import Link from "next/link";
import Img from "@/components/site/Img";
import Reveal from "@/components/site/Reveal";
import { getCategories, izgaraDenkle } from "@/lib/content";

/**
 * Kategoriler — görsel ağırlıklı editorial vitrin.
 *
 * Her kategori büyük bir fotoğraf, adı, kısa açıklaması ve tek bir bağlantı
 * içeren bir kart olarak gösterilir. Masaüstünde 2 kolonluk grid; ritmi
 * bozmak için bazı kartlar tam genişlikte (`wide: true`). Mobilde tüm
 * kartlar tek kolonda alt alta akar — yatay kaydırma yok.
 */
export default async function Categories() {
  // Panelden kayıt eklenip silinebildiği için ızgara boşluğu burada kapatılır
  const categories = izgaraDenkle(await getCategories());

  return (
    <section className="section" id="kategoriler" aria-labelledby="kategoriler-baslik">
      <div className="container">
        <Reveal className="section__head">
          <div>
            <span className="eyebrow">01 — Ürün grupları</span>
            <h2 className="section__title" id="kategoriler-baslik">
              Kategoriler
            </h2>
          </div>
          <p className="section__note">
            Her mekân için sade bir başlangıç noktası. Kategoriyi seçin, o
            alanda yaptığımız uygulamaları birlikte görün.
          </p>
        </Reveal>

        <div className="catgrid">
          {categories.map((category, i) => (
            <Reveal
              key={category.slug}
              as="article"
              delay={(i % 2) * 70}
              className={`catcard${category.wide ? " catcard--wide" : ""}`}
            >
              {/* Görsel bağlantısı klavye sırasında tekrar etmesin diye
                  odaklanılabilir değil; başlık ve alttaki bağlantı yeterli. */}
              {/* Ekran okuyucudan gizli ama tarayıcı ve arama motoru için
                  açıklayıcı olsun diye title verilir. */}
              <Link
                href={`/kategori/${category.slug}`}
                tabIndex={-1}
                aria-hidden="true"
                title={`${category.name} kategorisini incele`}
              >
                <div className="catcard__media media media--zoom">
                  <Img
                    name={category.image}
                    alt={category.imageAlt}
                    focus={category.focus}
                    sizes={
                      category.wide
                        ? "92vw"
                        : "(min-width: 900px) 46vw, 92vw"
                    }
                  />
                </div>
              </Link>

              <div className="catcard__body">
                <h3 className="catcard__name">
                  <Link href={`/kategori/${category.slug}`}>{category.name}</Link>
                </h3>
                <p className="catcard__text">{category.description}</p>
                <Link
                  className="link-arrow catcard__link"
                  href={`/kategori/${category.slug}`}
                  title={`${category.name} kategorisini incele`}
                  aria-label={`${category.name} kategorisini incele`}
                >
                  Kategoriyi İncele
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
