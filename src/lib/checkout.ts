export const DEFAULT_SHIPPING_IN_CENTS = 999;

export function getCheckoutShippingInCents(itemCount: number) {
  return itemCount > 0 ? DEFAULT_SHIPPING_IN_CENTS : 0;
}
