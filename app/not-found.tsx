import Link from "next/link";
import SiteChrome from "@/components/site/SiteChrome";
import { getCategories } from "@/lib/content";

/** 404 sayfası arama sonuçlarında görünmemeli */
export const metadata = {
  title: "Sayfa bulunamadı",
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  const categories = await getCategories();

  return (
    <SiteChrome>
      <section className="container notfound">
        <span className="eyebrow">404</span>
        <h1 style={{ fontSize: "var(--fs-h2)" }}>
          Aradığınız sayfa bulunamadı.
        </h1>
        <p className="lead" style={{ maxWidth: "44ch", marginInline: "auto" }}>
          Bağlantı değişmiş ya da sayfa kaldırılmış olabilir. Aşağıdaki
          bölümlerden devam edebilirsiniz.
        </p>

        <ul className="chips" style={{ justifyContent: "center" }}>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link className="chip" href={`/kategori/${c.slug}`}>
                {c.name}
              </Link>
            </li>
          ))}
          <li>
            <Link className="chip" href="/#projeler">
              Projeler
            </Link>
          </li>
          <li>
            <Link className="chip" href="/#iletisim">
              İletişim
            </Link>
          </li>
        </ul>

        <div>
          <Link className="btn" href="/">
            Ana Sayfaya Dön
          </Link>
        </div>
      </section>
    </SiteChrome>
  );
}
