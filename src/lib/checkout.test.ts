import { describe, expect, it } from "vitest";
import { DEFAULT_SHIPPING_IN_CENTS, getCheckoutShippingInCents } from "@/lib/checkout";

describe("checkout helpers", () => {
  it("returns the default shipping value when there are items", () => {
    expect(getCheckoutShippingInCents(1)).toBe(DEFAULT_SHIPPING_IN_CENTS);
    expect(getCheckoutShippingInCents(4)).toBe(DEFAULT_SHIPPING_IN_CENTS);
  });

  it("returns zero shipping for an empty checkout", () => {
    expect(getCheckoutShippingInCents(0)).toBe(0);
  });
});
