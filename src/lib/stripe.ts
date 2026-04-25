import Stripe from "stripe";

const STRIPE_API_VERSION = "2026-03-25.dahlia";

let stripeClient: Stripe | null = null;

function getCheckoutBaseUrl(requestOrigin?: string) {
  const configuredBaseUrl =
    process.env.STRIPE_CHECKOUT_BASE_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    requestOrigin?.trim();

  if (!configuredBaseUrl) {
    throw new Error("CHECKOUT_BASE_URL_NOT_CONFIGURED");
  }

  return configuredBaseUrl;
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

  const successUrl = new URL(
    process.env.STRIPE_CHECKOUT_SUCCESS_URL?.trim() || "/checkout/success",
    baseUrl,
  );
  successUrl.searchParams.set("order", orderNumber);

  const cancelUrl = new URL(
    cancelPath?.startsWith("/")
      ? cancelPath
      : process.env.STRIPE_CHECKOUT_CANCEL_URL?.trim() || "/checkout",
    baseUrl,
  );

  return {
    successUrl: successUrl.toString(),
    cancelUrl: cancelUrl.toString(),
  };
}
