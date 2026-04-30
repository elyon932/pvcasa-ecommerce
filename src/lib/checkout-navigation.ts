export const CHECKOUT_INTENT_STORAGE_KEY = "pvcasa-checkout-intent";

export function markCheckoutIntent() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(CHECKOUT_INTENT_STORAGE_KEY, String(Date.now()));
}

export function consumeCheckoutIntent(maxAgeInMs = 5 * 60 * 1000) {
  if (typeof window === "undefined") {
    return false;
  }

  const value = window.sessionStorage.getItem(CHECKOUT_INTENT_STORAGE_KEY);
  window.sessionStorage.removeItem(CHECKOUT_INTENT_STORAGE_KEY);

  if (!value) {
    return false;
  }

  const createdAt = Number(value);
  return Number.isFinite(createdAt) && Date.now() - createdAt <= maxAgeInMs;
}
