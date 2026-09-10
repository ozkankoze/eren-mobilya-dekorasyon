import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionValue } from "@/lib/auth";

/**
 * (Next.js 16: eski adıyla middleware)
 *
 * /admin altındaki her sayfa oturum ister. Giriş sayfası ve giriş/çıkış
 * uç noktaları hariç tutulur.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    pathname === "/admin/giris" ||
    pathname === "/api/admin/giris" ||
    pathname === "/api/admin/cikis";
  if (isPublic) return NextResponse.next();

  const ok = await verifySessionValue(
    request.cookies.get(SESSION_COOKIE)?.value
  );
  if (ok) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ hata: "Oturum gerekli" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/admin/giris";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
