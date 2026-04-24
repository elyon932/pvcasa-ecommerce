import { describe, expect, it } from "vitest";
import { getCatalog } from "@/lib/storefront";

describe("storefront catalog", () => {
  it("finds products by similarity across names and descriptions", async () => {
    const result = await getCatalog({ query: "spa premium" });

    expect(result.length).toBeGreaterThan(0);
    expect(result.some((product) => product.name.includes("Spa"))).toBe(true);
  });

  it("filters products by category and sale state", async () => {
    const result = await getCatalog({ category: "bath", sale: true });

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((product) => product.category.slug === "bath")).toBe(true);
    expect(result.every((product) => product.isOnSale)).toBe(true);
  });

  it("filters products by color and price range", async () => {
    const result = await getCatalog({
      color: "copper",
      price: "100-to-200",
    });

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((product) => product.colors.includes("copper"))).toBe(true);
    expect(result.every((product) => product.priceInCents > 10000)).toBe(true);
    expect(result.every((product) => product.priceInCents <= 20000)).toBe(true);
  });
});
