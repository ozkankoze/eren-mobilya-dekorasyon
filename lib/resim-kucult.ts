/**
 * Tarayıcı tarafında fotoğraf küçültme.
 *
 * Telefonla çekilen fotoğraflar 5–10 MB olabiliyor; sunucuya gönderilen
 * istek gövdesi ise sınırlı. Yükleme öncesi uzun kenarı 2000 piksele
 * indirip JPEG'e çeviriyoruz — site zaten en fazla 1536 piksel genişlikte
 * görsel servis ettiği için kalite kaybı görünmüyor.
 *
 * Herhangi bir aksilikte dosya olduğu gibi geri döner; yükleme yine çalışır.
 */

const MAX_KENAR = 2000;
const DOGRUDAN_LIMIT = 3 * 1024 * 1024;

export async function kucult(file: File): Promise<File> {
  if (typeof window === "undefined") return file;
  if (!file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });

    const uzunKenar = Math.max(bitmap.width, bitmap.height);
    if (uzunKenar <= MAX_KENAR && file.size <= DOGRUDAN_LIMIT) {
      bitmap.close?.();
      return file;
    }

    const oran = Math.min(1, MAX_KENAR / uzunKenar);
    const genislik = Math.round(bitmap.width * oran);
    const yukseklik = Math.round(bitmap.height * oran);

    const canvas = document.createElement("canvas");
    canvas.width = genislik;
    canvas.height = yukseklik;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close?.();
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, genislik, yukseklik);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9)
    );
    if (!blob) return file;

    const ad = file.name.replace(/\.[^.]+$/, "") || "fotograf";
    return new File([blob], `${ad}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}
