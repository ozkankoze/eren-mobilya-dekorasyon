import Reveal from "@/components/site/Reveal";
import ProductCard from "@/components/site/ProductCard";
import { getCategoryLabels, getFeaturedProducts } from "@/lib/content";

export default async function Featured() {
  const [items, labels] = await Promise.all([
    getFeaturedProducts(),
    getCategoryLabels(),
  ]);

  return (
    <section className="section" id="one-cikanlar" aria-labelledby="one-cikanlar-baslik">
      <div className="container">
        <Reveal className="section__head">
          <div>
            <span className="eyebrow">02 — Seçkiler</span>
            <h2 className="section__title" id="one-cikanlar-baslik">
              Öne Çıkan İşler
            </h2>
          </div>
          <p className="section__note">
            Teslim ettiğimiz uygulamalardan bir seçki. Ölçü, malzeme ve yüzey
            seçenekleri için bize yazın.
          </p>
        </Reveal>

        <div className="products">
          {items.map((product, i) => (
            <Reveal key={product.slug} delay={(i % 3) * 70}>
              <ProductCard product={product} categoryLabel={labels[product.category]} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
