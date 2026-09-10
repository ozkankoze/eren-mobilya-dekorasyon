"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import KayitKarti from "./KayitKarti";
import YeniKayitFormu from "./YeniKayitFormu";

export type Bolum = "hero" | "kategori" | "uygulama" | "proje";

export type KategoriSecenegi = { slug: string; name: string };

export type PanelKayit = {
  bolum: Bolum;
  slug: string;
  grup: string;
  /** Kayıt koddan mı geliyor yoksa panelden mi eklendi */
  kaynak: "kod" | "panel";
  baslik: string;
  altbaslik: string;
  /** Yalnızca başlığı düzenlenebilen kayıtlarda dolu */
  name?: string;
  /** Yalnızca açıklaması olan kayıtlarda dolu */
  description?: string;
  imageAlt: string;
  onizleme: string;
  /** Koddaki özgün fotoğraf — "eski fotoğrafa dön" için (panel kayıtlarında boş) */
  varsayilanOnizleme: string;
  /** Fotoğraf panelden mi yüklendi (yoksa koddaki varsayılan) */
  panelden: boolean;
  /** Ana sayfa dışındaki her kayıt silinebilir */
  silinebilir: boolean;
  /* Panelden eklenen kayıtlarda düzenlenebilen yapısal alanlar */
  category?: string;
  location?: string;
  year?: string;
  featured?: boolean;
};

type Grup = {
  ad: string;
  /** Ana sayfada yeni kayıt eklenemez — bilinçli olarak null */
  ekleBolumu: Exclude<Bolum, "hero"> | null;
  ekleEtiketi?: string;
};

const GRUPLAR: Grup[] = [
  { ad: "Ana Sayfa", ekleBolumu: null },
  { ad: "Kategoriler", ekleBolumu: "kategori", ekleEtiketi: "Yeni Kategori Ekle" },
  { ad: "Projeler", ekleBolumu: "proje", ekleEtiketi: "Yeni Proje Ekle" },
  { ad: "Uygulamalar", ekleBolumu: "uygulama", ekleEtiketi: "Yeni Uygulama Ekle" },
];

export default function Panel({
  marka,
  kayitlar,
  kategoriSecenekleri,
  depoBagli,
  guncellenme,
}: {
  marka: string;
  kayitlar: PanelKayit[];
  kategoriSecenekleri: KategoriSecenegi[];
  depoBagli: boolean;
  guncellenme: string;
}) {
  const router = useRouter();
  const [grupAdi, setGrupAdi] = useState(GRUPLAR[0].ad);
  const [ekleAcik, setEkleAcik] = useState(false);
  const [cikisYapiliyor, setCikisYapiliyor] = useState(false);

  const grup = GRUPLAR.find((g) => g.ad === grupAdi) ?? GRUPLAR[0];

  const gosterilen = useMemo(
    () => kayitlar.filter((k) => k.grup === grupAdi),
    [kayitlar, grupAdi]
  );

  const tarih = guncellenme
    ? new Date(guncellenme).toLocaleString("tr-TR", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  // Uygulama ve proje bir kategoriye bağlanır; hiç kategori yoksa eklenemez
  const kategoriGerekli =
    grup.ekleBolumu === "uygulama" || grup.ekleBolumu === "proje";
  const eklenebilir =
    Boolean(grup.ekleBolumu) &&
    depoBagli &&
    (!kategoriGerekli || kategoriSecenekleri.length > 0);

  function grupDegistir(ad: string) {
    setGrupAdi(ad);
    setEkleAcik(false);
  }

  async function cikis() {
    setCikisYapiliyor(true);
    await fetch("/api/admin/cikis", { method: "POST" });
    router.replace("/admin/giris");
    router.refresh();
  }

  return (
    <>
      <div className="yp__bar">
        <div className="yp__brand">
          <strong>Yönetim Paneli</strong>
          <span>{marka}</span>
        </div>
        <button
          className="yp-btn yp-btn--sade"
          type="button"
          onClick={cikis}
          disabled={cikisYapiliyor}
        >
          Çıkış
        </button>
      </div>

      <div className="yp__wrap">
        {!depoBagli && (
          <p className="yp-uyari">
            <strong>Depolama bağlı değil.</strong> Fotoğraf yükleyebilmek ve
            yeni içerik ekleyebilmek için Vercel projenize bir Blob deposu
            ekleyin; <code>BLOB_READ_WRITE_TOKEN</code> tanımlandıktan sonra
            kaydetme çalışır. O zamana kadar site, koddaki varsayılan içerikle
            yayında kalır.
          </p>
        )}

        <p className="yp-not">
          Fotoğrafı değiştirmek için bir dosya seçip <strong>Kaydet</strong>
          &apos;e basın. Değişiklik birkaç saniye içinde sitede görünür.
          {tarih && <> Son güncelleme: {tarih}.</>}
        </p>

        <div className="yp__tabs" role="tablist" aria-label="Bölümler">
          {GRUPLAR.map((g) => (
            <button
              key={g.ad}
              type="button"
              role="tab"
              className="yp__tab"
              aria-selected={g.ad === grupAdi}
              onClick={() => grupDegistir(g.ad)}
            >
              {g.ad}
            </button>
          ))}
        </div>

        {grup.ekleBolumu && (
          <div className="yp__ekle">
            <button
              type="button"
              className="yp-btn yp-btn--ekle"
              onClick={() => setEkleAcik((v) => !v)}
              disabled={!eklenebilir}
              aria-expanded={ekleAcik}
            >
              <span aria-hidden="true">+</span> {grup.ekleEtiketi}
            </button>

            <span className="yp__sayac">
              {gosterilen.length} kayıt
              {kategoriGerekli && kategoriSecenekleri.length === 0 && (
                <> · önce bir kategori ekleyin</>
              )}
            </span>
          </div>
        )}

        {grup.ekleBolumu && ekleAcik && (
          <YeniKayitFormu
            bolum={grup.ekleBolumu}
            kategoriSecenekleri={kategoriSecenekleri}
            onKapat={() => setEkleAcik(false)}
            onEklendi={() => {
              setEkleAcik(false);
              router.refresh();
            }}
          />
        )}

        <div className="yp__list">
          {gosterilen.map((kayit) => (
            <KayitKarti
              key={`${kayit.bolum}-${kayit.slug}`}
              kayit={kayit}
              kategoriSecenekleri={kategoriSecenekleri}
            />
          ))}

          {gosterilen.length === 0 && (
            <p className="yp-bos">
              Bu bölümde henüz kayıt yok. Yukarıdaki düğmeyle ekleyebilirsiniz.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
