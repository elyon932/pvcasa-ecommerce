import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ADMIN_SESSION_COOKIE, CLIENT_SESSION_COOKIE } from "@/lib/auth-cookies";
import { CHECKOUT_INTENT_COOKIE } from "@/lib/checkout-navigation";

function buildRedirect(request: NextRequest, pathname: string) {
  const url = new URL(pathname, request.url);
  url.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAccountRoute = pathname.startsWith("/account") && pathname !== "/account/login";
  const isCheckoutRoute = pathname.startsWith("/checkout") && pathname !== "/checkout/success";

  const adminToken = isAdminRoute
    ? await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: ADMIN_SESSION_COOKIE,
      })
    : null;
  const clientToken =
    isAccountRoute || isCheckoutRoute
      ? await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET,
          cookieName: CLIENT_SESSION_COOKIE,
        })
      : null;

  if (isAdminRoute && adminToken?.isAdmin !== true) {
    return buildRedirect(request, "/admin/login");
  }

  if (isAccountRoute && typeof clientToken?.customerId !== "string") {
    return buildRedirect(request, "/account/login");
  }

  if (isCheckoutRoute && typeof clientToken?.customerId !== "string") {
    return buildRedirect(request, "/account/login");
  }

  if (isCheckoutRoute && !request.cookies.has(CHECKOUT_INTENT_COOKIE)) {
    return NextResponse.redirect(new URL("/cart", request.url));
  }

  if (isCheckoutRoute) {
    const response = NextResponse.next();
    response.cookies.delete(CHECKOUT_INTENT_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout/:path*"],
};
