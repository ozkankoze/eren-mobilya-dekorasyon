import { imageMeta, imageSrcSet, imageUrl } from "@/lib/images";
import type { ImageValue } from "@/lib/content";

type ImgProps = {
  /** Yerleşik görselin adı ya da panelden yüklenmiş görsel kaydı */
  name: ImageValue;
  alt: string;
  /** Tarayıcıya hangi genişlikte gösterileceğini söyler */
  sizes: string;
  className?: string;
  /**
   * Kırpma odağı — CSS object-position değeri.
   * Kare/geniş çerçevelerde mobilyanın önemli kısmının kadrajda kalması için.
   */
  focus?: string;
  /** Ekranın üstündeki görseller için — lazy load kapatılır */
  priority?: boolean;
};

/**
 * Fotoğraf bileşeni: srcset + sizes ile responsive, varsayılan olarak lazy.
 * Genişlik/yükseklik verildiği için yüklenirken sayfa kaymaz (CLS yok).
 */
export default function Img({
  name,
  alt,
  sizes,
  className,
  focus,
  priority = false,
}: ImgProps) {
  const meta = imageMeta(name);

  return (
    <img
      src={imageUrl(name)}
      srcSet={imageSrcSet(name)}
      sizes={sizes}
      alt={alt}
      className={className}
      width={meta?.width}
      height={meta?.height}
      style={focus ? { objectPosition: focus } : undefined}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}
