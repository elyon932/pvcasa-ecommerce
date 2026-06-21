import "server-only";

import Stripe from "stripe";

const STRIPE_API_VERSION = "2026-03-25.dahlia";

let stripeClient: Stripe | null = null;

function assertCheckoutBaseUrl(value: string) {
  const url = new URL(value);

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("CHECKOUT_BASE_URL_NOT_CONFIGURED");
  }

  return url.toString();
}

function getCheckoutBaseUrl(requestOrigin?: string) {
  if (process.env.NODE_ENV !== "production" && requestOrigin?.trim()) {
    return assertCheckoutBaseUrl(requestOrigin.trim());
  }

  const configuredBaseUrl =
    process.env.STRIPE_CHECKOUT_BASE_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim();

  if (configuredBaseUrl) {
    return assertCheckoutBaseUrl(configuredBaseUrl);
  }

  throw new Error("CHECKOUT_BASE_URL_NOT_CONFIGURED");
}

function isLocalUrl(url: URL) {
  return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
}

function normalizeLocalUrlToBase(url: URL, baseUrl: string) {
  const base = new URL(baseUrl);

  if (process.env.NODE_ENV !== "production" && isLocalUrl(url) && isLocalUrl(base)) {
    return new URL(`${url.pathname}${url.search}${url.hash}`, base);
  }

  return url;
}

function resolveCheckoutUrl(path: string | undefined, fallback: string, baseUrl: string) {
  const value = path?.trim() || fallback;

  if (value.includes("\\") || value.startsWith("//")) {
    return normalizeLocalUrlToBase(new URL(fallback, baseUrl), baseUrl);
  }

  if (/^https?:\/\//i.test(value)) {
    return normalizeLocalUrlToBase(new URL(value), baseUrl);
  }

  if (!value.startsWith("/")) {
    return normalizeLocalUrlToBase(new URL(fallback, baseUrl), baseUrl);
  }

  return new URL(value, baseUrl);
}

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: STRIPE_API_VERSION,
    });
  }

  return stripeClient;
}

export function getStripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || null;
}

export function buildCheckoutUrls({
  orderNumber,
  requestOrigin,
  cancelPath,
}: {
  orderNumber: string;
  requestOrigin?: string | null;
  cancelPath?: string;
}) {
  const baseUrl = getCheckoutBaseUrl(requestOrigin ?? undefined);

  const successUrl = resolveCheckoutUrl(
    process.env.STRIPE_CHECKOUT_SUCCESS_URL,
    "/checkout/success",
    baseUrl,
  );
  successUrl.searchParams.set("order", orderNumber);

  const cancelUrl = resolveCheckoutUrl(
    cancelPath,
    process.env.STRIPE_CHECKOUT_CANCEL_URL?.trim() || "/checkout",
    baseUrl,
  );

  return {
    successUrl: successUrl.toString(),
    cancelUrl: cancelUrl.toString(),
  };
}
