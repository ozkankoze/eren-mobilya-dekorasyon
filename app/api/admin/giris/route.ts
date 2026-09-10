import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  checkPassword,
  createSessionValue,
  isAuthConfigured,
  sessionCookieOptions,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      { hata: "Panel şifresi tanımlı değil (ADMIN_PASSWORD)." },
      { status: 500 }
    );
  }

  let sifre = "";
  try {
    const body = (await request.json()) as { sifre?: string };
    sifre = String(body.sifre ?? "");
  } catch {
    return NextResponse.json({ hata: "Geçersiz istek." }, { status: 400 });
  }

  if (!checkPassword(sifre)) {
    // Kaba kuvvet denemelerini yavaşlatmak için küçük bir gecikme
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ hata: "Şifre hatalı." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    SESSION_COOKIE,
    await createSessionValue(),
    sessionCookieOptions
  );
  return response;
}
