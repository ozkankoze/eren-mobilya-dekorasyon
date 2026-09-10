import Link from "next/link";
import LogoWordmark from "./LogoWordmark";
import { site } from "@/lib/site";

/**
 * Marka işareti — header ve footer'da kullanılan yatay wordmark logosu
 * (EREN | MOBİLYA TASARIM). Kare monogram (`logo-mark.svg`) yalnızca
 * favicon ve manifest için kullanılır, burada değil.
 *
 * Logo satır içi SVG olarak gömülüdür; `currentColor` sayesinde hero
 * fotoğrafının üzerinde beyaz, sayfa kaydırılınca koyu antrasit görünür.
 * Boyutu `app/globals.css` → `.wordmark svg` kuralındadır.
 */
export default function Wordmark({
  href = "/",
  large = false,
  onClick,
}: {
  href?: string | null;
  large?: boolean;
  onClick?: () => void;
}) {
  const className = `wordmark${large ? " wordmark--lg" : ""}`;

  const inner = (
    <>
      <LogoWordmark />
      <span className="visually-hidden">{site.wordmark}</span>
    </>
  );

  if (!href) {
    return <span className={className}>{inner}</span>;
  }

  return (
    <Link href={href} className={className} aria-label={site.name} onClick={onClick}>
      {inner}
    </Link>
  );
}
