import Script from "next/script";
import { site } from "@/lib/site";

/**
 * Google etiketi (gtag.js) — Google Ads dönüşüm ölçümü.
 *
 * `afterInteractive` stratejisiyle yüklenir: sayfa çizildikten sonra devreye
 * girer, ilk boyamayı ve LCP'yi geciktirmez. Google'ın verdiği kod parçasının
 * yaptığı işin aynısını yapar, yalnızca yükleme zamanlaması farklıdır.
 *
 * Yalnızca üretim derlemesinde çalışır; yerel geliştirmede test dönüşümü
 * göndermemek için kapalıdır. Yönetim paneline de eklenmez (bu bileşen
 * yalnızca app/(site) çerçevesinde kullanılır).
 */
export default function GoogleTag() {
  const id = site.googleTagId;
  if (!id || process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        id="gtag-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}');`}
      </Script>
    </>
  );
}
