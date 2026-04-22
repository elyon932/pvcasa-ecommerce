import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function buildRedirect(request: NextRequest, pathname: string) {
  const url = new URL(pathname, request.url);
  url.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAccountRoute = pathname.startsWith("/account") && pathname !== "/account/login";

  if (isAdminRoute && token?.role !== "admin") {
    return buildRedirect(request, "/admin/login");
  }

  if (isAccountRoute && token?.role !== "customer") {
    return buildRedirect(request, "/account/login");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
