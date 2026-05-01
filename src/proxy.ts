import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { CHECKOUT_INTENT_COOKIE } from "@/lib/checkout-navigation";

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
  const isCheckoutRoute = pathname.startsWith("/checkout") && pathname !== "/checkout/success";

  if (isAdminRoute && token?.role !== "admin") {
    return buildRedirect(request, "/admin/login");
  }

  if (isAccountRoute && token?.role !== "customer") {
    return buildRedirect(request, "/account/login");
  }

  if (isCheckoutRoute && token?.role !== "customer") {
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
