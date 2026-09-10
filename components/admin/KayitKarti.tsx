"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { kucult } from "@/lib/resim-kucult";
import type { KategoriSecenegi, PanelKayit } from "./Panel";

type Durum = { tur: "ok" | "err"; mesaj: string } | null;

export default function KayitKarti({
  kayit,
  kategoriSecenekleri,
}: {
  kayit: PanelKayit;
  kategoriSecenekleri: KategoriSecenegi[];
}) {
  const router = useRouter();
  const dosyaRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(kayit.name ?? "");
  const [description, setDescription] = useState(kayit.description ?? "");
  const [imageAlt, setImageAlt] = useState(kayit.imageAlt);
  const [category, setCategory] = useState(kayit.category ?? "");
  const [location, setLocation] = useState(kayit.location ?? "");
  const [year, setYear] = useState(kayit.year ?? "");
  const [featured, setFeatured] = useState(Boolean(kayit.featured));
  const [onizleme, setOnizleme] = useState(kayit.onizleme);
  const [sifirlanabilir, setSifirlanabilir] = useState(
    kayit.kaynak === "kod" && kayit.panelden
  );
  const [secilen, setSecilen] = useState<File | null>(null);
  const [kaydediyor, setKaydediyor] = useState(false);
  const [siliniyor, setSiliniyor] = useState(false);
  const [silmeOnayi, setSilmeOnayi] = useState(false);
  const [durum, setDurum] = useState<Durum>(null);

  const panelKaydi = kayit.kaynak === "panel";
  const yapisalAlanlar = panelKaydi && kayit.bolum !== "kategori";

  // Seçilen dosyanın yerel önizlemesi
  useEffect(() => {
    if (!secilen) return;
    const url = URL.createObjectURL(secilen);
    setOnizleme(url);
    return () => URL.revokeObjectURL(url);
  }, [secilen]);

  function dosyaSecildi(event: React.ChangeEvent<HTMLInputElement>) {
    setDurum(null);
    setSecilen(event.target.files?.[0] ?? null);
  }

  async function kaydet(gorseliSifirla = false) {
    setKaydediyor(true);
    setDurum(null);

    try {
      const form = new FormData();
      form.set("bolum", kayit.bolum);
      form.set("slug", kayit.slug);
      form.set("imageAlt", imageAlt);
      if (kayit.name !== undefined) form.set("name", name);
      if (kayit.description !== undefined) form.set("description", description);

      if (yapisalAlanlar) {
        form.set("category", category);
        if (kayit.bolum === "proje") {
          form.set("location", location);
          form.set("year", year);
        }
        if (kayit.bolum === "uygulama" && featured) form.set("featured", "1");
      }

      if (gorseliSifirla) {
        form.set("gorseliSifirla", "1");
      } else if (secilen) {
        form.set("dosya", await kucult(secilen));
      }

      const res = await fetch("/api/admin/kaydet", {
        method: "POST",
        body: form,
      });
      const data = (await res.json().catch(() => ({}))) as {
        hata?: string;
        kayit?: { image?: { sources: { w: number; url: string }[] } };
      };

      if (!res.ok) {
        setDurum({ tur: "err", mesaj: data.hata ?? "Kaydedilemedi." });
        return;
      }

      const kaynaklar = data.kayit?.image?.sources ?? [];
      const yeni =
        kaynaklar.find((s) => s.w >= 768)?.url ??
        kaynaklar[kaynaklar.length - 1]?.url;

      if (gorseliSifirla) {
        setSifirlanabilir(false);
        setOnizleme(kayit.varsayilanOnizleme);
      } else if (yeni) {
        if (kayit.kaynak === "kod") setSifirlanabilir(true);
        setOnizleme(yeni);
      }

      setSecilen(null);
      if (dosyaRef.current) dosyaRef.current.value = "";
      setDurum({ tur: "ok", mesaj: "Kaydedildi. Sitede güncellendi." });

      router.refresh();
    } catch {
      setDurum({ tur: "err", mesaj: "Bağlantı kurulamadı. Tekrar deneyin." });
    } finally {
      setKaydediyor(false);
    }
  }

  async function sil() {
    setSiliniyor(true);
    setDurum(null);

    try {
      const form = new FormData();
      form.set("bolum", kayit.bolum);
      form.set("slug", kayit.slug);

      const res = await fetch("/api/admin/sil", { method: "POST", body: form });
      const data = (await res.json().catch(() => ({}))) as { hata?: string };

      if (!res.ok) {
        setDurum({ tur: "err", mesaj: data.hata ?? "Silinemedi." });
        setSilmeOnayi(false);
        return;
      }

      // Kart, listenin yeniden çizilmesiyle kaybolur
      router.refresh();
    } catch {
      setDurum({ tur: "err", mesaj: "Bağlantı kurulamadı. Tekrar deneyin." });
      setSilmeOnayi(false);
    } finally {
      setSiliniyor(false);
    }
  }

  const rozet = panelKaydi ? "Panelden eklendi" : sifirlanabilir ? "Panelden" : null;

  return (
    <form
      className="yp-card"
      onSubmit={(e) => {
        e.preventDefault();
        void kaydet(false);
      }}
    >
      <figure className="yp-card__media">
        {/* Panel içi önizleme — optimize edilmiş görsel gerekmiyor */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={onizleme} alt="" />
        {rozet && <span className="yp-card__rozet">{rozet}</span>}
      </figure>

      <div className="yp-card__body">
        <div className="yp-card__head">
          <h2>{kayit.baslik}</h2>
          <p>{kayit.altbaslik}</p>
        </div>

        <div className="yp-alan">
          <span>Fotoğraf</span>
          <div className="yp-dosya">
            {/* Tarayıcının kendi "Choose File" düğmesi yerine Türkçe düğme;
                gerçek input erişilebilirlik için görünmez ama odaklanabilir. */}
            <label className="yp-secbtn">
              Fotoğraf Seç
              <input
                ref={dosyaRef}
                type="file"
                accept="image/*"
                onChange={dosyaSecildi}
              />
            </label>
            <span className="yp-dosya__ad">
              {secilen ? secilen.name : "Henüz dosya seçilmedi"}
            </span>
          </div>
        </div>

        {kayit.name !== undefined && (
          <label className="yp-alan">
            <span>Başlık</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        )}

        {yapisalAlanlar && (
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

        {yapisalAlanlar && kayit.bolum === "proje" && (
          <div className="yp-ikili">
            <label className="yp-alan">
              <span>Yer</span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
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

        {kayit.description !== undefined && (
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
          />
        </label>

        {yapisalAlanlar && kayit.bolum === "uygulama" && (
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
          <button
            className="yp-btn"
            type="submit"
            disabled={kaydediyor || siliniyor}
          >
            {kaydediyor ? "Kaydediliyor…" : "Kaydet"}
          </button>

          {sifirlanabilir && (
            <button
              className="yp-btn yp-btn--sade"
              type="button"
              disabled={kaydediyor || siliniyor}
              onClick={() => void kaydet(true)}
            >
              Eski fotoğrafa dön
            </button>
          )}

          {kayit.silinebilir && !silmeOnayi && (
            <button
              className="yp-btn yp-btn--tehlike"
              type="button"
              disabled={kaydediyor || siliniyor}
              onClick={() => {
                setDurum(null);
                setSilmeOnayi(true);
              }}
            >
              Sil
            </button>
          )}

          {durum && (
            <p
              className={`yp-durum yp-durum--${durum.tur}`}
              role={durum.tur === "err" ? "alert" : "status"}
            >
              {durum.mesaj}
            </p>
          )}
        </div>

        {silmeOnayi && (
          <div className="yp-onaykutu" role="alertdialog" aria-label="Silme onayı">
            <p>
              <strong>{kayit.baslik}</strong> silinsin mi? Bu kayıt siteden
              kaldırılacak
              {kayit.bolum === "kategori" && (
                <> ve bu kategoriye bağlı uygulamalar da listelerden çıkacak</>
              )}
              . Bu işlem geri alınamaz.
            </p>
            <div className="yp-onaykutu__eylem">
              <button
                className="yp-btn yp-btn--tehlike"
                type="button"
                disabled={siliniyor}
                onClick={() => void sil()}
              >
                {siliniyor ? "Siliniyor…" : "Evet, sil"}
              </button>
              <button
                className="yp-btn yp-btn--sade"
                type="button"
                disabled={siliniyor}
                onClick={() => setSilmeOnayi(false)}
              >
                Vazgeç
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
