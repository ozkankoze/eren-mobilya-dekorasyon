import Link from "next/link";
import { imageMeta, imageSrcSet, imageUrl } from "@/lib/images";
import { getHero } from "@/lib/content";
import { site } from "@/lib/site";
import { blobKokeni } from "@/lib/seo";

/**
 * Tam ekran, tek parça hero.
 *
 * Fotoğraf bölümün tamamını kaplar; metin fotoğrafın üzerinde, alttan yukarı
 * yumuşakça açılan bir gradient sayesinde okunur. Mobilde ayrı bir dikey
 * kırpım servis edilir (scripts/optimize-images.mjs üretir) — böylece dar
 * ekranda mutfak adası ve tezgâh kadraj dışında kalmaz.
 */
export default async function Hero() {
  const heroImage = await getHero();
  const wide = imageMeta(heroImage.src);
  const tall = heroImage.portrait ? imageMeta(heroImage.portrait) : undefined;

  /**
   * Hero fotoğrafı sayfanın en büyük görselidir (LCP). Panelden yüklendiyse
   * ayrı bir sunucudan (Vercel Blob) gelir; bağlantıyı önden kurmak yükleme
   * süresini kısaltır. Yerleşik fotoğraflarda gerek yok, aynı alan adından
   * servis edilirler.
   */
  const blobSunucusu = blobKokeni(heroImage.src);

  return (
    <section className="hero" data-media-head aria-labelledby="hero-baslik">
      {blobSunucusu && (
        <link rel="preconnect" href={blobSunucusu} crossOrigin="anonymous" />
      )}

      {/*
        Hero fotoğrafı sayfanın en büyük görselidir (LCP). Ön yükleme etiketi
        <head> içine taşınır; tarayıcı gövdeyi ayrıştırmayı beklemeden, üstelik
        doğru boyutu seçerek indirmeye başlar. Mobil ve masaüstü için ayrı
        etiketler var — <picture> içindeki media kuralının aynısı kullanılır.
      */}
      {heroImage.portrait && tall ? (
        <>
          <link
            rel="preload"
            as="image"
            media="(max-width: 767px)"
            imageSrcSet={imageSrcSet(heroImage.portrait)}
            imageSizes="100vw"
            fetchPriority="high"
          />
          <link
            rel="preload"
            as="image"
            media="(min-width: 768px)"
            imageSrcSet={imageSrcSet(heroImage.src)}
            imageSizes="100vw"
            fetchPriority="high"
          />
        </>
      ) : (
        <link
          rel="preload"
          as="image"
          imageSrcSet={imageSrcSet(heroImage.src)}
          imageSizes="100vw"
          fetchPriority="high"
        />
      )}
      <div className="hero__media">
        <picture>
          {heroImage.portrait && tall && (
            <source
              media="(max-width: 767px)"
              srcSet={imageSrcSet(heroImage.portrait)}
              sizes="100vw"
              width={tall.width}
              height={tall.height}
            />
          )}
          <img
            src={imageUrl(heroImage.src)}
            srcSet={imageSrcSet(heroImage.src)}
            sizes="100vw"
            alt={heroImage.alt}
            width={wide?.width}
            height={wide?.height}
            fetchPriority="high"
            decoding="sync"
          />
        </picture>
      </div>

      <div className="hero__scrim" aria-hidden="true" />

      <div className="container hero__body">
        <h1 id="hero-baslik">
          <span className="eyebrow hero__eyebrow">{site.wordmark}</span>
          <span className="hero__title">
            Yaşam alanları için zamansız tasarım.
          </span>
        </h1>
        <p className="hero__text">{site.tagline}</p>
        <div className="hero__actions">
          <Link className="btn btn--light" href="#kategoriler">
            Kategorileri Keşfet
          </Link>
          <Link className="link-arrow link-arrow--light" href="#one-cikanlar">
            Yapılan işlere göz atın
          </Link>
        </div>
      </div>
    </section>
  );
}
