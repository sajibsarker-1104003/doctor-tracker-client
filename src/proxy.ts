import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const hasSession =
    request.cookies.has("refreshToken") || request.cookies.has("session");
  const path = request.nextUrl.pathname;
  const isProtected =
    path === "/" ||
    path.startsWith("/dashboard") ||
    path.startsWith("/doctors") ||
    path.startsWith("/patients");

  console.log(
    `[proxy] ${path} | cookies=${
      request.cookies.getAll().map((c) => c.name).join(",") || "none"
    } | hasSession=${hasSession} | protected=${isProtected}`
  );

  if (!hasSession && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/doctors/:path*",
    "/patients/:path*",
  ],
};