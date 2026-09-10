import {
  categories as kodKategoriler,
  products as kodUygulamalar,
  projects as kodProjeler,
} from "./data";
import type {
  EkKategori,
  EkProje,
  EkUygulama,
  ItemOverride,
  SiteContent,
  StoredImage,
} from "./content";
import { isStoredImage } from "./content";

/**
 * Admin API uçlarının ortak yardımcıları.
 * (kaydet / ekle / sil route'ları bu dosyayı paylaşır)
 */

export type Bolum = "hero" | "kategori" | "uygulama" | "proje";
export type ListeBolum = Exclude<Bolum, "hero">;

export const LISTE_BOLUMLERI: ListeBolum[] = ["kategori", "uygulama", "proje"];

/** Panel bölümü → içerik JSON'undaki alan adı */
export const KOVA = {
  kategori: "categories",
  uygulama: "products",
  proje: "projects",
} as const;

/** Koddan gelen (silinemeyen ama gizlenebilen) slug'lar */
export const KOD_SLUGLARI: Record<ListeBolum, string[]> = {
  kategori: kodKategoriler.map((c) => c.slug),
  uygulama: kodUygulamalar.map((p) => p.slug),
  proje: kodProjeler.map((p) => p.slug),
};

export function listeBolumuMu(value: string): value is ListeBolum {
  return (LISTE_BOLUMLERI as string[]).includes(value);
}

export function metin(form: FormData, alan: string): string {
  const value = form.get(alan);
  return typeof value === "string" ? value.trim() : "";
}

export function isaretli(form: FormData, alan: string): boolean {
  return metin(form, alan) === "1";
}

/** Formdaki dosya alanı — boşsa null */
export function dosya(form: FormData, alan = "dosya"): File | null {
  const value = form.get(alan);
  return value instanceof File && value.size > 0 ? value : null;
}

/**
 * Bir bölümdeki tüm dolu slug'lar.
 * Gizlenmiş kod kayıtları da dahildir: aynı slug yeniden kullanılırsa kayıt
 * geri getirildiğinde çakışma olurdu.
 */
export function doluSluglar(
  content: SiteContent,
  bolum: ListeBolum
): Set<string> {
  const yeni = content.yeni[KOVA[bolum]] as { slug: string }[];
  return new Set([...KOD_SLUGLARI[bolum], ...yeni.map((y) => y.slug)]);
}

/** Panelden eklenmiş kaydı bulur (koddan gelenler için undefined döner) */
export function panelKaydi(content: SiteContent, bolum: ListeBolum, slug: string) {
  const liste = content.yeni[KOVA[bolum]] as (
    | EkKategori
    | EkUygulama
    | EkProje
  )[];
  const indeks = liste.findIndex((item) => item.slug === slug);
  return indeks === -1 ? null : { liste, indeks, kayit: liste[indeks] };
}

/** Kaydın var olup olmadığı — kod listesinde ya da panel listesinde */
export function kayitVarMi(
  content: SiteContent,
  bolum: ListeBolum,
  slug: string
): boolean {
  return (
    KOD_SLUGLARI[bolum].includes(slug) || panelKaydi(content, bolum, slug) !== null
  );
}

/** Bir görsel kaydındaki tüm dosya adresleri — silme için */
export function gorselAdresleri(image: unknown): string[] {
  return isStoredImage(image) ? image.sources.map((s) => s.url) : [];
}

/** Üzerine yazma kaydındaki fotoğrafın adresleri */
export function overrideGorselleri(over: ItemOverride | undefined): string[] {
  return gorselAdresleri(over?.image);
}

export type YeniKayit = EkKategori | EkUygulama | EkProje;

/** Yeni kaydı ilgili listenin **sonuna** ekler */
export function kayitEkle(
  content: SiteContent,
  bolum: ListeBolum,
  kayit: YeniKayit
): SiteContent {
  const alan = KOVA[bolum];
  return {
    ...content,
    yeni: {
      ...content.yeni,
      [alan]: [...(content.yeni[alan] as YeniKayit[]), kayit],
    } as SiteContent["yeni"],
  };
}

export function damgala(content: SiteContent): SiteContent {
  return { ...content, updatedAt: new Date().toISOString() };
}

export type { StoredImage };
