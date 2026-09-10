import Link from "next/link";
import Img from "./Img";
import { WhatsAppIcon } from "./Icons";
import type { Product } from "@/lib/data";
import { whatsappLink } from "@/lib/site";

/**
 * Uygulama kartı.
 *
 * Ana sayfadaki "Öne Çıkan İşler" bölümünde kart, ilgili kategori sayfasına
 * götürür. Kategori sayfasının kendi içinde ise aynı sayfaya link vermek
 * anlamsız olacağı için kart, o parçaya özel hazır mesajla WhatsApp'a
 * yönlendirir.
 */
export default function ProductCard({
  product,
  sizes = "(min-width: 1040px) 30vw, (min-width: 620px) 46vw, 92vw",
  currentCategory,
  categoryLabel,
}: {
  product: Product;
  sizes?: string;
  /** Kartın gösterildiği kategori sayfasının slug'ı (varsa) */
  currentCategory?: string;
  /** Kategorinin görünen adı — panelden değiştirilebildiği için dışarıdan gelir */
  categoryLabel?: string;
}) {
  const onOwnCategoryPage = currentCategory === product.category;
  const href = `/kategori/${product.category}`;
  /** Genel "İncele" metni yerine bağlantının nereye gittiğini anlatan etiket */
  const etiket = `${product.name} — ${categoryLabel ?? product.category} kategorisini incele`;

  const media = (
    <div className="product__media media media--zoom">
      <Img
        name={product.image}
        alt={product.imageAlt}
        focus={product.focus}
        sizes={sizes}
      />
    </div>
  );

  return (
    <article className="product">
      {onOwnCategoryPage ? (
        media
      ) : (
        // Görsel bağlantısı klavye sırasında tekrar etmesin diye
        // odaklanılabilir değil; başlık ve alttaki bağlantı yeterli.
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden="true"
          title={etiket}
        >
          {media}
        </Link>
      )}

      <div className="product__body">
        <p className="product__meta">{categoryLabel ?? product.category}</p>
        <h3 className="product__name">{product.name}</h3>

        {onOwnCategoryPage ? (
          <a
            className="link-arrow product__link"
            href={whatsappLink(
              `Merhaba, ${product.name} hakkında bilgi almak istiyorum.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            title={`${product.name} için WhatsApp'tan bilgi alın`}
            aria-label={`${product.name} için WhatsApp'tan bilgi alın`}
          >
            <WhatsAppIcon className="link-arrow__icon" />
            Bilgi Alın
          </a>
        ) : (
          <Link
            className="link-arrow product__link"
            href={href}
            title={etiket}
            aria-label={etiket}
          >
            İncele
          </Link>
        )}
      </div>
    </article>
  );
}
