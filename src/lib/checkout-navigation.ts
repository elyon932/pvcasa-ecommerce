export const CHECKOUT_INTENT_COOKIE = "pvcasa_checkout_intent";

export function markCheckoutIntent() {
  if (typeof window === "undefined") {
    return;
  }

  document.cookie = `${CHECKOUT_INTENT_COOKIE}=1; Max-Age=300; Path=/; SameSite=Lax`;
}
