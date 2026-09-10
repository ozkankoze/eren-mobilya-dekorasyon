"use client";

import { useEffect, useRef, useState } from "react";
import { kucult } from "@/lib/resim-kucult";
import { slugify } from "@/lib/slug";
import type { Bolum, KategoriSecenegi } from "./Panel";

type EkleBolumu = Exclude<Bolum, "hero">;

const BASLIKLAR: Record<EkleBolumu, string> = {
  kategori: "Yeni Kategori",
  uygulama: "Yeni Uygulama",
  proje: "Yeni Proje",
};

const AD_ETIKETI: Record<EkleBolumu, string> = {
  kategori: "Kategori adı",
  uygulama: "Uygulama adı",
  proje: "Proje adı",
};

const ADRES_ONEKI: Record<EkleBolumu, string> = {
  kategori: "/kategori/",
  uygulama: "(adres kullanılmaz, benzersiz kimlik)",
  proje: "/proje/",
};

/**
 * Yeni kayıt formu.
 *
 * Slug, ad yazılırken otomatik üretilir; kullanıcı isterse elle değiştirebilir
 * (o andan sonra otomatik üretim durur). Fotoğraf zorunludur — fotoğrafsız
 * kayıt sitedeki ızgarada boşluk bırakırdı.
 */
export default function YeniKayitFormu({
  bolum,
  kategoriSecenekleri,
  onKapat,
  onEklendi,
}: {
  bolum: EkleBolumu;
  kategoriSecenekleri: KategoriSecenegi[];
  onKapat: () => void;
  onEklendi: () => void;
}) {
  const dosyaRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugElle, setSlugElle] = useState(false);
  const [description, setDescription] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [category, setCategory] = useState(kategoriSecenekleri[0]?.slug ?? "");
  const [location, setLocation] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [featured, setFeatured] = useState(false);
  const [secilen, setSecilen] = useState<File | null>(null);
  const [onizleme, setOnizleme] = useState("");
  const [kaydediyor, setKaydediyor] = useState(false);
  const [hata, setHata] = useState("");

  const kategoriBagli = bolum === "uygulama" || bolum === "proje";
  const aciklamaVar = bolum !== "uygulama";

  useEffect(() => {
    if (!secilen) {
      setOnizleme("");
      return;
    }
    const url = URL.createObjectURL(secilen);
    setOnizleme(url);
    return () => URL.revokeObjectURL(url);
  }, [secilen]);

  function adDegisti(value: string) {
    setName(value);
    if (!slugElle) setSlug(slugify(value));
  }

  async function gonder(event: React.FormEvent) {
    event.preventDefault();
    setHata("");

    if (!name.trim()) {
      setHata("Başlık gerekli.");
      return;
    }
    if (!secilen) {
      setHata("Fotoğraf seçmelisiniz.");
      return;
    }

    setKaydediyor(true);
    try {
      const form = new FormData();
      form.set("bolum", bolum);
      form.set("name", name.trim());
      form.set("slug", slug.trim() || slugify(name));
      form.set("imageAlt", imageAlt.trim());
      if (aciklamaVar) form.set("description", description.trim());
      if (kategoriBagli) form.set("category", category);
      if (bolum === "proje") {
        form.set("location", location.trim());
        form.set("year", year.trim());
      }
      if (bolum === "uygulama" && featured) form.set("featured", "1");
      form.set("dosya", await kucult(secilen));

      const res = await fetch("/api/admin/ekle", {
        method: "POST",
        body: form,
      });
      const data = (await res.json().catch(() => ({}))) as { hata?: string };

      if (!res.ok) {
        setHata(data.hata ?? "Eklenemedi.");
        return;
      }

      onEklendi();
    } catch {
      setHata("Bağlantı kurulamadı. Tekrar deneyin.");
    } finally {
      setKaydediyor(false);
    }
  }

  return (
    <form className="yp-card yp-card--yeni" onSubmit={gonder}>
      <figure className="yp-card__media">
        {onizleme ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={onizleme} alt="" />
        ) : (
          <span className="yp-card__bosgorsel">Fotoğraf seçilmedi</span>
        )}
      </figure>

      <div className="yp-card__body">
        <div className="yp-card__head">
          <h2>{BASLIKLAR[bolum]}</h2>
          <p>Kaydedildiğinde listenin sonuna eklenir ve sitede yayınlanır.</p>
        </div>

        <div className="yp-alan">
          <span>Fotoğraf (zorunlu)</span>
          <div className="yp-dosya">
            <label className="yp-secbtn">
              Fotoğraf Seç
              <input
                ref={dosyaRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setHata("");
                  setSecilen(e.target.files?.[0] ?? null);
                }}
              />
            </label>
            <span className="yp-dosya__ad">
              {secilen ? secilen.name : "Henüz dosya seçilmedi"}
            </span>
          </div>
        </div>

        <label className="yp-alan">
          <span>{AD_ETIKETI[bolum]} (zorunlu)</span>
          <input
            type="text"
            value={name}
            onChange={(e) => adDegisti(e.target.value)}
            required
          />
        </label>

        <label className="yp-alan">
          <span>Adres (slug) — addan otomatik üretilir</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlugElle(true);
              setSlug(slugify(e.target.value));
            }}
            placeholder="ornek-adres"
          />
          <span className="yp-ipucu">{ADRES_ONEKI[bolum]}{bolum !== "uygulama" ? slug : ""}</span>
        </label>

        {kategoriBagli && (
          <label className="yp-alan">
            <span>Kategori</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {kategoriSecenekleri.map((k) => (
                <option key={k.slug} value={k.slug}>
                  {k.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {bolum === "proje" && (
          <div className="yp-ikili">
            <label className="yp-alan">
              <span>Yer</span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Örn. Güzellik Merkezi"
              />
            </label>
            <label className="yp-alan">
              <span>Yıl</span>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                inputMode="numeric"
              />
            </label>
          </div>
        )}

        {aciklamaVar && (
          <label className="yp-alan">
            <span>Açıklama</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        )}

        <label className="yp-alan">
          <span>Fotoğraf açıklaması (görme engelliler ve Google için)</span>
          <input
            type="text"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            placeholder="Boş bırakırsanız başlık kullanılır"
          />
        </label>

        {bolum === "uygulama" && (
          <label className="yp-onay">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            <span>Ana sayfada &quot;Öne Çıkan İşler&quot; bölümünde göster</span>
          </label>
        )}

        <div className="yp-eylem">
          <button className="yp-btn" type="submit" disabled={kaydediyor}>
            {kaydediyor ? "Ekleniyor…" : "Ekle"}
          </button>
          <button
            className="yp-btn yp-btn--sade"
            type="button"
            onClick={onKapat}
            disabled={kaydediyor}
          >
            Vazgeç
          </button>

          {hata && (
            <p className="yp-durum yp-durum--err" role="alert">
              {hata}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
