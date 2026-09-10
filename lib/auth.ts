/**
 * Admin paneli kimlik doğrulama.
 *
 * Tek bir yönetici şifresi (`ADMIN_PASSWORD`) ile giriş yapılır. Giriş
 * başarılıysa HMAC ile imzalanmış, HttpOnly bir oturum çerezi yazılır.
 * Çerez içeriği yalnızca son kullanma zamanıdır; imza `ADMIN_SECRET` ile
 * doğrulanır, yani çerez kurcalanamaz.
 *
 * Web Crypto kullanıldığı için hem middleware (Edge) hem de sunucu
 * tarafında aynı kod çalışır.
 */

export const SESSION_COOKIE = "emt_admin";
const SESSION_DAYS = 14;

function secret() {
  // ADMIN_SECRET yoksa şifreden türetilir; yine de ayrı tanımlanması önerilir.
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
}

export function isAuthConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function toBase64Url(bytes: Uint8Array) {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );
  return toBase64Url(new Uint8Array(sig));
}

/** Sabit süreli karşılaştırma — şifre uzunluğu sızdırılmaz */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(input, expected);
}

export async function createSessionValue() {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  return `${expires}.${await sign(String(expires))}`;
}

export async function verifySessionValue(value: string | undefined) {
  if (!value || !secret()) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature) return false;
  if (Number(expires) < Date.now()) return false;
  return safeEqual(signature, await sign(expires));
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
};
