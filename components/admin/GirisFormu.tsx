"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GirisFormu({
  marka,
  sifreTanimli,
}: {
  marka: string;
  sifreTanimli: boolean;
}) {
  const router = useRouter();
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);

  async function gonder(event: React.FormEvent) {
    event.preventDefault();
    setHata("");
    setBekliyor(true);

    try {
      const res = await fetch("/api/admin/giris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre }),
      });

      if (res.ok) {
        router.replace("/admin");
        router.refresh();
        return;
      }

      const data = (await res.json().catch(() => ({}))) as { hata?: string };
      setHata(data.hata ?? "Giriş yapılamadı.");
    } catch {
      setHata("Bağlantı kurulamadı. Tekrar deneyin.");
    } finally {
      setBekliyor(false);
    }
  }

  return (
    <form className="yp-giris__kutu" onSubmit={gonder}>
      <h1>Yönetim Paneli</h1>
      <p>{marka}</p>

      {!sifreTanimli && (
        <p className="yp-uyari" style={{ margin: 0 }}>
          Panel şifresi henüz tanımlı değil. Vercel proje ayarlarında{" "}
          <code>ADMIN_PASSWORD</code> değişkenini ekleyip projeyi yeniden
          dağıtın.
        </p>
      )}

      <label className="yp-alan">
        <span>Şifre</span>
        <input
          type="password"
          name="sifre"
          autoComplete="current-password"
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
          required
          autoFocus
        />
      </label>

      {hata && (
        <p className="yp-durum yp-durum--err" role="alert">
          {hata}
        </p>
      )}

      <button className="yp-btn" type="submit" disabled={bekliyor}>
        {bekliyor ? "Kontrol ediliyor…" : "Giriş Yap"}
      </button>
    </form>
  );
}
