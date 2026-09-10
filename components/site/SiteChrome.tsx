import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import WhatsAppFab from "@/components/site/WhatsAppFab";

/**
 * Sitenin sabit çerçevesi: header, içerik alanı, footer ve WhatsApp butonu.
 * Admin paneli bu çerçeveyi kullanmaz — bu yüzden kök layout'tan ayrıldı.
 */
export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#icerik" className="skip-link">
        İçeriğe geç
      </a>
      <Header />
      <main id="icerik">{children}</main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
