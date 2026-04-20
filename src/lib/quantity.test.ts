import { describe, expect, it } from "vitest";
import { clampQuantityToStock, getMaxSelectableQuantity } from "@/lib/quantity";

describe("quantity helpers", () => {
  it("uses the current stock as the exact upper limit", () => {
    expect(getMaxSelectableQuantity(25)).toBe(25);
    expect(getMaxSelectableQuantity(250)).toBe(250);
  });

  it("clamps quantities to the valid range", () => {
    expect(clampQuantityToStock(0, 25)).toBe(1);
    expect(clampQuantityToStock(12, 25)).toBe(12);
    expect(clampQuantityToStock(40, 25)).toBe(25);
  });

  it("falls back safely for invalid values", () => {
    expect(getMaxSelectableQuantity(0)).toBe(1);
    expect(clampQuantityToStock(Number.NaN, 10)).toBe(1);
  });
});
